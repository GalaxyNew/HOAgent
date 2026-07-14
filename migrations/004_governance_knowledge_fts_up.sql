ALTER TABLE business_entity ADD COLUMN responsibility_chain TEXT NOT NULL DEFAULT 'unassigned';
ALTER TABLE business_relationship ADD COLUMN source_type TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE business_relationship ADD COLUMN responsibility_chain TEXT NOT NULL DEFAULT 'unassigned';
CREATE TABLE knowledge_document (
  document_id TEXT PRIMARY KEY, source_type TEXT NOT NULL, source_ref TEXT NOT NULL UNIQUE,
  source_hash TEXT NOT NULL, title_masked TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','revoked','deleted')),
  last_synced_at TEXT NOT NULL, deleted_at TEXT, responsibility_chain TEXT NOT NULL
);
CREATE TABLE knowledge_chunk (
  chunk_id INTEGER PRIMARY KEY, document_id TEXT NOT NULL REFERENCES knowledge_document(document_id),
  source_ref TEXT NOT NULL UNIQUE, source_hash TEXT NOT NULL, title_masked TEXT NOT NULL,
  summary_masked TEXT NOT NULL, tags TEXT NOT NULL, deleted_at TEXT
);
CREATE VIRTUAL TABLE knowledge_chunk_fts USING fts5(title_masked, summary_masked, tags, content='knowledge_chunk', content_rowid='chunk_id');
CREATE TRIGGER trg_knowledge_chunk_ai AFTER INSERT ON knowledge_chunk WHEN NEW.deleted_at IS NULL BEGIN
  INSERT INTO knowledge_chunk_fts(rowid,title_masked,summary_masked,tags) VALUES(NEW.chunk_id,NEW.title_masked,NEW.summary_masked,NEW.tags);
END;
CREATE TRIGGER trg_knowledge_chunk_au AFTER UPDATE OF title_masked,summary_masked,tags,deleted_at ON knowledge_chunk BEGIN
  INSERT INTO knowledge_chunk_fts(knowledge_chunk_fts,rowid,title_masked,summary_masked,tags) VALUES('delete',OLD.chunk_id,OLD.title_masked,OLD.summary_masked,OLD.tags);
  INSERT INTO knowledge_chunk_fts(rowid,title_masked,summary_masked,tags) SELECT NEW.chunk_id,NEW.title_masked,NEW.summary_masked,NEW.tags WHERE NEW.deleted_at IS NULL;
END;
CREATE TRIGGER trg_knowledge_chunk_ad AFTER DELETE ON knowledge_chunk BEGIN
  INSERT INTO knowledge_chunk_fts(knowledge_chunk_fts,rowid,title_masked,summary_masked,tags) VALUES('delete',OLD.chunk_id,OLD.title_masked,OLD.summary_masked,OLD.tags);
END;
