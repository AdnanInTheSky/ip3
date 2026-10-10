// Site-wide constants. Everything here is client-supplied (see ip3 content master, 2026).
module.exports = {
  name: 'IP3 Consulting Limited',
  short: 'IP3 Consulting',
  alt: 'Institute for Public Policy and Practice',
  descriptor: 'Institute for Public Policy & Practice',
  url: process.env.SITE_URL || 'https://ip3-bd.org',
  founded: 2018,
  email: 'info@ip3-bd.org',
  phone: '+880 1914 011 329',
  phoneHref: '+8801914011329',
  address: ['Zenith Prime, House-39, Road-35/A', 'Gulshan-2, Dhaka-1212', 'Bangladesh'],
  hours: 'Sunday – Thursday, 09:00–18:00 (GMT+6)',
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
