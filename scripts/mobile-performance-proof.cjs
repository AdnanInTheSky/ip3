const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const out = path.resolve(process.env.EXPLORE_QA_OUT || 'docs/interactive-experience/mobile-performance-2026-10-22');
const phase = process.argv[2]; if (!['before', 'after'].includes(phase)) throw Error('Use before or after');
const base = process.env.EXPLORE_BASE_URL || 'http://localhost:3123';
const routes = [['home', '/'], ['hub', '/explore'], ...require('../src/explore/catalogue').map(m => [m.slug, '/explore/' + m.slug])];
(async () => {
  fs.mkdirSync(out, { recursive: true }); const browser = await chromium.launch(), results = { phase, browser: browser.version(), pages: [], errors: [] };
  try {
    for (const width of [390, 1440]) for (const [name, route] of routes) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' }), page = await context.newPage();
      const fontRequests = []; page.on('pageerror', e => results.errors.push({ name, message: e.message }));
      page.on('request', r => { if (/fonts\.(googleapis|gstatic)|\/assets\/fonts\//.test(r.url())) fontRequests.push(r.url()); });
      await page.goto(base + route, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
      if (name === 'home') await page.waitForSelector('[data-hero].ready');
      const geometry = await page.evaluate(() => {
        const selectors = ['header.head', 'h1', '.hero__text.is-active .lead', '.xp-model-toolbar', '.ip3-model'];
        return selectors.flatMap(selector => { const n = document.querySelector(selector); if (!n) return []; const b = n.getBoundingClientRect(), s = getComputedStyle(n); return [{ selector, text: n.innerText.slice(0, 180), x: b.x, y: b.y, width: b.width, height: b.height, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing, variations: s.fontVariationSettings }]; });
      });
      await page.screenshot({ path: path.join(out, `${name}-${width}-${phase}.png`) });
      if (phase === 'after') {
        assert.ok(fontRequests.some(url => url.includes('fonts.gstatic.com')), `${name}: pinned font CDN not loaded`);
        assert.ok(!fontRequests.some(url => /fonts\.googleapis/.test(url)), `${name}: blocking Google stylesheet dependency`);
        if (!['home', 'hub'].includes(name)) assert.equal(await page.locator('script[src*="/assets/vendor/"]').count(), 0);
      }
      results.pages.push({ name, width, geometry, fontRequests }); await context.close();
    }
    if (phase === 'after') {
      const before = JSON.parse(fs.readFileSync(path.join(out, 'visual-before.json')));
      for (const row of results.pages) {
        const old = before.pages.find(p => p.name === row.name && p.width === row.width);
        assert.ok(old); assert.equal(row.geometry.length, old.geometry.length);
        row.geometry.forEach((n, i) => { const b = old.geometry[i]; for (const k of ['selector', 'text', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'variations']) assert.equal(n[k], b[k], `${row.name}/${row.width}/${k}`); for (const k of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(n[k] - b[k]) < 1, `${row.name}/${row.width}/${n.selector}/${k}: ${b[k]} → ${n[k]}`); });
      }
      const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), hp = await desktop.newPage();
      await hp.goto(base + '/', { waitUntil: 'networkidle' });
      const card = hp.locator('.cap').first(); await card.hover(); const box = await card.boundingBox();
      await hp.mouse.move(box.x + box.width * .7, box.y + box.height * .3); await hp.waitForTimeout(250);
      const tilt = await card.evaluate(n => ({ classPresent: n.classList.contains('tilt'), rx: n.style.getPropertyValue('--rx'), transform: getComputedStyle(n).transform }));
      assert.ok(tilt.classPresent && tilt.rx && tilt.transform !== 'none'); await desktop.close();
      const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }), mp = await mobile.newPage();
      await mp.goto(base + '/', { waitUntil: 'networkidle' }); await mp.locator('[data-burger]').click();
      assert.equal(await mp.locator('[data-burger]').getAttribute('aria-expanded'), 'true'); await mp.keyboard.press('Escape');
      assert.equal(await mp.locator('[data-burger]').getAttribute('aria-expanded'), 'false');
      const track = mp.locator('[data-hs-track]'); await track.scrollIntoViewIfNeeded();
      const swipe = await track.evaluate(n => { n.scrollLeft = 300; return { left: n.scrollLeft, overflow: n.scrollWidth > n.clientWidth }; });
      assert.ok(swipe.overflow && swipe.left > 0); await mp.waitForTimeout(100); assert.notEqual(await mp.locator('[data-progress]').evaluate(n => n.style.transform), 'scaleX(0)'); await mobile.close();
      results.interactionChecks = { desktopPointerTilt: tilt, mobileDrawer: 'open and Escape close pass', mobileSectorScroll: swipe };
      const offline = await browser.newContext({ viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce' }), fp = await offline.newPage(), mirrors = [];
      await fp.route('https://fonts.gstatic.com/**', r => r.abort()); fp.on('request', r => { if (r.url().includes('/assets/fonts/')) mirrors.push(r.url()); });
      await fp.goto(base + '/explore/economics-trade', { waitUntil: 'networkidle' }); await fp.evaluate(() => document.fonts.ready);
      const fonts = await fp.evaluate(() => ['400 20px Fraunces', 'italic 400 20px Fraunces', '400 20px Lato', '600 20px Montserrat'].map(spec => ({ spec, ready: document.fonts.check(spec) })));
      assert.ok(mirrors.length >= 4 && fonts.every(f => f.ready)); await fp.screenshot({ path: path.join(out, 'font-cdn-unavailable-fallback.png') });
      results.fontFallback = { expectedCDNFailure: true, localMirrors: mirrors, fonts }; await offline.close();
    }
    assert.deepEqual(results.errors, []); results.passed = true;
  } catch (e) { results.passed = false; results.errors.push(e.stack); process.exitCode = 1; }
  finally { await browser.close(); fs.writeFileSync(path.join(out, `visual-${phase}.json`), JSON.stringify(results, null, 2) + '\n'); console.log(JSON.stringify({ phase, passed: results.passed, pages: results.pages.length, errors: results.errors })); }
})();
