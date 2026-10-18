"""Built-in unittest only. No network, PHP process, secrets or generated-site edits."""
import unittest
from article_http_policy import article_expectation, preparation_html_is_safe


class ArticlePolicyTests(unittest.TestCase):
    def test_complete_articles_have_pages_and_legacy_redirects(self):
        self.assertEqual(article_expectation({'publicationStatus': 'published'}),
                         {'page_status': 200, 'legacy_status': 308, 'preparation': False})

    def test_preparation_topics_have_pages_but_no_legacy_redirect(self):
        self.assertEqual(article_expectation({'publicationStatus': 'in-preparation'}),
                         {'page_status': 200, 'legacy_status': 404, 'preparation': True})

    def test_drafts_have_neither_page_nor_redirect(self):
        self.assertEqual(article_expectation({'publicationStatus': 'draft'}),
                         {'page_status': 404, 'legacy_status': 404, 'preparation': False})

    def test_unknown_state_fails_closed(self):
        with self.assertRaises(ValueError):
            article_expectation({'publicationStatus': 'ready'})

    def test_preparation_requires_real_robots_tag_and_notice(self):
        self.assertTrue(preparation_html_is_safe(b'<meta content="nofollow, NOINDEX" name="robots"><h1>In preparation</h1>'))
        self.assertFalse(preparation_html_is_safe('<p>noindex In preparation</p>'))
        self.assertFalse(preparation_html_is_safe('<meta name="robots" content="noindex"><h1>No notice</h1>'))

    def test_preparation_cannot_masquerade_as_article_schema(self):
        html = '<meta name="robots" content="noindex"><h1>In preparation</h1>'
        self.assertFalse(preparation_html_is_safe(html + '<script type="application/ld+json">{"@type": "Article"}</script>'))


if __name__ == '__main__':
    unittest.main()
