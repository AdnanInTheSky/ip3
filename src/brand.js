// The IP3 logo lock-up (the owner's original design as clean vector), cropped tight to the artwork:
// viewBox 86.87 126.81 358.09 166.38 (aspect 2.1522), no padding, so CSS height == visible logo height.
// The enclosing home link carries the accessible name, so the image itself is decorative.
const SIZES = { nav: { w: 103, h: 48 }, reverse: { w: 138, h: 64 } }; // intrinsic px at the CSS height used

function brandLogo({ reverse = false, lazy = false, png = false } = {}) {
  const name = reverse ? 'ip3-logo-nav-reverse' : 'ip3-logo-nav';
  const { w, h } = SIZES[reverse ? 'reverse' : 'nav'];
  const src = png
    ? `/assets/logo/${name}@1x.png" srcset="/assets/logo/${name}@2x.png 2x, /assets/logo/${name}@3x.png 3x`
    : `/assets/logo/${name}.svg`;
  return `<img class="brand__logo" src="${src}" width="${w}" height="${h}" alt="" aria-hidden="true" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
}

module.exports = { brandLogo };
