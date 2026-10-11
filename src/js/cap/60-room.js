/* room.js — coverflow: the centred photo faces forward, neighbours turn away and recede; scroll-snap, buttons, arrow keys and mouse drag.
   Clicking a side photo brings it to the centre; clicking the centre photo (or any data-cp-photo link on the page) opens the lightbox. */
(function () {
  var cp = window.cp, sec = cp.$('#cp-room');
  if (!sec) return;
  var flow = cp.$('.cp-flow', sec), depth = cp.$('.cp-flow__depth', sec), track = cp.$('.cp-flow__track', sec);
  var items = cp.$$('.cp-flow__item', sec), btns = cp.$$('.cp-flow__btn', sec), countEl = cp.$('.cp-flow__count b', sec);
  var box = cp.$('.cp-lightbox', sec), center = 0, lbIndex = 0;
  var three = !cp.reduce && !cp.coarse && window.matchMedia('(min-width: 721px)').matches;
  if (three) flow.classList.add('is-3d');

  function measure() {
    var mid = track.getBoundingClientRect().left + track.clientWidth / 2, best = 0, bestD = 1e9;
    items.forEach(function (li, i) {
      var r = li.getBoundingClientRect(), d = (r.left + r.width / 2 - mid) / (r.width + 24);
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      if (three) {
        var c = Math.max(-1, Math.min(1, d)), a = Math.min(3, Math.abs(d));
        var el = li.firstElementChild.firstElementChild; // the image link
        el.style.transform = 'perspective(1400px) translateX(' + (-c * 18).toFixed(1) + '%) translateZ(' + (-a * 170).toFixed(1) + 'px) rotateY(' + (-c * 38).toFixed(2) + 'deg)';
        el.style.opacity = String(Math.max(0.35, 1 - a * 0.22).toFixed(3));
        li.style.zIndex = String(10 - Math.round(a * 3));
      }
    });
    if (best !== center || !items[center].classList.contains('is-center')) {
      items.forEach(function (li, i) { li.classList.toggle('is-center', i === best); });
      center = best;
      if (countEl) countEl.textContent = String(best + 1);
    }
    if (btns.length) { btns[0].disabled = center === 0; btns[1].disabled = center === items.length - 1; }
  }
  var raf = 0;
  var onScroll = function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; measure(); }); };
  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  function go(i, instant) {
    i = Math.max(0, Math.min(items.length - 1, i));
    var li = items[i];
    track.scrollTo({ left: li.offsetLeft - (track.clientWidth - li.offsetWidth) / 2, behavior: instant || cp.reduce ? 'auto' : 'smooth' });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { go(center + +b.dataset.dir); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var i = items.findIndex(function (li) { return li.contains(document.activeElement); });
    var j = (i < 0 ? center : i) + (e.key === 'ArrowRight' ? 1 : -1);
    if (!items[j]) return;
    e.preventDefault(); go(j); cp.$('.cp-flow__open', items[j]).focus({ preventScroll: true });
  });
  // keyboard focus on a side photo brings it to the centre
  track.addEventListener('focusin', function (e) { var i = items.findIndex(function (li) { return li.contains(e.target); }); if (i >= 0 && i !== center) go(i); });
  cp.drag(track);

  /* ---------- lightbox ---------- */
  function show(i) {
    lbIndex = (i + items.length) % items.length;
    var li = items[lbIndex], img = cp.$('img', li);
    var big = cp.$('[data-img]', box);
    big.src = img.currentSrc || img.src; big.width = img.naturalWidth || img.width; big.height = img.naturalHeight || img.height;
    cp.$('[data-cap]', box).textContent = cp.$('figcaption .cp-mono', li).textContent;
    cp.$('[data-alt]', box).textContent = img.alt;
  }
  function openBox(i, from) {
    if (!box || typeof box.showModal !== 'function') return false;
    show(i);
    if (!box.open) {
      cp.modal(box, from);
      box.addEventListener('close', function once() { box.removeEventListener('close', once); go(lbIndex, true); });
    }
    return true;
  }
  if (box) {
    cp.$$('[data-step]', box).forEach(function (b) { b.addEventListener('click', function () { show(lbIndex + +b.dataset.step); }); });
    cp.$('[data-close]', box).addEventListener('click', function () { box.close(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(lbIndex + 1); else if (e.key === 'ArrowLeft') show(lbIndex - 1); });
  }
  window.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cp-photo]');
    if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (cp.dragged(t)) return;
    var li = document.getElementById('room-' + t.dataset.cpPhoto), i = items.indexOf(li);
    if (i < 0) return;
    if (track.contains(t) && i !== center) { go(i); return; }
    openBox(i, t);
  }, true);

  /* ---------- scroll-linked depth drift of the whole strip ---------- */
  if (three && cp.gsapReady()) {
    gsap.fromTo(depth, { rotateX: 10, z: -80, transformPerspective: 1600 }, { rotateX: -4, z: 0, ease: 'none', scrollTrigger: { trigger: flow, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  }
  // start on the second photo so the strip opens with a neighbour on each side
  var startAt = function () { go(items.length > 2 ? 1 : 0, true); measure(); };
  if (document.readyState === 'complete') startAt(); else window.addEventListener('load', startAt);
  measure();
})();
