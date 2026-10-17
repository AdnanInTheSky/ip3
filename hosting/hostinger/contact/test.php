<?php
declare(strict_types=1);
require __DIR__ . '/handler.php';

$passed = 0; $failed = 0;
function check(string $name, callable $test): void {
    global $passed, $failed;
    try { $test(); echo "PASS $name\n"; $passed++; }
    catch (Throwable $error) { echo "FAIL $name: {$error->getMessage()}\n"; $failed++; }
}
function expect(mixed $actual, mixed $wanted): void {
    if ($actual !== $wanted) throw new RuntimeException('Expected ' . json_encode($wanted) . ', received ' . json_encode($actual));
}
$now = 1792210000000;
$valid = ['name' => 'Test Editor', 'email' => 'editor@example.invalid', 'organization' => 'IP3',
    'engagement' => 'Research', 'focus' => 'Policy', 'message' => 'Local mocked test only.',
    'website' => '', 'startedAt' => $now - 10000, 'turnstileToken' => 'mock-token'];
$request = ['method' => 'POST', 'headers' => ['host' => 'ip3-bd.org', 'origin' => 'https://ip3-bd.org',
    'content-type' => 'application/json'], 'remoteAddress' => '192.0.2.1', 'body' => json_encode($valid)];
$config = ['CONTACT_ALLOWED_HOSTS' => ['ip3-bd.org', 'localhost:8123'], 'RESEND_API_KEY' => 'mock-not-a-key',
    'CONTACT_TO' => 'info@example.invalid', 'CONTACT_FROM' => 'site@example.invalid', 'TURNSTILE_SECRET' => 'mock-not-a-secret'];
$calls = [];
$transport = static function (string $url, array $headers, string $body) use (&$calls): array {
    $calls[] = compact('url', 'headers', 'body');
    return str_contains($url, 'siteverify') ? ['status' => 200, 'body' => '{"success":true,"hostname":"ip3-bd.org"}'] :
        ['status' => 200, 'body' => '{"id":"mock-receipt"}'];
};
$allow = static fn(string $address): bool => true;
$run = static function (array $changes = [], ?array $settings = null, ?callable $http = null, ?callable $rate = null)
    use ($request, $config, $transport, $allow, $now): array {
    return ip3_contact_handle(array_replace_recursive($request, $changes), $settings ?? $config,
        $http ?? $transport, $rate ?? $allow, $now);
};
$body = static fn(array $changes): array => ['body' => json_encode(array_replace($valid, $changes))];
check('valid mocked delivery and JSON response', function () use ($run, &$calls) {
    $calls = []; $result = $run(); expect($result['status'], 200); expect($result['body']['message'], 'Message sent.');
    expect(count($calls), 2); expect($result['headers']['Cache-Control'], 'no-store');
    expect($calls[0]['url'], 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect($calls[1]['url'], 'https://api.resend.com/emails');
});
check('GET rejected', fn() => expect($run(['method' => 'GET'])['status'], 405));
check('missing origin rejected', fn() => expect($run(['headers' => ['origin' => '']])['status'], 403));
check('foreign origin rejected', fn() => expect($run(['headers' => ['origin' => 'https://example.invalid']])['status'], 403));
check('HTTP public origin rejected', fn() => expect($run(['headers' => ['origin' => 'http://ip3-bd.org']])['status'], 403));
check('spoofed host and origin outside allowlist rejected', fn() => expect($run(['headers' => ['host' => 'evil.invalid', 'origin' => 'https://evil.invalid']])['status'], 403));
check('origin with credentials rejected', fn() => expect($run(['headers' => ['origin' => 'https://user@ip3-bd.org']])['status'], 403));
check('origin suffix rejected', fn() => expect($run(['headers' => ['origin' => 'https://ip3-bd.org.evil.invalid']])['status'], 403));
check('JSON MIME suffix trick rejected', fn() => expect($run(['headers' => ['content-type' => 'application/json-evil']])['status'], 415));
check('JSON charset accepted', fn() => expect($run(['headers' => ['content-type' => 'application/json; charset=UTF-8']])['status'], 200));
check('malformed JSON rejected', fn() => expect($run(['body' => '{broken'])['status'], 400));
check('array body rejected', fn() => expect($run(['body' => '[]'])['status'], 400));
check('oversize body rejected', fn() => expect($run(['body' => str_repeat(' ', 16385)])['status'], 413));
check('honeypot returns accepted without HTTP', function () use ($run, $body, &$calls) {
    $calls = []; expect($run($body(['website' => 'spam']))['body']['message'], 'Message received.'); expect(count($calls), 0);
});
check('stale timestamp rejected', fn() => expect($run($body(['startedAt' => $now - 86400001]))['status'], 400));
check('future timestamp rejected', fn() => expect($run($body(['startedAt' => $now + 300001]))['status'], 400));
check('noninteger timestamp rejected', fn() => expect($run($body(['startedAt' => 1.5]))['status'], 400));
check('missing name rejected', fn() => expect($run($body(['name' => '']))['status'], 400));
check('invalid email rejected', fn() => expect($run($body(['email' => 'bad\r\nBcc: bad']))['status'], 400));
check('nonstring field rejected', fn() => expect($run($body(['organization' => ['unsafe']]))['status'], 400));
check('overlong field rejected', fn() => expect($run($body(['message' => str_repeat('x', 5001)]))['status'], 400));
check('UTF-16 limits preserved', fn() => expect($run($body(['name' => str_repeat('😀', 61)]))['status'], 400));
check('missing provider configuration fails closed', function () use ($run, $config) { $c = $config; unset($c['RESEND_API_KEY']); expect($run([], $c)['status'], 503); });
check('missing Turnstile configuration fails closed', function () use ($run, $config) { $c = $config; unset($c['TURNSTILE_SECRET']); expect($run([], $c)['status'], 503); });
check('sender header injection rejected', function () use ($run, $config) { $c = $config; $c['CONTACT_FROM'] = "site@example.invalid\r\nBcc:bad"; expect($run([], $c)['status'], 503); });
check('missing security token rejected', fn() => expect($run($body(['turnstileToken' => '']))['status'], 400));
check('Turnstile false rejected', fn() => expect($run([], null, static fn() => ['status' => 200, 'body' => '{"success":false}'])['status'], 400));
check('Turnstile hostname mismatch rejected', fn() => expect($run([], null, static fn() => ['status' => 200, 'body' => '{"success":true,"hostname":"evil.invalid"}'])['status'], 400));
check('Turnstile HTTP failure rejected', fn() => expect($run([], null, static fn() => ['status' => 500, 'body' => '{}'])['status'], 400));
check('Turnstile transport exception hidden', fn() => expect($run([], null, static function () { throw new RuntimeException('private transport error'); })['status'], 502));
check('rate limit rejects before HTTP', function () use ($run, &$calls) { $calls = []; expect($run([], null, null, static fn() => false)['status'], 429); expect(count($calls), 0); });
check('rate limiter failure fails closed', fn() => expect($run([], null, null, static function () { throw new RuntimeException('private path'); })['status'], 503));
check('provider rejection does not report sent', function () use ($run) {
    $http = static fn(string $url) => str_contains($url, 'siteverify') ? ['status' => 200, 'body' => '{"success":true,"hostname":"ip3-bd.org"}'] : ['status' => 429, 'body' => '{}'];
    expect($run([], null, $http)['status'], 502);
});
check('provider malformed success does not report sent', function () use ($run) {
    $http = static fn(string $url) => str_contains($url, 'siteverify') ? ['status' => 200, 'body' => '{"success":true,"hostname":"ip3-bd.org"}'] : ['status' => 200, 'body' => '{}'];
    expect($run([], null, $http)['status'], 502);
});
check('HTML fields escaped and message line breaks retained', function () use ($run, $body, &$calls) {
    $calls = []; expect($run($body(['name' => '<img src=x>', 'message' => "<script>bad</script>\nnext & \"quoted\""]))['status'], 200);
    $mail = json_decode($calls[1]['body'], true);
    expect(str_contains($mail['html'], '<script>'), false); expect(str_contains($mail['html'], '&lt;script&gt;'), true);
    expect(str_contains($mail['html'], '&lt;img src=x&gt;'), true); expect(str_contains($mail['text'], "\nnext"), true);
    expect($mail['reply_to'], 'editor@example.invalid');
});
check('fixed transport rejects arbitrary endpoints before network', function () {
    try { ip3_contact_curl('https://example.invalid', [], ''); } catch (RuntimeException) { return; }
    throw new RuntimeException('Arbitrary endpoint accepted.');
});
check('local HTTP explicit allowlist supported', fn() => expect(ip3_contact_same_origin(['host' => 'localhost:8123', 'origin' => 'http://localhost:8123'], ['localhost:8123']), true));
check('filesystem rate limit enforces count and reset', function () {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ip3-contact-test-' . bin2hex(random_bytes(8));
    if (!mkdir($dir, 0700)) throw new RuntimeException('Temporary directory creation failed.');
    $path = $dir . DIRECTORY_SEPARATOR . 'ip3-rate-limits-v1.json';
    try {
        for ($i = 0; $i < 5; $i++) expect(ip3_contact_rate_limit($dir, '192.0.2.99', 1000), true);
        expect(ip3_contact_rate_limit($dir, '192.0.2.99', 1000), false);
        expect(ip3_contact_rate_limit($dir, '192.0.2.99', 1900), true);
    } finally { if (is_file($path)) unlink($path); rmdir($dir); }
});
check('filesystem rate limiter rejects forged proxy address', function () {
    try { ip3_contact_rate_limit(sys_get_temp_dir(), '192.0.2.1,evil', 1000); }
    catch (RuntimeException) { return; } throw new RuntimeException('Invalid address accepted.');
});
check('private configuration and storage reject public directory', function () {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ip3-private-test-' . bin2hex(random_bytes(8));
    mkdir($dir, 0700); mkdir($dir . '/public', 0700); mkdir($dir . '/public/rate', 0700);
    try {
        try { ip3_contact_private_path($dir . '/public/rate', $dir . '/public'); }
        catch (RuntimeException) { return; }
        throw new RuntimeException('Public path accepted.');
    } finally { rmdir($dir . '/public/rate'); rmdir($dir . '/public'); rmdir($dir); }
});
check('private sibling directory remains permitted', function () {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ip3-private-test-' . bin2hex(random_bytes(8));
    mkdir($dir, 0700); mkdir($dir . '/public', 0700); mkdir($dir . '/public-private', 0700);
    try { expect(ip3_contact_private_path($dir . '/public-private', $dir . '/public'), realpath($dir . '/public-private')); }
    finally { rmdir($dir . '/public-private'); rmdir($dir . '/public'); rmdir($dir); }
});
check('missing private path rejected', function () {
    try { ip3_contact_private_path(sys_get_temp_dir() . '/ip3-deliberately-missing-' . bin2hex(random_bytes(8)), sys_get_temp_dir()); }
    catch (RuntimeException) { return; }
    throw new RuntimeException('Missing path accepted.');
});
check('request cannot override configured recipient or sender', function () use ($run, $body, &$calls, $config) {
    $calls = []; expect($run($body(['to' => 'attacker@example.invalid', 'from' => 'attacker@example.invalid']))['status'], 200);
    $mail = json_decode($calls[1]['body'], true);
    expect($mail['to'], [$config['CONTACT_TO']]); expect($mail['from'], $config['CONTACT_FROM']);
});
check('forwarded proxy headers never choose rate-limit identity', function () use ($run) {
    $seen = '';
    $result = $run(['headers' => ['x-forwarded-for' => '203.0.113.9', 'cf-connecting-ip' => '203.0.113.8']], null, null,
        static function (string $address) use (&$seen): bool { $seen = $address; return true; });
    expect($result['status'], 200); expect($seen, '192.0.2.1');
});
check('missing direct address fails closed without transport', function () use ($run, &$calls) {
    $calls = []; expect($run(['remoteAddress' => ''])['status'], 503); expect(count($calls), 0);
});
check('equivalent IPv6 addresses share canonical identity', function () {
    expect(ip3_contact_client_address('2001:0db8:0:0:0:0:0:1'), ip3_contact_client_address('2001:db8::1'));
});
check('control characters in message rejected', fn() => expect($run($body(['message' => "hello\0world"]))['status'], 400));
check('nonstring challenge configuration fails closed', function () use ($run, $config) {
    $c = $config; $c['TURNSTILE_SECRET'] = ['unsafe']; expect($run([], $c)['status'], 503);
});
check('corrupt rate-limit state is rejected rather than reset', function () {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ip3-contact-test-' . bin2hex(random_bytes(8)); mkdir($dir, 0700);
    $path = $dir . DIRECTORY_SEPARATOR . 'ip3-rate-limits-v1.json';
    try {
        foreach (['{broken', '{"count":-1,"reset":1500}', '{"version":1,"clients":{"bad":{"count":0,"reset":1500}}}', str_repeat('x', 262145)] as $raw) {
            file_put_contents($path, $raw); $rejected = false;
            try { ip3_contact_rate_limit($dir, '192.0.2.99', 1000); } catch (RuntimeException) { $rejected = true; }
            expect($rejected, true);
        }
    } finally { if (is_file($path)) unlink($path); rmdir($dir); }
});
check('relative private configuration path rejected', function () {
    try { ip3_contact_private_path('handler.php', __DIR__); } catch (RuntimeException) { return; }
    throw new RuntimeException('Relative path accepted.');
});
check('bounded limiter rejects new clients at capacity and reuses expired slots', function () {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ip3-contact-test-' . bin2hex(random_bytes(8)); mkdir($dir, 0700);
    $path = $dir . '/ip3-rate-limits-v1.json';
    $clients = [];
    for ($i=0; $i<1024; $i++) $clients[hash('sha256', 'fixture-' . $i)] = ['count'=>1,'reset'=>1500];
    try {
        file_put_contents($path, json_encode(['version'=>1,'clients'=>$clients]));
        expect(ip3_contact_rate_limit($dir, '192.0.2.99', 1000), false);
        expect(ip3_contact_rate_limit($dir, '192.0.2.99', 1500), true);
        expect(count(json_decode(file_get_contents($path), true)['clients']), 1);
    } finally { if (is_file($path)) unlink($path); rmdir($dir); }
});
check('limiter rejects symbolic and hard-linked state without changing the target', function () {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ip3-contact-test-' . bin2hex(random_bytes(8)); mkdir($dir, 0700);
    $path = $dir . '/ip3-rate-limits-v1.json'; $target = $dir . '/owned-fixture.txt'; file_put_contents($target, 'preserve fixture');
    try {
        foreach (['symlink', 'link'] as $make) {
            if (!$make($target, $path)) throw new RuntimeException('Cannot create local link fixture.');
            $rejected = false;
            try { ip3_contact_rate_limit($dir, '192.0.2.99', 1000); } catch (RuntimeException) { $rejected = true; }
            expect($rejected, true); expect(file_get_contents($target), 'preserve fixture'); unlink($path);
        }
    } finally { if (is_link($path) || is_file($path)) unlink($path); unlink($target); rmdir($dir); }
});

echo json_encode(['passed' => $passed, 'failed' => $failed, 'externalRequests' => 0], JSON_PRETTY_PRINT) . "\n";
exit($failed === 0 ? 0 : 1);
