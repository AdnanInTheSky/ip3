/* gallery — wide screens with motion allowed: the section grows tall, its stage sticks, and the camera flies forward through
   the photos and films, which hang at different depths and sides. The caption shows on the frame nearest the camera.
   Narrow screens, reduced motion or fewer than three frames: the swipeable row from the stylesheet. */
(function () {
  var sx = window.sx, sec = sx.$('[data-sx-gal]');
  if (!sec) return;
  var items = sx.$$('[data-sx-gal-item]', sec), n = items.length, D = 1000, on = false;
  var wide = function () { return !sx.reduce && n >= 3 && window.innerWidth >= 900; };
  function place(p) {
    var vw = window.innerWidth / 100, cam = p * ((n - 1) * D + D * 0.55);
    items.forEach(function (it, i) {
      var z = -i * D + cam - D * 0.35, side = i % 2 ? 1 : -1, x = side * (13 + (i % 3) * 3) * vw, y = (i % 3 - 1) * 4 * window.innerHeight / 100;
      var far = sx.clamp(1 + z / (D * 2.6), 0, 1), past = sx.clamp(1 - (z - 120) / 380, 0, 1), o = Math.min(far, past);
      it.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (side * -6).toFixed(1) + 'deg)';
      it.style.opacity = o.toFixed(3);
      it.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      it.style.setProperty('--cap', sx.clamp(1 - Math.abs(z + 60) / 420, 0, 1).toFixed(3));
      it.style.zIndex = String(1000 + Math.round(z));
    });
  }
  function setup() {
    var want = wide();
    if (want === on) return;
    on = want;
    sec.classList.toggle('is-3d', on);
    if (on) sec.style.height = 'calc(' + (n * 70 + 110) + 'svh)';
    else { sec.style.height = ''; items.forEach(function (it) { it.removeAttribute('style'); it.style.setProperty('--i', items.indexOf(it)); }); }
  }
  setup();
  window.addEventListener('resize', setup);
  sx.tick(function () { if (on && sx.near(sec)) place(sx.stickProgress(sec)); });
})();
