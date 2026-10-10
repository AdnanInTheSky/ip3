// Site-wide constants. Brand identity is fixed here; contact details come from content/site.json (CMS-editable).
const site = require('./content').file('site');

module.exports = {
  name: 'IP3 Consulting Limited',
  short: 'IP3 Consulting',
  alt: 'Institute for Public Policy and Practice',
  descriptor: 'Institute for Public Policy & Practice',
  url: process.env.SITE_URL || 'https://ip3-bd.org',
  founded: 2018,
  email: site.email,
  phone: site.phone,
  phoneHref: site.phone.replace(/[^+\d]/g, ''),
  address: site.address,
  hours: site.hours,
  nav: [
    { href: '/about', label: 'About' },
    { href: '/approach', label: 'Approach' },
    { href: '/capabilities', label: 'Capabilities' },
    { href: '/sectors', label: 'Sectors' },
    { href: '/engagements', label: 'Engagements' },
    { href: '/insights', label: 'Insights' },
    { href: '/people', label: 'People' },
  ],
};
