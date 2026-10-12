/* scene (runs after the drawings 31-…38- have registered) — turns the scroll position into a continuous step value sp (−1 before the first step, 0…n−1 across the steps), eases
   towards it, and hands it to the drawing registered in sx.viz[type] (31-…38-*.js). Marks the current step, rail link and
   "now" label. Reduced motion or no drawing script: the drawing shows its final state and every step is shown. */
(function () {
  var sx = window.sx, sec = sx.$('[data-sx-scene]');
  if (!sec) return;
  var type = sec.getAttribute('data-sx-scene'), viz = sx.$('[data-sx-viz]', sec);
  var steps = sx.$$('[data-sx-step]', sec), rail = sx.$$('[data-sx-jump]', sec), n = steps.length;
  var nowN = sx.$('[data-sx-now-n]', sec), nowL = sx.$('[data-sx-now-l]', sec);
  var labels = rail.map(function (a) { return a.textContent.trim(); });
  var make = sx.viz[type], drawer = null;
  try { drawer = make ? make(viz, n) : null; } catch (e) { drawer = null; }
  var active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    rail.forEach(function (a, k) { if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    if (nowN) nowN.textContent = String(i + 1).padStart(2, '0');
    if (nowL && labels[i]) nowL.textContent = labels[i];
    viz.setAttribute('data-step', i);
  }
  if (sx.reduce || !drawer) { if (drawer) drawer.set(n - 1, true); setActive(n - 1); return; }
  sec.classList.add('is-live');

  // the fractional step whose centre sits at the viewport's reading line (55% down)
  function target() {
    var line = window.innerHeight * 0.55, c = steps.map(function (s) { var r = s.getBoundingClientRect(); return r.top + r.height / 2; });
    if (line <= c[0]) return sx.clamp(-(c[0] - line) / Math.max(1, c[1] - c[0]), -1, 0);
    for (var k = 0; k < n - 1; k++) if (line < c[k + 1]) return k + (line - c[k]) / (c[k + 1] - c[k]);
    return n - 1;
  }
  var sp = -1, goal = -1, raf = 0;
  function step() {
    raf = 0;
    sp += (goal - sp) * 0.16;
    if (Math.abs(goal - sp) < 0.002) sp = goal;
    drawer.set(sp, false);
    if (sp !== goal) raf = requestAnimationFrame(step);
  }
  sx.tick(function () {
    if (!sx.near(sec, 300)) return;
    goal = target();
    setActive(Math.max(0, Math.min(n - 1, Math.round(goal))));
    if (!raf) raf = requestAnimationFrame(step);
  });
  drawer.set(-1, false);
  // the rail jumps to a step: scroll so that the step's centre lands on the reading line
  rail.forEach(function (a, k) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var r = steps[k].getBoundingClientRect();
      sx.scrollTo(window.scrollY + r.top + r.height / 2 - window.innerHeight * 0.55);
    });
  });
  // pause ambient drawing loops while the scene is off screen
  if (drawer.visible && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { drawer.visible(es[0].isIntersecting); }).observe(viz);
})();
