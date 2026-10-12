/* Shared sector helpers. Motion is opt-in enhancement; preference changes apply
   without reloading. Native scrolling and readable HTML remain the baseline. */
window.sx = (function () {
  var media = window.matchMedia('(prefers-reduced-motion: reduce)'), preference = false;
  try { preference = localStorage.getItem('ip3-sector-reduce-motion') === 'true'; } catch (_) {}
  var callbacks = [], api;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(f) { return f * f * (3 - 2 * f); }
  function frame(keys, sp) {
    var x = clamp(sp + 1, 0, keys.length - 1), i = Math.floor(x), j = Math.min(keys.length - 1, i + 1), f = smooth(x - i), a = keys[i], b = keys[j], o = {};
    for (var k in a) o[k] = a[k] + (b[k] - a[k]) * f;
    return o;
  }
  function near(el, margin) { var r = el.getBoundingClientRect(), m = margin || 0; return r.bottom > -m && r.top < window.innerHeight + m; }
  function scrollTo(y) { window.scrollTo({ top: y, behavior: api.reduce ? 'instant' : 'smooth' }); }
  function apply() {
    api.reduce = media.matches || preference;
    document.body.dataset.sxReduced = String(api.reduce);
    $$('[data-sx-motion]').forEach(function (input) { input.checked = api.reduce; input.disabled = media.matches; });
    callbacks.forEach(function (fn) { fn(api.reduce); });
  }
  api = { reduce: media.matches || preference, $: $, $$: $$, clamp: clamp, smooth: smooth, frame: frame, near: near, mq: function (q) { return window.matchMedia(q).matches; }, scrollTo: scrollTo, viz: {},
    onMotion: function (fn) { callbacks.push(fn); fn(api.reduce); }
  };
  $$('[data-sx-motion-control]').forEach(function (el) { el.hidden = false; });
  $$('[data-sx-motion]').forEach(function (input) {
    input.addEventListener('change', function () {
      preference = input.checked;
      try { localStorage.setItem('ip3-sector-reduce-motion', String(preference)); } catch (_) {}
      apply();
    });
  });
  media.addEventListener('change', apply);
  apply();
  return api;
})();
