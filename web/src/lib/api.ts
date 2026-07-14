import type { ApiResponse } from '@/types/api';

const API_BASE = '/api/plugins/charlie-cockpit/v1';

// Token is injected by the trusted host in production.
// For local dev, read from env-aware default.
const DEV_TOKEN = 'charlie-cockpit-dev-read-token';

function getAuthHeader(): Record<string, string> {
  // In Hermes Dashboard Plugin context, the host injects auth.
  // For standalone dev, use the dev token.
  if (typeof window !== 'undefined' && (window as any).__HERMES_PLUGIN_SDK__) {
    return {}; // Host handles auth
  }
  return { Authorization: `Bearer ${DEV_TOKEN}` };
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T>> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: getAuthHeader(),
  });

  if (resp.status === 403) {
    throw new ApiError(403, 'forbidden', '无访问权限');
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
