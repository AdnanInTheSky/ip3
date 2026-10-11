/* hero.js — the jump bar follows the section in view and drops below the site header when it shows; the figures band tilts in; the names marquee can be paused */
(function () {
  var cp = window.cp, jump = cp.$('[data-cp-jump]');
  if (jump) {
    var links = cp.$$('a', jump), head = cp.$('.head');
    var byId = {}; links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var targets = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          var a = byId[e.target.id]; if (!a) return;
          a.setAttribute('aria-current', 'true');
          var ul = a.parentNode.parentNode; // keep the active chip visible in the bar on small screens
          if (ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - 24, behavior: cp.reduce ? 'auto' : 'smooth' });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(function (t) { io.observe(t); });
    }
    var ticking = false;
    var place = function () {
      ticking = false;
      var stuck = jump.getBoundingClientRect().top <= 35;
      var headShown = head && !head.classList.contains('is-hidden') && window.scrollY > 10;
      jump.classList.toggle('is-low', stuck && !!headShown);
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(place); } }, { passive: true });
    if (head && 'MutationObserver' in window) new MutationObserver(place).observe(head, { attributes: true, attributeFilter: ['class'] });
    place();
  }

  var mq = cp.$('.cp-marquee'), btn = mq && cp.$('.cp-marquee__toggle', mq);
  if (btn && !cp.reduce) {
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var paused = mq.classList.toggle('is-paused');
      btn.textContent = paused ? btn.dataset.play : btn.dataset.pause;
    });
  }

  var grid = cp.$('[data-cp-figs]');
  if (grid && cp.gsapReady() && !cp.reduce) {
    gsap.fromTo(grid, { rotateX: 16, z: -120, opacity: 0.35 }, { rotateX: 0, z: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: grid, start: 'top 98%', end: 'top 55%', scrub: 0.6 } });
  }
})();
