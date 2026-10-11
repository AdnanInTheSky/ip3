/* browser.js — filters (with a FLIP re-flow), carousel controls, grid/carousel switch, and the record sheet.
   The sheet clones the full record from the all-assignments list; #proof-<slug> links and data-cp-open anywhere on the page open it. */
(function () {
  var cp = window.cp, sec = cp.$('#cp-proof');
  if (!sec) return;
  var deck = cp.$('.cp-deck', sec), track = cp.$('.cp-cards', sec), cards = cp.$$('.cp-card', sec);
  var filters = cp.$$('.cp-filter', sec), countEl = cp.$('.cp-proof__count b', sec), views = cp.$$('.cp-view button', sec);
  var btns = cp.$$('.cp-deck__btn', sec), bar = cp.$('.cp-deck__bar i', sec), index = cp.$('#proof-index');
  var dlg = cp.$('.cp-sheet', sec), body = dlg && cp.$('[data-body]', dlg), pos = dlg && cp.$('[data-pos]', dlg);
  var current = '', order = cards.slice();
  var slugOf = function (c) { return cp.$('a', c).dataset.cpOpen; };
  var shown = function () { return order.filter(function (c) { return !c.hidden; }); };

  /* ---------- carousel ---------- */
  function update() {
    var max = track.scrollWidth - track.clientWidth;
    var grid = deck.dataset.view === 'grid';
    if (bar) bar.style.setProperty('--p', grid || max <= 0 ? 1 : ((track.scrollLeft + track.clientWidth) / track.scrollWidth).toFixed(3));
    if (btns.length) { btns[0].disabled = grid || track.scrollLeft <= 2; btns[1].disabled = grid || track.scrollLeft >= max - 2; }
  }
  function stepWidth() { var v = shown(); return v.length > 1 ? v[1].offsetLeft - v[0].offsetLeft : track.clientWidth; }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var w = stepWidth(), per = Math.max(1, Math.floor(track.clientWidth / w));
      track.scrollBy({ left: +b.dataset.dir * w * per, behavior: cp.reduce ? 'auto' : 'smooth' });
    });
  });
  var raf = 0;
  track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; update(); }); }, { passive: true });
  window.addEventListener('resize', update);
  track.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var v = shown(), i = v.findIndex(function (c) { return c.contains(document.activeElement); });
    var j = i + (e.key === 'ArrowRight' ? 1 : -1);
    if (i < 0 || !v[j]) return;
    e.preventDefault(); cp.$('a', v[j]).focus();
  });
  cp.drag(track);
  views.forEach(function (b) {
    b.addEventListener('click', function () {
      views.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      deck.dataset.view = b.dataset.view; track.scrollLeft = 0; update();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ---------- filters ---------- */
  function rank(c, cap) { var i = c.dataset.caps.split(' ').indexOf(cap); return cap ? (i < 0 ? 99 : i) : 0; }
  function filter(cap) {
    current = cap || '';
    filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cap === current)); });
    var first = new Map();
    cards.forEach(function (c) { if (!c.hidden) first.set(c, c.getBoundingClientRect()); });
    order = cards.slice().sort(function (a, b) { return rank(a, current) - rank(b, current) || a.dataset.o - b.dataset.o; });
    order.forEach(function (c) { c.hidden = !!current && rank(c, current) === 99; track.appendChild(c); });
    track.scrollLeft = 0;
    countEl.textContent = String(shown().length);
    if (!cp.reduce && window.gsap) {
      shown().forEach(function (c, i) {
        var f = first.get(c), l = c.getBoundingClientRect();
        if (f) gsap.fromTo(c, { x: f.left - l.left, y: f.top - l.top }, { x: 0, y: 0, duration: 0.65, ease: 'power3.out', clearProps: 'transform' });
        else gsap.fromTo(c, { opacity: 0, z: -160, rotateY: -16 }, { opacity: 1, z: 0, rotateY: 0, duration: 0.7, delay: Math.min(i, 6) * 0.04, ease: 'power3.out', clearProps: 'transform,opacity' });
      });
    }
    update();
  }
  filters.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.cap); }); });
  window.addEventListener('cp:filter', function (e) { filter(e.detail && e.detail.cap); });

  /* ---------- the record sheet ---------- */
  var openSlug = null;
  function open(slug, from) {
    var src = document.getElementById('proof-' + slug);
    if (!src || !dlg || typeof dlg.showModal !== 'function') return false;
    var art = cp.$('.cp-rec__in', src).cloneNode(true);
    cp.$$('[id]', art).forEach(function (x) { x.removeAttribute('id'); });
    art.removeAttribute('aria-labelledby');
    var h = cp.$('h3', art); if (h) h.id = 'cp-sheet-h';
    cp.$$('img', art).forEach(function (i) { i.loading = 'eager'; });
    body.innerHTML = ''; body.appendChild(art); body.scrollTop = 0;
    openSlug = slug;
    var list = shown().map(slugOf);
    if (list.indexOf(slug) < 0) list = order.map(slugOf);
    if (pos) pos.textContent = (list.indexOf(slug) + 1) + ' / ' + list.length;
    if (!dlg.open) cp.modal(dlg, from || document.activeElement);
    try { history.replaceState(null, '', '#proof-' + slug); } catch (e) {}
    return true;
  }
  function step(d) {
    var list = shown().map(slugOf); if (list.indexOf(openSlug) < 0) list = order.map(slugOf);
    var i = list.indexOf(openSlug); open(list[(i + d + list.length) % list.length]);
  }
  if (dlg) {
    cp.$$('[data-step]', dlg).forEach(function (b) { b.addEventListener('click', function () { step(+b.dataset.step); }); });
    cp.$('[data-close]', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); });
    // a link to another part of this page (a capability row) closes the sheet first, then the page scrolls there
    dlg.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) dlg.close(); });
    dlg.addEventListener('close', function () {
      if (location.hash.indexOf('#proof-') === 0) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
    });
  }

  // page-wide hooks, in the capture phase so the site's smooth-scroll link handler does not also act on them
  window.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cp-open],[data-cp-filter]');
    if (!t || cp.dragged(t)) { if (t) { e.preventDefault(); e.stopPropagation(); } return; }
    if (t.hasAttribute('data-cp-open')) {
      if (open(t.dataset.cpOpen, t)) { e.preventDefault(); e.stopPropagation(); }
    } else {
      e.preventDefault(); e.stopPropagation();
      filter(t.dataset.cpFilter);
      cp.scrollTo(sec);
    }
  }, true);

  // arriving with #proof-<slug>: open the list so the record is on the page behind the sheet, then open the sheet
  var m = /^#proof-([a-z0-9-]+)$/.exec(location.hash);
  if (m && document.getElementById('proof-' + m[1])) {
    if (index) index.open = true;
    window.addEventListener('load', function () { setTimeout(function () { open(m[1]); }, 500); });
  }

  /* ---------- entrance: the deck swings in from depth, once ---------- */
  if (cp.gsapReady() && !cp.reduce) {
    var first = cards.slice(0, 5);
    gsap.set(first, { opacity: 0, z: -220, rotateY: -22, x: 60 });
    ScrollTrigger.create({ trigger: track, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(first, { opacity: 1, z: 0, rotateY: 0, x: 0, duration: 1, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity' });
    } });
  }
  update();
})();
