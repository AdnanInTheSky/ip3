<?php
declare(strict_types=1);

// Copied to public /api/contact.php; handler copied to /api/contact-lib.php.
ini_set('display_errors', '0');
header_remove('X-Powered-By');

try {
    require __DIR__ . '/contact-lib.php';
    $config = [];
    $privateConfig = getenv('IP3_CONTACT_CONFIG');
    if ($privateConfig !== false && $privateConfig !== '') {
        $loaded = require ip3_contact_private_path($privateConfig, $_SERVER['DOCUMENT_ROOT'] ?? '');
        if (!is_array($loaded)) throw new RuntimeException('Invalid private configuration.');
        $config = $loaded;
    }
    foreach (['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'TURNSTILE_SECRET', 'CONTACT_RATE_DIR'] as $key) {
        $value = getenv($key);
        if ($value !== false && $value !== '') $config[$key] = $value;
    }
    $hosts = getenv('CONTACT_ALLOWED_HOSTS');
    if ($hosts !== false && $hosts !== '') $config['CONTACT_ALLOWED_HOSTS'] = array_map('trim', explode(',', strtolower($hosts)));
    $rateDirectory = empty($config['CONTACT_RATE_DIR']) ? '' :
        ip3_contact_private_path($config['CONTACT_RATE_DIR'], $_SERVER['DOCUMENT_ROOT'] ?? '');
    // Read at most the limit plus one byte; reject oversize without buffering arbitrary input.
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    $reply = ip3_contact_handle([
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        'headers' => ['host' => $_SERVER['HTTP_HOST'] ?? '', 'origin' => $_SERVER['HTTP_ORIGIN'] ?? '',
            'content-type' => $_SERVER['CONTENT_TYPE'] ?? ''],
        'remoteAddress' => $_SERVER['REMOTE_ADDR'] ?? '', 'body' => $raw === false ? '' : $raw,
    ], $config, 'ip3_contact_curl',
        static fn(string $address): bool => ip3_contact_rate_limit($rateDirectory, $address, time()),
        (int) floor(microtime(true) * 1000));
} catch (Throwable) {
    // Also safe if the library itself cannot be loaded; do not call its functions here.
    $reply = ['status' => 503, 'headers' => ['Content-Type' => 'application/json; charset=utf-8',
        'Cache-Control' => 'no-store', 'X-Content-Type-Options' => 'nosniff'],
        'body' => ['message' => 'The contact service is not configured yet.']];
}
http_response_code($reply['status']);
foreach ($reply['headers'] as $key => $value) header($key . ': ' . $value);
echo json_encode($reply['body'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
