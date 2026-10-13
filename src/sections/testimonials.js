// One shared renderer and content identity; placements never copy CMS records.
const { esc } = require('../layout');

function testimonialCards(items) {
  return items.map((t) => `<figure class="quote"><blockquote>${esc(t.quote)}</blockquote><footer><b>${esc(t.name)}</b><span>${esc(t.role)}</span></footer></figure>`).join('');
}

function testimonialsSection(items) {
  return `<section class="section" id="home-testimonials" aria-label="Testimonials"><div class="container"><div class="quotes" data-stagger>${testimonialCards(items)}</div></div></section>`;
}

module.exports = { testimonialCards, testimonialsSection };
