/* next — the next sector's photo opens from a small window to the full frame as the portal rises into view (writes --np 0→1). */
(function () {
  var sx = window.sx, sec = sx.$('[data-sx-next]');
  if (!sec || sx.reduce) return;
  var portal = sx.$('.sx-next__portal', sec), last = -1;
  sec.style.setProperty('--np', 0);
  sx.tick(function () {
    if (!sx.near(sec, 100)) return;
    var p = Math.round(sx.viewProgress(portal, 1, 0.42) * 1000) / 1000;
    if (p !== last) { last = p; sec.style.setProperty('--np', p); }
  });
})();
