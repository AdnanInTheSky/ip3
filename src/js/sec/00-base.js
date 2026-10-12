/* /sectors/<slug> — shared helpers for the section scripts (10-hero.js, 20-statement.js ...). Loaded after site.js, only on the
   eight sector pages. Each section script is an IIFE that returns early when its element is missing. Under prefers-reduced-motion
   the scripts show final states and add no scroll effects; the page must read fully without any of it.
   One scroll loop: modules register update functions with sx.tick(); they run once per animation frame after a scroll or resize. */
window.sx = (function () {
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(f) { return f * f * (3 - 2 * f); }
  function lerp(a, b, f) { return a + (b - a) * f; }
  // keyframes: keys[0] is the state before the first step (sp = -1), keys[k + 1] the state at step k; returns an interpolated copy
  function frame(keys, sp) {
    var x = clamp(sp + 1, 0, keys.length - 1), i = Math.floor(x), j = Math.min(keys.length - 1, i + 1), f = smooth(x - i), a = keys[i], b = keys[j], o = {};
    for (var k in a) o[k] = a[k] + (b[k] - a[k]) * f;
    return o;
  }
  // progress of a tall section whose stage is sticky: 0 when its top reaches the viewport top, 1 when its bottom reaches the bottom
  function stickProgress(el) {
    var r = el.getBoundingClientRect(), span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < 0 ? 1 : 0);
  }
  // progress of an element moving through the viewport: 0 when its top is at `from` (fraction of viewport height), 1 at `to`
  function viewProgress(el, from, to) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp((vh * from - r.top) / (vh * (from - to)), 0, 1);
  }
  function near(el, margin) { var r = el.getBoundingClientRect(), m = margin || 0; return r.bottom > -m && r.top < window.innerHeight + m; }

  var subs = [], queued = false;
  function run() { queued = false; for (var i = 0; i < subs.length; i++) subs[i](); }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(run); } }
  function tick(fn) { subs.push(fn); queue(); }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  function lenis() { return window.ip3Lenis || null; }
  function scrollTo(y) {
    var l = lenis();
    if (l) l.scrollTo(y, { duration: reduce ? 0 : 1.2, immediate: reduce });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  return { reduce: reduce, mq: mq, $: $, $$: $$, clamp: clamp, smooth: smooth, lerp: lerp, frame: frame, stickProgress: stickProgress, viewProgress: viewProgress, near: near, tick: tick, queue: queue, lenis: lenis, scrollTo: scrollTo, viz: {} };
})();
