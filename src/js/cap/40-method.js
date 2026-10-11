/* method.js — the five stages. Wide screens: a pinned CSS-3D tunnel; the scroll position moves the camera through the planes and the
   plane in front plays its graphic. Narrow screens: stacked panels that play as they scroll into view. Reduced motion: final states. */
(function () {
  var cp = window.cp, sec = cp.$('#cp-method');
  if (!sec) return;
  var stage = cp.$('[data-cp-method]', sec), tunnel = cp.$('.cp-tunnel', sec), floor = cp.$('.cp-method__floor', sec);
  var planes = cp.$$('.cp-plane', sec), links = cp.$$('.cp-rail a', sec), n = planes.length;

  // the evidence dot field: one dot per unit, coloured by part, drawn up to a fraction of the total
  function drawDots(cv, f) {
    var parts = (cv.dataset.parts || '').split(',').map(Number).filter(Boolean);
    var total = parts.reduce(function (a, b) { return a + b; }, 0); if (!total) return;
    var cols = 33, rows = Math.ceil(total / cols), cell = cv.width / cols, r = cell * 0.3;
    cv.height = Math.round(rows * cell);
    var colours = cp.$$('.cp-g__legend i', cv.parentNode).map(function (i) { return getComputedStyle(i).backgroundColor; });
    var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
    var shown = Math.round(total * f), k = 0;
    for (var p = 0; p < parts.length; p++) {
      for (var j = 0; j < parts[p]; j++, k++) {
        var x = (k % cols) * cell + cell / 2, y = Math.floor(k / cols) * cell + cell / 2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = k < shown ? colours[p] || '#fff' : 'rgba(255,255,255,.08)';
        ctx.fill();
      }
    }
  }
  function tween(ms, step) {
    var t0 = performance.now();
    (function frame(t) { var f = Math.min(1, (t - t0) / ms); step(1 - Math.pow(1 - f, 3)); if (f < 1) requestAnimationFrame(frame); })(t0);
  }
  function play(el) {
    if (el.classList.contains('is-on')) return;
    el.classList.add('is-on');
    var cv = cp.$('.cp-dots', el), num = cp.$('[data-cp-count]', el);
    if (cp.reduce) { if (cv) drawDots(cv, 1); return; }
    if (cv) tween(1800, function (f) { drawDots(cv, f); });
    if (num) { var end = parseFloat(num.dataset.cpCount); tween(1800, function (f) { num.textContent = Math.round(end * f); }); }
  }
  cp.$$('.cp-dots', sec).forEach(function (cv) { drawDots(cv, cp.reduce ? 1 : 0); });
  if (cp.reduce) { planes.forEach(play); return; }
  sec.classList.add('cp-anim');

  var observeStacked = function () {
    if (!('IntersectionObserver' in window)) { planes.forEach(play); return function () {}; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -20% 0px' });
    planes.forEach(function (p) { io.observe(p); });
    return function () { io.disconnect(); };
  };
  if (!cp.gsapReady()) { observeStacked(); return; }

  var mm = gsap.matchMedia();
  mm.add('(max-width: 899px)', observeStacked);
  mm.add('(min-width: 900px)', function () {
    sec.classList.add('is-3d');
    var active = -1, EDGE = 0.05, st;
    var map = function (pr) { return Math.min(1, Math.max(0, (pr - EDGE) / (1 - 2 * EDGE))) * (n - 1); };
    var yFor = function (i) { return st.start + (st.end - st.start) * (EDGE + (i / (n - 1)) * (1 - 2 * EDGE)); };
    function layout(p) {
      var spread = Math.min(220, window.innerWidth * 0.14);
      planes.forEach(function (el, i) {
        var d = i - p, ad = Math.abs(d), dir = i % 2 ? 1 : -1;
        var z = d < 0 ? -d * 700 : -d * 950;
        var o = d < 0 ? 1 + d * 2.4 : 1 - d * 0.55;
        o = Math.max(0, Math.min(1, o));
        el.style.transform = 'translate(-50%,-50%) translate3d(' + (d * spread * dir).toFixed(1) + 'px,' + (d > 0 ? -d * 46 : -d * 30).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (d * -7 * dir).toFixed(2) + 'deg)';
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
        el.style.zIndex = String(100 - Math.round(ad * 10) - (d < 0 ? 50 : 0));
        el.style.pointerEvents = ad < 0.35 ? 'auto' : 'none';
        el.style.setProperty('--d', d.toFixed(3));
      });
      if (floor) floor.style.setProperty('--fy', (p * 260).toFixed(1) + 'px');
      var a = Math.round(p);
      if (a !== active) {
        active = a; play(planes[a]);
        planes.forEach(function (el, k) { el.classList.toggle('is-active', k === a); });
        links.forEach(function (l, k) { if (k === a) l.setAttribute('aria-current', 'step'); else l.removeAttribute('aria-current'); });
      }
    }
    st = ScrollTrigger.create({
      trigger: stage, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * (n - 1) * 1.1); },
      pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) { layout(map(self.progress)); },
      onRefresh: function (self) { layout(map(self.progress)); },
    });
    layout(map(st.progress));

    var onRail = function (e) { e.preventDefault(); cp.scrollTo(yFor(+this.dataset.i)); };
    links.forEach(function (l) { l.addEventListener('click', onRail); });
    // keyboard users tabbing into a plane behind the camera are taken to it
    var onFocus = function () { var i = +this.dataset.i; if (i !== active) { var l = cp.lenis(); if (l) l.scrollTo(yFor(i), { immediate: true }); else window.scrollTo(0, yFor(i)); } };
    planes.forEach(function (p) { p.addEventListener('focusin', onFocus); });

    var moveTunnel = null, leave = null;
    if (cp.fine) {
      var rx = gsap.quickTo(tunnel, 'rotationX', { duration: 0.9, ease: 'power3' }), ry = gsap.quickTo(tunnel, 'rotationY', { duration: 0.9, ease: 'power3' });
      moveTunnel = function (e) { var r = stage.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 6); rx(-((e.clientY - r.top) / r.height - 0.5) * 4); };
      leave = function () { rx(0); ry(0); };
      stage.addEventListener('pointermove', moveTunnel); stage.addEventListener('pointerleave', leave);
    }
    return function () {
      sec.classList.remove('is-3d');
      links.forEach(function (l) { l.removeEventListener('click', onRail); l.removeAttribute('aria-current'); });
      planes.forEach(function (p) { p.removeEventListener('focusin', onFocus); p.removeAttribute('style'); p.classList.remove('is-active'); });
      if (moveTunnel) { stage.removeEventListener('pointermove', moveTunnel); stage.removeEventListener('pointerleave', leave); gsap.set(tunnel, { clearProps: 'transform' }); }
    };
  });
})();
