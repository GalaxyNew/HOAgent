from __future__ import annotations
import hashlib
import sqlite3
from pathlib import Path

MIGRATIONS = Path(__file__).parents[1] / "migrations"

def connect(db_path: str | Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path), timeout=5, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn

def migrations() -> list[tuple[str, Path, Path]]:
    out = []
    for up in sorted(MIGRATIONS.glob("*_up.sql")):
        version = up.name.removesuffix("_up.sql")
        down = up.with_name(f"{version}_down.sql")
        if not down.exists():
            raise RuntimeError(f"missing down migration for {version}")
        out.append((version, up, down))
    return out

def migrate_up(db_path: str | Path) -> str:
    conn = connect(db_path)
    try:
        conn.execute("CREATE TABLE IF NOT EXISTS schema_version (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
        applied = {r[0] for r in conn.execute("SELECT version FROM schema_version")}
        for version, up, _ in migrations():
            if version not in applied:
                try:
                    # executescript controls the entire migration transaction so DDL and version row commit together.
                    sql = up.read_text() + "\nINSERT INTO schema_version(version) VALUES ('" + version.replace("'", "''") + "');"
                    conn.executescript("BEGIN IMMEDIATE;\n" + sql + "\nCOMMIT;")
                except Exception:
                    conn.rollback(); raise
        return conn.execute("SELECT version FROM schema_version ORDER BY applied_at DESC, version DESC LIMIT 1").fetchone()[0]
    finally: conn.close()

def migrate_down(db_path: str | Path) -> str | None:
    conn = connect(db_path)
    try:
        row = conn.execute("SELECT version FROM schema_version ORDER BY applied_at DESC, version DESC LIMIT 1").fetchone()
        if not row: return None
        version = row[0]
        down = MIGRATIONS / f"{version}_down.sql"
        try:
            sql = down.read_text() + "\nDELETE FROM schema_version WHERE version='" + version.replace("'", "''") + "';"
            conn.executescript("BEGIN IMMEDIATE;\n" + sql + "\nCOMMIT;")
        except Exception:
            conn.rollback(); raise
        return version
    finally: conn.close()

def source_hash(payload: str) -> str:
    return hashlib.sha256(payload.encode()).hexdigest()
