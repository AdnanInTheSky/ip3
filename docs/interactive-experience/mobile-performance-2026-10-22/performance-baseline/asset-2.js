/* IP3 Consulting — motion & interaction. GSAP 3.12 + ScrollTrigger + Lenis, all vendored locally. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;

  /* ---------- utilities ---------- */
  function splitWords(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = '1';
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var w = d.createElement('span'); w.className = 'w';
            var i = d.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    })(el);
    el.classList.add('is-split');
    return out;
  }

  /* ---------- header, drawer, progress ---------- */
  function initChrome() {
    var head = $('[data-head]'), burger = $('[data-burger]'), drawer = $('[data-drawer]'), bar = $('[data-progress]');
    var lastY = window.scrollY, open = false;
    function setMenu(v) {
      open = v; root.classList.toggle('menu-open', v); d.body.classList.toggle('menu-open', v);
      burger.setAttribute('aria-expanded', v); burger.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
      drawer.setAttribute('aria-hidden', !v);
      if (lenis) v ? lenis.stop() : lenis.start(); else d.body.style.overflow = v ? 'hidden' : '';
    }
    if (burger) burger.addEventListener('click', function () { setMenu(!open); });
    if (drawer) drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setMenu(false); });
    function onScroll() {
      var y = window.scrollY, dy = y - lastY;
      if (head && !open) {
        if (y > 220 && dy > 8) head.classList.add('is-hidden');
        else if (dy < -6 || y < 120) head.classList.remove('is-hidden');
      }
      lastY = y;
      if (bar) { var h = d.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')'; }
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- contact form (Resend with a prefilled mailto fallback) ---------- */
  function initForms() {
    $$('[data-contact-form]').forEach(function (f) {
      if (f.elements.startedAt) f.elements.startedAt.value = String(Date.now());
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
        var ok = true;
        ['name', 'email', 'message'].forEach(function (n) { var el = f.elements[n]; var bad = !v(n) || (n === 'email' && !/^\S+@\S+\.\S+$/.test(v(n))); el.style.borderColor = bad ? '#e0705a' : ''; if (bad) ok = false; });
        if (!ok) { var first = $('input[style*="e0705a"],textarea[style*="e0705a"]', f); if (first) first.focus(); return; }
        var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nOrganization: ' + v('organization') + '\nEngagement type: ' + v('engagement') + '\nFocus area: ' + v('focus') + '\n\n' + v('message');
        var email = "info@ip3-bd.org";
        var status = $('.form__ok', f), error = $('[data-form-error]', f), button = $('button[type="submit"]', f);
        var mailto = 'mailto:' + email + '?subject=' + encodeURIComponent('Website enquiry — ' + v('engagement') + ' — ' + v('name')) + '&body=' + encodeURIComponent(body);
        var showEmailFallback = function () {
          f.classList.remove('is-sending');
          if (status) status.textContent = (f.dataset.fallbackMessage || 'Your message is ready.').replace(/\{\{email\}\}/g, email);
          if (error) {
            error.textContent = 'If your email app did not open, write to ';
            var link = d.createElement('a'); link.href = 'mailto:' + email; link.textContent = email;
            error.appendChild(link); error.hidden = false;
          }
          window.location.href = mailto;
        };
        if (error) error.hidden = true;
        if (!f.hasAttribute('data-contact-api')) { showEmailFallback(); return; }
        var tokenField = f.elements['cf-turnstile-response'];
        var token = tokenField ? tokenField.value : '';
        if (f.dataset.turnstileSitekey && !token) {
          if (status) status.textContent = 'Complete the security check. Opening your email app instead.';
          showEmailFallback();
          return;
        }
        if (button) button.disabled = true;
        f.classList.add('is-sending');
        if (status) status.textContent = 'Sending your message…';
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify({
            name: v('name'), email: v('email'), organization: v('organization'),
            engagement: v('engagement'), focus: v('focus'), message: v('message'),
            website: v('website'), startedAt: Number(v('startedAt')), turnstileToken: token,
          }),
        }).then(function (response) {
          if (!response.ok) throw new Error('contact request failed');
          f.classList.remove('is-sending');
          f.classList.add('is-sent');
          if (status) status.textContent = 'Thank you. Your message was sent; we will reply using the email address you provided.';
        }).catch(function () {
          showEmailFallback();
        }).finally(function () {
          if (button) button.disabled = false;
          if (window.turnstile && typeof window.turnstile.reset === 'function') window.turnstile.reset();
        });
      });
    });
  }

  /* ---------- lazy / viewport-gated videos ---------- */
  function initLazyVideo() {
    var vids = $$('video[data-lazyvideo]');
    if (!vids.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          $$('source[data-src]', v).forEach(function (s) { s.src = s.dataset.src; s.removeAttribute('data-src'); v.load(); });
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else v.pause();
      });
    }, { rootMargin: '200px' });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- hero slider ---------- */
  function initHero() {
    var hero = $('[data-hero]'); if (!hero) return;
    var slides = $$('.hero__slide', hero), texts = $$('.hero__text', hero), tabs = $$('.hero__tab', hero);
    var n = slides.length, cur = 0, DUR = 8, tween = null, inView = true, hold = false, focusHold = false, timer = null, warmTimer = null, userPaused = false, mediaReady = false, mediaTimer = null;
    var heroMedia = window.matchMedia('(prefers-reduced-motion: reduce)'), pauseButton = $('[data-hero-pause]', hero);
    var words = texts.map(function (t) { return splitWords($('h1,h2', t)); });
    function playVideo(i, restart) {
      var v = $('video', slides[i]); if (!v) return;
      if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
      if (heroMedia.matches || userPaused || !mediaReady) return;
      var added = false;
      $$('source[data-src]', v).forEach(function (s) { s.src = s.dataset.src; delete s.dataset.src; added = true; });
      v.preload = 'auto'; if (added) v.load();
      if (restart) { try { v.currentTime = 0; } catch (e) {} }
      if (!userPaused && inView && !d.hidden) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
    function warm(i) {
      if (heroMedia.matches || userPaused || !inView || d.hidden) return;
      var v = $('video', slides[i]); if (!v || v.preload !== 'none') return;
      if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
      $$('source[data-src]', v).forEach(function (s) { s.src = s.dataset.src; delete s.dataset.src; });
      v.preload = 'metadata'; v.load();
    }
    function scheduleWarm() { clearTimeout(warmTimer); if (!heroMedia.matches && !userPaused) warmTimer = setTimeout(function () { warm((cur + 1) % n); }, (DUR - 2) * 1000); }
    function animateText(i, first) {
      if (!hasGsap || heroMedia.matches) return;
      var t = texts[i], eb = $('.eyebrow', t), lead = $('.lead', t), cta = $('.hero__cta', t);
      var tl = gsap.timeline({ delay: first ? 0.25 : 0.35 });
      gsap.set(words[i], { yPercent: 115 });
      gsap.set([eb, lead, cta], { opacity: 0, y: 24 });
      tl.to(eb, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0)
        .to(words[i], { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'power4.out' }, 0.05)
        .to(lead, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.45)
        .to(cta, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform' }, 0.6);
    }
    function runProgress() {
      if (tween) tween.kill();
      tabs.forEach(function (t, k) { var bar = $('i', t); if (bar) { if (hasGsap) gsap.set(bar, { scaleX: k < cur ? 1 : 0 }); else bar.style.transform = 'scaleX(' + (k < cur ? 1 : 0) + ')'; } });
      if (heroMedia.matches || userPaused) return;
      var bar = $('i', tabs[cur]);
      if (hasGsap) {
        tween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: 'none', onComplete: function () { go(cur + 1); } });
        if (!inView || hold || focusHold || userPaused || d.hidden) tween.pause();
      } else { clearTimeout(timer); timer = setTimeout(function () { go(cur + 1); }, DUR * 1000); }
    }
    function go(i, first) {
      var prev = cur; cur = (i + n) % n;
      if (!first) {
        slides[prev].classList.remove('is-active'); slides[prev].setAttribute('aria-hidden', 'true');
        texts[prev].classList.remove('is-active'); tabs[prev].classList.remove('is-active');
        if (prev !== cur) setTimeout(function () { if (prev !== cur) { var pv = $('video', slides[prev]); if (pv) pv.pause(); } }, 1500);
      }
      slides[cur].classList.add('is-active'); slides[cur].setAttribute('aria-hidden', 'false');
      texts[cur].classList.add('is-active'); tabs[cur].classList.add('is-active');
      if (first) mediaTimer = setTimeout(function () { mediaReady=true;playVideo(cur,false); }, 1800);
      else { mediaReady=true;clearTimeout(mediaTimer);playVideo(cur,true); }
      scheduleWarm();
      animateText(cur, first); runProgress();
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { if (k !== cur) go(k); }); });
    var pb = $('[data-prev]', hero), nb = $('[data-next]', hero);
    if (pb) pb.addEventListener('click', function () { go(cur - 1); });
    if (nb) nb.addEventListener('click', function () { go(cur + 1); });
    d.addEventListener('keydown', function (e) { if (!inView) return; if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); sx = null; }, { passive: true });
    hero.addEventListener('mouseenter', function () { hold = true; if (tween) tween.pause(); });
    hero.addEventListener('mouseleave', function () { hold = false; if (tween && inView && !d.hidden && !userPaused && !focusHold && !heroMedia.matches) tween.resume(); });
    hero.addEventListener('focusin',function(){focusHold=true;if(tween)tween.pause();});
    hero.addEventListener('focusout',function(e){if(!hero.contains(e.relatedTarget)){focusHold=false;syncHeroMotion();}});
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      syncHeroMotion();
    }, { threshold: 0.2 }).observe(hero);
    function syncHeroMotion() {
      if (!hero.classList.contains('ready')) return;
      var stopped = userPaused || heroMedia.matches || d.hidden || !inView;
      hero.classList.toggle('is-motion-paused',stopped);
      if (tween) stopped || hold || focusHold ? tween.pause() : tween.resume();
      if (stopped) { clearTimeout(timer); clearTimeout(warmTimer); slides.forEach(function (s) { var v=$('video',s);if(v)v.pause(); }); }
      else { playVideo(cur,false); if (!tween) runProgress(); scheduleWarm(); }
      if (pauseButton) { pauseButton.disabled=heroMedia.matches;pauseButton.setAttribute('aria-pressed',String(userPaused||heroMedia.matches));var label=heroMedia.matches?'Motion disabled by your reduced-motion preference':userPaused?'Resume automatic slides and background video':'Pause automatic slides and background video';pauseButton.setAttribute('aria-label',label);pauseButton.title=label; }
    }
    if (pauseButton) pauseButton.addEventListener('click',function(){userPaused=!userPaused;syncHeroMotion();});
    heroMedia.addEventListener('change',syncHeroMotion);d.addEventListener('visibilitychange',syncHeroMotion);
    // initial state
    texts.forEach(function (t, k) { if (k !== 0) t.classList.remove('is-active'); });
    var start = function () { if (hero.classList.contains('ready')) return; go(0, true); hero.classList.add('ready');syncHeroMotion(); };
    setTimeout(start, 2500);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else start();
  }

  /* ---------- sector scroller, native mode ---------- */
  // below 900px (and with reduced motion) the cards scroll natively; the progress line follows the swipe
  function initHsNative() {
    var track = $('[data-hs-track]'), fill = $('[data-hs-fill]'); if (!track || !fill) return;
    track.addEventListener('scroll', function () {
      var max = track.scrollWidth - track.clientWidth;
      fill.style.transform = 'scaleX(' + (max > 0 ? track.scrollLeft / max : 0) + ')';
    }, { passive: true });
  }

  /* ---------- card decks (home): a carousel / grid of cards with step buttons and a progress bar ---------- */
  function makeDeck(deck, track, nav, cardSel) {
    var bar = nav && $('[class$="__bar"] i', nav);
    var prev = nav && $('[data-dir="-1"]', nav), next = nav && $('[data-dir="1"]', nav);
    function state() {
      if (!nav) return;
      var max = track.scrollWidth - track.clientWidth;
      nav.hidden = max < 4;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
      if (bar) bar.style.setProperty('--p', max > 0 ? (0.2 + 0.8 * track.scrollLeft / max).toFixed(3) : 1);
    }
    function step(dir) {
      var c = $$(cardSel, track).filter(function (x) { return !x.hidden; })[0];
      track.scrollBy({ left: dir * (c ? c.offsetWidth + 26 : track.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
    }
    if (nav) {
      prev.addEventListener('click', function () { step(-1); });
      next.addEventListener('click', function () { step(1); });
      track.addEventListener('scroll', state, { passive: true });
      window.addEventListener('resize', state);
    }
    return {
      state: state,
      reset: function () { track.scrollLeft = 0; state(); if (window.ScrollTrigger) requestAnimationFrame(function () { ScrollTrigger.refresh(); }); },
      view: function (v, buttons, active) {
        deck.setAttribute('data-view', v);
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === active)); });
        track.scrollLeft = 0; state();
      },
    };
  }
  function scrollToEl(el, offset) {
    if (window.ip3Lenis) window.ip3Lenis.scrollTo(el, { offset: offset || -110, duration: reduce ? 0 : 1.1 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- delivery chain (home): a stage opens its panel under its tile and filters the assignments ---------- */
  function initChain() {
    var sec = $('[data-chain]'); if (!sec) return;
    var tiles = $$('.dc-tile', sec), slots = $$('.dc-slot', sec), cards = $$('.dc-card', sec);
    var deck = $('[data-deck]', sec), track = $('[data-cards]', sec), nav = $('[data-deck-nav]', sec), bar = $('[data-bar]', sec);
    var count = $('[data-dc-count]', sec), all = $('[data-stage-all]', sec), lbl = $('[data-dc-stage]', sec);
    var d = makeDeck(deck, track, nav, '.dc-card');
    var stage = 0;
    function select(n, lead) {
      stage = n;
      // first view: Stage 01 is shown as the lead (highlighted, with its panel open) while all assignments are listed
      tiles.forEach(function (t) {
        var on = +t.getAttribute('data-stage') === n;
        t.classList.toggle('is-lead', !!lead && t.getAttribute('data-stage') === '1');
        t.setAttribute('aria-pressed', String(on));
      });
      var open = lead ? 1 : n;
      slots.forEach(function (sl) { sl.classList.toggle('is-on', +$('[data-panel]', sl).getAttribute('data-panel') === open); });
      var shown = 0;
      cards.forEach(function (c) {
        var on = !n || c.getAttribute('data-stages').split(' ').indexOf(String(n)) > -1;
        c.hidden = !on; if (on) shown++;
      });
      if (count) count.textContent = shown;
      if (all) all.hidden = !n;
      if (lbl) lbl.textContent = n ? $('.dc-tile__t', tiles[n - 1]).textContent : '';
      d.reset();
    }
    tiles.forEach(function (t) {
      t.addEventListener('click', function () {
        var n = +t.getAttribute('data-stage');
        select(stage === n ? 0 : n);
      });
    });
    if (all) all.addEventListener('click', function () { select(0); });
    $$('.dc-view button', sec).forEach(function (b) {
      b.addEventListener('click', function () { d.view(b.getAttribute('data-view'), $$('.dc-view button', sec), b); });
    });
    // the panel's own links: see all of this stage's assignments, or jump to one of them
    function stageOf(el) { return +el.closest('[data-panel]').getAttribute('data-panel'); }
    $$('[data-go-cards]', sec).forEach(function (btn) {
      btn.addEventListener('click', function () { var n = stageOf(btn); if (stage !== n) select(n); scrollToEl(bar, -100); });
    });
    $$('[data-jump]', sec).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var n = stageOf(a); if (stage !== n) select(n);
        var card = $('#dc-card-' + a.getAttribute('data-jump'), sec); if (!card) return;
        scrollToEl(bar, -100);
        if (deck.getAttribute('data-view') === 'carousel') track.scrollTo({ left: Math.max(0, card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - 2), behavior: reduce ? 'auto' : 'smooth' });
        card.classList.add('is-flash'); setTimeout(function () { card.classList.remove('is-flash'); }, 1800);
      });
    });
    select(0, true);
    sec.classList.add('is-ready');
  }

  /* ---------- engagements & insights (home): filter by kind, carousel / grid ---------- */
  function initEvidence() {
    var sec = $('[data-ev]'); if (!sec) return;
    var pills = $$('.ev-pill', sec), cards = $$('.ev-card', sec), count = $('[data-ev-count]', sec);
    var deck = $('[data-ev-deck]', sec), track = $('[data-ev-cards]', sec), nav = $('[data-ev-nav]', sec);
    var d = makeDeck(deck, track, nav, '.ev-card');
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        var k = p.getAttribute('data-kind'), shown = 0;
        pills.forEach(function (x) { x.setAttribute('aria-pressed', String(x === p)); });
        cards.forEach(function (c) { var on = !k || c.getAttribute('data-kind') === k; c.hidden = !on; if (on) shown++; });
        if (count) count.textContent = shown;
        d.reset();
      });
    });
    $$('.ev-view button', sec).forEach(function (b) {
      b.addEventListener('click', function () { d.view(b.getAttribute('data-view'), $$('.ev-view button', sec), b); });
    });
    d.state();
  }

  /* ---------- capabilities (home): an unseen hand travels a thread through the six decisions as you scroll ---------- */
  function initHand() {
    var sec = $('[data-hand]'); if (!sec) return;
    var board = $('[data-hand-board]', sec), svg = $('svg', board), path = $('[data-hand-path]', board), lit = $('[data-hand-lit]', board), dot = $('[data-hand-dot]', board);
    var cards = $$('[data-hand-card]', sec), nums = $$('[data-hand-n]', sec);
    var pts = [], cum = [], total = 0, plen = 1, ticking = false, hot = -1;
    function build() {
      var br = board.getBoundingClientRect(), w = br.width, h = br.height;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var c = cards.map(function (el, i) {
        var r = el.getBoundingClientRect(), n = nums[i].getBoundingClientRect();
        return { l: r.left - br.left, r: r.right - br.left, t: r.top - br.top, b: r.bottom - br.top, x: n.left - br.left + 6, y: n.top - br.top - 9 };
      });
      var cols = c.filter(function (k) { return Math.abs(k.t - c[0].t) < 4; }).length;
      var d, x0 = -12, x1 = w + 12;
      pts = c.map(function (k) { return [k.x, k.y]; });
      if (cols === 1) {
        // single column: the thread runs down the left margin, with a short stub to each number
        d = 'M' + (-12) + ' ' + (c[0].y - 40) + ' L-12 ' + c[0].y;
        c.forEach(function (k, i) { d += ' L-12 ' + k.y + ' L' + k.x + ' ' + k.y + ' L-12 ' + k.y; });
        d += ' L-12 ' + (c[c.length - 1].y + 40);
        pts = c.map(function (k) { return [-12, k.y]; });
      } else {
        var rows = [], cur = [];
        c.forEach(function (k, i) { if (cur.length && Math.abs(k.t - cur[0].k.t) > 4) { rows.push(cur); cur = []; } cur.push({ k: k, i: i }); });
        rows.push(cur);
        d = 'M' + x0 + ' ' + rows[0][0].k.y;
        pts = [];
        rows.forEach(function (row, ri) {
          row.forEach(function (it) { d += ' L' + it.k.x + ' ' + it.k.y; pts[it.i] = [it.k.x, it.k.y]; });
          var last = row[row.length - 1].k, next = rows[ri + 1];
          if (next) {
            var gap = (last.b + next[0].k.t) / 2;
            d += ' L' + x1 + ' ' + last.y + ' L' + x1 + ' ' + gap + ' L' + x0 + ' ' + gap + ' L' + x0 + ' ' + next[0].k.y;
          } else d += ' L' + x1 + ' ' + last.y;
        });
      }
      path.setAttribute('d', d); lit.setAttribute('d', d);
      plen = path.getTotalLength();
      lit.style.strokeDasharray = plen + ' ' + plen;
      // cumulative polyline distance to each number, taken from the path itself
      cum = pts.map(function (pt) {
        var best = 0, bd = 1e9, step = Math.max(2, plen / 600);
        for (var s = 0; s <= plen; s += step) { var q = path.getPointAtLength(s), dd = Math.abs(q.x - pt[0]) + Math.abs(q.y - pt[1]); if (dd < bd) { bd = dd; best = s; } }
        return best;
      });
    }
    function paint(p) {
      var at = p * plen, cur = -1;
      lit.style.strokeDashoffset = String(plen - at);
      var q = path.getPointAtLength(at);
      dot.setAttribute('transform', 'translate(' + q.x + ' ' + q.y + ')');
      cards.forEach(function (el, i) { var on = at >= cum[i] - 6; el.classList.toggle('is-lit', on); if (on) cur = i; });
      cards.forEach(function (el, i) { el.classList.toggle('is-hand', i === (hot > -1 ? hot : cur)); });
    }
    function progress() {
      var r = board.getBoundingClientRect(), vh = window.innerHeight;
      return Math.min(1, Math.max(0, (vh * 0.78 - r.top) / Math.max(1, r.height + vh * 0.12 - vh * 0.1)));
    }
    function update() { ticking = false; paint(reduce ? 1 : progress()); }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    cards.forEach(function (el, i) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3)); el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3)); });
      el.addEventListener('pointerenter', function () { hot = i; update(); });
      el.addEventListener('pointerleave', function () { hot = -1; el.style.setProperty('--px', 0); el.style.setProperty('--py', 0); update(); });
      el.addEventListener('focus', function () { hot = i; update(); });
      el.addEventListener('blur', function () { hot = -1; update(); });
    });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); update(); }, 120); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', function () { build(); update(); });
    build(); sec.classList.add('is-ready'); update();
  }

  /* ---------- why IP3 (home): the four reasons take turns; the phone caption and big numeral follow ---------- */
  function initWhy() {
    var sec = $('[data-why]'); if (!sec) return;
    var items = $$('[data-wy-item]', sec), num = $('[data-wy-num]', sec), cap = $('[data-wy-cap]', sec);
    var cur = 0, ticking = false;
    function set(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
      var it = items[i];
      num.textContent = it.getAttribute('data-n');
      $('span', cap).textContent = it.getAttribute('data-n');
      $('b', cap).textContent = it.getAttribute('data-t');
      [num, cap].forEach(function (el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); });
    }
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var mid = window.innerHeight * 0.55, best = 0, bd = 1e9;
        items.forEach(function (it, k) { var r = it.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
        set(best);
      });
    }
    items.forEach(function (it, k) {
      it.addEventListener('mouseenter', function () { set(k); });
      it.addEventListener('focusin', function () { set(k); });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    sec.classList.add('is-ready');
  }

  /* ---------- founder portrait: a gentle tilt that follows the pointer (fine pointers only) ---------- */
  function initTilt() {
    if (reduce || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ---------- Lenis ---------- */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, wheelMultiplier: 0.95 });
    window.ip3Lenis = lenis; // page scripts (e.g. /capabilities) scroll and pause through the same instance
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0); }
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]'); if (!a) return;
      var u = new URL(a.href, location.href);
      if (u.pathname !== location.pathname || !u.hash) return;
      var t = $(u.hash); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -96, duration: 1.4 });
    });
  }
  function jumpToHash() {
    if (!location.hash) return;
    var t = null; try { t = $(location.hash); } catch (e) {}
    if (!t) return;
    setTimeout(function () { if (lenis) lenis.scrollTo(t, { offset: -96, immediate: true }); else t.scrollIntoView(); }, 350);
  }

  /* ---------- page transition ---------- */
  function initTransitions() {
    // browsers with cross-document View Transitions animate navigation in CSS (@view-transition)
    if (reduce || 'onpagereveal' in window) return;
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || /^(mailto|tel):/.test(a.getAttribute('href') || '')) return;
      e.preventDefault(); d.body.style.transition = 'opacity .32s ease'; d.body.style.opacity = '0';
      setTimeout(function () { location.href = a.href; }, 300);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { d.body.style.opacity = ''; } });
  }

  /* ---------- scroll choreography (GSAP) ---------- */
  function initScroll() {
    gsap.registerPlugin(ScrollTrigger);

    // headings: word-by-word rise
    $$('.split').forEach(function (el) {
      var w = splitWords(el); if (!w.length) return;
      gsap.set(w, { yPercent: 115 });
      var run = function () { gsap.to(w, { yPercent: 0, duration: 1.1, stagger: 0.045, ease: 'power4.out' }); };
      if (el.hasAttribute('data-hero-title')) { (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { gsap.delayedCall(0.15, run); }); }
      else ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: run });
    });

    // generic reveals
    $$('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    $$('[data-stagger]').forEach(function (g) {
      var kids = Array.prototype.slice.call(g.children);
      gsap.fromTo(kids, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95, stagger: 0.09, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: g, start: 'top 90%', once: true } });
    });

    // clip-path image reveals
    $$('[data-clip]').forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.5, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // parallax
    $$('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // page heroes: a slow camera dolly — the image tilts back and pushes in as the page scrolls away
    $$('[data-parallax-bg]').forEach(function (el) {
      gsap.to(el, { yPercent: 12, rotateX: 7, scale: 1.08, transformPerspective: 1100, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: { trigger: el.closest('.phero') || el, start: 'top top', end: 'bottom top', scrub: true } });
    });
    // portraits drift in 3D with the scroll (portfolio hero technique)
    $$('[data-drift]').forEach(function (el) {
      gsap.fromTo(el, { rotateY: 5, rotateX: -2, transformPerspective: 900 }, { rotateY: -6, rotateX: 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    });

    // counters
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count), o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 2.2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      } });
    });

    // footer wordmark: the outlined letters fill with the brand gradient as the page comes to rest
    $$('.foot__big').forEach(function (el) {
      gsap.fromTo(el, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
    });

    var mm = gsap.matchMedia();

    // horizontal sector scroller
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
      var hs = $('[data-hs]'), track = $('[data-hs-track]'), fill = $('[data-hs-fill]'); if (!hs || !track) return;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: {
        trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { if (fill) fill.style.transform = 'scaleX(' + s.progress + ')'; },
      } });
    });

    // capabilities: each card's setting turns in from depth, and the smaller photo (the service) travels in to meet it
    $$('[data-cap-media]').forEach(function (m) {
      var card = m.closest('.cap'), a = $('.cap__m1', m);
      var st = { trigger: card, start: 'top 98%', end: 'top 40%', scrub: 0.8 };
      gsap.fromTo(a, { z: -320, rotationY: -26, rotationX: 8, xPercent: 16, opacity: 0, transformPerspective: 900 }, { z: 0, rotationY: 0, rotationX: 0, xPercent: 0, opacity: 1, ease: 'power2.out', scrollTrigger: st });
    });

    // convening list highlight
    var items = $$('[data-conv] .conv__item');
    items.forEach(function (it, i) {
      ScrollTrigger.create({ trigger: it, start: 'top 62%', end: 'bottom 62%', onToggle: function (self) {
        if (!self.isActive) return; items.forEach(function (x, k) { x.classList.toggle('is-active', k === i); });
      } });
    });

    // polycrisis → polysolutions compare
    $$('[data-compare]').forEach(function (c) {
      var top = $('.compare__top', c), bar = $('.compare__bar', c);
      var tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 72%', end: 'bottom 38%', scrub: 0.6 } });
      tl.fromTo(top, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0)
        .fromTo(bar, { left: '0%' }, { left: '100%', ease: 'none' }, 0);
    });

    // orbit nodes fade in
    $$('[data-orbit]').forEach(function (o) {
      gsap.from($$('.orbit__node > div', o), { opacity: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: o, start: 'top 80%', once: true } });
    });

    initFilm(); initGiant(); initTerminal(mm); initFragFilm(mm);

    // layout settles after fonts/images
    var refresh = function () { ScrollTrigger.refresh(); };
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(refresh);
    window.addEventListener('load', function () { setTimeout(refresh, 250); jumpToHash(); });
  }

  /* ---------- brand film: the framed card settles into place as it scrolls in ---------- */
  function initFilm() {
    $$('[data-film]').forEach(function (el) {
      var frame = $('[data-film-frame]', el);
      if (!frame) return;
      gsap.fromTo(frame, { y: 40, scale: 0.96, autoAlpha: 0.4 }, { y: 0, scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top 90%', end: 'top 55%', scrub: 0.6 } });
    });
  }

  /* ---------- giant word: grows into focus, dwells, then blows past the camera (IP3 Motion engine) ---------- */
  function initGiant() {
    $$('[data-giant]').forEach(function (el) {
      var w = $('[data-giant-word]', el); if (!w) return;
      el.classList.add('is-pinned');
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: '+=120%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.fromTo(w, { opacity: 0, scale: 0.55, filter: 'blur(10px)', z: -300 }, { opacity: 1, scale: 1, filter: 'blur(0px)', z: 0, duration: 0.45 }, 0)
        .to(w, { opacity: 1, duration: 0.25 })
        .to(w, { scale: 1.7, opacity: 0, filter: 'blur(16px)', z: 260, duration: 0.3 });
    });
  }

  /* ---------- Policy Intelligence Terminal: a pinned, scrubbed walkthrough on large screens ---------- */
  function initTerminal(mm) {
    var el = $('[data-term]'); if (!el) return;
    var st = $('[data-term-stage]', el), jumps = $$('[data-term-jump]', el);
    var jump = function () {};
    jumps.forEach(function (b) { b.addEventListener('click', function () { jump(Number(b.dataset.termJump)); }); });
    function mark(i) { jumps.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); }
    mm.add('(min-width: 1024px) and (min-height: 700px)', function () {
      st.setAttribute('data-pinned', '');
      var beats = $$('[data-beat]', st), nodes = $$('[data-term-node]', st), fill = $('[data-term-fill]', st);
      var n = beats.length, D = n - 1 + 0.45;
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      beats.forEach(function (b, i) {
        var text = $('[data-beat-text]', b), fig = $('[data-beat-fig]', b), scan = $('.term__scan', b);
        if (i === 0) gsap.set(b, { autoAlpha: 1 });
        else {
          gsap.set(b, { autoAlpha: 0 });
          tl.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, i - 0.08)
            .fromTo(text, { y: 34 }, { y: 0, duration: 0.2, ease: 'power2.out' }, i - 0.08)
            .fromTo(fig, { y: 70, scale: 0.94, rotationX: 8, transformPerspective: 1200 }, { y: 0, scale: 1, rotationX: 0, duration: 0.24, ease: 'power2.out' }, i - 0.08);
        }
        if (scan) tl.fromTo(scan, { yPercent: -100, autoAlpha: 0.9 }, { yPercent: 900, autoAlpha: 0, duration: 0.5 }, i + 0.02);
        if (i < n - 1) tl.to(b, { autoAlpha: 0, duration: 0.1 }, i + 0.8).to(fig, { y: -40, scale: 0.97, duration: 0.12 }, i + 0.78);
      });
      if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: D, transformOrigin: 'left center' }, 0);
      tl.set({}, {}, D);
      var trigger = ScrollTrigger.create({
        trigger: st, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * n * 0.9); },
        pin: true, scrub: 0.6, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          mark(Math.min(n - 1, Math.max(0, Math.floor(self.progress * D + 0.1))));
          var lit = Math.floor((self.progress + 0.001) * (nodes.length - 1) + 0.5);
          nodes.forEach(function (node, k) { node.classList.toggle('is-lit', k <= lit); });
        },
      });
      jump = function (i) {
        var top = trigger.start + (trigger.end - trigger.start) * (i / D) + 2;
        if (lenis) lenis.scrollTo(top, { duration: 1.2 }); else window.scrollTo({ top: top, behavior: 'smooth' });
      };
      return function () { st.removeAttribute('data-pinned'); nodes.forEach(function (node) { node.classList.remove('is-lit'); }); jump = function () {}; };
    });
    mm.add('(max-width: 1023px), (max-height: 699px)', function () {
      $$('[data-term-node]', st).forEach(function (node) { node.classList.add('is-lit'); });
      $$('[data-beat]', st).forEach(function (b) {
        gsap.from(b.children, { y: 32, autoAlpha: 0, duration: 0.75, ease: 'power3.out', stagger: 0.1, clearProps: 'all', scrollTrigger: { trigger: b, start: 'top 85%', once: true } });
      });
      jump = function (i) { var b = $$('[data-beat]', st)[i]; if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    });
  }

  /* ---------- six movements as a pinned CSS-3D film: 48 fragments rearrange per movement (portfolio film) ---------- */
  function initFragFilm(mm) {
    var ff = $('[data-ffilm]'); if (!ff) return;
    mm.add('(min-width: 900px) and (min-height: 620px)', function () {
      ff.classList.add('is-on');
      var world = $('[data-ffilm-world]', ff), frags = $$('.frag', ff), caps = $$('[data-ffilm-cap]', ff), rail = $$('[data-ffilm-jump]', ff);
      var ring = $('[data-ffilm-ring]', ff), curve = $('[data-ffilm-curve]', ff);
      var seed = function (i, s) { var x = Math.sin((i + 1) * s) * 43758.5453; return x - Math.floor(x); };
      var S = Math.min(1.25, Math.max(0.8, window.innerWidth / 1400));
      function pose(s, i) {
        var col = i % 8, row = Math.floor(i / 8), p;
        if (s === 0) p = { x: (seed(i, 12.19) - 0.5) * 520, y: (seed(i, 32.4) - 0.5) * 340, z: (seed(i, 76.3) - 0.5) * 420, rX: seed(i, 15) * 180, rY: seed(i, 18) * 180, scale: 0.65 + seed(i, 8) * 1.3, opacity: 0.25 + seed(i, 4.8) * 0.75 };
        else if (s === 1) p = { x: ((i % 3) - 1) * 150 + (seed(i, 5) - 0.5) * 46, y: (Math.floor(i / 3) - 7.5) * 17, z: ((i % 3) - 1) * 75, rX: 0, rY: (i % 3 - 1) * 28, scale: 0.8, opacity: i > 41 ? 0.12 : 0.92 };
        else if (s === 2) p = { x: (col - 3.5) * 56, y: 67 - Math.exp(-Math.pow((col - 3.5) / 2.3, 2)) * 155 + row * 11, z: (row - 2.5) * 38, rX: 0, rY: 0, scale: 1, opacity: 0.95 };
        else if (s === 3) { var branch = Math.floor(row / 2) - 1; p = { x: (col - 3.5) * 59, y: branch * (col + 1) * 15, z: branch === 0 ? 88 : -96 - Math.abs(branch) * 70, rX: 0, rY: branch === 0 ? 0 : 45, scale: branch === 0 ? 1.1 : 0.74, opacity: branch === 0 ? 1 : 0.16 }; }
        else if (s === 4) { var a = (i % 6) * Math.PI / 3, r = 138 + (Math.floor(i / 6) - 3.5) * 3; p = { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.82, z: Math.sin(a) * 22, rX: 0, rY: (i % 6) * 60, scale: 1, opacity: 0.94 }; }
        else p = { x: (col - 3.5) * 53, y: (row - 2.5) * 42, z: 0, rX: 0, rY: 0, scale: 0.82, opacity: 0.8 };
        return { x: p.x * S, y: p.y * S, z: p.z * S, rotateX: p.rX, rotateY: p.rY, scale: p.scale, autoAlpha: p.opacity };
      }
      var cam = [[-5, -12, 0], [8, 7, -40], [12, -16, 35], [0, 0, 45], [-7, 12, 0], [0, 0, 0]];
      var n = caps.length;
      frags.forEach(function (f, i) { gsap.set(f, pose(0, i)); });
      gsap.set(world, { rotateX: cam[0][0], rotateY: cam[0][1], z: cam[0][2] });
      gsap.set(caps, { autoAlpha: 0, y: 34 }); gsap.set(caps[0], { autoAlpha: 1, y: 0 });
      gsap.set([ring, curve], { autoAlpha: 0 });
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      for (var s = 0; s < n - 1; s++) {
        (function (s) {
          var nx = s + 1;
          frags.forEach(function (f, i) { tl.to(f, Object.assign({ duration: 1 }, pose(nx, i)), s); });
          tl.to(world, { rotateX: cam[nx][0], rotateY: cam[nx][1], z: cam[nx][2], duration: 1 }, s);
          tl.to(caps[s], { autoAlpha: 0, y: -34, duration: 0.18 }, s + 0.76).to(caps[nx], { autoAlpha: 1, y: 0, duration: 0.24 }, s + 0.78);
          tl.to(curve, { autoAlpha: nx === 2 ? 1 : 0, duration: 0.3 }, s + 0.2).to(ring, { autoAlpha: nx === 4 ? 1 : 0, duration: 0.3 }, s + 0.2);
        })(s);
      }
      var active = -1;
      // the scrub keeps easing after the scroll stops, so the rail follows the timeline, not the scroll position
      tl.eventCallback('onUpdate', function () {
        var cur = Math.min(n - 1, Math.floor(tl.time() + 0.001));
        if (cur === active) return; active = cur;
        ff.setAttribute('data-scene', cur);
        rail.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      });
      var trigger = ScrollTrigger.create({
        trigger: ff, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * (n - 1) * 0.85); },
        pin: true, scrub: 1.1, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
      });
      function go(e) {
        var i = Number(e.currentTarget.dataset.ffilmJump);
        var top = trigger.start + (trigger.end - trigger.start) * Math.min(1, (i + 0.08) / (n - 1));
        if (lenis) lenis.scrollTo(top, { duration: 1.2 }); else window.scrollTo({ top: top, behavior: 'smooth' });
      }
      rail.forEach(function (b) { b.addEventListener('click', go); });
      return function () { ff.classList.remove('is-on'); ff.removeAttribute('data-scene'); rail.forEach(function (b) { b.removeEventListener('click', go); }); };
    });
  }

  /* ---------- interactions that work with or without GSAP and with reduced motion ---------- */
  function initInteractive() {
    // sector network on /why-ip3: pick a sector, its ties light up
    $$('[data-smap]').forEach(function (map) {
      var tabs = $$('[data-pick]', map), panels = $$('[data-panel]', map), nodes = $$('[data-n]', map), edges = $$('[data-e]', map);
      function pick(i) {
        tabs.forEach(function (t, k) { t.setAttribute('aria-pressed', String(k === i)); });
        panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
        nodes.forEach(function (n, k) { n.classList.toggle('is-on', k === i); });
        var tied = {};
        edges.forEach(function (e) { var ab = e.dataset.e.split(' ').map(Number), on = ab[0] === i || ab[1] === i; e.classList.toggle('is-on', on); if (on) tied[ab[0] === i ? ab[1] : ab[0]] = 1; });
        nodes.forEach(function (n, k) { n.classList.toggle('is-tied', !!tied[k]); });
      }
      tabs.forEach(function (t, k) { t.addEventListener('click', function () { pick(k); }); });
      nodes.forEach(function (n, k) { n.addEventListener('click', function () { pick(k); }); });
      map.classList.add('is-live'); pick(0);
    });

    // publication filter on /insights
    $$('[data-pub-filter]').forEach(function (group) {
      var list = $(group.dataset.pubFilter), btns = $$('button', group);
      btns.forEach(function (b) { b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $$('[data-kind]', list).forEach(function (row) { row.hidden = !!b.dataset.kind && row.dataset.kind !== b.dataset.kind; });
      }); });
      group.hidden = false;
    });

    // people profiles open in a dialog; without JS (or <dialog>) the details element expands in place
    var dlg = $('[data-profile-dialog]');
    if (dlg && typeof dlg.showModal === 'function') {
      var body = $('[data-profile-content]', dlg);
      $$('[data-profile]').forEach(function (card) {
        var sum = $('summary', card); if (!sum) return;
        sum.addEventListener('click', function (e) {
          e.preventDefault();
          body.innerHTML = '';
          var head = d.createElement('div'); head.className = 'pdlg__head';
          var av = $('.person__av', card); if (av) head.appendChild(av.cloneNode(true));
          var meta = d.createElement('div');
          ['h4', '.role', '.aff'].forEach(function (s) { var x = $(s, card); if (x) meta.appendChild(x.cloneNode(true)); });
          head.appendChild(meta); body.appendChild(head);
          var more = $('[data-profile-body]', card); if (more) body.appendChild(more.cloneNode(true));
          dlg.showModal(); if (lenis) lenis.stop();
        });
      });
      dlg.addEventListener('close', function () { if (lenis) lenis.start(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-profile-close]')) dlg.close(); });
    }

    // method diagrams draw in when they reach the viewport
    var charts = $$('[data-chart]');
    if (charts.length && 'IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }); }, { threshold: 0.35 });
      charts.forEach(function (c) { c.classList.add('is-armed'); io.observe(c); });
    }

    // drifting labelled network (IP3 Motion engine), used on /people for the Dynamic Network Model
    $$('canvas[data-net]').forEach(function (c) { mountNet(c); });

    // pointer tilt on cards: a light 3D lean towards the cursor with a moving highlight
    if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('[data-tilt], .tile, .ins-card, .person, .cap, .wk, .hs__card, .quote').forEach(function (card) {
        var rect = null;
        card.classList.add('tilt');
        card.addEventListener('pointerenter', function () { rect = card.getBoundingClientRect(); });
        card.addEventListener('pointermove', function (e) {
          if (!rect) rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width - 0.5, y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg'); card.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
          card.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%'); card.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', function () { rect = null; card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
      });
    }
  }

  function mountNet(canvas) {
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    var labels = (canvas.dataset.nodes || '').split('|').filter(Boolean);
    var colors = ['#963f2e', '#0f6b3d', '#c96a4a', '#6ab43d', '#b5523a', '#47433f'];
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, visible = true;
    var rnd = (function (a) { return function () { a = (a + 0x6d2b79f5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })(41);
    var nodes = labels.map(function (l, i) { return { l: l.toUpperCase(), c: colors[i % colors.length], x: 0.15 + rnd() * 0.7, y: 0.2 + rnd() * 0.6, vx: (rnd() - 0.5) * 0.0011, vy: (rnd() - 0.5) * 0.0011, p: rnd() * 4000 }; });
    function resize() { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize(); window.addEventListener('resize', resize);
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      if (!reduce) nodes.forEach(function (n) { n.x += n.vx; n.y += n.vy; if (n.x < 0.08 || n.x > 0.84) n.vx *= -1; if (n.y < 0.14 || n.y > 0.86) n.vy *= -1; });
      var reach = Math.max(w, h) * 0.55;
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j], dd = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
        if (dd < reach) { ctx.strokeStyle = 'rgba(22,21,19,' + (0.2 * (1 - dd / reach)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke(); }
      }
      nodes.forEach(function (n) {
        var X = n.x * w, Y = n.y * h, ph = ((t + n.p) % 3600) / 3600;
        ctx.globalAlpha = reduce ? 0.3 : (1 - ph) * 0.5; ctx.strokeStyle = n.c; ctx.beginPath(); ctx.arc(X, Y, 6 + (reduce ? 10 : ph * 30), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = n.c; ctx.beginPath(); ctx.arc(X, Y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(22,21,19,.75)'; ctx.font = '600 10px Montserrat, system-ui, sans-serif'; ctx.fillText(n.l, X + 12, Y + 3.5);
      });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);
    if (reduce) { draw(0); return; }
    (function loop(t) { if (visible) draw(t); requestAnimationFrame(loop); })(0);
  }

  /* ---------- mandate finder (/find-support) — runs only in the browser; nothing is stored or sent ---------- */
  function initFinder() {
    var f = $('[data-finder]');
    if (!f) return;
    var out = $('[data-finder-out]', f), empty = $('[data-finder-empty]', f), go = $('[data-finder-contact]', f);
    var has = function (el, k, v) { return (' ' + (el.getAttribute('data-' + k) || '') + ' ').indexOf(' ' + v + ' ') > -1; };
    function update() {
      var s = f.elements.sector.value, h = f.elements.help.value, ready = !!(s && h);
      out.hidden = !ready; empty.hidden = ready;
      go.parentNode.hidden = !ready;
      if (!ready) return;
      $$('.mf-group', out).forEach(function (g) {
        var and = g.getAttribute('data-mode') === 'and', shown = 0;
        $$('.mf-item', g).forEach(function (it) {
          var sm = has(it, 'sectors', s) || has(it, 'sectors', '*'), hm = has(it, 'helps', h);
          var on = and ? sm && hm : sm || hm;
          it.hidden = !on; if (on) shown++;
          if (on && sm) g.querySelector('ul').insertBefore(it, g.querySelector('ul').firstChild); // sector matches first
        });
        $('.mf-none', g).hidden = shown > 0;
      });
      go.href = '/contact?sector=' + encodeURIComponent(s) + '&help=' + encodeURIComponent(h) + '#contact-form';
    }
    f.addEventListener('change', update);
    f.addEventListener('reset', function () { setTimeout(update, 0); });
    update();
  }
  function initFinderPrefill() {
    var src = $('#finder-prefill'), form = $('#contact-form');
    if (!src || !form || !window.URLSearchParams) return;
    var q = new URLSearchParams(location.search), map;
    try { map = JSON.parse(src.textContent); } catch (e) { return; }
    var sector = map.sectors[q.get('sector')], help = map.help[q.get('help')];
    if (!sector || !help) return; // only known keys are accepted; free text from the URL is never used
    var pick = function (name, text) { var el = form.elements[name]; if (el && text) $$('option', el).forEach(function (o) { if (o.textContent === text) el.value = o.value; }); };
    pick('engagement', help.engagement); pick('focus', help.focus);
    if (form.elements.message && !form.elements.message.value) form.elements.message.value = map.message.replace('{{sector}}', sector).replace('{{help}}', help.label) + '\n\n';
  }

  /* ---------- boot ---------- */
  (function initExplorerPrefill(){
    var src = $('#explorer-prefill'), form = $('#contact-form');
    if (!src || !form) return;
    var map; try { map = JSON.parse(src.textContent); } catch (e) { return; }
    var slug = new URLSearchParams(location.search).get('discipline');
    if (!Object.prototype.hasOwnProperty.call(map, slug)) return;
    var choice = map[slug];
    $$('option', form.elements.focus).forEach(function(option){ if(option.textContent === choice.focus) form.elements.focus.value = option.value; });
    if (!form.elements.message.value) form.elements.message.value = 'I would like to discuss a ' + choice.title + ' question.\n\n';
  })();
  initFinder(); initFinderPrefill();
  initChrome(); initForms(); initLazyVideo(); initInteractive(); initHsNative(); initChain(); initEvidence(); initHand(); initWhy(); initTilt();
  // Sector narratives own their motion lifecycle. Keep their policy text visible,
  // use native scrolling, and avoid stacking global reveals/Lenis over the scene.
  if (d.body.classList.contains('sxp') || d.body.classList.contains('explore-model')) {
    window.addEventListener('load', jumpToHash);
    return;
  }
  if (!hasGsap) { root.classList.remove('js'); initHero(); return; }
  initLenis();
  initHero();
  if (reduce) { $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; }); window.addEventListener('load', jumpToHash); return; }
  initScroll();
  initTransitions();
})();
