// Conservative per-document delivery of the existing stylesheet. Declarations,
// selector order, media queries and keyframes are never rewritten.
const postcss = require('postcss');
const { parseHTML } = require('linkedom');
const runtimeClasses = new Set(['w', 'wi', 'js', 'no-js', 'menu-open']);
const motion = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/js/site.js'), 'utf8');
for (const match of motion.matchAll(/(?:classList\.(?:add|toggle)\(\s*|className\s*=\s*)['"]([^'"]+)['"]/g)) {
  match[1].split(/\s+/).forEach(name => runtimeClasses.add(name));
}
function pageCss(css, html) {
  const { document } = parseHTML(html), classes = new Set();
  document.querySelectorAll('[class]').forEach(n => n.classList.forEach(c => classes.add(c)));
  const tree = postcss.parse(css);
  tree.walkRules(rule => {
    // Functional selectors and CSS nesting are deliberately retained. Splitting
    // their commas or treating a negated class as required would be unsafe.
    if (/[(&\[\\]/.test(rule.selector)) return;
    const canMatch = rule.selector.split(',').some(selector => {
      const first = selector.match(/\.([a-zA-Z_][\w-]*)/);
      if (!first) return true;
      const name = first[1];
      return classes.has(name) || runtimeClasses.has(name) || /^(is-|has-|lenis)/.test(name);
    });
    if (!canMatch) rule.remove();
  });
  // Never remove declarations inside @font-face, @page or @view-transition.
  tree.walkAtRules(rule => { if (rule.nodes && rule.nodes.length === 0) rule.remove(); });
  return tree.toString();
}
module.exports = { pageCss };
