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

  /* ---------- contact form (mailto) ---------- */
  function initForms() {
    $$('[data-contact-form]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
        var ok = true;
        ['name', 'email', 'message'].forEach(function (n) { var el = f.elements[n]; var bad = !v(n) || (n === 'email' && !/^\S+@\S+\.\S+$/.test(v(n))); el.style.borderColor = bad ? '#e0705a' : ''; if (bad) ok = false; });
        if (!ok) { var first = $('input[style*="e0705a"],textarea[style*="e0705a"]', f); if (first) first.focus(); return; }
        var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nOrganization: ' + v('organization') + '\nEngagement type: ' + v('engagement') + '\nFocus area: ' + v('focus') + '\n\n' + v('message');
        f.classList.add('is-sent');
        window.location.href = 'mailto:info@ip3-bd.org?subject=' + encodeURIComponent('Website enquiry — ' + v('engagement') + ' — ' + v('name')) + '&body=' + encodeURIComponent(body);
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
    var n = slides.length, cur = 0, DUR = 8, tween = null, inView = true, hold = false, timer = null;
    var words = texts.map(function (t) { return splitWords($('h1,h2', t)); });
    function playVideo(i, restart) {
      var v = $('video', slides[i]); if (!v) return;
      if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
      if (restart) { try { v.currentTime = 0; } catch (e) {} }
      if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
    function warm(i) { var v = $('video', slides[i]); if (v && v.preload === 'none') { v.preload = 'auto'; v.load(); } }
    function animateText(i, first) {
      if (!hasGsap || reduce) return;
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
      if (reduce) return;
      var bar = $('i', tabs[cur]);
      if (hasGsap) {
        tween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: 'none', onComplete: function () { go(cur + 1); } });
        if (!inView || hold || d.hidden) tween.pause();
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
      playVideo(cur, !first);
      warm((cur + 1) % n);
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
    hero.addEventListener('mouseleave', function () { hold = false; if (tween && inView && !d.hidden) tween.resume(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      var cv = $('video', slides[cur]);
      if (inView) { if (tween && !hold && !d.hidden) tween.resume(); if (cv && !reduce) { var p = cv.play(); if (p && p.catch) p.catch(function () {}); } }
      else { if (tween) tween.pause(); if (cv) cv.pause(); }
    }, { threshold: 0.2 }).observe(hero);
    d.addEventListener('visibilitychange', function () { if (!tween) return; d.hidden ? tween.pause() : (inView && !hold && tween.resume()); });
    // initial state
    texts.forEach(function (t, k) { if (k !== 0) t.classList.remove('is-active'); });
    var start = function () { if (hero.classList.contains('ready')) return; go(0, true); hero.classList.add('ready'); };
    setTimeout(start, 2500);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else start();
  }

  /* ---------- Lenis ---------- */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, wheelMultiplier: 0.95 });
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
    if (reduce) return;
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
    $$('[data-parallax-bg]').forEach(function (el) {
      gsap.to(el, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el.closest('.phero') || el, start: 'top top', end: 'bottom top', scrub: true } });
    });

    // counters
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count), o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 2.2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      } });
    });

    var mm = gsap.matchMedia();

    // stacking deck (mandates)
    mm.add('(min-width: 1041px)', function () {
      var cards = $$('[data-deck]');
      cards.forEach(function (c, i) {
        var next = cards[i + 1]; if (!next) return;
        gsap.to(c, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: next, start: 'top 72%', end: 'top 24%', scrub: true } });
      });
    });

    // horizontal sector scroller
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
      var hs = $('[data-hs]'), track = $('[data-hs-track]'), fill = $('[data-hs-fill]'); if (!hs || !track) return;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: {
        trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { if (fill) fill.style.transform = 'scaleX(' + s.progress + ')'; },
      } });
    });

    // translation: sticky step highlight
    var steps = $$('[data-step]'), rail = $$('[data-rail] li');
    steps.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: 'top 58%', end: 'bottom 58%', onToggle: function (self) {
        if (!self.isActive) return;
        steps.forEach(function (x, k) { x.classList.toggle('is-active', k === i); });
        rail.forEach(function (x, k) { x.classList.toggle('is-active', k === i); });
      } });
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

    // layout settles after fonts/images
    var refresh = function () { ScrollTrigger.refresh(); };
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(refresh);
    window.addEventListener('load', function () { setTimeout(refresh, 250); jumpToHash(); });
  }

  /* ---------- boot ---------- */
  initChrome(); initForms(); initLazyVideo();
  if (!hasGsap) { root.classList.remove('js'); initHero(); return; }
  initLenis();
  initHero();
  if (reduce) { $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; }); window.addEventListener('load', jumpToHash); return; }
  initScroll();
  initTransitions();
})();
