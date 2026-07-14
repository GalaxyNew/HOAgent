#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd); db="${OPS_DB:-$root/data/ops.db}"
task_root="${TASK_CARD_ROOT:-/Users/galaxyai/agent-vault/任务账本/active}"
agent_root="${AGENT_ROOT:-/Users/galaxyai/.openclaw}"
python="$root/.venv/bin/python"; [ -x "$python" ] || python=python3
snapshot=$(mktemp -d "${TMPDIR:-/tmp}/hoagent-projection-snapshot.XXXXXX")
trap 'rm -rf "$snapshot"' EXIT
mkdir -p "$snapshot/tasks" "$snapshot/agents"
find "$task_root" -maxdepth 1 -type f -name 'T*.md' -exec cp {} "$snapshot/tasks/" \;
find "$agent_root" -maxdepth 2 -type f -path '*/AGENT_SCHEMA.yaml' -exec sh -c 'd="$1"; target="$2/agents/$(basename "$(dirname "$d")")"; mkdir -p "$target"; cp "$d" "$target/AGENT_SCHEMA.yaml"' _ {} "$snapshot" \;
"$python" "$root/scripts/project_sources.py" --db "$db" --task-root "$snapshot/tasks" --agent-root "$snapshot/agents" >/dev/null
before=$(sqlite3 "$db" 'SELECT COUNT(*) FROM projection_run;')
result=$("$python" "$root/scripts/project_sources.py" --db "$db" --task-root "$snapshot/tasks" --agent-root "$snapshot/agents")
after=$(sqlite3 "$db" 'SELECT COUNT(*) FROM projection_run;')
read applied skipped conflicts <<EOF_COUNTS
$(printf '%s' "$result" | sed -nE "s/.*'applied': ([0-9]+), 'skipped': ([0-9]+), 'conflicts': ([0-9]+).*/\1 \2 \3/p")
EOF_COUNTS
printf 'FROZEN_SNAPSHOT_ID=%s\nIDEMPOTENCY applied=%s skipped=%s conflicts=%s runs_before=%s runs_after=%s\n' "$(find "$snapshot" -type f -exec shasum -a 256 {} \; | shasum -a 256 | awk '{print $1}')" "$applied" "$skipped" "$conflicts" "$before" "$after"
[ "$applied" = 0 ] && [ "$skipped" -gt 0 ] && [ "$conflicts" = 0 ]
