import os
import subprocess
import sys
from pathlib import Path

from cockpit.db import connect, migrate_up


ROOT = Path(__file__).resolve().parents[1]
IMPORT_PLUGIN = "from dashboard.plugin_api import _db_path; print(_db_path.resolve())"


def _import_plugin(db_path: Path) -> None:
    env = os.environ | {"OPS_DB": str(db_path)}
    completed = subprocess.run(
        [sys.executable, "-c", IMPORT_PLUGIN],
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=True,
    )
    assert completed.stdout.strip() == str(db_path.resolve())


def _schema_versions(db_path: Path) -> list[str]:
    conn = connect(db_path)
    try:
        return [row[0] for row in conn.execute("SELECT version FROM schema_version ORDER BY version")]
    finally:
        conn.close()


def test_plugin_import_migrates_empty_ops_db_twice(tmp_path):
    db = tmp_path / "empty" / "ops.db"
    db.parent.mkdir()

    _import_plugin(db)
    _import_plugin(db)

    assert _schema_versions(db)[-1] == "006_sync_state_unknown"


def test_plugin_import_accepts_fully_migrated_ops_db_twice(tmp_path):
    db = tmp_path / "migrated" / "ops.db"
    db.parent.mkdir()
    assert migrate_up(db) == "006_sync_state_unknown"

    _import_plugin(db)
    _import_plugin(db)

    assert _schema_versions(db)[-1] == "006_sync_state_unknown"
