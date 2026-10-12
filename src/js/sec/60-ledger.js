/* ledger — wide screens with motion allowed: the section grows by the track's width, its stage sticks, and vertical scrolling
   slides the cards sideways; each card turns towards the centre. Otherwise the native swipe row, with the bar following it. */
(function () {
  var sx = window.sx, sec = sx.$('[data-sx-led]');
  if (!sec) return;
  var stage = sx.$('.sx-led__stage', sec), track = sx.$('[data-sx-led-track]', sec), cards = sx.$$('[data-sx-card]', sec);
  var bar = sx.$('[data-sx-led-bar]', sec), on = false, travel = 0;
  var wide = function () { return !sx.reduce && window.innerWidth >= 900 && track.scrollWidth - window.innerWidth > 160; };
  function measure() {
    travel = Math.max(0, track.scrollWidth - window.innerWidth);
    sec.style.height = Math.round(stage.offsetTop + window.innerHeight * 1.3 + travel) + 'px';
  }
  function setup() {
    var want = wide();
    if (want !== on) {
      on = want;
      sec.classList.toggle('is-pinned', on);
      if (!on) { sec.style.height = ''; track.style.transform = ''; cards.forEach(function (c) { c.style.transform = ''; }); }
    }
    if (on) measure();
    sx.queue();
  }
  setup();
  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);
  sx.tick(function () {
    if (!on || !sx.near(sec)) return;
    var r = sec.getBoundingClientRect(), span = r.height - stage.offsetTop - window.innerHeight;
    var p = span > 0 ? sx.clamp((-r.top - stage.offsetTop) / span, 0, 1) : 0;
    track.style.transform = 'translate3d(' + (-p * travel).toFixed(1) + 'px,0,0)';
    var mid = window.innerWidth / 2;
    cards.forEach(function (c) {
      var b = c.getBoundingClientRect(), d = sx.clamp((b.left + b.width / 2 - mid) / mid, -1.4, 1.4);
      c.style.transform = 'rotateY(' + (d * -16).toFixed(2) + 'deg) translateZ(' + (-Math.abs(d) * 90).toFixed(1) + 'px)';
    });
    if (bar) bar.parentNode.style.setProperty('--lp', p.toFixed(3));
  });
  // native row: the bar follows the swipe
  track.addEventListener('scroll', function () {
    if (on || !bar) return;
    var max = track.scrollWidth - track.clientWidth;
    bar.parentNode.style.setProperty('--lp', max > 0 ? (track.scrollLeft / max).toFixed(3) : '1');
  }, { passive: true });
})();
