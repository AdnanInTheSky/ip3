/* rows.js — each capability row comes forward in depth as it enters; its proof cards follow on a stagger */
(function () {
  var cp = window.cp, rows = cp.$$('.cp-row');
  if (!rows.length || !cp.gsapReady() || cp.reduce) return;
  var mm = gsap.matchMedia();
  mm.add('(min-width: 721px)', function () {
    rows.forEach(function (row) {
      var a = cp.$('.cp-row__a', row), b = cp.$('.cp-row__b', row), n = cp.$('.n', row);
      gsap.fromTo([a, b], { rotateX: 10, z: -90, opacity: 0.25, transformPerspective: 1300, transformOrigin: '50% 0%' }, { rotateX: 0, z: 0, opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 48%', scrub: 0.6 } });
      gsap.fromTo(n, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 60%', scrub: 0.6 } });
    });
  });
  // proof strips: cards swing in from depth, once
  cp.$$('.cp-strip').forEach(function (strip) {
    var cards = cp.$$('.cp-mini', strip);
    gsap.set(cards, { opacity: 0, z: -140, rotateY: -18, x: 40 });
    ScrollTrigger.create({ trigger: strip, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(cards, { opacity: 1, z: 0, rotateY: 0, x: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' });
    } });
  });
})();
