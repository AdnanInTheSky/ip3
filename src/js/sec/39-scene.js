/* ScrollTrigger supplies progress notifications; one bounded rAF interpolates
   the model with time-based damping. Text never fades or changes position. */
(function () {
  var sx = window.sx, sec = sx.$('[data-sx-scene]');
  if (!sec) return;
  var viz = sx.$('[data-sx-viz]', sec), steps = sx.$$('[data-sx-step]', sec), rail = sx.$$('[data-sx-jump]', sec), n = steps.length;
  var nowN = sx.$('[data-sx-now-n]', sec), nowL = sx.$('[data-sx-now-l]', sec), bar = sx.$('[data-sx-progress]', sec);
  var drawer, trigger, raf = 0, sp = 0, goal = 0, time = 0, active = -1, enabled = false;
  try { drawer = sx.viz[sec.dataset.sxScene](viz, n); } catch (_) { drawer = null; }
  function setActive(i) {
    if (i === active) return;
    active = i;
    steps.forEach(function (step, k) { step.classList.toggle('is-on', i === k); });
    rail.forEach(function (a, k) { if (i === k) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    nowN.textContent = String(i + 1).padStart(2, '0');
    nowL.textContent = rail[i].textContent.trim();
  }
  function draw(value) {
    if (drawer) drawer.set(value, sx.reduce);
    viz.style.setProperty('--phase', (value / Math.max(1, n - 1)).toFixed(4));
    bar.style.transform = 'scaleX(' + ((value + 1) / n).toFixed(4) + ')';
  }
  function target() {
    var line = window.innerHeight * 0.52;
    var centres = steps.map(function (s) { var r = s.getBoundingClientRect(); return r.top + r.height / 2; });
    if (line <= centres[0]) return 0;
    for (var k = 0; k < n - 1; k++) if (line < centres[k + 1]) return k + (line - centres[k]) / Math.max(1, centres[k + 1] - centres[k]);
    return n - 1;
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; time = 0; }
  function step(stamp) {
    raf = 0;
    if (!enabled || document.hidden || !sx.near(sec)) { time = 0; return; }
    var dt = time ? Math.min(64, stamp - time) : 16.67; time = stamp;
    sp += (goal - sp) * (1 - Math.exp(-dt / 240));
    if (Math.abs(goal - sp) < 0.001) sp = goal;
    draw(sp);
    if (sp !== goal) raf = requestAnimationFrame(step); else time = 0;
  }
  function update() {
    if (!enabled || document.hidden || !sx.near(sec)) return;
    goal = target(); setActive(Math.round(goal));
    if (!raf) raf = requestAnimationFrame(step);
  }
  function setup() {
    stop(); if (trigger) { trigger.kill(); trigger = null; }
    enabled = !!drawer && !sx.reduce && window.innerWidth >= 900 && window.innerHeight >= 680 && !!window.ScrollTrigger;
    sec.classList.toggle('is-live', enabled);
    // Wrapped navigation, text zoom and longer CMS labels must never trap the
    // bottom of the model below the viewport. Fall back to normal document flow.
    if (enabled && sx.$('.sx-scene__sticky', sec).getBoundingClientRect().height + 98 > window.innerHeight) {
      enabled = false; sec.classList.remove('is-live');
    }
    if (!enabled) {
      draw(n - 1); active = -1;
      steps.forEach(function (s) { s.classList.remove('is-on'); });
      rail.forEach(function (a) { a.removeAttribute('aria-current'); });
      return;
    }
    sp = goal = target(); draw(sp); setActive(Math.round(goal));
    trigger = ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: update });
  }
  rail.forEach(function (a, k) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var r = steps[k].getBoundingClientRect();
      var y = window.scrollY + r.top + (enabled ? r.height / 2 - window.innerHeight * 0.52 : -104);
      history.replaceState(null, '', a.hash);
      steps[k].focus({ preventScroll: true }); sx.scrollTo(y);
    });
  });
  sx.onMotion(setup);
  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);
  if (document.fonts) document.fonts.ready.then(setup);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else update(); });
})();
