const { validateOrder } = require('./section-order');

// Home-only pilot. The labels are saved by Pages CMS; content remains in the
// existing testimonials file, shared with Engagements.
const testimonialPlacements = {
  'With clients and funders (default)': { embedded: true },
  'After selected engagements': { after: 'Engagements' },
  'Before founder profile': { before: 'Founder' },
};
const defaultTestimonialPlacement = 'With clients and funders (default)';

function validateHomeTestimonialsPlacement(placement, order, items) {
  if (!Object.hasOwn(testimonialPlacements, placement)) {
    throw new Error('Choose a supported Home testimonial location.');
  }
  const rule = testimonialPlacements[placement];
  const keys = validateOrder('home', order);
  const anchor = rule.before || rule.after;
  if (anchor && !keys.includes(anchor)) throw new Error(`Testimonials require the Home section “${anchor}”.`);
  if (!Array.isArray(items)) throw new Error('The shared testimonials content is missing.');
  if (!rule.embedded && !items.some((item) => item && !item.hidden && typeof item.quote === 'string' && item.quote.trim())) {
    throw new Error('Keep at least one visible testimonial before moving the Testimonials section.');
  }
  return rule;
}

module.exports = { testimonialPlacements, defaultTestimonialPlacement, validateHomeTestimonialsPlacement };
