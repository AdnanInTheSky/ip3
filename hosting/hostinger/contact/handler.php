<?php
declare(strict_types=1);

// Pure request handling; external HTTP and rate limiting are injected for local tests.
function ip3_contact_reply(int $status, string $message): array
{
    return ['status' => $status, 'headers' => [
        'Content-Type' => 'application/json; charset=utf-8',
        'Cache-Control' => 'no-store', 'X-Content-Type-Options' => 'nosniff',
    ], 'body' => ['message' => $message]];
}

function ip3_contact_clean(mixed $value, int $max): string
{
    if (!is_scalar($value) && $value !== null) return '';
    $value = trim(preg_replace('/[\r\n\x00-\x1f\x7f]+/', ' ', (string) $value) ?? '');
    preg_match_all('/./us', $value, $chars);
    return implode('', array_slice($chars[0], 0, $max));
}

function ip3_contact_length(string $value): int
{
    // Match JavaScript string limits (UTF-16 code units), without requiring mbstring.
    preg_match_all('/./us', $value, $chars);
    $length = 0;
    foreach ($chars[0] as $char) $length += strlen($char) === 4 ? 2 : 1;
    return $length;
}

function ip3_contact_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
}

function ip3_contact_private_path(string $path, string $publicRoot): string
{
    if ($path === '' || $publicRoot === '' || !preg_match('~^(?:/|[A-Za-z]:[\\\\/])~', $path) || is_link($path))
        throw new RuntimeException('Explicit private absolute path required.');
    $resolved = realpath($path);
    $root = realpath($publicRoot);
    if ($resolved === false || $root === false ||
        str_starts_with(strtolower($resolved . DIRECTORY_SEPARATOR), strtolower($root . DIRECTORY_SEPARATOR)))
        throw new RuntimeException('Private configuration must be outside the document root.');
    return $resolved;
}

function ip3_contact_client_address(mixed $address): string
{
    // No forwarded header is trusted. Provider proxy ranges need separate verified configuration.
    if (!is_string($address) || !filter_var($address, FILTER_VALIDATE_IP))
        throw new RuntimeException('Verified client address unavailable.');
    $packed = inet_pton($address);
    if ($packed === false) throw new RuntimeException('Verified client address unavailable.');
    return inet_ntop($packed);
}

function ip3_contact_same_origin(array $headers, array $allowedHosts): bool
{
    $host = strtolower($headers['host'] ?? '');
    $origin = parse_url($headers['origin'] ?? '');
    if (!is_array($origin) || !isset($origin['scheme'], $origin['host']) ||
        isset($origin['user']) || isset($origin['pass']) || isset($origin['query']) ||
        isset($origin['fragment']) || (($origin['path'] ?? '') !== '')) return false;
    // No proxy headers, comma-separated hosts, control characters or wildcard suffixes.
    if (!preg_match('/^(?:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::[0-9]{1,5})?$/D', $host)) return false;
    $authority = strtolower($origin['host']) . (isset($origin['port']) ? ':' . $origin['port'] : '');
    $local = preg_match('/^(?:localhost|127\.0\.0\.1):[0-9]+$/D', $host) === 1;
    if ($origin['scheme'] !== 'https' && !($local && $origin['scheme'] === 'http')) return false;
    return $authority === $host && in_array($host, $allowedHosts, true);
}

function ip3_contact_handle(array $request, array $config, callable $transport, callable $rateLimit, int $nowMs): array
{
    if (($request['method'] ?? '') !== 'POST') {
        $reply = ip3_contact_reply(405, 'Method not allowed.');
        $reply['headers']['Allow'] = 'POST';
        return $reply;
    }
    $headers = array_change_key_case($request['headers'] ?? [], CASE_LOWER);
    if (!ip3_contact_same_origin($headers, $config['CONTACT_ALLOWED_HOSTS'] ?? []))
        return ip3_contact_reply(403, 'This request could not be verified.');
    if (!preg_match('/^application\/json(?:\s*;|$)/i', $headers['content-type'] ?? ''))
        return ip3_contact_reply(415, 'Expected a JSON request.');
    $raw = $request['body'] ?? '';
    if (!is_string($raw)) return ip3_contact_reply(400, 'Invalid request.');
    if (strlen($raw) > 16 * 1024) return ip3_contact_reply(413, 'Request is too large.');
    try { $body = json_decode($raw, false, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException) { return ip3_contact_reply(400, 'Invalid request.'); }
    if (!$body instanceof stdClass) return ip3_contact_reply(400, 'Invalid request.');
    if (ip3_contact_clean($body->website ?? '', 200) !== '')
        return ip3_contact_reply(200, 'Message received.');
    $started = $body->startedAt ?? null;
    if ((!is_int($started) && !(is_string($started) && preg_match('/^[0-9]{1,16}$/D', $started))) ||
        (float)$started > 9007199254740991 || (float)$started > $nowMs + 300000 ||
        (float)$started < $nowMs - 86400000)
        return ip3_contact_reply(400, 'Please review the form and try again.');
    foreach (['name' => 120, 'email' => 254, 'organization' => 160,
        'engagement' => 120, 'focus' => 160, 'message' => 5000, 'turnstileToken' => 2048] as $key => $max) {
        $value = $body->$key ?? '';
        if (!is_string($value) || ip3_contact_length($value) > $max)
            return ip3_contact_reply(400, 'One or more fields are too long or invalid.');
    }
    $name = ip3_contact_clean($body->name ?? '', 120);
    $email = ip3_contact_clean($body->email ?? '', 254);
    $organization = ip3_contact_clean($body->organization ?? '', 160);
    $engagement = ip3_contact_clean($body->engagement ?? '', 120);
    $focus = ip3_contact_clean($body->focus ?? '', 160);
    $message = trim($body->message ?? '');
    $token = ip3_contact_clean($body->turnstileToken ?? '', 2048);
    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '')
        return ip3_contact_reply(400, 'Enter your name, a valid email address and a message.');
    if (preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', $message))
        return ip3_contact_reply(400, 'Please review the message and try again.');
    foreach (['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'TURNSTILE_SECRET'] as $key)
        if (!is_string($config[$key] ?? null) || trim($config[$key]) === '' || preg_match('/[\x00-\x1f\x7f]/', $config[$key]))
            return ip3_contact_reply(503, 'The contact service is not configured yet.');
    if (empty($config['TURNSTILE_SECRET']))
        return ip3_contact_reply(503, 'The contact security check is not configured yet.');
    if (!filter_var($config['CONTACT_TO'], FILTER_VALIDATE_EMAIL) ||
        !filter_var($config['CONTACT_FROM'], FILTER_VALIDATE_EMAIL) ||
        preg_match('/[\r\n]/', $config['RESEND_API_KEY'] . $config['TURNSTILE_SECRET']))
        return ip3_contact_reply(503, 'The contact service is not configured yet.');
    if ($token === '') return ip3_contact_reply(400, 'Complete the security check and try again.');
    try {
        $clientAddress = ip3_contact_client_address($request['remoteAddress'] ?? null);
        if (!$rateLimit($clientAddress))
            return ip3_contact_reply(429, 'Too many requests. Please try again later.');
    } catch (Throwable) { return ip3_contact_reply(503, 'The contact service is not configured yet.'); }
    $host = strtolower(parse_url('https://' . $headers['host'], PHP_URL_HOST) ?? '');
    try {
        $verify = $transport('https://challenges.cloudflare.com/turnstile/v0/siteverify',
            ['Content-Type' => 'application/x-www-form-urlencoded'],
            http_build_query(['secret' => $config['TURNSTILE_SECRET'], 'response' => $token]));
        $result = json_decode($verify['body'] ?? '', true);
        if (($verify['status'] ?? 0) < 200 || ($verify['status'] ?? 0) >= 300 ||
            !is_array($result) || ($result['success'] ?? false) !== true ||
            strtolower((string)($result['hostname'] ?? '')) !== $host)
            return ip3_contact_reply(400, 'The security check expired. Please try again.');
    } catch (Throwable) { return ip3_contact_reply(502, 'The security check could not be verified. Please try again.'); }
    $fields = ['Name' => $name, 'Email' => $email, 'Organization' => $organization ?: 'Not provided',
        'Engagement type' => $engagement ?: 'Not provided', 'Focus area' => $focus ?: 'Not provided'];
    $html = ''; $text = '';
    foreach ($fields as $label => $value) {
        $html .= '<p><strong>' . ip3_contact_html($label) . ':</strong> ' . ip3_contact_html($value) . '</p>';
        $text .= $label . ': ' . $value . "\n";
    }
    $html .= '<p><strong>Message:</strong></p><pre style="white-space:pre-wrap;font:inherit">' . ip3_contact_html($message) . '</pre>';
    try {
        $sent = $transport('https://api.resend.com/emails',
            ['Authorization' => 'Bearer ' . $config['RESEND_API_KEY'], 'Content-Type' => 'application/json'],
            json_encode(['from' => $config['CONTACT_FROM'], 'to' => [$config['CONTACT_TO']],
                'reply_to' => $email, 'subject' => 'Website enquiry — ' . ($engagement ?: 'General') . ' — ' . $name,
                'html' => $html, 'text' => $text . "\n" . $message], JSON_THROW_ON_ERROR));
        if (($sent['status'] ?? 0) < 200 || ($sent['status'] ?? 0) >= 300)
            return ip3_contact_reply(502, 'We could not send your message. Please use the email fallback.');
        $receipt = json_decode($sent['body'] ?? '', true);
        if (!is_array($receipt) || !is_string($receipt['id'] ?? null) || $receipt['id'] === '')
            return ip3_contact_reply(502, 'We could not send your message. Please use the email fallback.');
        return ip3_contact_reply(200, 'Message sent.');
    } catch (Throwable) { return ip3_contact_reply(502, 'We could not send your message. Please use the email fallback.'); }
}

function ip3_contact_curl(string $url, array $headers, string $body): array
{
    if (!in_array($url, ['https://challenges.cloudflare.com/turnstile/v0/siteverify', 'https://api.resend.com/emails'], true))
        throw new RuntimeException('Unsupported transport endpoint.');
    if (!extension_loaded('curl')) throw new RuntimeException('HTTPS transport unavailable.');
    $handle = curl_init($url);
    $lines = [];
    foreach ($headers as $key => $value) $lines[] = $key . ': ' . $value;
    $response = '';
    curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $lines,
        CURLOPT_RETURNTRANSFER => false, CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10, CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$response): int {
            if (strlen($response) + strlen($chunk) > 65536) return 0;
            $response .= $chunk;
            return strlen($chunk);
        }]);
    try {
        if (curl_exec($handle) === false) throw new RuntimeException('HTTPS transport failed.');
        return ['status' => curl_getinfo($handle, CURLINFO_RESPONSE_CODE), 'body' => $response];
    } finally { curl_close($handle); }
}

function ip3_contact_rate_limit(string $directory, string $address, int $now): bool
{
    $address = ip3_contact_client_address($address);
    if (!is_dir($directory) || !is_writable($directory))
        throw new RuntimeException('Private rate limiter unavailable.');
    // One bounded locked store avoids creating a file for every attacker-supplied IP.
    $identity = hash('sha256', $address);
    $path = $directory . DIRECTORY_SEPARATOR . 'ip3-rate-limits-v1.json';
    clearstatcache(true, $path);
    if (is_link($path)) throw new RuntimeException('Unsafe rate limiter state.');
    $file = fopen($path, 'c+');
    if ($file === false) throw new RuntimeException('Rate limiter unavailable.');
    try {
        if (!flock($file, LOCK_EX)) throw new RuntimeException('Rate limiter unavailable.');
        clearstatcache(true, $path);
        $opened = fstat($file); $named = lstat($path);
        if ($opened === false || $named === false || ($named['mode'] & 0170000) !== 0100000 ||
            $opened['ino'] !== $named['ino'] || $opened['dev'] !== $named['dev'] ||
            $opened['nlink'] !== 1 || $opened['size'] > 262144)
            throw new RuntimeException('Unsafe rate limiter state.');
        $raw = stream_get_contents($file, 262145);
        if ($raw === false) throw new RuntimeException('Rate limiter unavailable.');
        if ($raw === '') $state = ['version' => 1, 'clients' => []];
        else {
            try { $state = json_decode($raw, true, 8, JSON_THROW_ON_ERROR); }
            catch (JsonException) { throw new RuntimeException('Invalid rate limiter state.'); }
            if (!is_array($state) || count($state) !== 2 || ($state['version'] ?? null) !== 1 ||
                !is_array($state['clients'] ?? null) || count($state['clients']) > 1024)
                throw new RuntimeException('Invalid rate limiter state.');
            foreach ($state['clients'] as $key => $client) {
                if (!is_string($key) || !preg_match('/^[a-f0-9]{64}$/D', $key) || !is_array($client) || count($client) !== 2 ||
                    !is_int($client['count'] ?? null) || $client['count'] < 0 || $client['count'] > 5 ||
                    !is_int($client['reset'] ?? null) || $client['reset'] <= 0 || $client['reset'] > $now + 900)
                    throw new RuntimeException('Invalid rate limiter state.');
                if ($client['reset'] <= $now) unset($state['clients'][$key]);
            }
        }
        if (!isset($state['clients'][$identity])) {
            if (count($state['clients']) >= 1024) return false;
            $state['clients'][$identity] = ['count' => 0, 'reset' => $now + 900];
        }
        if ($state['clients'][$identity]['count'] >= 5) return false;
        $state['clients'][$identity]['count']++;
        rewind($file);
        $encoded = json_encode($state, JSON_THROW_ON_ERROR);
        if (!ftruncate($file, 0) || fwrite($file, $encoded) !== strlen($encoded) || !fflush($file))
            throw new RuntimeException('Rate limiter unavailable.');
        return true;
    } finally { flock($file, LOCK_UN); fclose($file); }
}
