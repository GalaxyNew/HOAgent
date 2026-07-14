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
