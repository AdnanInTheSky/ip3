/* hero — as the page scrolls, the aperture closes in and the camera pulls back (writes --hp, 0→1, on the hero).
   The header film pauses while the hero is off screen, and does not play at all under reduced motion. */
(function () {
  var sx = window.sx, hero = sx.$('[data-sx-hero]');
  if (!hero) return;
  var video = sx.$('video', hero);
  if (video && sx.reduce) { video.removeAttribute('autoplay'); video.pause(); }
  else if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else video.pause();
    }).observe(hero);
  }
  if (sx.reduce) return;
  var last = -1;
  sx.tick(function () {
    if (!sx.near(hero)) return;
    var p = Math.round(sx.stickProgress(hero) * 1000) / 1000;
    if (p !== last) { last = p; hero.style.setProperty('--hp', p); }
  });
})();
