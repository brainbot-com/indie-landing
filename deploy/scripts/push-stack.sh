#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_HOST="${INDIEBOX_DEPLOY_HOST:-87.106.111.141}"
DEPLOY_USER="${INDIEBOX_DEPLOY_USER:-deploy}"
SSH_KEY="${INDIEBOX_DEPLOY_KEY:-$HOME/.ssh/indiebox_ionos}"
APP_PATH="${INDIEBOX_APP_PATH:-/srv/indiebox/app/}"
CONFIG_PATH="${INDIEBOX_CONFIG_PATH:-/srv/edge/config/}"

# Deploy target. Default deploys the whole stack (staging + live). Pass
# --staging to rebuild ONLY the backend-staging container, leaving the live
# backend, live env, Caddyfile and Caddy container untouched — for verifying
# a backend change on staging before it reaches production.
TARGET="all"
if [[ "${1:-}" == "--staging" ]]; then
  TARGET="staging"
fi

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

# Preflight: the deploy key has a passphrase, so non-interactive auth only
# works if the key is unlocked in the SSH agent. Without this, every rsync
# below would fail with a cryptic "Permission denied (publickey,password)".
# Fix once:    ssh-add --apple-use-keychain ~/.ssh/indiebox_ionos
if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=5 \
       "${DEPLOY_USER}@${DEPLOY_HOST}" true 2>/dev/null; then
  cat >&2 <<EOF
SSH preflight to ${DEPLOY_USER}@${DEPLOY_HOST} failed (non-interactive).
The deploy key has a passphrase — load it into the agent once:
    ssh-add --apple-use-keychain $SSH_KEY
Then retry this script.
EOF
  exit 1
fi

# ── Safety guard ──────────────────────────────────────────────────────────
# This script deploys the SHARED core Caddyfile + this repo's own vhost snippet
# (conf.d/indiebox.caddy) and docker-compose.yml. It NEVER touches other
# projects' conf.d/*.caddy (e.g. brainbot.caddy). Abort if the deploy would drop
# a hostname this repo owns, or a Caddy bind mount that is currently live on the
# server — that is how brainbot.com was once taken down. Override deliberately
# with ALLOW_VHOST_REMOVAL=1 (only when you truly mean to remove it).
# Extractors read a real file path ($1) — piping via /dev/stdin is unreliable.
caddy_hosts()  { grep -oE '^[A-Za-z0-9*][A-Za-z0-9.,*_ -]*\{' "$1" | sed 's/{.*//' | tr ',' '\n' | tr -s ' ' '\n' | grep -E '\.' | sort -u; }
caddy_mounts() { awk '/^  [A-Za-z0-9_-]+:[[:space:]]*$/{s=$1} s=="caddy:" && /^[[:space:]]*-[[:space:]]*\//{print}' "$1" | sed -E 's/^[[:space:]]*-[[:space:]]*//; s/:.*//' | sort -u; }

GUARD_TMP_COMPOSE="$(mktemp)"; GUARD_TMP_CADDY="$(mktemp)"
trap 'rm -f "$GUARD_TMP_COMPOSE" "$GUARD_TMP_CADDY"' EXIT
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" "cat ${APP_PATH}docker-compose.yml" > "$GUARD_TMP_COMPOSE" 2>/dev/null || true
MISSING_MOUNTS="$(comm -23 <(caddy_mounts "$GUARD_TMP_COMPOSE") <(caddy_mounts "$ROOT_DIR/docker-compose.yml") || true)"

MISSING_HOSTS=""
if [[ "$TARGET" == "all" ]]; then
  # Compare only THIS repo's snippet against the one live on the server. Other
  # projects' snippets are never read or written here, so they can't be dropped.
  ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" "cat ${CONFIG_PATH}conf.d/indiebox.caddy" > "$GUARD_TMP_CADDY" 2>/dev/null || true
  MISSING_HOSTS="$(comm -23 <(caddy_hosts "$GUARD_TMP_CADDY") <(caddy_hosts "$ROOT_DIR/deploy/caddy/conf.d/indiebox.caddy") || true)"
fi

if [[ -n "${MISSING_HOSTS}${MISSING_MOUNTS}" && "${ALLOW_VHOST_REMOVAL:-0}" != "1" ]]; then
  {
    echo "ABORT: this deploy would drop config that is currently LIVE on the server:"
    [[ -n "$MISSING_HOSTS" ]]  && { echo "  Caddy vhosts:";      echo "$MISSING_HOSTS"  | sed 's/^/    - /'; }
    [[ -n "$MISSING_MOUNTS" ]] && { echo "  Caddy bind mounts:"; echo "$MISSING_MOUNTS" | sed 's/^/    - /'; }
    echo "These likely belong to another project sharing this host/Caddy."
    echo "Add them to deploy/caddy/Caddyfile and docker-compose.yml, or, only if"
    echo "you really mean to remove them, re-run with ALLOW_VHOST_REMOVAL=1."
  } >&2
  exit 1
fi

rsync -av --delete --delete-excluded -e "ssh -i $SSH_KEY" \
  --exclude ".DS_Store" \
  --exclude "node_modules/" \
  "$ROOT_DIR/backend/" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${APP_PATH}backend/"

rsync -av -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/docker-compose.yml" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${APP_PATH}docker-compose.yml"

rsync -av -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/deploy/env/.env.staging" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:/srv/staging.indiebox/config/runtime.staging.env"

if [[ "$TARGET" == "staging" ]]; then
  echo "→ Backing up staging database before deploy..."
  bash "$(dirname "${BASH_SOURCE[0]}")/backup-remote-sqlite.sh" staging

  echo "→ Deploying backend-staging only (live + Caddy untouched)..."
  ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
    "install -d -m 755 /srv/staging.indiebox/site /srv/staging.indiebox/config /srv/staging.indiebox/data /srv/staging.indiebox/backups && sudo -n docker compose -f ${APP_PATH}docker-compose.yml up -d --build backend-staging"

  echo "✓ Staging backend deployed. Verify at https://staging.indiebox.ai/admin/orders.html"
  exit 0
fi

# Deploy the CORE Caddyfile (globals/snippets/import) and THIS repo's vhost
# snippet only. Never touch other projects' conf.d/*.caddy — a single-file rsync
# with --inplace, never a --delete on the conf.d directory. --inplace keeps the
# bind-mounted inode stable so the container keeps reading the right file.
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" "install -d -m 755 ${CONFIG_PATH}conf.d"
rsync -av --inplace -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/deploy/caddy/Caddyfile" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${CONFIG_PATH}Caddyfile"
rsync -av --inplace -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/deploy/caddy/conf.d/indiebox.caddy" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${CONFIG_PATH}conf.d/indiebox.caddy"

rsync -av -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/deploy/env/.env.live" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:/srv/indiebox/config/runtime.live.env"

echo "→ Backing up live database before deploy..."
bash "$(dirname "${BASH_SOURCE[0]}")/backup-remote-sqlite.sh" live

# Validate the ASSEMBLED config (core + every conf.d snippet) inside the running
# Caddy — it has the real env and the conf.d mount. validate only reads, it does
# not apply, so a bad config here changes nothing live.
echo "→ Validating assembled Caddy config..."
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "sudo -n docker exec indiebox-caddy caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile"

echo "→ Deploying stack..."
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "install -d -m 755 /srv/staging.indiebox/site /srv/staging.indiebox/config /srv/staging.indiebox/data /srv/staging.indiebox/backups /srv/indiebox/data/backend-live /srv/edge/config && if [ ! -f ${CONFIG_PATH}caddy.env ]; then install -m 600 /dev/null ${CONFIG_PATH}caddy.env; fi && sudo -n docker compose -f ${APP_PATH}docker-compose.yml up -d --build"

# Apply the new Caddy config with zero downtime. reload re-validates internally
# and keeps the running config if the new one fails. (If compose recreated Caddy
# above, this is a harmless no-op.)
echo "→ Reloading Caddy..."
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "sudo -n docker exec indiebox-caddy caddy reload --adapter caddyfile --config /etc/caddy/Caddyfile"
