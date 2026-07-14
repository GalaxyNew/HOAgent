#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
# Match credential-like assignments and forbidden source categories; report only counts/paths, never matched content.
set +e
hits=$(grep -rIlE '(?i)(password|api[_-]?key|access[_-]?token|authorization:[[:space:]]*bearer|private[ _-]?memory|淘宝|闲鱼)' \
  --exclude-dir=.git --exclude-dir=.venv --exclude='*.db' "$root/cockpit" "$root/migrations" "$root/tests" 2>/dev/null)
set -e
if [ -n "$hits" ]; then printf 'SENSITIVE_SCAN_HIT_COUNT=%s\n' "$(printf '%s\n' "$hits" | wc -l | tr -d ' ')"; printf '%s\n' "$hits" | sed 's#^#SENSITIVE_SCAN_PATH=#'; exit 1; fi
printf 'SENSITIVE_SCAN_OK=1\n'
