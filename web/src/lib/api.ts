import type { ApiResponse } from '@/types/api';

const API_BASE = '/api/plugins/charlie-cockpit/v1';

function getAuthHeader(): Record<string, string> {
  // Authentication is injected exclusively by the trusted Hermes Dashboard host.
  // This plugin must never contain, generate, or fall back to a client-side token.
  return {};
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T>> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: getAuthHeader(),
  });

  if (resp.status === 401 || resp.status === 403) {
    throw new ApiError(resp.status, 'forbidden', '无访问权限：请在受信任的 Dashboard 宿主中打开');
  }
  if (resp.status === 0 || !resp.ok) {
    throw new ApiError(resp.status || 0, 'offline', '无法连接服务');
  }

  return resp.json();
}

export class ApiError extends Error {
  constructor(
    public code: number,
    public kind: string,
    message: string,
  ) {
    super(message);
  }
}

export const api = {
  health: () => fetchApi<{ status: string; service: string }>('/health'),
  tasks: () => fetchApi<any[]>('/tasks'),
  agents: () => fetchApi<any[]>('/agents'),
  entities: () => fetchApi<any[]>('/business/entities'),
  relationships: () => fetchApi<any[]>('/business/relationships'),
  audit: () => fetchApi<any[]>('/audit'),
  search: (q: string) => fetchApi<any[]>(`/search?q=${encodeURIComponent(q)}`),
};
