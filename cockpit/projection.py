from __future__ import annotations
import sqlite3, uuid
from datetime import UTC, datetime
from pathlib import Path
from .adapters import SourceRecord
from .db import connect

def iso() -> str: return datetime.now(UTC).isoformat().replace('+00:00','Z')
def project(db_path: Path, records: list[SourceRecord]) -> dict[str, int]:
    conn=connect(db_path); applied=skipped=conflicts=0
    try:
      conn.execute('BEGIN IMMEDIATE')
      seen: dict[str, str] = {}
      for record in records:
        run_id=str(uuid.uuid4()); now=iso()
        prior = seen.get(record.source_id)
        if prior is not None and prior != record.source_hash:
          conn.execute("INSERT INTO source_cursor(source_id,source_type,source_ref,source_hash,last_success_at,sync_state) VALUES(?,?,?,?,?, 'conflict') ON CONFLICT(source_id) DO UPDATE SET sync_state='conflict'", (record.source_id, record.source_type, record.source_ref, prior, now))
          conn.execute("INSERT OR IGNORE INTO projection_conflict(conflict_id,source_id,observed_hash,expected_hash,status,detected_at,masked_detail) VALUES(?,?,?,?, 'open', ?, ?)", (str(uuid.uuid4()), record.source_id, record.source_hash, prior, now, 'multiple source hashes in one projection batch'))
          conn.execute("INSERT INTO projection_run VALUES(?,?,?,?,?,?,?,?)",(run_id,record.source_id,now,now,'conflict',record.source_hash,0,'duplicate_source_hash_conflict'))
          conflicts += 1
          continue
        seen[record.source_id] = record.source_hash
        current=conn.execute('SELECT source_hash FROM source_cursor WHERE source_id=?',(record.source_id,)).fetchone()
        if current and current['source_hash'] == record.source_hash:
          conn.execute("INSERT INTO projection_run VALUES(?,?,?,?,?,?,?,?)",(run_id,record.source_id,now,now,'skipped',record.source_hash,0,None)); skipped+=1; continue
        conn.execute("INSERT INTO source_cursor(source_id,source_type,source_ref,source_hash,last_success_at,sync_state) VALUES(?,?,?,?,?, 'running') ON CONFLICT(source_id) DO UPDATE SET source_type=excluded.source_type,source_ref=excluded.source_ref,sync_state='running'",(record.source_id,record.source_type,record.source_ref,record.source_hash,now))
        p=record.payload
        if record.source_type == 'task_card':
          conn.execute("INSERT INTO task(task_id,title,status,priority,owner_ref,source_ref,source_hash,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(task_id) DO UPDATE SET title=excluded.title,status=excluded.status,priority=excluded.priority,owner_ref=excluded.owner_ref,source_ref=excluded.source_ref,source_hash=excluded.source_hash,updated_at=excluded.updated_at",(p['task_id'],p['title'],p['status'],p['priority'],p['owner_ref'],record.source_ref,record.source_hash,p['updated_at']))
        elif record.source_type == 'agent_schema':
          conn.execute("INSERT INTO agent(agent_id,name,role,status,registry_ref,source_ref,source_hash,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(agent_id) DO UPDATE SET name=excluded.name,role=excluded.role,status=excluded.status,registry_ref=excluded.registry_ref,source_ref=excluded.source_ref,source_hash=excluded.source_hash,updated_at=excluded.updated_at",(p['agent_id'],p['name'],p['role'],p['status'],record.source_ref,record.source_ref,record.source_hash,p['updated_at']))
        conn.execute("UPDATE source_cursor SET source_hash=?,last_success_at=?,sync_state='idle' WHERE source_id=?",(record.source_hash,now,record.source_id))
        conn.execute("INSERT INTO projection_run VALUES(?,?,?,?,?,?,?,?)",(run_id,record.source_id,now,now,'succeeded',record.source_hash,1,None)); applied+=1
      conn.commit(); return {'applied':applied,'skipped':skipped,'conflicts':conflicts}
    except Exception:
      conn.rollback(); raise
    finally: conn.close()
def rebuild(db_path: Path, records: list[SourceRecord]) -> dict[str,int]:
    conn=connect(db_path)
    try:
      conn.execute('BEGIN IMMEDIATE'); conn.execute('DELETE FROM projection_conflict'); conn.execute('DELETE FROM projection_run'); conn.execute('DELETE FROM audit_event'); conn.execute('DELETE FROM task'); conn.execute('DELETE FROM agent'); conn.execute('DELETE FROM source_cursor'); conn.commit()
    except Exception: conn.rollback(); raise
    finally: conn.close()
    return project(db_path,records)
