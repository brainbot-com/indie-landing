#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_HOST="${INDIEBOX_DEPLOY_HOST:-87.106.111.141}"
DEPLOY_USER="${INDIEBOX_DEPLOY_USER:-deploy}"
DEPLOY_PATH="${INDIEBOX_DEPLOY_PATH:-/srv/indiebox/app/site/}"
STAGING_PATH="${INDIEBOX_STAGING_PATH:-/srv/staging.indiebox/}"
SSH_KEY="${INDIEBOX_DEPLOY_KEY:-$HOME/.ssh/indiebox_ionos}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

RSYNC_BASE_ARGS=(
  --archive
  --verbose
  --delete
  --delete-excluded
  --human-readable
  --compress
  -e
  "ssh -i $SSH_KEY"
  --exclude
  ".git/"
  --exclude
  ".codex/"
  --exclude
  ".specify/"
  --exclude
  ".vscode/"
  --exclude
  ".local-data/"
  --exclude
  "node_modules/"
  --exclude
  "dist/"
  --exclude
  "build/"
  --exclude
  "deploy/"
  --exclude
  "scripts/"
  --exclude
  "specs/"
  --exclude
  ".env"
  --exclude
  ".DS_Store"
  --exclude
  ".gitignore"
  --exclude
  "CNAME"
  --exclude
  "*.md"
  --exclude
  "AGENTS.md"
  --exclude
  "README.md"
  --exclude
  "STYLE_GUIDE.md"
  --exclude
  "TRANSLATION.md"
)

if [[ "${1:-}" == "--dry-run" ]]; then
  RSYNC_BASE_ARGS=(--dry-run "${RSYNC_BASE_ARGS[@]}")
fi

rsync "${RSYNC_BASE_ARGS[@]}" "$ROOT_DIR/" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

if [[ -n "$STAGING_PATH" ]]; then
  rsync "${RSYNC_BASE_ARGS[@]}" "$ROOT_DIR/" "${DEPLOY_USER}@${DEPLOY_HOST}:${STAGING_PATH}"
fi
