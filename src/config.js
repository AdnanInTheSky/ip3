// Site-wide constants. Brand identity is fixed here; contact details come from content/site.json (CMS-editable).
const site = require('./content').file('site');
const validVercelScriptPath = (value) => /^\/(?:[A-Za-z0-9_-]+\/)+script\.js$/.test(value || '') ? value : '';
const analyticsEnabled = process.env.VERCEL_ENV === 'production' && process.env.ENABLE_ANALYTICS === '1';
const contactApiEnabled = process.env.CONTACT_API_ENABLED === '1';

module.exports = {
  name: 'IP3 Consulting Limited',
  short: 'IP3 Consulting',
  alt: 'Institute for Public Policy and Practice',
  descriptor: 'Institute for Public Policy & Practice',
  url: process.env.SITE_URL || site.url,
  contactApiEnabled,
  turnstileSiteKey: contactApiEnabled ? (process.env.PUBLIC_TURNSTILE_SITE_KEY || '') : '',
  analytics: {
    enabled: analyticsEnabled,
    webAnalyticsPath: validVercelScriptPath(process.env.VERCEL_WEB_ANALYTICS_PATH),
    speedInsightsPath: validVercelScriptPath(process.env.VERCEL_SPEED_INSIGHTS_PATH),
  },
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
