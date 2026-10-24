/* /evidence-map — the documented assignments as one dot each, drawn with D3 (vendored, loaded only on this page).
   The story chart regroups as the scroll steps pass (GSAP ScrollTrigger, on the site's Lenis scroll); the explore chart
   below answers its own grouping buttons, client search and dot selection. The data is the JSON the build embeds in
   #em-data. Without this script or D3 the page still reads: the steps are plain text and the table lists every record. */
(function () {
  'use strict';
  var dataEl = document.getElementById('em-data');
  if (!dataEl || !window.d3) return;
  var d3 = window.d3;
  var DATA = JSON.parse(dataEl.textContent);
  var C = DATA.copy;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var MODES = ['all', 'client', 'phase', 'sector'];
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var fill = function (s, v) { return String(s).replace(/\{\{(\w+)\}\}/g, function (m, k) { return k in v ? v[k] : m; }); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var names = function (mode, rec) { return rec[mode].map(function (i) { return DATA.groups[mode][i].label; }); };
  // animate only when there is time to; with no duration apply at once, so nothing waits on a frame that never comes
  var tween = function (sel, dur, delay) { return dur ? sel.transition().delay(delay || 0).duration(dur).ease(d3.easeCubicInOut) : sel; };
  document.documentElement.classList.add('em-ready');

  /* ---------- layout: one row per group, a label line above wrapped dots ---------- */
  function groupsFor(mode) {
    if (mode === 'all') return [{ label: C['all-row'], items: DATA.rows.slice() }];
    var gs = DATA.groups[mode].map(function (g) { return { label: g.label, items: [] }; });
    var none = { label: C['unplaced-row'], items: [] };
    DATA.rows.forEach(function (r) {
      if (!r[mode].length) none.items.push(r);
      r[mode].forEach(function (i) { gs[i].items.push(r); });
    });
    if (none.items.length) gs.push(none);
    return gs;
  }
  function layout(mode, W, r) {
    var step = r * 2 + 4, labelH = 22, gap = 16;
    var per = Math.max(1, Math.floor((W + 4) / step));
    // ungrouped, the record sits as one compact block in the middle rather than a strip across the chart
    if (mode === 'all') per = Math.min(per, Math.ceil(Math.sqrt(DATA.rows.length * 1.6)));
    var x0 = mode === 'all' ? Math.round((W - (per * step - 4)) / 2) : 0;
    var y = 0, dots = [], labels = [], seen = {};
    groupsFor(mode).forEach(function (g, gi) {
      labels.push({ key: mode + gi, text: g.label, n: g.items.length, x: x0, y: y + 13 });
      g.items.forEach(function (rec, k) {
        // the first placement keeps the record's key, so the dot travels; a second placement is its own dot
        var key = seen[rec.s] ? rec.s + '~' + gi : rec.s;
        seen[rec.s] = true;
        dots.push({ key: key, rec: rec, x: x0 + r + (k % per) * step, y: y + labelH + r + Math.floor(k / per) * step });
      });
      y += labelH + Math.ceil(Math.max(1, g.items.length) / per) * step + gap;
    });
    return { dots: dots, labels: labels, h: y - gap, step: step };
  }
  // the largest dots whose tallest grouping fits the box (or the natural height when the box has none)
  function fit(W, Hbox) {
    var tallest = function (r) { return Math.max.apply(null, MODES.map(function (m) { return layout(m, W, r).h; })); };
    var r = W < 520 ? 6 : 8;
    while (Hbox && r > 3 && tallest(r) > Hbox) r--;
    return { r: r, h: tallest(r) };
  }

  /* ---------- one chart ---------- */
  function Chart(root, opts) {
    var holder = root.querySelector('[data-em-svg]');
    var tip = root.querySelector('[data-em-tip]');
    var svg = d3.select(holder).append('svg').attr('class', 'em-svg').attr('role', 'img').attr('focusable', 'false');
    if (opts.keys) svg.attr('tabindex', 0).attr('role', 'group');
    var gLabels = svg.append('g').attr('class', 'em-labels');
    var gDots = svg.append('g').attr('class', 'em-dots');
    var S = { mode: opts.mode, hl: {}, hasHl: false, sel: null, W: 0, H: 0, r: 6, dots: [], focus: -1, shown: !opts.intro };

    function size() {
      var W = Math.floor(holder.clientWidth);
      if (!W) return false;
      var Hbox = opts.fill ? Math.floor(holder.clientHeight) : 0;
      var f = fit(W, Hbox);
      S.W = W; S.r = f.r; S.H = Math.max(Hbox, f.h);
      return true;
    }
    function describe(L) {
      var counts = L.labels.map(function (l) { return l.text + ' ' + l.n; }).join(', ');
      var group = (S.mode === 'all' ? C['group-all'] : C['group-' + S.mode]).toLowerCase();
      svg.attr('aria-label', fill(C['chart-label'], { total: DATA.total, group: group, counts: counts }));
    }
    function classes(sel) {
      sel.classed('is-hl', function (d) { return !!S.hl[d.rec.s]; })
        .classed('is-dim', function (d) { return S.hasHl && !S.hl[d.rec.s]; })
        .classed('is-sel', function (d) { return S.sel === d.rec.s; });
    }
    function render(animate) {
      if (!S.W && !size()) return;
      var L = layout(S.mode, S.W, S.r);
      var off = Math.round(Math.max(0, (S.H - L.h) / 2));
      var dur = animate && !reduce ? 760 : 0;
      svg.attr('viewBox', '0 0 ' + S.W + ' ' + S.H).attr('width', S.W).attr('height', S.H);

      var lab = gLabels.selectAll('text').data(L.labels, function (d) { return d.key; });
      tween(lab.exit(), dur / 2).style('opacity', 0).remove();
      var labIn = lab.enter().append('text').attr('class', 'em-lbl').style('opacity', 0);
      labIn.append('tspan').attr('class', 'em-lbl__t');
      labIn.append('tspan').attr('class', 'em-lbl__n').attr('dx', 8);
      var labAll = labIn.merge(lab);
      labAll.attr('transform', function (d) { return 'translate(' + d.x + ',' + (d.y + off) + ')'; });
      labAll.select('.em-lbl__n').text(function (d) { return d.n; });
      labAll.each(function (d) { // shorten a label that would run past the chart, keep the full name as a tooltip
        var t = d3.select(this).select('.em-lbl__t').text(d.text);
        var room = S.W - d.x - 34, s = d.text;
        while (s.length > 4 && this.getComputedTextLength && this.getComputedTextLength() > room) { s = s.slice(0, -2); t.text(s.replace(/[\s,&]+$/, '') + '…'); }
        d3.select(this).selectAll('title').remove();
        if (s !== d.text) d3.select(this).append('title').text(d.text);
      });
      tween(labAll, dur / 2, dur / 3).style('opacity', S.shown ? 1 : 0);

      var pos = {};
      S.dots.forEach(function (d) { pos[d.key] = d; });
      var dot = gDots.selectAll('g.em-dot').data(L.dots, function (d) { return d.key; });
      tween(dot.exit(), dur / 2).style('opacity', 0).remove();
      var dotIn = dot.enter().append('g').attr('class', 'em-dot').style('opacity', 0)
        .attr('transform', function (d) { var p = pos[d.rec.s] || d; return 'translate(' + p.x + ',' + (p.y + (p === d ? off : 0)) + ')'; });
      dotIn.append('circle').attr('class', 'em-hit');
      dotIn.append('circle').attr('class', 'em-mk');
      var all = dotIn.merge(dot);
      all.select('.em-hit').attr('r', L.step / 2);
      all.select('.em-mk').attr('r', S.r);
      classes(all);
      (dur ? all.transition().delay(function (d, i) { return Math.min(i * 7, 260); }).duration(dur).ease(d3.easeCubicInOut) : all.interrupt())
        .attr('transform', function (d) { return 'translate(' + d.x + ',' + (d.y + off) + ')'; })
        .style('opacity', S.shown ? 1 : 0);
      all.on('pointerenter', function (ev, d) { show(this, d); })
        .on('pointerleave', function () { hideTip(); })
        .on('click', function (ev, d) { if (opts.onSelect) pick(d.rec); else show(this, d); });

      S.dots = L.dots.map(function (d) { return { key: d.key, rec: d.rec, x: d.x, y: d.y + off }; });
      describe(L);
    }

    /* tooltip */
    function show(node, d) {
      var also = S.mode !== 'all' && d.rec[S.mode].length > 1 ? '<span class="em-tip__also">' + esc(C['also-listed']) + ': ' + esc(names(S.mode, d.rec).join('; ')) + '</span>' : '';
      tip.innerHTML = '<b>' + esc(d.rec.q) + '</b><span>' + esc(d.rec.c) + '</span><span class="em-tip__p">' + esc(d.rec.p) + '</span>' + also;
      tip.hidden = false;
      var box = root.getBoundingClientRect(), b = node.getBoundingClientRect();
      var x = b.left + b.width / 2 - box.left, y = b.top - box.top;
      var w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.max(0, Math.min(box.width - w, x - w / 2)) + 'px';
      tip.style.top = (y - h - 10 < 0 ? y + b.height + 10 : y - h - 10) + 'px';
    }
    function hideTip() { tip.hidden = true; }

    /* selection & keyboard (explore chart) */
    function pick(rec) {
      S.sel = rec.s;
      classes(gDots.selectAll('g.em-dot'));
      opts.onSelect(rec);
    }
    function focusAt(i) {
      var nodes = gDots.selectAll('g.em-dot').nodes();
      S.focus = Math.max(0, Math.min(S.dots.length - 1, i));
      gDots.selectAll('g.em-dot').classed('is-focus', function (d, j) { return j === S.focus; });
      var d = S.dots[S.focus], n = nodes.filter(function (el) { return d3.select(el).datum().key === d.key; })[0];
      if (n) show(n, d);
    }
    if (opts.keys) {
      svg.on('keydown', function (ev) {
        var k = ev.key, per = Math.max(1, Math.floor((S.W + 4) / (S.r * 2 + 4)));
        if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowUp' || k === 'Home' || k === 'End') {
          ev.preventDefault();
          var f = S.focus < 0 ? 0 : S.focus;
          focusAt(k === 'Home' ? 0 : k === 'End' ? S.dots.length - 1 : f + (k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : k === 'ArrowDown' ? per : -per));
        } else if ((k === 'Enter' || k === ' ') && S.focus > -1) { ev.preventDefault(); pick(S.dots[S.focus].rec); }
        else if (k === 'Escape') hideTip();
      }).on('focus', function () { if (S.focus < 0) focusAt(0); else focusAt(S.focus); })
        .on('blur', function () { gDots.selectAll('g.em-dot').classed('is-focus', false); hideTip(); });
    }

    var lastW = 0, lastH = 0;
    if (window.ResizeObserver) new ResizeObserver(function () {
      var W = holder.clientWidth, H = holder.clientHeight;
      if (Math.abs(W - lastW) < 2 && (!opts.fill || Math.abs(H - lastH) < 2)) return;
      lastW = W; lastH = H;
      requestAnimationFrame(function () { if (size()) render(false); });
    }).observe(holder);

    size(); render(false);
    return {
      set: function (mode, hl) {
        var same = mode === S.mode;
        S.mode = mode;
        if (hl) { S.hl = {}; hl.forEach(function (s) { S.hl[s] = true; }); S.hasHl = hl.length > 0; }
        S.focus = -1; hideTip();
        if (same) classes(gDots.selectAll('g.em-dot')); else render(true);
      },
      intro: function () {
        if (S.shown) return;
        S.shown = true;
        if (reduce) { gLabels.selectAll('text').style('opacity', 1); gDots.selectAll('g.em-dot').style('opacity', 1); return; }
        gLabels.selectAll('text').transition().duration(500).style('opacity', 1);
        gDots.selectAll('g.em-dot').transition().delay(function (d, i) { return i * 18; }).duration(420).style('opacity', 1);
      },
    };
  }

  /* ---------- story: scroll steps drive the chart ---------- */
  var storyEl = document.querySelector('[data-em-chart="story"]');
  var steps = [].slice.call(document.querySelectorAll('[data-em-step]'));
  if (storyEl && steps.length) {
    var story = Chart(storyEl, { fill: true, mode: 'all', intro: true });
    var activate = function (el) {
      steps.forEach(function (s) { s.classList.toggle('is-active', s === el); });
      var hl = el.getAttribute('data-em-hl');
      story.set(el.getAttribute('data-em-step'), hl ? DATA.hl[hl] : []);
    };
    var counter = storyEl.parentNode.querySelector('[data-em-count]');
    var start = function () {
      story.intro();
      if (counter && hasGsap && !reduce) { var o = { v: 0 }; gsap.to(o, { v: DATA.total, duration: 1.4, ease: 'power2.out', onUpdate: function () { counter.textContent = Math.round(o.v); } }); }
    };
    steps[0].classList.add('is-active');
    if (hasGsap) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({ trigger: storyEl.parentNode, start: 'top 75%', once: true, onEnter: start });
      steps.forEach(function (s) {
        ScrollTrigger.create({ trigger: s.querySelector('.em-step__card'), start: 'top 80%', end: 'bottom 20%', onEnter: function () { activate(s); }, onEnterBack: function () { activate(s); } });
      });
    } else if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) start(); }, { rootMargin: '0px 0px -25% 0px' }).observe(storyEl.parentNode);
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) activate(e.target); }); }, { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(function (s) { io.observe(s); });
    } else start();
  }

  /* ---------- explore: buttons, client search, detail panel ---------- */
  var exEl = document.querySelector('[data-em-chart="explore"]');
  if (exEl) {
    var detail = exEl.querySelector('[data-em-detail]');
    var q = exEl.querySelector('[data-em-q]');
    var qn = exEl.querySelector('[data-em-n]');
    var btns = [].slice.call(exEl.querySelectorAll('[data-em-group]'));
    var showRecord = function (rec) {
      var row = function (k, v) { return v ? '<div><dt>' + esc(C[k]) + '</dt><dd>' + v + '</dd></div>' : ''; };
      var secs = rec.sector.map(function (i) { var g = DATA.groups.sector[i]; return '<a href="' + esc(g.href) + '">' + esc(g.label) + '</a>'; }).join('<br>');
      detail.innerHTML = '<p class="em-detail__k">' + esc(names('client', rec).join('')) + ' · ' + esc(rec.p) + '</p>'
        + '<h3 class="em-detail__q">' + esc(rec.q) + '</h3><p class="em-detail__t">' + esc(rec.t) + '</p>'
        + '<dl class="em-detail__dl">' + row('th-client', esc(rec.c)) + row('th-phase', esc(names('phase', rec).join('; '))) + row('th-sector', secs) + '</dl>'
        + '<p class="em-detail__sum">' + esc(rec.sum) + '</p>'
        + '<a class="link" href="/capabilities#proof-' + esc(rec.s) + '">' + esc(C['detail-link']) + ARROW + '</a>';
      // on a phone the panel sits under the chart: bring its top into view, leaving the chart's lower rows in sight
      if (window.matchMedia('(max-width: 899px)').matches && detail.getBoundingClientRect().top > window.innerHeight * 0.6) {
        var to = detail.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
        if (window.ip3Lenis) window.ip3Lenis.scrollTo(to, { duration: reduce ? 0 : 0.9, immediate: reduce }); else window.scrollTo({ top: to, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    var ex = Chart(exEl.querySelector('.em-x__fig'), { mode: 'client', keys: true, onSelect: showRecord });
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        ex.set(b.getAttribute('data-em-group'), null);
      });
    });
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase();
      if (!v) { ex.set(currentMode(), []); qn.textContent = ''; return; }
      var hits = DATA.rows.filter(function (r) { return r.c.toLowerCase().indexOf(v) > -1; }).map(function (r) { return r.s; });
      ex.set(currentMode(), hits);
      qn.textContent = hits.length ? fill(C['search-count'], { n: hits.length, total: DATA.total }) : C['search-none'];
    });
    var currentMode = function () { var b = btns.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0]; return b ? b.getAttribute('data-em-group') : 'client'; };
  }
})();
