/* Canvas drawings: coverage (health and social protection) and lattice (AI and emerging technology). Both are labelled on the page
   as illustrative, not data. Each dot or node has a position per state; the scroll value blends neighbouring states. All drawing updates are driven by scroll progress, with no ambient timer. */
(function () {
  var sx = window.sx;
  var C = { peach: [240, 185, 163], rust: [201, 106, 74], leaf: [106, 180, 61], water: [143, 179, 201], white: [255, 255, 255] };
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')'; }
  function mix(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f].map(Math.round); }
  // blend a per-state list of values at sp (state 0 = before step 1)
  function at(list, sp) {
    var x = sx.clamp(sp + 1, 0, list.length - 1), i = Math.floor(x), j = Math.min(list.length - 1, i + 1), f = sx.smooth(x - i);
    return [i, j, f];
  }
  function canvasFor(viz, kind) {
    var cv = sx.$('[data-sx-canvas="' + kind + '"]', viz); if (!cv || !cv.getContext) return null;
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!ctx) return null;
    viz.classList.add('has-canvas');
    function size() { var r = cv.getBoundingClientRect(); cv.width = Math.max(300, Math.round(r.width * dpr)); cv.height = Math.max(220, Math.round(r.height * dpr)); }
    size(); window.addEventListener('resize', size);
    return { cv: cv, ctx: ctx, dpr: dpr };
  }

  // 03 — a population of dots: scattered → measured on a grid → split into two comparison groups → a subgroup ringed and some
  // left out → the left-out reached → the dots stacked into two columns weighed against each other
  sx.viz.coverage = function (viz) {
    var c = canvasFor(viz, 'coverage'); if (!c) return null;
    var cols = 24, rows = 14, N = cols * rows, r = rnd(1729), dots = [];
    for (var i = 0; i < N; i++) {
      var col = i % cols, row = Math.floor(i / cols), half = col < cols / 2 ? 0 : 1;
      dots.push({ col: col, row: row, half: half, rx: r(), ry: r(), ring: r() < 0.5, out: r() < 0.16, ph: r() * Math.PI * 2, k: i / N, bar: 0, bi: 0 });
    }
    // columns for the last state: the treated half becomes one column, the comparison half another (counts are illustrative)
    var bi = [0, 0];
    dots.forEach(function (d) { d.bar = d.half; d.bi = bi[d.half]++; });
    var sp = 3, t = 0;
    function pos(d, s, W, H) {
      var gx = W * 0.16 + (d.col / (cols - 1)) * W * 0.68, gy = H * 0.24 + (d.row / (rows - 1)) * H * 0.56;
      if (s === 0) return [W * 0.08 + d.rx * W * 0.84, H * 0.12 + d.ry * H * 0.78];
      if (s === 1) return [gx, gy];
      if (s === 2 || s === 3 || s === 4) return [gx + (d.half ? 1 : -1) * W * 0.06, gy];
      var per = 12, bx = d.bar ? W * 0.62 : W * 0.3, cx = d.bi % per, cy = Math.floor(d.bi / per), sz = Math.min(W, H) * 0.024;
      return [bx + (cx - per / 2) * sz, H * 0.86 - cy * sz];
    }
    function look(d, s) {
      // [colour, alpha, radius factor, ring alpha]
      if (s === 0) return [C.white, 0.22, 0.8, 0];
      if (s === 1) return [C.white, 0.85, 1, 0];
      var col = d.half ? C.water : C.peach;
      if (s === 2) return [col, 0.9, 1, 0];
      if (s === 3) return [col, d.out ? 0.18 : 0.9, 1, d.ring ? 0.9 : 0];
      if (s === 4) return [d.out && !d.half ? C.leaf : col, d.out && d.half ? 0.18 : 0.9, 1, d.ring ? 0.5 : 0];
      return [d.bar ? C.leaf : C.rust, 0.9, 0.9, 0];
    }
    function draw() {
      var ctx = c.ctx, W = c.cv.width, H = c.cv.height, base = Math.min(W, H) * 0.0105, ijf = at([0, 1, 2, 3, 4, 5], sp);
      ctx.clearRect(0, 0, W, H);
      // the gap between the two comparison groups
      var split = sx.clamp(sp - 0.5, 0, 1) * (1 - sx.clamp(sp - 3.5, 0, 1));
      if (split > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.25 * split).toFixed(3) + ')'; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(W / 2, H * 0.2); ctx.lineTo(W / 2, H * 0.84); ctx.stroke(); ctx.setLineDash([]); }
      for (var i = 0; i < N; i++) {
        var d = dots[i], a = pos(d, ijf[0], W, H), b = pos(d, ijf[1], W, H), f = ijf[2];
        if (ijf[1] === 1) f = sx.clamp((f - d.k * 0.5) / 0.5, 0, 1); // the measurement sweeps across the grid
        var x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        if (!sx.reduce && sp < 0.2) { x += Math.sin(t / 900 + d.ph) * base * 1.2; y += Math.cos(t / 1100 + d.ph) * base * 1.2; }
        var la = look(d, ijf[0]), lb = look(d, ijf[1]), colr = mix(la[0], lb[0], f), al = la[1] + (lb[1] - la[1]) * f, rf = la[2] + (lb[2] - la[2]) * f, ring = la[3] + (lb[3] - la[3]) * f;
        ctx.fillStyle = rgba(colr, al); ctx.beginPath(); ctx.arc(x, y, base * rf, 0, Math.PI * 2); ctx.fill();
        if (ring > 0.02) { ctx.strokeStyle = rgba(C.leaf, ring); ctx.lineWidth = Math.max(1, base * 0.35); ctx.beginPath(); ctx.arc(x, y, base * 1.75, 0, Math.PI * 2); ctx.stroke(); }
      }
    }
    return { set: function (v) { sp = v; t = v * 1800; draw(); } };
  };

  // 08 — a network: scattered signals → collected in a band (data) → arranged in layers with links (analytics) → framed by
  // guardrails, weak links pruned (governance) → connected to four services (applications) → pulses reach people (adoption)
  sx.viz.lattice = function (viz) {
    var c = canvasFor(viz, 'lattice'); if (!c) return null;
    var r = rnd(4242), L = [9, 12, 12, 9, 4], nodes = [], edges = [], sp = 4, t = 0;
    L.forEach(function (count, li) { for (var k = 0; k < count; k++) nodes.push({ li: li, k: k, n: count, rx: r(), ry: r(), ph: r() * 6.28 }); });
    var byLayer = L.map(function (_, li) { return nodes.filter(function (nd) { return nd.li === li; }); });
    for (var li = 0; li < L.length - 1; li++) {
      byLayer[li].forEach(function (a) {
        var next = byLayer[li + 1], m = li === L.length - 2 ? 1 : 2;
        for (var e = 0; e < m; e++) edges.push({ a: a, b: next[Math.floor(r() * next.length)], weak: r() < 0.28, ph: r() });
      });
    }
    var people = []; for (var p = 0; p < 26; p++) people.push({ s: Math.floor(r() * 4), a: r() * 6.28, d: 0.7 + r() * 0.6 });
    function pos(nd, s, W, H) {
      if (s === 0) return [W * 0.08 + nd.rx * W * 0.84, H * 0.1 + nd.ry * H * 0.8];
      if (s === 1) return [W * 0.12 + (nd.rx * 0.9 + nd.li * 0.02) * W * 0.76, H * 0.74 + nd.ry * H * 0.12];
      var x = W * 0.14 + (nd.li / (L.length - 1)) * W * 0.62, y = H * 0.5 + (nd.k - (nd.n - 1) / 2) * (H * 0.62 / Math.max(nd.n, 9));
      return [x, y];
    }
    function draw() {
      var ctx = c.ctx, W = c.cv.width, H = c.cv.height, R = Math.min(W, H) * 0.0105, s = at([0, 1, 2, 3, 4, 5], sp), f = s[2];
      ctx.clearRect(0, 0, W, H);
      var P = nodes.map(function (nd) {
        var a = pos(nd, s[0], W, H), b = pos(nd, s[1], W, H), x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        if (!sx.reduce && sp < 0.5) { var j = (0.5 - Math.max(0, sp)) * 2 * R * 2; x += Math.sin(t / 700 + nd.ph) * j; y += Math.cos(t / 800 + nd.ph) * j; }
        return [x, y];
      });
      var linkA = sx.clamp((sp - 0.4) * 1.7, 0, 1), guard = sx.clamp((sp - 1.4) * 1.7, 0, 1), apps = sx.clamp((sp - 2.4) * 1.7, 0, 1), adopt = sx.clamp((sp - 3.4) * 1.7, 0, 1);
      // guardrails around the model
      if (guard > 0) {
        ctx.strokeStyle = rgba(C.leaf, 0.7 * guard); ctx.lineWidth = Math.max(1.5, R * 0.3); ctx.setLineDash([R * 1.2, R * 0.8]);
        var gx = W * 0.09, gy = H * 0.12, gw = W * 0.72, gh = H * 0.76;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(gx, gy, gw, gh, R * 3); else ctx.rect(gx, gy, gw, gh); ctx.stroke(); ctx.setLineDash([]);
      }
      // links between layers: weak links fade once the guardrails are up
      if (linkA > 0) edges.forEach(function (e) {
        var ia = nodes.indexOf(e.a), ib = nodes.indexOf(e.b), al = 0.28 * linkA * (e.weak ? 1 - guard * 0.85 : 1);
        if (e.b.li === L.length - 1) al *= apps;
        ctx.strokeStyle = rgba(C.peach, al); ctx.lineWidth = Math.max(1, R * 0.16); ctx.beginPath(); ctx.moveTo(P[ia][0], P[ia][1]); ctx.lineTo(P[ib][0], P[ib][1]); ctx.stroke();
        if (adopt > 0 && !e.weak && !sx.reduce) {
          var q = (t / 1600 + e.ph) % 1, px = P[ia][0] + (P[ib][0] - P[ia][0]) * q, py = P[ia][1] + (P[ib][1] - P[ia][1]) * q;
          ctx.fillStyle = rgba(C.white, 0.8 * adopt); ctx.beginPath(); ctx.arc(px, py, R * 0.45, 0, 6.29); ctx.fill();
        }
      });
      // nodes: the last layer becomes four larger service nodes
      nodes.forEach(function (nd, i) {
        var out = nd.li === L.length - 1, rad = out ? R * (1 + apps * 1.4) : R, al = out ? 0.25 + 0.75 * apps : 0.9;
        ctx.fillStyle = out ? rgba(mix(C.peach, C.leaf, apps), al) : rgba(sp < 0.5 ? C.white : C.peach, al);
        ctx.beginPath(); ctx.arc(P[i][0], P[i][1], rad, 0, 6.29); ctx.fill();
      });
      // people around each service light up on adoption
      if (adopt > 0) {
        var outs = byLayer[L.length - 1];
        people.forEach(function (pp) {
          var o = P[nodes.indexOf(outs[pp.s])], rr = R * 5 * pp.d, x = o[0] + R * 6 + Math.cos(pp.a) * rr * 0.6, y = o[1] + Math.sin(pp.a) * rr;
          ctx.fillStyle = rgba(C.white, 0.85 * adopt); ctx.beginPath(); ctx.arc(x, y, R * 0.5, 0, 6.29); ctx.fill();
        });
      }
    }
    return { set: function (v) { sp = v; t = v * 1800; draw(); } };
  };
})();
