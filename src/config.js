// Site-wide constants. Brand identity is fixed here; contact details come from content/site.json (CMS-editable).
const site = require('./content').file('site');

module.exports = {
  name: 'IP3 Consulting Limited',
  short: 'IP3 Consulting',
  alt: 'Institute for Public Policy and Practice',
  descriptor: 'Institute for Public Policy & Practice',
  url: process.env.SITE_URL || site.url,
  founded: 2018,
  email: site.email,
  phone: site.phone,
  phoneHref: site.phone.replace(/[^+\d]/g, ''),
  address: site.address,
  streetAddress: site.streetAddress,
  addressLocality: site.addressLocality,
  postalCode: site.postalCode,
  countryCode: site.countryCode,
  hours: site.hours,
  mapUrl: site.mapUrl,
  officeLabel: site.officeLabel,
  emailLabel: site.emailLabel,
  phoneLabel: site.phoneLabel,
  hoursLabel: site.hoursLabel,
};
