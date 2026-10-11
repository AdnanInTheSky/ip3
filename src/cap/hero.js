// Top of the page: the headline, jump links, the figures band and the development-partner names.
const { D, esc, rich, phero, breadcrumb } = require('./util');

function render() {
  const pg = D.pages.capabilities;
  return phero({ crumbs: [breadcrumb('/capabilities')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'video', src: '/assets/video/data.mp4', poster: '/assets/img/poster-data.webp' } });
}

module.exports = { render };
