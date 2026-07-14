DROP TRIGGER IF EXISTS trg_knowledge_chunk_ad;
DROP TRIGGER IF EXISTS trg_knowledge_chunk_au;
DROP TRIGGER IF EXISTS trg_knowledge_chunk_ai;
DROP TABLE IF EXISTS knowledge_chunk_fts;
DROP TABLE IF EXISTS knowledge_chunk;
DROP TABLE IF EXISTS knowledge_document;
DROP TRIGGER IF EXISTS trg_br_bu_no_overlap;
DROP TRIGGER IF EXISTS trg_br_bi_no_overlap;
DROP INDEX IF EXISTS idx_business_rel_left;
DROP INDEX IF EXISTS idx_business_rel_right;
CREATE TABLE business_entity_rollback (
  entity_id TEXT PRIMARY KEY, entity_kind TEXT NOT NULL CHECK(entity_kind IN ('Brand','ProductLine','ProductService','Channel')),
  name TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('planned','active','paused','retired')),
  effective_from TEXT NOT NULL, effective_to TEXT, source_type TEXT NOT NULL, source_ref TEXT NOT NULL,
  source_hash TEXT NOT NULL, updated_at TEXT NOT NULL,
  CHECK(effective_to IS NULL OR effective_to > effective_from), UNIQUE(entity_kind, source_type, source_ref, effective_from)
);
INSERT INTO business_entity_rollback SELECT entity_id,entity_kind,name,status,effective_from,effective_to,source_type,source_ref,source_hash,updated_at FROM business_entity;
CREATE TABLE business_relationship_rollback (
  relationship_id TEXT PRIMARY KEY, left_entity_id TEXT NOT NULL REFERENCES business_entity_rollback(entity_id),
  right_entity_id TEXT NOT NULL REFERENCES business_entity_rollback(entity_id), relation_type TEXT NOT NULL,
  responsibility TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('planned','active','paused','retired')),
  effective_from TEXT NOT NULL, effective_to TEXT, source_ref TEXT NOT NULL, source_hash TEXT NOT NULL,
  CHECK(left_entity_id <> right_entity_id), CHECK(effective_to IS NULL OR effective_to > effective_from),
  UNIQUE(left_entity_id,right_entity_id,relation_type,responsibility,effective_from)
);
INSERT INTO business_relationship_rollback SELECT relationship_id,left_entity_id,right_entity_id,relation_type,responsibility,status,effective_from,effective_to,source_ref,source_hash FROM business_relationship;
DROP TABLE business_relationship;
DROP TABLE business_entity;
ALTER TABLE business_entity_rollback RENAME TO business_entity;
ALTER TABLE business_relationship_rollback RENAME TO business_relationship;
CREATE INDEX idx_business_rel_left ON business_relationship(left_entity_id, effective_from DESC);
CREATE INDEX idx_business_rel_right ON business_relationship(right_entity_id, effective_from DESC);
CREATE TRIGGER trg_br_bi_no_overlap BEFORE INSERT ON business_relationship BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM business_relationship b WHERE b.left_entity_id=NEW.left_entity_id AND b.right_entity_id=NEW.right_entity_id AND b.relation_type=NEW.relation_type AND b.responsibility=NEW.responsibility AND COALESCE(b.effective_to,'9999-12-31')>NEW.effective_from AND COALESCE(NEW.effective_to,'9999-12-31')>b.effective_from) THEN RAISE(ABORT,'business relationship effective range overlaps') END;
END;
CREATE TRIGGER trg_br_bu_no_overlap BEFORE UPDATE OF left_entity_id,right_entity_id,relation_type,responsibility,effective_from,effective_to ON business_relationship BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM business_relationship b WHERE b.relationship_id<>OLD.relationship_id AND b.left_entity_id=NEW.left_entity_id AND b.right_entity_id=NEW.right_entity_id AND b.relation_type=NEW.relation_type AND b.responsibility=NEW.responsibility AND COALESCE(b.effective_to,'9999-12-31')>NEW.effective_from AND COALESCE(NEW.effective_to,'9999-12-31')>b.effective_from) THEN RAISE(ABORT,'business relationship effective range overlaps') END;
END;
