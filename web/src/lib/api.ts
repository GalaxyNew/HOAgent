import type { ApiResponse } from '@/types/api';

const API_BASE = '/api/plugins/charlie-cockpit/v1';

interface HermesPluginSdk {
  // The trusted Dashboard host owns authentication and may transparently proxy requests.
  readonly request?: unknown;
}

export function getTrustedHostSdk(): HermesPluginSdk | null {
  if (typeof window === 'undefined') return null;
  const sdk = (window as Window & { __HERMES_PLUGIN_SDK__?: HermesPluginSdk })
    .__HERMES_PLUGIN_SDK__;
  return sdk ?? null;
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T>> {
  // Fail closed before any network activity when the plugin is opened outside
  // the trusted Hermes Dashboard host. No client-side token or fallback exists.
  if (!getTrustedHostSdk()) {
    throw new ApiError(403, 'host-unavailable', '仅支持 Hermes Dashboard 宿主访问');
  }

  const resp = await fetch(`${API_BASE}${path}`);

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
