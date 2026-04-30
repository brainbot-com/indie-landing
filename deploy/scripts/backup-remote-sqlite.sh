#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="${INDIEBOX_DEPLOY_HOST:-87.106.111.141}"
DEPLOY_USER="${INDIEBOX_DEPLOY_USER:-deploy}"
SSH_KEY="${INDIEBOX_DEPLOY_KEY:-$HOME/.ssh/indiebox_ionos}"
TARGET_ENV="${1:-all}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

case "$TARGET_ENV" in
  staging)
    ENVIRONMENTS=("staging")
    ;;
  live)
    ENVIRONMENTS=("live")
    ;;
  all)
    ENVIRONMENTS=("staging" "live")
    ;;
  *)
    echo "Usage: bash deploy/scripts/backup-remote-sqlite.sh [staging|live|all]" >&2
    exit 1
    ;;
esac

read -r -d '' REMOTE_SCRIPT <<'PY' || true
from pathlib import Path
import gzip
import shutil
import sqlite3
from datetime import datetime, timezone
import sys

environment = sys.argv[1]
if environment == "staging":
    source = Path("/srv/staging.indiebox/data/indiebox.sqlite")
    target_dir = Path("/srv/staging.indiebox/backups")
else:
    source = Path("/srv/indiebox/data/backend-live/indiebox.sqlite")
    target_dir = Path("/srv/indiebox/backups/live")
target_dir.mkdir(parents=True, exist_ok=True)

timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
target = target_dir / f"indiebox-{timestamp}.sqlite"
compressed = target.with_suffix(target.suffix + ".gz")

src = sqlite3.connect(source)
dst = sqlite3.connect(target)
src.backup(dst)
dst.close()
src.close()

with target.open("rb") as src_file, gzip.open(compressed, "wb") as dst_file:
    shutil.copyfileobj(src_file, dst_file)

target.unlink()
print(compressed)
PY

for environment in "${ENVIRONMENTS[@]}"; do
  echo "Creating ${environment} backup on ${DEPLOY_HOST}..."
  compressed=$(ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" \
    "python3 - '$environment'" <<<"$REMOTE_SCRIPT")

  # Encrypt with age if a recipient key file exists on the server
  AGE_KEY_FILE="/srv/indiebox/config/backup-age-recipient.txt"
  ssh -i "$SSH_KEY" "${DEPLOY_USER}@${DEPLOY_HOST}" bash <<REMOTE
    set -euo pipefail
    if command -v age &>/dev/null && [ -f "$AGE_KEY_FILE" ]; then
      recipient=\$(cat "$AGE_KEY_FILE" | tr -d '[:space:]')
      age -r "\$recipient" -o "${compressed}.age" "$compressed" && rm "$compressed"
      echo "Encrypted backup: ${compressed}.age"
    else
      echo "Backup (unencrypted): $compressed"
      echo "  → To enable encryption: install age and put your public key in $AGE_KEY_FILE"
    fi
REMOTE
done
