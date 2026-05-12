#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_HOST="${INDIEBOX_DEPLOY_HOST:-87.106.111.141}"
DEPLOY_USER="${INDIEBOX_DEPLOY_USER:-deploy}"
DEPLOY_PATH="${INDIEBOX_DEPLOY_PATH:-/srv/indiebox/app/site/}"
STAGING_PATH="${INDIEBOX_STAGING_PATH:-/srv/staging.indiebox/site/}"
SSH_KEY="${INDIEBOX_DEPLOY_KEY:-$HOME/.ssh/indiebox_ionos}"

DRY_RUN=false
TARGET="both"

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --staging) TARGET="staging" ;;
    --production) TARGET="production" ;;
  esac
done

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

# Preflight: the deploy key has a passphrase, so non-interactive auth only
# works if the key is unlocked in the SSH agent. Without this, rsync below
# would fail with a cryptic "Permission denied (publickey,password)".
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
  ".claude/"
  --exclude
  ".specify/"
  --exclude
  ".mcp.json*"
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
  "backend/"
  --exclude
  "deploy/"
  --exclude
  "i18n/"
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
  "*.yml"
  --exclude
  "*.yaml"
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

if [[ "$DRY_RUN" == true ]]; then
  RSYNC_BASE_ARGS=(--dry-run "${RSYNC_BASE_ARGS[@]}")
fi

if [[ "$TARGET" == "production" || "$TARGET" == "both" ]]; then
  echo "→ production: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
  rsync "${RSYNC_BASE_ARGS[@]}" "$ROOT_DIR/" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
fi

if [[ "$TARGET" == "staging" || "$TARGET" == "both" ]]; then
  if [[ -n "$STAGING_PATH" ]]; then
    echo "→ staging: ${DEPLOY_USER}@${DEPLOY_HOST}:${STAGING_PATH}"
    rsync "${RSYNC_BASE_ARGS[@]}" "$ROOT_DIR/" "${DEPLOY_USER}@${DEPLOY_HOST}:${STAGING_PATH}"
  fi
fi
