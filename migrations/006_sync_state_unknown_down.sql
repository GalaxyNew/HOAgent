-- Reverse: remove 'unknown' from sync_state, revert source_cursor rebuild
-- Must also rebuild FK tables back to original schema IDs.

DROP TABLE IF EXISTS projection_conflict;
DROP TABLE IF EXISTS projection_run;

ALTER TABLE source_cursor RENAME TO source_cursor_new;
CREATE TABLE source_cursor (
  source_id TEXT PRIMARY KEY, source_type TEXT NOT NULL, source_ref TEXT NOT NULL,
  source_hash TEXT NOT NULL, last_success_at TEXT, sync_state TEXT NOT NULL DEFAULT 'idle'
    CHECK(sync_state IN ('idle','running','failed','conflict','offline','stale')),
  UNIQUE(source_type, source_ref)
);
INSERT INTO source_cursor
  SELECT source_id, source_type, source_ref, source_hash, last_success_at,
         CASE WHEN sync_state='unknown' THEN 'stale' ELSE sync_state END
  FROM source_cursor_new;
DROP TABLE source_cursor_new;

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
