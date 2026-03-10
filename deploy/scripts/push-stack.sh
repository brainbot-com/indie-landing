#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_HOST="${INDIEBOX_DEPLOY_HOST:-87.106.111.141}"
DEPLOY_USER="${INDIEBOX_DEPLOY_USER:-deploy}"
SSH_KEY="${INDIEBOX_DEPLOY_KEY:-$HOME/.ssh/indiebox_ionos}"
APP_PATH="${INDIEBOX_APP_PATH:-/srv/indiebox/app/}"
CONFIG_PATH="${INDIEBOX_CONFIG_PATH:-/srv/indiebox/config/}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
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
  "$ROOT_DIR/deploy/caddy/Caddyfile" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${CONFIG_PATH}Caddyfile"

ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "install -d -m 755 /srv/indiebox/data/backend-staging /srv/indiebox/data/backend-live && sudo -n docker compose -f ${APP_PATH}docker-compose.yml up -d --build"
