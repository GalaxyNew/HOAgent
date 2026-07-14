#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd); db="${OPS_DB:-$root/data/ops.db}"
task_root="${TASK_CARD_ROOT:-/Users/galaxyai/agent-vault/任务账本/active}"
agent_root="${AGENT_ROOT:-/Users/galaxyai/.openclaw}"
python="$root/.venv/bin/python"; [ -x "$python" ] || python=python3
before=$(sqlite3 "$db" 'SELECT COUNT(*) FROM projection_run;')
"$python" "$root/scripts/project_sources.py" --db "$db" --task-root "$task_root" --agent-root "$agent_root"
after=$(sqlite3 "$db" 'SELECT COUNT(*) FROM projection_run;')
skipped=$(sqlite3 "$db" "SELECT COUNT(*) FROM projection_run WHERE status='skipped';")
printf 'IDEMPOTENCY runs_before=%s runs_after=%s skipped=%s\n' "$before" "$after" "$skipped"
[ "$skipped" -gt 0 ]
