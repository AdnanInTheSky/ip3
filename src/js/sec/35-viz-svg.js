/* SVG drawings: flow (governance), chain (economic transformation), loop (sustainable finance). */
(function () {
  var sx = window.sx;
  function now(els, a, cls) { els.forEach(function (el, i) { el.classList.toggle(cls || 'is-now', i === a); }); }

  // 05 — governance: each link draws as the reader moves from one step to the next; the feedback loop closes on the last step
  sx.viz.flow = function (viz, n) {
    var svg = sx.$('.sx-flow svg', viz); if (!svg) return null;
    var links = sx.$$('.sx-flow__link', svg), nodes = sx.$$('.sx-flow__n', svg), loop = sx.$('.sx-flow__loop', svg);
    var pulses = sx.$$('.sx-flow__pulse', svg), loopPulse = sx.$('.sx-flow__pulse--loop', svg), cur = -2;
    if (sx.reduce && svg.pauseAnimations) svg.pauseAnimations();
    return {
      set: function (sp) {
        links.forEach(function (l, i) { var f = sx.clamp(sp - i, 0, 1); l.style.strokeDashoffset = (1 - f).toFixed(3); });
        pulses.forEach(function (p) { if (p === loopPulse) return; var i = +p.getAttribute('data-i'); p.style.opacity = sp - i >= 1 ? 1 : 0; });
        var lf = sx.clamp((sp - (n - 2)) * 1.2, 0, 1);
        loop.style.strokeDashoffset = (1 - lf).toFixed(3);
        loopPulse.style.opacity = lf >= 1 ? 1 : 0;
        svg.style.setProperty('--ry', ((sp - (n - 1) / 2) * -2.4).toFixed(2) + 'deg');
        nodes.forEach(function (g, i) { g.style.opacity = sp + 1 >= i ? 1 : 0.35; });
        var a = Math.round(sp);
        if (a !== cur) { cur = a; now(nodes, a); }
      },
    };
  };

  // 06 — economic transformation: the camera pans along the chain; far hills move slower, cargo faster (three depths)
  sx.viz.chain = function (viz) {
    var svg = sx.$('.sx-chain__svg', viz); if (!svg) return null;
    var l0 = sx.$('.sx-chain__l0', svg), l1 = sx.$('.sx-chain__l1', svg), l2 = sx.$('.sx-chain__l2', svg);
    var fill = sx.$('.sx-chain__fill', svg), stations = sx.$$('.sx-chain__s', svg), cur = -2;
    var W = +getComputedStyle(svg).getPropertyValue('--w') || 2840, X = function (k) { return 300 + k * 560; };
    svg.setAttribute('preserveAspectRatio', 'xMinYMid slice');
    return {
      set: function (sp) {
        var r = svg.getBoundingClientRect(), viewW = r.height ? (600 * r.width) / r.height : 800;
        var centre = X(sx.clamp(sp, -0.6, stations.length - 1)), pan = sx.clamp(centre - viewW / 2, -viewW * 0.2, W - viewW);
        l0.setAttribute('transform', 'translate(' + (-pan * 0.45).toFixed(1) + ' 0)');
        l1.setAttribute('transform', 'translate(' + (-pan).toFixed(1) + ' 0)');
        l2.setAttribute('transform', 'translate(' + (-pan * 1.25).toFixed(1) + ' 0)');
        fill.style.strokeDashoffset = (1 - sx.clamp(centre / W, 0, 1)).toFixed(3);
        var a = Math.round(sp);
        if (a !== cur) { cur = a; now(stations, a); }
      },
    };
  };

  // 07 — sustainable finance: take–make–waste bends into a circle between the first two steps; then each segment of the loop
  // lights in turn, an arrow travels round, and E·S·G appears at the centre on the last step
  sx.viz.loop = function (viz, n) {
    var root = sx.$('.sx-loop', viz), path = sx.$('[data-sx-morph]', viz); if (!root || !path) return null;
    var segs = sx.$$('.sx-loop__seg', viz), N = 96, R = 190, cur = -2, lastT = -1;
    function d(t) {
      var out = [];
      for (var i = 0; i < N; i++) {
        var u = i / (N - 1), lx = -300 + 600 * u, ly = 40, a = u * Math.PI * 2, cx = R * Math.sin(a), cy = -R * Math.cos(a);
        out.push((lx + (cx - lx) * t).toFixed(1) + ' ' + (ly + (cy - ly) * t).toFixed(1));
      }
      return 'M' + out.join('L');
    }
    return {
      set: function (sp) {
        var t = sx.smooth(sx.clamp(sp + 0.15, 0, 1));
        if (Math.abs(t - lastT) > 0.001) { lastT = t; path.setAttribute('d', d(t)); }
        root.style.setProperty('--t', t.toFixed(3));
        root.style.setProperty('--seg', sx.clamp((sp - 0.55) * 2.4, 0, 1).toFixed(3));
        root.style.setProperty('--core', sx.clamp((sp - (n - 1.6)) * 2, 0, 1).toFixed(3));
        root.style.setProperty('--rot', (sx.clamp(sp, 0, n - 1) * 90 - 45).toFixed(1) + 'deg');
        var a = Math.round(sp);
        if (a !== cur) { cur = a; segs.forEach(function (s) { s.classList.toggle('is-now', +s.getAttribute('data-i') === a); }); }
      },
    };
  };
})();
