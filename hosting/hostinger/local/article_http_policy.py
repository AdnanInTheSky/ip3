"""Pure acceptance policy for local HTTP checks; no network or provider access."""
from html.parser import HTMLParser


def article_expectation(article):
    state = article['publicationStatus']
    if state not in ('draft', 'in-preparation', 'published'):
        raise ValueError('Unknown article publication status')
    return {
        'page_status': 404 if state == 'draft' else 200,
        'legacy_status': 308 if state == 'published' else 404,
        'preparation': state == 'in-preparation',
    }


class RobotsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag.lower() == 'meta' and attributes.get('name', '').lower() == 'robots':
            tokens = attributes.get('content', '').lower().replace(',', ' ').split()
            self.noindex |= 'noindex' in tokens


def preparation_html_is_safe(body):
    text = body.decode('utf-8') if isinstance(body, bytes) else body
    parser = RobotsParser()
    parser.feed(text)
    # Body withholding is covered by renderer unit tests; this checks HTTP metadata/notice.
    compact = ''.join(text.split())
    return parser.noindex and 'In preparation' in text and '"@type":"Article"' not in compact
