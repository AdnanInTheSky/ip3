/* reel.js — poster first, play on request, one film at a time; choosing a film swaps the featured player with a depth turn.
   data-cp-film links elsewhere on the page bring the visitor here with that film ready to play. */
(function () {
  var cp = window.cp, sec = cp.$('#cp-reel');
  if (!sec) return;
  var feat = cp.$('.cp-reel__feature', sec), video = cp.$('video', feat), source = cp.$('source', video), play = cp.$('.cp-reel__play', feat);
  var items = cp.$$('.cp-reel__li', sec), current = feat.dataset.slug;
  video.removeAttribute('controls');
  play.hidden = false;

  function start() { play.hidden = true; video.controls = true; var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  play.addEventListener('click', start);
  video.addEventListener('ended', function () { video.controls = false; play.hidden = false; });

  function fill(li) {
    var a = cp.$('a', li);
    current = a.dataset.cpFilm; feat.dataset.slug = current;
    video.pause(); video.controls = false; play.hidden = false;
    source.src = li.dataset.src; video.poster = li.dataset.poster; video.load();
    cp.$('[data-title]', feat).textContent = cp.$('.cp-reel__t', li).textContent;
    cp.$('[data-caption]', feat).textContent = cp.$('.cp-reel__c', li).textContent;
    cp.$('[data-rt]', feat).textContent = cp.$('.cp-reel__rt', li).textContent;
    cp.$('[data-play-label]', feat).textContent = play.dataset.play + ': ' + cp.$('.cp-reel__t', li).textContent;
    var slot = cp.$('[data-caplink]', feat), tpl = cp.$('template[data-caplink]', li);
    slot.innerHTML = ''; if (tpl) slot.appendChild(tpl.content.cloneNode(true));
    items.forEach(function (x) { var on = x === li; x.classList.toggle('is-current', on); var xa = cp.$('a', x); if (on) xa.setAttribute('aria-current', 'true'); else xa.removeAttribute('aria-current'); });
  }
  function choose(slug, autoplay) {
    var li = document.getElementById('reel-' + slug);
    if (!li) return false;
    if (slug === current) { if (autoplay) start(); return true; }
    if (cp.reduce || !window.gsap) { fill(li); if (autoplay) start(); return true; }
    gsap.timeline()
      .to(feat, { rotateY: -14, z: -160, opacity: 0, transformPerspective: 1400, duration: 0.28, ease: 'power2.in' })
      .add(function () { fill(li); if (autoplay) start(); })
      .fromTo(feat, { rotateY: 14, z: -160, opacity: 0 }, { rotateY: 0, z: 0, opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'transform' });
    return true;
  }
  window.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cp-film]');
    if (!t) return;
    var inList = sec.contains(t);
    if (!choose(t.dataset.cpFilm, inList)) return;
    e.preventDefault(); e.stopPropagation();
    if (!inList) { cp.scrollTo(sec); setTimeout(function () { play.focus({ preventScroll: true }); }, cp.reduce ? 0 : 900); }
  }, true);
  // leaving the section pauses the film
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting && !video.paused) video.pause(); }); }, { threshold: 0 }).observe(sec);
  }
})();
