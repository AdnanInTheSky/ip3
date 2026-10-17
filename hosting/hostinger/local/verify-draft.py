"""Actual HTTP against cached local Apache/PHP; loopback only, no provider credentials."""
import argparse, hashlib, json, os, pathlib, socket, subprocess, tempfile, time, urllib.request, urllib.error
from article_http_policy import article_expectation, preparation_html_is_safe

parser = argparse.ArgumentParser()
parser.add_argument('--document-root', required=True)
parser.add_argument('--evidence-output', required=True)
parser.add_argument('--legacy-preview', action='store_true')
parser.add_argument('--inventory-cases')
args = parser.parse_args()
repo = pathlib.Path(__file__).resolve().parents[3]
document = pathlib.Path(args.document_root).resolve()
output = pathlib.Path(args.evidence_output).resolve()
allowed = [repo / 'docs/local-preparation-20261017', repo / 'docs/articles-preservation-20261017', repo / 'docs/phased-launch-20261018']
assert any(document.is_relative_to(folder) for folder in allowed) and document.is_dir()
assert any(output.is_relative_to(folder) for folder in allowed) and not output.exists()
runtime = pathlib.Path.home() / '.cache/ip3-hostinger-poc-runtime/root'
assert (runtime / 'usr/sbin/apache2').is_file() and (runtime / 'usr/bin/php-cgi8.5').is_file()

def free_port():
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 0))
        return probe.getsockname()[1]

http_port, php_port = free_port(), free_port()
while php_port == http_port:
    php_port = free_port()
base = f'http://127.0.0.1:{http_port}'
env = dict(os.environ, LD_LIBRARY_PATH=str(runtime / 'usr/lib/x86_64-linux-gnu'), CONTACT_ALLOWED_HOSTS=f'127.0.0.1:{http_port}')
for key in ['RESEND_API_KEY','CONTACT_TO','CONTACT_FROM','TURNSTILE_SECRET','IP3_CONTACT_CONFIG','CONTACT_RATE_DIR']:
    env.pop(key, None)
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args): return None
opener = urllib.request.build_opener(NoRedirect())
checks = []
def request(route, method='GET', body=None, headers=None):
    req = urllib.request.Request(base + route, data=body, method=method, headers=headers or {})
    try: response = opener.open(req, timeout=10)
    except urllib.error.HTTPError as e: response = e
    with response: return response.status, dict((k.lower(),v) for k,v in response.headers.items()), response.read()
def check(name, ok, **details): checks.append(dict(name=name, passed=bool(ok), **details))

with tempfile.TemporaryDirectory(prefix='ip3-http-draft-') as temp:
    state = pathlib.Path(temp)
    modules = ['mpm_event','authz_core','authz_host','dir','mime','rewrite','headers','proxy','proxy_fcgi','filter','deflate','env']
    config = '\n'.join([f'ServerRoot "{state}"', f'Listen 127.0.0.1:{http_port}', 'ServerName 127.0.0.1',
        f'PidFile "{state}/apache.pid"', f'ErrorLog "{state}/error.log"',
        *[f'LoadModule {m}_module "{runtime}/usr/lib/apache2/modules/mod_{m}.so"' for m in modules],
        'ServerTokens Prod', 'ServerSignature Off', f'DocumentRoot "{document}"',
        f'<Directory "{document}">', 'AllowOverride All', 'Require all granted', '</Directory>',
        'TypesConfig /etc/mime.types', 'ProxyFCGIBackendType GENERIC', '<FilesMatch "\\.php$">',
        f'SetHandler "proxy:fcgi://127.0.0.1:{php_port}"',
        f'ProxyFCGISetEnvIf "true" SCRIPT_FILENAME "{document}/api/contact.php"', '</FilesMatch>', ''])
    config_file = state / 'httpd.conf'; config_file.write_text(config)
    syntax = subprocess.run([str(runtime/'usr/sbin/apache2'), '-t', '-f', str(config_file)], env=env, capture_output=True, text=True)
    if syntax.returncode: raise RuntimeError(syntax.stderr)
    php_log = (state/'php.log').open('wb'); apache_log = (state/'apache.log').open('wb')
    processes = []
    try:
        processes.append(subprocess.Popen([str(runtime/'usr/bin/php-cgi8.5'), '-n', '-b', f'127.0.0.1:{php_port}'], env=env, stdout=php_log, stderr=php_log))
        processes.append(subprocess.Popen([str(runtime/'usr/sbin/apache2'), '-DFOREGROUND', '-f', str(config_file)], env=env, stdout=apache_log, stderr=apache_log))
        for _ in range(50):
            try:
                with socket.create_connection(('127.0.0.1', http_port), timeout=.1): break
            except OSError:
                if any(p.poll() is not None for p in processes): raise RuntimeError('Local harness exited: ' + (state/'apache.log').read_text())
                time.sleep(.1)
        inventory = json.loads(pathlib.Path(str(document)+'-inventory.json').read_text())
        for item in inventory['inventory']:
            name = item['file']
            if name.startswith('api/') or name == '.htaccess': continue
            route = '/' if name == 'index.html' else '/' + (name[:-5] if name.endswith('.html') else name)
            status, headers, body = request(route)
            check('file:' + route, status == 200 and hashlib.sha256(body).hexdigest() == item['sha256'], status=status)
            if name.endswith('.html'):
                check('headers:' + route, headers.get('x-content-type-options') == 'nosniff' and headers.get('x-frame-options') == 'SAMEORIGIN')
        aliases = json.loads((repo/'vercel.json').read_text())['redirects']
        for rule in aliases:
            status, headers, _ = request(rule['source'])
            check('alias:' + rule['source'], status == 308 and headers.get('location') == base + rule['destination'], status=status)
            status, headers, _ = request(rule['source'] + '?utm_source=local')
            loc = urllib.parse.urlsplit(headers.get('location','')); target = urllib.parse.urlsplit(rule['destination'])
            check('alias-query:' + rule['source'], status == 308 and loc.path == target.path and loc.fragment == target.fragment and urllib.parse.parse_qs(loc.query).get('utm_source') == ['local'])
            if not rule['source'].endswith('.html'):
                status, headers, _ = request(rule['source'] + '/')
                check('alias-slash:' + rule['source'], status == 308 and headers.get('location') == base + rule['destination'], status=status)
        for route in ['/about/', '/about.html', '/sectors/', '/sectors/climate-energy-resilience.html']:
            status, headers, _ = request(route)
            check('canonical:' + route, status == 308 and headers.get('location') == base + route.rstrip('/').removesuffix('.html'))
        draft_rules = json.loads((repo/'hosting/hostinger/confirmed-legacy-preview.json').read_text())
        for rule in (r for r in draft_rules if r.get('has')):
            route = rule['source'] + '?page_id=' + rule['has'][0]['value']
            status, headers, _ = request(route)
            check('draft-query:' + route, (status == 308 and headers.get('location') == base + rule['destination']) if args.legacy_preview else status == 404, status=status)
        cases_file = pathlib.Path(args.inventory_cases).resolve() if args.inventory_cases else document.parent/'legacy-cases.json'
        assert any(cases_file.is_relative_to(folder) for folder in allowed)
        cases = json.loads(cases_file.read_text())
        for row in cases:
            route = urllib.parse.quote(row['path'], safe='/?&=%:@,;~+-_.')
            status, headers, _ = request(route)
            expected = row['preview' if args.legacy_preview else 'baseline']
            if expected['status'] == 404:
                accepted = status in ((400,403,404) if row['action'] == 'MALFORMED_LINK' else (403,404))
            else:
                accepted = status == expected['status'] and (status != 308 or headers.get('location') == base + expected['destination'])
            check('legacy-inventory:' + row['path'], accepted, status=status, expected=expected, action=row['action'])
        articles = [json.loads(file.read_text()) for file in (repo/'content/articles').glob('*.json')]
        for article in articles:
            canonical = '/insights/' + article['slug']
            expected = article_expectation(article)
            status, _, body = request(canonical)
            check('article-visibility:' + article['slug'], status == expected['page_status'], status=status)
            if expected['preparation']:
                check('article-preparation-metadata:' + article['slug'], preparation_html_is_safe(body))
            if article['publicationStatus'] != 'published':
                if article.get('wpId'):
                    for root_path in ['/', '/index.php', '/index.html']:
                        status, _, _ = request(root_path + '?p=' + article['wpId'])
                        check('unpublished-legacy:' + article['wpId'] + ':' + root_path, status == expected['legacy_status'], status=status)
                continue
            if not article.get('wpId'):
                continue  # New owner-written articles have no legacy WordPress selector.
            for root_path in ['/', '/index.php', '/index.html']:
                route = root_path + '?utm_source=local&p=' + article['wpId']
                status, headers, _ = request(route)
                check('article-query:' + route, status == 308 and headers.get('location') == base + canonical, status=status)
            for suffix in ['/', '.html']:
                status, headers, _ = request(canonical + suffix)
                check('article-alias:' + canonical + suffix, status == 308 and headers.get('location') == base + canonical, status=status)
            article_id = article['wpId']
            for route in [f'/?p={article_id}&p={article_id}', f'/?p={article_id}&p', f'/?p={article_id}&page_id=6281',
                          f'/?p={article_id}&s', f'/?P={article_id}', f'/?%70={article_id}', '/?p=%'+format(ord(article_id[0]),'02X')+article_id[1:], canonical+'?p='+article_id]:
                status, _, body = request(route)
                check('article-selector-denied:' + route, status == 404 and body == (document/'404.html').read_bytes(), status=status)
        for route in ['/?page_id=6281&page_id=6281', '/?page_id=6281&p=3355', '/?p%61ge_id=6281', '/?page_id', '/?author=3', '/?cat=105', '/index.html?p=999999999', '/unknown-ip3-page']:
            status, _, body = request(route)
            check('unresolved:' + route, status == 404 and body == (document/'404.html').read_bytes(), status=status)
        for route in ['/.env', '/.git/config', '/api/contact-lib.php', '/wp-config.php']:
            status, _, body = request(route); check('private:' + route, status in (403,404) and b'<?php' not in body, status=status)
        status, _, _ = request('/api/contact'); check('contact-method', status == 405, status=status)
        status, _, _ = request('/api/contact', 'POST', b'{}', {'Origin':'https://evil.invalid','Content-Type':'application/json'})
        check('contact-origin', status == 403, status=status)
        valid = json.dumps(dict(name='Local fixture',email='fixture@example.invalid',message='No delivery',startedAt=int(time.time()*1000),turnstileToken='mock')).encode()
        status, headers, body = request('/api/contact', 'POST', valid, {'Origin':base,'Content-Type':'application/json'})
        check('contact-unconfigured', status == 503 and b'not configured' in body and b'<?php' not in body and headers.get('cache-control') == 'no-store', status=status)
    finally:
        for process in processes:
            if process.poll() is None: process.terminate()
        for process in processes:
            try: process.wait(timeout=5)
            except subprocess.TimeoutExpired: process.kill(); process.wait()
        php_log.close(); apache_log.close()
    result = dict(scope='LOCAL Apache/PHP 8.5 harness; not Hostinger or PHP 8.3', legacyPreview=args.legacy_preview,
        total=len(checks), passed=sum(c['passed'] for c in checks), failed=sum(not c['passed'] for c in checks), checks=checks)
    output.write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k != 'checks'}))
    for c in checks:
        if not c['passed']: print(json.dumps(c))
    if result['failed']: raise SystemExit(1)
