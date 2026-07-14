import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLUGIN_API = ROOT / "dashboard" / "plugin_api.py"


def test_hermes_spec_loader_imports_plugin_outside_plugin_root(tmp_path):
    """Hermes loads plugin_api.py by file spec without adding its root to sys.path."""
    external_cwd = tmp_path / "hermes-dashboard-cwd"
    external_cwd.mkdir()
    ops_db = tmp_path / "missing-db-parent" / "ops.db"
    script = """
import importlib.util
import os
import sqlite3
import sys
from pathlib import Path

plugin_api = Path(os.environ["PLUGIN_API"]).resolve()
plugin_root = plugin_api.parents[1]
os.chdir(os.environ["EXTERNAL_CWD"])
sys.path[:] = [
    entry for entry in sys.path
    if Path(entry or os.getcwd()).resolve() != plugin_root
]
assert str(plugin_root) not in sys.path
spec = importlib.util.spec_from_file_location(
    "hermes_dashboard_plugin_charlie_cockpit", plugin_api
)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)
print(f"router_routes={len(module.router.routes)}")
conn = sqlite3.connect(os.environ["OPS_DB"])
try:
    print("schema_version=" + conn.execute(
        "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1"
    ).fetchone()[0])
finally:
    conn.close()
"""
    env = os.environ | {
        "PYTHONPATH": "",
        "PLUGIN_API": str(PLUGIN_API),
        "EXTERNAL_CWD": str(external_cwd),
        "OPS_DB": str(ops_db),
    }
    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=external_cwd,
        env=env,
        text=True,
        capture_output=True,
        check=True,
    )

    assert result.stdout.splitlines() == [
        "router_routes=7",
        "schema_version=006_sync_state_unknown",
    ]
