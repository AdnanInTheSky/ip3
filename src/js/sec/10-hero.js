/* A quiet opening: only the image moves, never the policy text. A saved or OS
   motion preference also pauses background video before loading its source. */
(function () {
  var sx = window.sx, hero = sx.$('[data-sx-hero]');
  if (!hero) return;
  var video = sx.$('video', hero), seen = false, trigger;
  var saveData = navigator.connection && navigator.connection.saveData;
  function playback() {
    if (!video) return;
    if (sx.reduce || !seen || document.hidden || saveData) { video.pause(); return; }
    var source = video.querySelector('source');
    if (!source.hasAttribute('src')) { source.src = source.dataset.src; video.load(); }
    var promise = video.play(); if (promise && promise.catch) promise.catch(function () {});
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { seen = entries[0].isIntersecting; playback(); }).observe(hero);
  document.addEventListener('visibilitychange', playback);
  function setup() {
    if (trigger) { trigger.kill(); trigger = null; }
    hero.style.setProperty('--hp', 0);
    playback();
    if (sx.reduce || window.innerWidth < 900 || window.innerHeight < 680 || !window.ScrollTrigger) return;
    trigger = ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onUpdate: function (self) { hero.style.setProperty('--hp', self.progress.toFixed(3)); } });
  }
  sx.onMotion(setup);
  window.addEventListener('resize', setup);
})();
