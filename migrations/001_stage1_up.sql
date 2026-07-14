CREATE TABLE source_cursor (
  source_id TEXT PRIMARY KEY, source_type TEXT NOT NULL, source_ref TEXT NOT NULL,
  source_hash TEXT NOT NULL, last_success_at TEXT, sync_state TEXT NOT NULL DEFAULT 'idle'
    CHECK(sync_state IN ('idle','running','failed','conflict','offline','stale')),
  UNIQUE(source_type, source_ref)
);
CREATE TABLE agent (
  agent_id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL,
  registry_ref TEXT NOT NULL UNIQUE, source_ref TEXT NOT NULL, source_hash TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE task (
  task_id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL,
  owner_ref TEXT NOT NULL, parent_task_id TEXT REFERENCES task(task_id), source_ref TEXT NOT NULL,
  source_hash TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE business_entity (
  entity_id TEXT PRIMARY KEY, entity_kind TEXT NOT NULL CHECK(entity_kind IN ('Brand','ProductLine','ProductService','Channel')),
  name TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('planned','active','paused','retired')),
  effective_from TEXT NOT NULL, effective_to TEXT, source_type TEXT NOT NULL, source_ref TEXT NOT NULL,
  source_hash TEXT NOT NULL, updated_at TEXT NOT NULL,
  CHECK(effective_to IS NULL OR effective_to > effective_from),
  UNIQUE(entity_kind, source_type, source_ref, effective_from)
);
CREATE TABLE business_relationship (
  relationship_id TEXT PRIMARY KEY, left_entity_id TEXT NOT NULL REFERENCES business_entity(entity_id),
  right_entity_id TEXT NOT NULL REFERENCES business_entity(entity_id), relation_type TEXT NOT NULL,
  responsibility TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('planned','active','paused','retired')),
  effective_from TEXT NOT NULL, effective_to TEXT, source_ref TEXT NOT NULL, source_hash TEXT NOT NULL,
  CHECK(left_entity_id <> right_entity_id), CHECK(effective_to IS NULL OR effective_to > effective_from),
  UNIQUE(left_entity_id,right_entity_id,relation_type,responsibility,effective_from)
);
CREATE TRIGGER trg_br_bi_no_overlap BEFORE INSERT ON business_relationship BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM business_relationship b WHERE b.left_entity_id=NEW.left_entity_id AND b.right_entity_id=NEW.right_entity_id AND b.relation_type=NEW.relation_type AND b.responsibility=NEW.responsibility AND COALESCE(b.effective_to,'9999-12-31')>NEW.effective_from AND COALESCE(NEW.effective_to,'9999-12-31')>b.effective_from) THEN RAISE(ABORT,'business relationship effective range overlaps') END;
END;
CREATE TABLE audit_event (
  audit_id TEXT PRIMARY KEY, occurred_at TEXT NOT NULL, action TEXT NOT NULL, result TEXT NOT NULL,
  request_id TEXT NOT NULL, source_ref TEXT NOT NULL, source_hash TEXT NOT NULL, masked_detail TEXT NOT NULL
);
CREATE VIRTUAL TABLE search_fts USING fts5(title_masked, summary_masked, tags, content='');
CREATE INDEX idx_task_status_priority ON task(status, priority, updated_at DESC);
CREATE INDEX idx_business_rel_left ON business_relationship(left_entity_id, effective_from DESC);
CREATE INDEX idx_business_rel_right ON business_relationship(right_entity_id, effective_from DESC);
