-- When a knowledge_document is revoked or soft-deleted, cascade to its child chunks.
-- The chunk AFTER UPDATE trigger (trg_knowledge_chunk_au) will then remove them from knowledge_chunk_fts.
CREATE TRIGGER trg_knowledge_document_revoked
AFTER UPDATE OF status, deleted_at ON knowledge_document
WHEN NEW.status IN ('revoked','deleted') OR NEW.deleted_at IS NOT NULL
BEGIN
  UPDATE knowledge_chunk
  SET deleted_at = COALESCE(NEW.deleted_at, datetime('now'))
  WHERE document_id = NEW.document_id
    AND deleted_at IS NULL;
END;
