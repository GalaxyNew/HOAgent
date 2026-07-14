// ---- Shared API types ----

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

// ---- Domain types ----

export interface Task {
  task_id: string;
  title: string;
  status: string;
  priority: string;
  owner: string;
  created_at: string;
  updated_at: string;
  source_ref: string;
}

export interface Agent {
  agent_id: string;
  name: string;
  role: string;
  status: string;
  source_ref: string;
}

export interface BusinessEntity {
  entity_id: string;
  name: string;
  type: string;
  source_ref: string;
}

export interface BusinessRelationship {
  relationship_id: string;
  from_entity: string;
  to_entity: string;
  kind: string;
  effective_from: string;
  source_ref: string;
}

export interface AuditEvent {
  event_id: string;
  agent_id: string;
  action: string;
  occurred_at: string;
  source_ref: string;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  title_masked: string;
  summary_masked: string;
  tags: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}
