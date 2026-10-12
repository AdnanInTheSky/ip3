/* statement — the large sentence lights up word by word as it crosses the viewport (opacity per word, <em> kept). */
(function () {
  var sx = window.sx, el = sx.$('[data-sx-lit]');
  if (!el || sx.reduce) return;
  var words = [];
  (function walk(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'sx-w'; w.textContent = part; frag.appendChild(w); words.push(w);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) walk(n);
    });
  })(el);
  el.classList.add('is-lit');
  var n = words.length, last = -1;
  sx.tick(function () {
    if (!sx.near(el, 200)) return;
    var p = sx.viewProgress(el, 0.88, 0.32), lit = p * (n + 4);
    if (Math.abs(lit - last) < 0.05) return;
    last = lit;
    for (var i = 0; i < n; i++) words[i].style.opacity = (0.14 + 0.86 * sx.clamp(lit - i, 0, 1)).toFixed(2);
  });
})();
