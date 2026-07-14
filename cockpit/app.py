from __future__ import annotations
import os, sqlite3, uuid
from datetime import UTC, datetime
from pathlib import Path
from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse
from .db import connect, migrate_up

DB_PATH = Path(os.getenv("OPS_DB", Path(__file__).parents[1] / "data" / "ops.db"))
PREFIX = "/api/plugins/charlie-cockpit/v1"

def now() -> str: return datetime.now(UTC).isoformat().replace('+00:00', 'Z')
def meta(request: Request, *, source_ref: str = "projection://ops.db", source_hash: str = "", freshness: str = "empty") -> dict:
    return {"request_id": request.headers.get("x-request-id", str(uuid.uuid4())), "source_ref": source_ref, "source_hash": source_hash, "last_synced_at": now(), "freshness": freshness}
def response(request: Request, data: object, **fields: str) -> JSONResponse:
    return JSONResponse({"data": data, "meta": meta(request, **fields)})
def rows(db: Path, query: str, params: tuple = ()) -> list[dict]:
    conn=connect(db)
    try: return [dict(x) for x in conn.execute(query, params)]
    finally: conn.close()

def create_app(db_path: Path | None = None) -> FastAPI:
    db = db_path or DB_PATH
    db.parent.mkdir(parents=True, exist_ok=True)
    migrate_up(db)
    app=FastAPI(title="Charlie Cockpit", version="0.1.0")
    router=APIRouter(prefix=PREFIX)
    @router.get('/health')
    def health(request: Request):
        return response(request, {"status":"ok", "database":str(db)}, freshness="fresh")
    @router.get('/tasks')
    def tasks(request: Request): return response(request, rows(db, 'SELECT * FROM task ORDER BY updated_at DESC'))
    @router.get('/agents')
    def agents(request: Request): return response(request, rows(db, 'SELECT * FROM agent ORDER BY name'))
    @router.get('/business/entities')
    def entities(request: Request): return response(request, rows(db, 'SELECT * FROM business_entity ORDER BY name'))
    @router.get('/business/relationships')
    def relationships(request: Request): return response(request, rows(db, 'SELECT * FROM business_relationship ORDER BY effective_from DESC'))
    @router.get('/audit')
    def audit(request: Request): return response(request, rows(db, 'SELECT * FROM audit_event ORDER BY occurred_at DESC'))
    @router.get('/search')
    def search(request: Request, q: str = ''):
        if not q.strip(): return response(request, [])
        return response(request, rows(db, "SELECT rowid, title_masked, summary_masked, tags FROM search_fts WHERE search_fts MATCH ?", (q,)))
    app.include_router(router)
    return app

app=create_app()
