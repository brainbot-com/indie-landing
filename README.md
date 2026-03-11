# INDIE LANDING PAGE
*Static marketing, checkout, and legal pages for Indie.Box.*

## Overview
Indie.Box is a dedicated hardware platform for running open-weight AI models
locally.

This repository is designed to:
1. **Position**: Explain the value of local AI in a clear commercial narrative.
2. **Build trust**: Substantiate claims about privacy, operations, and product fit.
3. **Convert**: Guide users from interest to checkout or direct contact.

**Live Site:** https://indiebox.ai

---

## Working Rules

- `STYLE_GUIDE.md` is the single source of truth for typography, gradients,
  backgrounds, and component usage.
- `TRANSLATION.md` defines the DE -> EN workflow.
- German pages are the source of truth; matching English pages must stay in
  sync.
- This repo stays intentionally simple: static HTML, shared CSS, minimal
  JavaScript.

---

## Quick Start

### 1. Local Content Workflow

- Update German source pages first.
- Keep matching English pages in sync.
- For generated language pages, regenerate the English output after copy changes.

### 2. Translation
For `index.html`, update German copy first, then update
`i18n/index.html.lang.en.json`, and regenerate `en/index.html`:

```bash
node scripts/generate-lang.js
```

### 3. Analytics
Matomo is loaded via `matomo.js`. Any analytics change must stay consistent with
the site's privacy claims.

---

## Operations

### Admin Access

The internal admin area currently runs on staging:

- Inventory: `https://staging.indiebox.ai/admin/inventory.html`
- Orders: `https://staging.indiebox.ai/admin/orders.html`

Access is protected in two layers:

1. **HTTP Basic Auth on the proxy**
2. **Admin sign-in inside the app via session cookie**

The app session is configured to stay valid for up to 30 days.

Credentials are intentionally not committed to git.

Relevant local files:

- `deploy/env/.env.caddy`
- `deploy/env/.env.staging`

Relevant server files:

- `/srv/edge/config/caddy.env`
- `/srv/staging.indiebox/config/runtime.staging.env`

The admin area is not enabled for the live environment by default.

### Runtime Layout

Current server layout:

- Live site root: `/srv/indiebox/app/site`
- Live backend data: `/srv/indiebox/data/backend-live`
- Staging site root: `/srv/staging.indiebox/site`
- Staging runtime config: `/srv/staging.indiebox/config/runtime.staging.env`
- Staging backend data: `/srv/staging.indiebox/data`
- Shared Caddy config: `/srv/edge/config/Caddyfile`
- Shared Caddy credentials: `/srv/edge/config/caddy.env`

Deployment scripts:

- Static site: `bash deploy/scripts/push-site.sh`
- Backend and proxy stack: `bash deploy/scripts/push-stack.sh`
- SQLite backup: `bash deploy/scripts/backup-remote-sqlite.sh staging|live|all`

### Order Flow

Current checkout flow:

1. The user fills out the checkout form on `checkout.html`.
2. The backend validates the request and creates an internal order draft.
3. A Mollie payment is created.
4. The user is redirected to Mollie Hosted Checkout.
5. After payment, Mollie redirects back to `checkout-status.html`.
6. The backend verifies the payment status server-side through Mollie.
7. If the payment is confirmed, stock is reserved automatically.

### What The User Can Do

- view product and checkout pages
- submit a German checkout request
- choose from the payment methods currently enabled in Mollie
- return from Mollie and view the current payment status

### What The Admin Can Do

- update the public inventory state shown on checkout
- maintain the current system description
- record supplier orders and incoming stock
- review customer orders
- update reservation and fulfilment state

### Security Notes

- Admin access on staging requires both proxy authentication and an app session.
- Public order status checks require `order_id` and `status_token`.
- Staging uses rate limiting for checkout, status, admin, and webhook endpoints.

---

## File Structure

```text
indie-landing/
├── index.html              # German landing page source
├── checkout.html           # German checkout/supporting page
├── betriebs.html           # German operations page
├── privacy.html            # German privacy page
├── terms.html              # German terms page
├── impressum.html          # German legal page
├── en/                     # English counterparts
├── admin/                  # Internal admin pages
├── docs/                   # Documentation pages
├── i18n/                   # Translation keys for generated pages
├── style.css               # Shared design system and tokens
├── script.js               # Progressive enhancement behaviors
├── backend/                # Mollie/order backend
├── deploy/                 # Deploy, Caddy, backup scripts
├── scripts/generate-lang.js
└── README.md
```

---

## Support & Contact

- **Email**: sysadmin@indie.ai
- **GitHub**: [brainbot-com/indie-core](https://github.com/brainbot-com/indie-core)

---

**Built as a static site with shared CSS and minimal JavaScript.**
