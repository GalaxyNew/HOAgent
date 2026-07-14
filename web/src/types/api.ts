// ---- Shared API types ----
// Aligned with T-34 backend HEAD=133e12a real response schema.

export interface SourceMeta {
  source_ref: string;
  source_hash: string;
  last_synced_at: string | null;
  freshness: 'fresh' | 'stale' | 'empty' | 'error' | 'offline' | 'conflict';
  request_id?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: SourceMeta;
}

// ---- Domain types (backend-accurate field names) ----

export interface Task {
  task_id: string;
  title: string;
  status: string;
  priority: string;
  owner_ref: string;
  parent_task_id: string | null;
  source_ref: string;
  source_hash: string;
  updated_at: string;
}

export interface Agent {
  agent_id: string;
  name: string;
  role: string;
  status: string;
  registry_ref: string;
  source_ref: string;
  source_hash: string;
  updated_at: string;
}

export interface BusinessEntity {
  entity_id: string;
  entity_kind: string;
  name: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
  source_type: string;
  source_ref: string;
  source_hash: string;
  updated_at: string;
  responsibility_chain: string;
}

export interface BusinessRelationship {
  relationship_id: string;
  left_entity_id: string;
  right_entity_id: string;
  relation_type: string;
  responsibility: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
  source_ref: string;
  source_hash: string;
  source_type: string;
  responsibility_chain: string;
}

export interface AuditEvent {
  audit_id: string;
  occurred_at: string;
  action: string;
  result: string;
  request_id: string;
  source_ref: string;
  source_hash: string;
  masked_detail: string;
}

export interface SearchResult {
  chunk_id: number;
  document_id: string;
  title_masked: string;
  summary_masked: string;
  tags: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}
