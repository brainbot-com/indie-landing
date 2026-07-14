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

# --inplace preserves the inode on the host so the Caddy container's
# bind mount (/srv/edge/config/Caddyfile → /etc/caddy/Caddyfile) keeps
# pointing at the right file. Without it, rsync replaces the file
# (new inode) and the container keeps reading the old one until it is
# restarted, which silently breaks proxy header injection.
rsync -av --inplace -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/deploy/caddy/Caddyfile" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${CONFIG_PATH}Caddyfile"

rsync -av -e "ssh -i $SSH_KEY" \
  "$ROOT_DIR/deploy/env/.env.live" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:/srv/indiebox/config/runtime.live.env"

echo "→ Backing up live database before deploy..."
bash "$(dirname "${BASH_SOURCE[0]}")/backup-remote-sqlite.sh" live

echo "→ Deploying stack..."
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "install -d -m 755 /srv/staging.indiebox/site /srv/staging.indiebox/config /srv/staging.indiebox/data /srv/staging.indiebox/backups /srv/indiebox/data/backend-live /srv/edge/config && if [ ! -f ${CONFIG_PATH}caddy.env ]; then install -m 600 /dev/null ${CONFIG_PATH}caddy.env; fi && sudo -n docker compose -f ${APP_PATH}docker-compose.yml up -d --build"

# docker compose only restarts containers whose image/config changed —
# Caddy keeps running on bind-mount edits. Restart (not just reload) so
# Caddyfile *and* caddy.env changes both take effect. ~1s downtime.
echo "→ Restarting Caddy..."
ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "sudo -n docker restart indiebox-caddy"
