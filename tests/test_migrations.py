import sqlite3
from pathlib import Path

import pytest
from cockpit.db import connect, migrate_down, migrate_up

def test_up_down_and_integrity(tmp_path):
    db = tmp_path / 'ops.db'
    assert migrate_up(db) == '006_sync_state_unknown'
    conn = connect(db)
    assert conn.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    assert conn.execute('PRAGMA foreign_key_check').fetchall() == []
    assert conn.execute('PRAGMA journal_mode').fetchone()[0].lower() == 'wal'
    conn.close()
    # Full down-migration chain
    assert migrate_down(db) == '006_sync_state_unknown'
    assert migrate_down(db) == '005_document_revocation_cascade'
    assert migrate_down(db) == '004_governance_knowledge_fts'
    assert migrate_down(db) == '003_temporal_update_guard'
    assert migrate_down(db) == '002_projection_pipeline'
    assert migrate_down(db) == '001_stage1'
    conn = sqlite3.connect(db)
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='task'").fetchone() is None

def test_legacy_003_alias_is_not_reapplied_and_migrates_to_006(tmp_path):
    """A real historical typo must be treated as the corrected 003 migration."""
    db = tmp_path / "legacy-003" / "ops.db"
    assert migrate_up(db) == "006_sync_state_unknown"

    # Construct the historical state from a 002 database, then apply the
    # current 003 SQL while recording its old durable version name.
    for expected in ("006_sync_state_unknown", "005_document_revocation_cascade", "004_governance_knowledge_fts", "003_temporal_update_guard"):
        assert migrate_down(db) == expected
    conn = connect(db)
    migration = Path(__file__).resolve().parents[1] / "migrations" / "003_temporal_update_guard_up.sql"
    conn.executescript("BEGIN IMMEDIATE;\n" + migration.read_text() + "\n"
                       "INSERT INTO schema_version(version) VALUES ('003_temporaldate_guard');\nCOMMIT;")
    conn.close()

    # This must not execute 003 a second time and recreate its triggers.
    assert migrate_up(db) == "006_sync_state_unknown"
    conn = connect(db)
    versions = {row[0] for row in conn.execute("SELECT version FROM schema_version")}
    assert "003_temporaldate_guard" in versions
    assert "003_temporal_update_guard" not in versions
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND name='trg_br_bu_no_overlap'").fetchone()
    assert conn.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    assert conn.execute("PRAGMA foreign_key_check").fetchall() == []
    conn.close()

def test_connect_and_migrate_up_create_missing_parent_idempotently(tmp_path):
    db = tmp_path / "cold" / "nested" / "ops.db"
    assert not db.parent.exists()
    conn = connect(db)
    conn.close()
    assert db.parent.exists()
    assert migrate_up(db) == "006_sync_state_unknown"
    assert migrate_up(db) == "006_sync_state_unknown"

def test_update_overlap_trigger_rejects_overlap(tmp_path):
    db = tmp_path / 'ops.db'
    migrate_up(db)
    conn = connect(db)
    conn.execute("INSERT INTO business_entity(entity_id,entity_kind,name,status,effective_from,effective_to,source_type,source_ref,source_hash,updated_at) VALUES ('a','Brand','A','active','2026-01-01',NULL,'test','safe://a','a','2026-01-01')")
    conn.execute("INSERT INTO business_entity(entity_id,entity_kind,name,status,effective_from,effective_to,source_type,source_ref,source_hash,updated_at) VALUES ('b','Brand','B','active','2026-01-01',NULL,'test','safe://b','b','2026-01-01')")
    conn.execute("INSERT INTO business_relationship(relationship_id,left_entity_id,right_entity_id,relation_type,responsibility,status,effective_from,effective_to,source_ref,source_hash) VALUES ('r1','a','b','owns','owner','active','2026-01-01','2026-02-01','safe://r1','h1')")
    conn.execute("INSERT INTO business_relationship(relationship_id,left_entity_id,right_entity_id,relation_type,responsibility,status,effective_from,effective_to,source_ref,source_hash) VALUES ('r2','a','b','owns','owner','active','2026-02-01','2026-03-01','safe://r2','h2')")
    with pytest.raises(sqlite3.IntegrityError, match='overlaps'):
        conn.execute("UPDATE business_relationship SET effective_from='2026-01-15' WHERE relationship_id='r2'")

def test_knowledge_fts_chunk_soft_delete(tmp_path):
    """Chunk-level soft delete removes entry from FTS."""
    db = tmp_path / 'ops.db'
    migrate_up(db)
    conn = connect(db)
    conn.execute("INSERT INTO knowledge_document VALUES ('d1','approved_metadata','safe://d1','h1','Safe title','active','2026-01-01T00:00:00Z',NULL,'ops')")
    conn.execute("INSERT INTO knowledge_chunk(document_id,source_ref,source_hash,title_masked,summary_masked,tags) VALUES ('d1','safe://c1','h1','Safe title','Safe summary','safe')")
    assert conn.execute("SELECT COUNT(*) FROM knowledge_chunk_fts WHERE knowledge_chunk_fts MATCH 'Safe'").fetchone()[0] == 1
    conn.execute("UPDATE knowledge_chunk SET deleted_at='2026-01-02T00:00:00Z' WHERE source_ref='safe://c1'")
    assert conn.execute("SELECT COUNT(*) FROM knowledge_chunk_fts WHERE knowledge_chunk_fts MATCH 'Safe'").fetchone()[0] == 0

def test_knowledge_fts_document_revocation_cascade(tmp_path):
    """Revoking a parent document cascades to child chunks and purges FTS."""
    db = tmp_path / 'ops.db'
    migrate_up(db)
    conn = connect(db)
    conn.execute("INSERT INTO knowledge_document VALUES ('d2','approved_metadata','safe://d2','h2','Alpha report','active','2026-01-01T00:00:00Z',NULL,'ops')")
    conn.execute("INSERT INTO knowledge_chunk(document_id,source_ref,source_hash,title_masked,summary_masked,tags) VALUES ('d2','safe://c2','h2','Alpha title','Alpha summary','alpha')")
    assert conn.execute("SELECT COUNT(*) FROM knowledge_chunk_fts WHERE knowledge_chunk_fts MATCH 'Alpha'").fetchone()[0] == 1
    # Revoke parent document → trigger should cascade to child chunks → FTS purge
    conn.execute("UPDATE knowledge_document SET status='revoked', deleted_at='2026-01-03T00:00:00Z' WHERE document_id='d2'")
    assert conn.execute("SELECT COUNT(*) FROM knowledge_chunk_fts WHERE knowledge_chunk_fts MATCH 'Alpha'").fetchone()[0] == 0
    assert conn.execute("SELECT deleted_at FROM knowledge_chunk WHERE source_ref='safe://c2'").fetchone()[0] is not None

def test_governance_columns_exist(tmp_path):
    db = tmp_path / 'ops.db'
    migrate_up(db)
    conn = connect(db)
    assert 'responsibility_chain' in {r[1] for r in conn.execute('PRAGMA table_info(business_entity)')}
    assert {'source_type', 'responsibility_chain'} <= {r[1] for r in conn.execute('PRAGMA table_info(business_relationship)')}

def test_migration_005_down_reversible(tmp_path):
    db = tmp_path / 'ops.db'
    migrate_up(db)
    conn = connect(db)
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND name='trg_knowledge_document_revoked'").fetchone() is not None
    conn.close()
    # Down removes 006 first (not the trigger)
    assert migrate_down(db) == '006_sync_state_unknown'
    conn = connect(db)
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND name='trg_knowledge_document_revoked'").fetchone() is not None
    # Down again removes 005 trigger
    assert migrate_down(db) == '005_document_revocation_cascade'
    conn = connect(db)
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND name='trg_knowledge_document_revoked'").fetchone() is None
    assert conn.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    assert conn.execute('PRAGMA foreign_key_check').fetchall() == []
    conn.close()
    # Re-up restores
    migrate_up(db)
    conn = connect(db)
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND name='trg_knowledge_document_revoked'").fetchone() is not None
    conn.close()
