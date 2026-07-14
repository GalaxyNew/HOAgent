from __future__ import annotations
import os, sqlite3, uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path
from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from .db import connect, migrate_up

DB_PATH = Path(os.getenv("OPS_DB", Path(__file__).parents[1] / "data" / "ops.db"))
PREFIX = "/api/plugins/charlie-cockpit/v1"
READ_SCOPE = "charlie-cockpit.read"

def now() -> str: return datetime.now(UTC).isoformat().replace('+00:00', 'Z')
def parse_time(value: str | None) -> datetime | None:
    if not value: return None
    return datetime.fromisoformat(value.replace('Z', '+00:00'))
def rows(db: Path, query: str, params: tuple = ()) -> list[dict]:
    conn=connect(db)
    try: return [dict(x) for x in conn.execute(query, params)]
    finally: conn.close()
def source_meta(db: Path, source_refs: list[str] | None = None) -> dict:
    conn=connect(db)
    try:
        sql="SELECT source_ref,source_hash,last_success_at,sync_state FROM source_cursor"
        params: tuple=()
        if source_refs:
            sql += " WHERE source_ref IN (" + ','.join('?' for _ in source_refs) + ")"; params=tuple(source_refs)
        selected=[dict(row) for row in conn.execute(sql, params)]
    finally: conn.close()
    if not selected: return {"source_ref":"projection://empty","source_hash":"","last_synced_at":None,"freshness":"empty"}
    states={r['sync_state'] for r in selected}
    if 'conflict' in states: freshness='conflict'
    elif 'offline' in states: freshness='offline'
    elif 'failed' in states: freshness='error'
    else:
        last=max((r['last_success_at'] for r in selected if r['last_success_at']), default=None)
        freshness='stale' if not last or parse_time(last) < datetime.now(UTC)-timedelta(minutes=5) else 'fresh'
    newest=max(selected, key=lambda r: r['last_success_at'] or '')
    return {"source_ref": newest['source_ref'], "source_hash":newest['source_hash'], "last_synced_at":newest['last_success_at'], "freshness":freshness}
def response(request: Request, db: Path, data: object, source_refs: list[str] | None = None) -> JSONResponse:
    meta=source_meta(db, source_refs); meta['request_id']=request.headers.get("x-request-id", str(uuid.uuid4()))
    return JSONResponse({"data":data,"meta":meta})
def require_read_scope(request: Request) -> None:
    expected=os.getenv('CHARLIE_COCKPIT_READ_TOKEN')
    supplied=request.headers.get('authorization','').removeprefix('Bearer ')
    scopes=set(request.headers.get('x-charlie-scopes','').split())
    if not expected or supplied != expected or READ_SCOPE not in scopes:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='read scope required')

def create_app(db_path: Path | None = None) -> FastAPI:
    db=db_path or DB_PATH; db.parent.mkdir(parents=True, exist_ok=True); migrate_up(db)
    app=FastAPI(title="Charlie Cockpit", version="0.1.0")
    router=APIRouter(prefix=PREFIX, dependencies=[__import__('fastapi').Depends(require_read_scope)])
    @router.get('/health')
    def health(request: Request): return response(request, db, {"status":"ok","service":"charlie-cockpit-projection"})
    @router.get('/tasks')
    def tasks(request: Request):
        result=rows(db,'SELECT * FROM task ORDER BY updated_at DESC'); return response(request,db,result,[r['source_ref'] for r in result])
    @router.get('/agents')
    def agents(request: Request):
        result=rows(db,'SELECT * FROM agent ORDER BY name'); return response(request,db,result,[r['source_ref'] for r in result])
    @router.get('/business/entities')
    def entities(request: Request):
        result=rows(db,'SELECT * FROM business_entity ORDER BY name'); return response(request,db,result,[r['source_ref'] for r in result])
    @router.get('/business/relationships')
    def relationships(request: Request):
        result=rows(db,'SELECT * FROM business_relationship ORDER BY effective_from DESC'); return response(request,db,result,[r['source_ref'] for r in result])
    @router.get('/audit')
    def audit(request: Request):
        result=rows(db,'SELECT * FROM audit_event ORDER BY occurred_at DESC'); return response(request,db,result,[r['source_ref'] for r in result])
    @router.get('/search')
    def search(request: Request, q: str=''): return response(request,db,[] if not q.strip() else rows(db,"SELECT rowid,title_masked,summary_masked,tags FROM search_fts WHERE search_fts MATCH ?",(q,)))
    app.include_router(router); return app
app=create_app()
