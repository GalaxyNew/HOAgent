-- Migration 006: allow 'unknown' in source_cursor.sync_state
-- SQLite CHECK constraints cannot be ALTERed in-place, so we rebuild the table.
-- We also rebuild projection_run/projection_conflict because their FK references
-- point to the old internal source_cursor schema ID (SQLite stores FK targets by
-- internal table ID, not name). Rebuilding the referenced table invalidates
-- existing FK pointers, causing "no such table: source_cursor_old" errors.

-- Step 1: Drop FK tables that reference source_cursor
DROP TABLE IF EXISTS projection_conflict;
DROP TABLE IF EXISTS projection_run;

-- Step 2: Rename old source_cursor
ALTER TABLE source_cursor RENAME TO source_cursor_old;

-- Step 3: Create new source_cursor with expanded CHECK
CREATE TABLE source_cursor (
  source_id TEXT PRIMARY KEY, source_type TEXT NOT NULL, source_ref TEXT NOT NULL,
  source_hash TEXT NOT NULL, last_success_at TEXT, sync_state TEXT NOT NULL DEFAULT 'idle'
    CHECK(sync_state IN ('idle','running','failed','conflict','offline','stale','unknown')),
  UNIQUE(source_type, source_ref)
);

-- Step 4: Copy data
INSERT INTO source_cursor SELECT * FROM source_cursor_old;

-- Step 5: Drop old source_cursor
DROP TABLE source_cursor_old;

-- Step 6: Recreate FK tables (from migration 002)
CREATE TABLE projection_run (
  run_id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES source_cursor(source_id),
  started_at TEXT NOT NULL, completed_at TEXT, status TEXT NOT NULL CHECK(status IN ('running','succeeded','failed','skipped','conflict')),
  source_hash TEXT NOT NULL, records_applied INTEGER NOT NULL DEFAULT 0, error_code TEXT
);
CREATE TABLE projection_conflict (
  conflict_id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES source_cursor(source_id),
  observed_hash TEXT NOT NULL, expected_hash TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('open','resolved','ignored')),
  detected_at TEXT NOT NULL, masked_detail TEXT NOT NULL
);
CREATE UNIQUE INDEX uq_projection_conflict_open ON projection_conflict(source_id, observed_hash) WHERE status='open';
CREATE INDEX idx_projection_run_source_time ON projection_run(source_id, started_at DESC);
