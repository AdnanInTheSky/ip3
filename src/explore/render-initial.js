// Static initial state is generated from the real, local controller, so the first
// case and its numerical results remain readable when JavaScript is unavailable.
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const math = require('./math');
module.exports = function renderInitial(body, controller) {
  const { window } = parseHTML(`<!doctype html><html><body><div class="ip3-model">${body}</div></body></html>`);
  const noop = () => {};
  const location = new URL('https://ip3-bd.org/explore');
  Object.assign(window, {
    matchMedia: () => ({ matches: false, addEventListener: noop }),
    location, IP3ModelMath: math, requestAnimationFrame: noop,
    setTimeout: noop, setInterval: noop, clearInterval: noop,
    ResizeObserver: class { observe() {} },
    IntersectionObserver: class { observe() {} },
  });
  const context = {
    window, document: window.document, location,
    matchMedia: window.matchMedia, requestAnimationFrame: noop,
    setTimeout: noop, setInterval: noop, clearInterval: noop,
    addEventListener: noop, URLSearchParams, CustomEvent: window.CustomEvent,
    ResizeObserver: window.ResizeObserver, IntersectionObserver: window.IntersectionObserver,
  };
  vm.runInNewContext(controller, context, { timeout: 2000, filename: 'model-static-initial-state.js' });
  // No event handlers are serialised; normal route-local scripts attach them on load.
  return window.document.querySelector('.ip3-model').innerHTML;
};
