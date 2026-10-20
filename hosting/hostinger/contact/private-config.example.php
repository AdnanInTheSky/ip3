<?php
// Template only. Store the populated file OUTSIDE public_html, Git and deployment artifacts.
// Configure the absolute path with the server-side IP3_CONTACT_CONFIG environment variable.
return [
    'RESEND_API_KEY' => '',
    'CONTACT_TO' => '',
    'CONTACT_FROM' => '', // Bare verified sender email, not a display-name header.
    'TURNSTILE_SECRET' => '',
    'CONTACT_ALLOWED_HOSTS' => ['ip3-bd.org', 'www.ip3-bd.org'],
    'CONTACT_RATE_DIR' => '', // Existing private writable directory OUTSIDE public_html.
];
