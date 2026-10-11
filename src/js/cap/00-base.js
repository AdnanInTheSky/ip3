/* /capabilities — shared helpers for the section scripts (10-hero.js, 20-led.js ...). Loaded after site.js, only on this page.
   Each section script is an IIFE that returns early when its root element is missing, and does nothing under prefers-reduced-motion
   beyond what the page already shows. The page must read fully without any of it. */
window.cp = (function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function gsapReady() { return !!(window.gsap && window.ScrollTrigger); }
  return { reduce: reduce, coarse: coarse, $: $, $$: $$, gsapReady: gsapReady };
})();
