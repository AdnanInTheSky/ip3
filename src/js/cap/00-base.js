/* /capabilities — shared helpers for the section scripts (10-hero.js, 20-led.js ...). Loaded after site.js, only on this page.
   Each section script is an IIFE that returns early when its root element is missing, and does nothing under prefers-reduced-motion
   beyond what the page already shows. The page must read fully without any of it. */
window.cp = (function () {
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var coarse = mq('(pointer: coarse)');
  var fine = mq('(hover: hover) and (pointer: fine)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function gsapReady() { return !!(window.gsap && window.ScrollTrigger); }
  function lenis() { return window.ip3Lenis || null; }
  // smooth page scroll to a y position or an element (offset clears the fixed header)
  function scrollTo(target, offset) {
    var l = lenis(); offset = offset == null ? -96 : offset;
    if (l) { l.scrollTo(target, { offset: typeof target === 'number' ? 0 : offset, duration: reduce ? 0 : 1.2, immediate: reduce }); return; }
    var y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  // a dialog that pauses smooth scrolling while open and gives focus back to the opener when it closes
  function modal(dlg, opener) {
    if (!dlg.open) dlg.showModal();
    var l = lenis(); if (l) l.stop();
    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      var l2 = lenis(); if (l2) l2.start();
      if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
    });
    // a click on the backdrop closes
    if (!dlg.cpBound) { dlg.cpBound = true; dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); }
  }
  // mouse drag-to-scroll for a horizontal track; touch keeps native scrolling. Returns a function telling whether the last press was a drag.
  function drag(track) {
    var down = false, moved = false, x0 = 0, s0 = 0;
    track.classList.add('is-draggable');
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) { track.classList.remove("is-dragging"); track.cpDragged = true; setTimeout(function () { moved = false; track.cpDragged = false; }, 0); }
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  // true while the click that ends a mouse drag is being dispatched (so a drag never opens a card)
  function dragged(el) { var t = el && el.closest('.is-draggable'); return !!(t && t.cpDragged); }
  function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail: detail })); }
  return { reduce: reduce, coarse: coarse, fine: fine, $: $, $$: $$, gsapReady: gsapReady, lenis: lenis, scrollTo: scrollTo, modal: modal, drag: drag, dragged: dragged, emit: emit };
})();
