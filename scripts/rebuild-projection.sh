#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd); db="${OPS_DB:-$root/data/ops.db}"
task_root="${TASK_CARD_ROOT:-/Users/galaxyai/agent-vault/任务账本/active}"
agent_root="${AGENT_ROOT:-/Users/galaxyai/.openclaw}"
python="$root/.venv/bin/python"
[ -x "$python" ] || python=python3
before=$(sqlite3 "$db" "SELECT 'task='||COUNT(*) FROM task UNION ALL SELECT 'agent='||COUNT(*) FROM agent;" 2>/dev/null || true)
"$python" "$root/scripts/project_sources.py" --db "$db" --task-root "$task_root" --agent-root "$agent_root" --rebuild
integrity=$(sqlite3 "$db" 'PRAGMA integrity_check; PRAGMA foreign_key_check;')
printf 'REBUILD_BEFORE\n%s\nREBUILD_INTEGRITY\n%s\n' "$before" "$integrity"
[ "$integrity" = "ok" ]
