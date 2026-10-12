/* CSS-3D drawings: terrain (climate), ladder (education), stack (digital government). Each writes custom properties and classes;
   the stylesheet (31-viz-3d.css) does the rest. Keyframes: the first entry is the state before step 1. */
(function () {
  var sx = window.sx;
  function setter(el) {
    var cache = {};
    return function (vars) {
      for (var k in vars) {
        var v = Math.round(vars[k] * 1000) / 1000;
        if (cache[k] !== v) { cache[k] = v; el.style.setProperty('--' + k, v); }
      }
    };
  }

  // 01 — climate: water rises over the low ground (risk), a plan grid settles (plan), infrastructure rises (build),
  // finance flows in (finance), the canopy spreads (govern). The camera orbits a little with each step.
  sx.viz.terrain = function (viz) {
    var root = sx.$('.sx-terrain', viz); if (!root) return null;
    var put = setter(root);
    var K = [
      { water: 0.3, risk: 0, grid: 0, grow: 0, flow: 0, canopy: 0, spin: -60, tilt: 70, zoom: 0.84 },
      { water: 3.4, risk: 1, grid: 0, grow: 0, flow: 0, canopy: 0, spin: -44, tilt: 63, zoom: 1 },
      { water: 3.4, risk: 0.7, grid: 1, grow: 0, flow: 0, canopy: 0, spin: -34, tilt: 61, zoom: 1.03 },
      { water: 2.2, risk: 0.12, grid: 0.35, grow: 1, flow: 0, canopy: 0, spin: -24, tilt: 60, zoom: 1.06 },
      { water: 2.2, risk: 0.08, grid: 0.2, grow: 1, flow: 1, canopy: 0, spin: -15, tilt: 60, zoom: 1.04 },
      { water: 2, risk: 0.04, grid: 0.15, grow: 1, flow: 0.45, canopy: 1, spin: -6, tilt: 59, zoom: 1 },
    ];
    return { set: function (sp) { put(sx.frame(K, sp)); } };
  };

  // 02 — education: the platforms rise into a staircase; the camera climbs with the reader; the trail lights up to the current stage
  sx.viz.ladder = function (viz, n) {
    var root = sx.$('.sx-ladder', viz); if (!root) return null;
    var put = setter(root), plats = sx.$$('.sx-ladder__p', root), cur = -2;
    return {
      set: function (sp) {
        put({ sp: sp, cam: sx.clamp(sp, 0, n - 1), 'rise-f': sx.smooth(sx.clamp(sp + 1, 0, 1)) });
        var a = Math.round(sp);
        if (a === cur) return;
        cur = a;
        plats.forEach(function (p, i) { p.classList.toggle('is-on', i === a); p.classList.toggle('is-done', i < a); });
      },
    };
  };

  // 04 — digital government: the plates separate (an exploded view) as the scene starts; the current layer lights up
  sx.viz.stack = function (viz, n) {
    var root = sx.$('.sx-stack', viz); if (!root) return null;
    var plates = sx.$$('.sx-stack__p', root), cur = -2, unit = function () { return Math.max(34, Math.min(70, window.innerWidth * 0.052)); };
    return {
      set: function (sp) {
        var open = sx.smooth(sx.clamp(sp + 1, 0, 1));
        root.style.setProperty('--gap', (unit() * (0.18 + 0.82 * open)).toFixed(1) + 'px');
        var a = Math.round(sp);
        if (a === cur) return;
        cur = a;
        plates.forEach(function (p, i) { p.classList.toggle('is-on', i === a); });
      },
    };
  };
})();
