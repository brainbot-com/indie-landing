#!/usr/bin/env node
// Quick smoke-test: sends a plain email via the staging Mailgun account.
// Usage: MAILGUN_API_KEY=... MAILGUN_DOMAIN=... node test-email.mjs [recipient]
// Default recipient: neo@brainbot.com

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN  = process.env.MAILGUN_DOMAIN || 'notifications.indiebox.ai';
const FROM            = 'Indie.box <indiebox@brainbot.com>';
const TO              = process.argv[2] ?? 'neo@brainbot.com';

if (!MAILGUN_API_KEY) {
  console.error('MAILGUN_API_KEY env var is required.');
  process.exit(1);
}

const url  = `https://api.eu.mailgun.net/v3/${encodeURIComponent(MAILGUN_DOMAIN)}/messages`;
const auth = `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`;

const body = new URLSearchParams({
  from:    FROM,
  to:      TO,
  subject: '[Indie.box staging] Email test',
  text:    `This is a test email sent from the Indie.box staging environment.\n\nMailgun domain: ${MAILGUN_DOMAIN}\nTimestamp: ${new Date().toISOString()}`,
});

console.log(`Sending test email to ${TO} via ${MAILGUN_DOMAIN} (EU) …`);

const res = await fetch(url, {
  method:  'POST',
  headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
  body:    body.toString(),
});

const json = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`FAILED ${res.status} ${res.statusText}`, json);
  process.exit(1);
}

console.log('OK', json);
