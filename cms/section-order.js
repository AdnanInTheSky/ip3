// Only independent, page-level sections belong here. Hero and closing CTA sections
// are rendered outside these lists and therefore cannot be moved by editors.
const editableSectionOrders = {
  home: {
    label: 'Home',
    fieldLabel: 'Home — middle sections',
    hint: 'Drag sections to change their order. The hero stays first and the closing contact section stays last. Every section must appear once.',
    default: ['Built for complex mandates', 'IP3 in numbers', 'Capabilities', 'Why IP3', 'Sectors', 'Translation, not theory', 'Engagements', 'Insights', 'Convening', 'Selected proof', 'Founder'],
  },
  about: {
    label: 'About',
    fieldLabel: 'About — middle sections',
    hint: 'Drag sections to change their order. The page headline stays first and the contact section stays last. Every section must appear once.',
    default: ['Introduction', 'Vision, mission & aims', 'Principles', 'Policy lifecycle', 'Strategic pillars', 'Our values', 'What makes IP3 different', 'Our network'],
  },
  people: {
    label: 'People',
    fieldLabel: 'People — middle sections',
    hint: 'Choose whether the founder profile or people directory appears first. The page headline and contact section stay in place.',
    default: ['Founder profile', 'People directory'],
  },
  contact: {
    label: 'Contact',
    fieldLabel: 'Contact — sections after the headline',
    hint: 'Drag sections to change their order. The contact details and form, contact pathways, and FAQs must each appear once.',
    default: ['Contact details & enquiry form', 'Contact pathways', 'Frequently asked questions'],
  },
};

function validateOrder(page, order) {
  const spec = editableSectionOrders[page];
  if (!spec) throw new Error(`Section order is not editable for “${page}”.`);
  if (!Array.isArray(order) || order.length !== spec.default.length) {
    throw new Error(`${spec.label} section order must contain exactly ${spec.default.length} supported sections.`);
  }
  const expected = new Set(spec.default);
  const seen = new Set();
  for (const key of order) {
    if (!expected.has(key)) throw new Error(`${spec.label} section “${key}” is not supported.`);
    if (seen.has(key)) throw new Error(`${spec.label} section “${key}” appears more than once.`);
    seen.add(key);
  }
  return order;
}

function renderOrder(page, order, renderers) {
  const valid = validateOrder(page, order);
  if (Array.isArray(renderers)) {
    const spec = editableSectionOrders[page];
    if (renderers.length !== spec.default.length) throw new Error(`${spec.label} renderer count does not match its supported sections.`);
    renderers = Object.fromEntries(spec.default.map((key, index) => [key, renderers[index]]));
  }
  for (const key of valid) {
    if (typeof renderers[key] !== 'function' && typeof renderers[key] !== 'string') throw new Error(`${page} section “${key}” has no renderer.`);
  }
  return valid.map((key) => typeof renderers[key] === 'function' ? renderers[key]() : renderers[key]).join('\n');
}

module.exports = { editableSectionOrders, validateOrder, renderOrder };
