const { chromium } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const out = path.resolve(process.env.EXPLORE_QA_OUT || 'docs/interactive-experience/mobile-performance-2026-10-22');
const base = process.env.EXPLORE_BASE_URL || 'http://localhost:3123';
(async () => {
  const browser = await chromium.launch(), result = { checks: [], errors: [] };
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } }), page = await context.newPage();
      page.on('pageerror', e => result.errors.push(e.message)); await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.locator('[data-hero-pause]').click();
      for (const selector of ['#capabilities', '.stats-band', '#why-ip3', '#thinking-in-action', '#sectors', '#translation', '#insights', '#convening', '#clients', '#leadership', '#start']) {
        const section = page.locator(selector); await section.scrollIntoViewIfNeeded(); await page.waitForTimeout(2500);
        const visible = await section.evaluate(root => {
          const shown = n => { const b = n.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top < innerHeight * .85 && b.bottom > 100; };
          return {
            reveals: [...root.querySelectorAll('[data-reveal], [data-stagger] > *')].filter(shown).map(n => ({ text: n.textContent.slice(0, 60), opacity: +getComputedStyle(n).opacity })),
            headings: [...root.querySelectorAll('.split')].filter(shown).map(n => ({ split: n.dataset.split, words: [...n.querySelectorAll('.wi')].map(w => Math.abs(new DOMMatrixReadOnly(getComputedStyle(w).transform).m42)) })),
            counters: [...root.querySelectorAll('[data-count]')].filter(shown).map(n => ({ value: n.textContent, expected: n.dataset.count })),
          };
        });
        assert.ok(visible.reveals.every(n => n.opacity > .98), `${width} ${selector}: hidden reveal`);
        assert.ok(visible.headings.every(h => h.split === '1' && h.words.length && h.words.every(y => y < 1)), `${width} ${selector}: heading animation did not complete`);
        assert.ok(visible.counters.every(n => +n.value === +n.expected), `${width} ${selector}: counter did not complete`);
        result.checks.push({ width, selector, ...visible });
      }
      await context.close();
    }
    const stages = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 1000 } }), sp = await stages.newPage();
    await sp.goto(base + '/', { waitUntil: 'networkidle' }); result.stageControls = [];
    for (let n = 1; n <= 6; n++) { await sp.locator(`.dc-tile[data-stage="${n}"]`).click(); assert.equal(await sp.locator(`.dc-slot.is-on[data-tone="${n}"]`).isVisible(), true); assert.equal(await sp.locator(`.dc-tile[data-stage="${n}"]`).getAttribute('aria-pressed'), 'true'); result.stageControls.push({ stage: n, visible: true }); }
    await sp.locator('[data-stage-all]').click(); assert.equal(await sp.locator('.dc-card[hidden]').count(), 0); await stages.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } }), np = await nojs.newPage();
    await np.goto(base + '/', { waitUntil: 'networkidle' });
    result.noJavaScriptPanels = await np.locator('.dc-slot').evaluateAll(ns => ns.map(n => ({ stage: n.dataset.tone, display: getComputedStyle(n).display })));
    assert.equal(result.noJavaScriptPanels.length, 6); assert.ok(result.noJavaScriptPanels.every(n => n.display !== 'none')); await nojs.close();
    assert.deepEqual(result.errors, []); result.passed = true;
  } catch (e) { result.passed = false; result.errors.push(e.stack); process.exitCode = 1; }
  finally { await browser.close(); fs.writeFileSync(path.join(out, 'home-scroll-proof.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify({ passed: result.passed, checks: result.checks.length, errors: result.errors })); }
})();
