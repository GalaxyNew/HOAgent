"""Charlie Cockpit dashboard plugin backend.

Mounted at /api/plugins/charlie-cockpit/v1/ by the Hermes dashboard.
Authentication is handled entirely by the dashboard's middleware stack
(session-token or OAuth gated mode). This plugin does NOT implement any
auth of its own — no tokens, no scope checks, no Authorization parsing.

When the dashboard mounts this router, every request reaching it has
already cleared the dashboard's auth gate. In standalone/test mode,
``create_standalone_app()`` provides a minimal FastAPI app without auth
for pytest and local curl testing only.
"""
from __future__ import annotations

import os
import sqlite3
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

from cockpit.db import migrate_up

# ── Database helpers (shared with standalone app) ──────────────────────────

def _default_db_path() -> Path:
    """Resolve the projection DB, allowing an explicit OPS_DB override."""
    configured_path = os.environ.get("OPS_DB")
    if configured_path:
        return Path(configured_path)
    return Path(__file__).resolve().parents[1] / "data" / "ops.db"


def _connect(db_path: Path):
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def _ensure_migrated(db_path: Path) -> None:
    """Apply migrations through the authoritative Cockpit migration runner."""
    migrate_up(db_path)


def _now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def _parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _rows(db_path: Path, query: str, params: tuple = ()) -> list[dict]:
    conn = _connect(db_path)
    try:
        return [dict(x) for x in conn.execute(query, params)]
    finally:
        conn.close()


def _source_meta(db_path: Path, source_refs: list[str] | None = None) -> dict:
    conn = _connect(db_path)
    try:
        sql = "SELECT source_ref,source_hash,last_success_at,sync_state FROM source_cursor"
        params: tuple = ()
        if source_refs:
            sql += " WHERE source_ref IN (" + ",".join("?" for _ in source_refs) + ")"
            params = tuple(source_refs)
        selected = [dict(row) for row in conn.execute(sql, params)]
    finally:
        conn.close()

    if not selected:
        return {"source_ref": "projection://empty", "source_hash": "", "last_synced_at": None, "freshness": "empty"}
    states = {r["sync_state"] for r in selected}
    if "unknown" in states:
        freshness = "unknown"
    elif "conflict" in states:
        freshness = "conflict"
    elif "offline" in states:
        freshness = "offline"
    elif "failed" in states:
        freshness = "error"
    else:
        last = max((r["last_success_at"] for r in selected if r["last_success_at"]), default=None)
        freshness = "stale" if not last or _parse_time(last) < datetime.now(UTC) - timedelta(minutes=5) else "fresh"
    newest = max(selected, key=lambda r: r["last_success_at"] or "")
    return {
        "source_ref": newest["source_ref"],
        "source_hash": newest["source_hash"],
        "last_synced_at": newest["last_success_at"],
        "freshness": freshness,
    }


def _response(request: Request, db_path: Path, data: Any, source_refs: list[str] | None = None) -> JSONResponse:
    meta = _source_meta(db_path, source_refs)
    meta["request_id"] = request.headers.get("x-request-id", str(uuid.uuid4()))
    return JSONResponse({"data": data, "meta": meta})


# ── Plugin router (no auth — host middleware owns it) ──────────────────────

PREFIX = "/v1"


def build_plugin_router(db_path: Path | None = None) -> APIRouter:
    """Build the read-only API router for the Hermes Dashboard host.

    The host's auth middleware (session-token or OAuth gated mode) protects
    every ``/api/plugins/...`` route. This router adds NO auth dependency
    of its own.
    """
    db = db_path or _default_db_path()
    _ensure_migrated(db)
    router = APIRouter(prefix=PREFIX)

    @router.get("/health")
    def health(request: Request):
        return _response(request, db, {"status": "ok", "service": "charlie-cockpit-projection"})

    @router.get("/tasks")
    def tasks(request: Request):
        result = _rows(db, "SELECT * FROM task ORDER BY updated_at DESC")
        return _response(request, db, result, [r["source_ref"] for r in result])

    @router.get("/agents")
    def agents(request: Request):
        result = _rows(db, "SELECT * FROM agent ORDER BY name")
        return _response(request, db, result, [r["source_ref"] for r in result])

    @router.get("/business/entities")
    def entities(request: Request):
        result = _rows(db, "SELECT * FROM business_entity ORDER BY name")
        return _response(request, db, result, [r["source_ref"] for r in result])

    @router.get("/business/relationships")
    def relationships(request: Request):
        result = _rows(db, "SELECT * FROM business_relationship ORDER BY effective_from DESC")
        return _response(request, db, result, [r["source_ref"] for r in result])

    @router.get("/audit")
    def audit(request: Request):
        result = _rows(db, "SELECT * FROM audit_event ORDER BY occurred_at DESC")
        return _response(request, db, result, [r["source_ref"] for r in result])

    @router.get("/search")
    def search(request: Request, q: str = ""):
        if not q.strip():
            return _response(request, db, [])
        result = _rows(
            db,
            "SELECT c.chunk_id, c.document_id, c.title_masked, c.summary_masked, c.tags "
            "FROM knowledge_chunk_fts f "
            "JOIN knowledge_chunk c ON c.chunk_id = f.rowid "
            "JOIN knowledge_document d ON d.document_id = c.document_id "
            "WHERE knowledge_chunk_fts MATCH ? "
            "AND c.deleted_at IS NULL AND d.status = 'active' AND d.deleted_at IS NULL",
            (q,),
        )
        return _response(request, db, result)

    return router


# ── Module-level router for dashboard auto-mount ───────────────────────────
# The dashboard plugin loader imports this module and expects a top-level
# ``router`` attribute (an APIRouter). We build it lazily so the DB path
# can be overridden via OPS_DB env var.

_db_path = _default_db_path()
if _db_path.parent.exists():
    _ensure_migrated(_db_path)

router = build_plugin_router(_db_path)


# ── Standalone app (test/curl only — NOT for production) ───────────────────

def create_standalone_app(db_path: Path | None = None) -> FastAPI:
    """Create a standalone FastAPI app for tests and local curl.

    ⚠️ NO AUTH — for pytest and local development only.
    Production runs through the Hermes Dashboard host which provides auth.
    """
    db = db_path or _default_db_db_path_safely()
    _ensure_migrated(db)
    app = FastAPI(title="Charlie Cockpit (standalone, no auth)", version="0.1.0")
    app.include_router(build_plugin_router(db), prefix="/api/plugins/charlie-cockpit")
    return app


def _default_db_db_path_safely() -> Path:
    p = _default_db_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    return p
