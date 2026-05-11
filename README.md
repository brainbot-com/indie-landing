# Indie.Box — Landing, Checkout & Admin

Static marketing and checkout site for Indie.Box, with a Node.js backend for order processing and an internal admin area.

**Live:** https://indiebox.ai · **Staging:** https://staging.indiebox.ai

---

## Architecture

```
Browser
  │
  ▼
Caddy (TLS termination, security headers, basic auth for /admin*)
  ├── /api/* and /mail/*  → Node.js backend (Express 4, port 8080)
  └── everything else     → static files (HTML/CSS/JS)

Node.js backend
  └── SQLite (node:sqlite, single file: indiebox.sqlite)
```

All services run in Docker on a single server via `docker-compose.yml`.
Two independent backend instances share one Caddy: `backend-live` and `backend-staging`.

---

## Local Development

### 1. Start the backend

```bash
cd backend
npm install
```

Copy and source the dev env:

```bash
cp deploy/env/.env.dev .env.local   # do not commit
export $(grep -v '^#' deploy/env/.env.dev | xargs)
node src/index.mjs
# → backend listening on http://127.0.0.1:8080
```

Default dev credentials: username `admin`, password `brainbot`.

### 2. Start the static preview server

In a second terminal, from the repo root:

```bash
node deploy/scripts/local-preview.mjs
# → http://127.0.0.1:3000
```

This serves static files and proxies `/api/*` to the backend on port 8080.

### 3. Translation

German pages are the source of truth. After updating German copy, regenerate English pages:

```bash
node scripts/generate-lang.js
```

---

## Deployment

Two scripts cover all deployment scenarios. Both require SSH key access to the server.

Set the target server via environment variables (or rely on defaults):

```bash
export INDIEBOX_DEPLOY_HOST=87.106.111.141   # default
export INDIEBOX_DEPLOY_USER=deploy           # default
export INDIEBOX_DEPLOY_KEY=~/.ssh/indiebox_ionos  # default
```

### Deploy static site only

```bash
bash deploy/scripts/push-site.sh               # both staging and live
bash deploy/scripts/push-site.sh --staging     # staging only
bash deploy/scripts/push-site.sh --production  # live only
bash deploy/scripts/push-site.sh --dry-run     # preview what would change
```

Rsyncs all static files (HTML, CSS, JS, images) to the server. Does **not** restart the backend.

### Deploy backend + proxy stack

```bash
bash deploy/scripts/push-stack.sh
```

This script:
1. **Takes a live DB backup first** (aborts if backup fails — see Backup below)
2. Rsyncs backend source code and `docker-compose.yml`
3. Rsyncs the Caddyfile and env files for both environments
4. Runs `docker compose up -d --build` on the server

Use this whenever `backend/src/`, `docker-compose.yml`, `deploy/caddy/Caddyfile`, or env files change.

### Server layout

| Path | Contents |
|---|---|
| `/srv/indiebox/app/site/` | Live static site |
| `/srv/indiebox/app/backend/` | Backend source (deployed by push-stack) |
| `/srv/indiebox/data/backend-live/` | Live DB + data (bind-mounted, never deleted by Docker) |
| `/srv/indiebox/config/runtime.live.env` | Live runtime env vars |
| `/srv/staging.indiebox/site/` | Staging static site |
| `/srv/staging.indiebox/data/` | Staging DB + data |
| `/srv/staging.indiebox/config/runtime.staging.env` | Staging runtime env vars |
| `/srv/edge/config/Caddyfile` | Shared Caddy config |
| `/srv/edge/config/caddy.env` | Caddy basic-auth credentials |

---

## Environment Variables

### Backend (`runtime.live.env` / `runtime.staging.env`)

| Variable | Purpose |
|---|---|
| `APP_ENV` | `production` or `staging` — controls cookie Secure flag and dev shortcuts |
| `APP_BASE_URL` | Public base URL, used in Mollie redirect and email links |
| `APP_RUNTIME_NAME` | Human label shown in admin and API responses |
| `MOLLIE_API_KEY` | Mollie API key (`live_…` or `test_…`) |
| `MOLLIE_PROFILE_ID` | Mollie profile ID |
| `MOLLIE_MODE` | `live` or `test` |
| `ENABLE_ADMIN_API` | Must be `true` to activate admin endpoints |
| `PROXY_INTERNAL_TOKEN` | Token Caddy injects as `X-Proxy-Auth` — backend checks this to reject direct access |
| `ADMIN_SESSION_SECRET` | Secret for HMAC-signing session cookies (min 32 random bytes) |
| `ADMIN_SESSION_TTL_SECONDS` | Session lifetime in seconds (default: 2592000 = 30 days) |
| `ADMIN_LOGIN_PASSWORD` | Bootstrap admin password (used only when no users exist in DB) |
| `ADMIN_LOGIN_HASH` | Pre-hashed bootstrap password: `salt:scrypt_derived` |
| `ADMIN_API_TOKEN` | Optional static bearer token for API access (CI scripts etc.) |
| `MAILGUN_API_KEY` | Mailgun API key for order and 2FA emails |
| `MAILGUN_DOMAIN` | Mailgun sending domain |
| `MAILGUN_REGION` | `eu` or `us` |
| `ORDER_NOTIFICATION_FROM` | Sender address for admin and 2FA notification emails |
| `ORDER_NOTIFICATION_TO` | Recipient for new-order notifications |
| `DATA_DIR` | Path to data directory inside the container (default: `/app/data`) |
| `PORT` | Backend listen port (default: `8080`) |

### Caddy (`caddy.env`)

| Variable | Purpose |
|---|---|
| `ADMIN_BASIC_AUTH_USER` | HTTP basic auth username for `/admin*` |
| `ADMIN_BASIC_AUTH_HASH` | Bcrypt hash of basic auth password (generate with `caddy hash-password`) |
| `PROXY_INTERNAL_TOKEN` | Same value as in backend env — Caddy injects it into API proxied requests |

---

## Admin Authentication

The admin area has two independent layers:

### Layer 1 — HTTP Basic Auth (Caddy)

All requests to `/admin*` are gated by HTTP Basic Auth at the proxy level before any HTML is served. Configured in `caddy.env`.

### Layer 2 — App Session (Backend)

After passing Basic Auth, the admin pages require a signed session cookie obtained by logging in at the bottom of any admin page.

**Login flow:**

1. Enter username + password.
2. If credentials are correct and the account has **fewer than 5 recorded failed attempts**: session cookie is issued immediately.
3. If credentials are correct but there were **5 or more failed attempts**: a 6-digit code is sent to the user's registered email address. The email also states how many failed attempts were recorded. The user must enter the code within 10 minutes to complete sign-in. After success, the failed-attempt counter resets.
4. Wrong password: increments the failed-attempt counter for that username.

Sessions are valid for 30 days (`ADMIN_SESSION_TTL_SECONDS`).

### Managing admin users

Users and their email addresses (required for 2FA alerts) are managed at `/admin/users.html`. Each user needs an email set to receive 2FA codes.

---

## Backup

### Manual backup

```bash
bash deploy/scripts/backup-remote-sqlite.sh staging|live|all
```

Connects to the server and runs `sqlite3.backup()` (WAL-safe snapshot), gzips the result, and stores it at:

- Live: `/srv/indiebox/backups/live/indiebox-YYYYMMDD-HHMMSS.sqlite.gz`
- Staging: `/srv/staging.indiebox/backups/indiebox-YYYYMMDD-HHMMSS.sqlite.gz`

### Automatic pre-deploy backup

`push-stack.sh` automatically runs the live backup before every deploy. If the backup fails, the deploy is aborted.

### Backup encryption with age

Backups can be encrypted at rest using [age](https://age-encryption.org). The server encrypts with your public key; only you can decrypt with your private key.

**One-time setup:**

```bash
# 1. Generate a key pair locally
age-keygen -o ~/.config/age/indiebox-backup.key
# → prints the public key, e.g.: age1abcdef1234...

# 2. Install age on the server
ssh deploy@87.106.111.141 "sudo apt install -y age"

# 3. Store your public key on the server
ssh deploy@87.106.111.141 \
  "mkdir -p /srv/indiebox/config && \
   echo 'age1abcdef1234...' > /srv/indiebox/config/backup-age-recipient.txt"
```

Once the key file exists, every backup is automatically encrypted to `.sqlite.gz.age` and the unencrypted `.sqlite.gz` is deleted.

**Decrypt a backup:**

```bash
age -d -i ~/.config/age/indiebox-backup.key \
    -o restored.sqlite.gz \
    indiebox-20240501-120000.sqlite.gz.age
gunzip restored.sqlite.gz
# → restored.sqlite
```

**Important:** Store the private key (`indiebox-backup.key`) in a password manager or offline backup. Without it, encrypted backups cannot be restored.

### Restore procedure

```bash
# 1. Take a safety backup of the current live DB
bash deploy/scripts/backup-remote-sqlite.sh live

# 2. Copy the restored SQLite file to the server
scp -i ~/.ssh/indiebox_ionos restored.sqlite \
    deploy@87.106.111.141:/srv/indiebox/data/backend-live/indiebox.sqlite

# 3. Restart the backend to pick up the restored file
ssh -i ~/.ssh/indiebox_ionos deploy@87.106.111.141 \
    "sudo docker restart indiebox-backend-live"
```

---

## Security Notes

- TLS is terminated at Caddy with HSTS preload enabled.
- Security headers are set globally: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, `Cross-Origin-*-Policy`.
- The backend does not expose a public port; it only listens on the internal Docker network.
- Passwords are hashed with scrypt (32-byte salt, 64-byte derived key).
- Session cookies are HMAC-signed, `HttpOnly`, `SameSite=Strict`, `Secure` (in non-dev environments).
- All SQL queries use prepared statements.
- Public order status checks require both `order_id` and `status_token` (UUID).
- Mollie webhooks are verified by re-fetching payment status from the Mollie API rather than trusting the webhook payload.
- Rate limiting per IP is applied to checkout, order-status, admin, and webhook endpoints.

### Field-level PII Encryption

AES-256-GCM via `node:crypto` is wired up across orders, stock devices and order allocations. Encrypted columns: `customer_*`, `billing_address_json`, `shipping_address_json`, `orders.notes`, `device_username`, `device_password`. Stored format: `enc:v1:{iv}:{ciphertext}:{tag}` — plaintext rows are read transparently and re-encrypted on next write. `customer_email_lookup_hash` (HMAC-SHA256) is reserved for indexed email lookup. One-shot migration: `backend/src/migrate-encrypt-pii.mjs`.

The key is derived from `DATA_ENCRYPTION_KEY`:
- 64 hex chars → used directly as a 32-byte raw key (recommended for live)
- any other string → SHA-256-derived to 32 bytes (test/staging convenience)

#### 🚨 TODO — Replace test passphrase before first real customer order

All three env files currently ship with `DATA_ENCRYPTION_KEY=brainbot` as a test default. This means anyone who guesses the (publicly known) passphrase can decrypt a leaked DB backup. **Before going live with real customers:**

1. Generate a real key: `openssl rand -hex 32`
2. Put it in `deploy/env/.env.live` (and `.env.staging` if useful)
3. Store a copy in 1Password / secure vault — **losing the key = unrecoverable PII**
4. Push the env, then run the one-shot migration on the server:
   ```bash
   ssh deploy@indiebox.ai "sudo docker exec indiebox-backend-live \
       node /app/src/migrate-encrypt-pii.mjs /app/data"
   ```
5. Verify: read any pre-existing order via the admin API and confirm fields decrypt correctly.

---

## 3rd-Party API

The Indie.Box backend exposes one API consumed by an external party:

- **Devices / Provisioning API** — used by the box-side install script to read and write its own device record. Spec: [`DEVICES_API.md`](DEVICES_API.md).
  - Auth: API keys, prefixed `ind_bo_live_…` / `ind_bo_stg_…`, managed under `/admin/configuration.html` → API Keys.
  - Endpoints under `/api/v1/devices/*` (implementation pending — auth layer is live).

---

## Working Rules

- `STYLE_GUIDE.md` — single source of truth for typography, gradients, components.
- `TRANSLATION.md` — DE → EN workflow. German pages are always the source; English pages must stay in sync.
- `AGENTS.md` — briefing for AI agents working in this repo.
- Admin and backend pages are **English only** — no `en/admin/` counterparts.
