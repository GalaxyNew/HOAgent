import type { ApiResponse } from '@/types/api';

const API_BASE = '/api/plugins/charlie-cockpit/v1';

interface HermesPluginSdk {
  // Trusted Dashboard API: host owns session authentication and proxy headers.
  fetchJSON<T>(path: string): Promise<T>;
}

export function getTrustedHostSdk(): HermesPluginSdk | null {
  if (typeof window === 'undefined') return null;
  const sdk = (window as Window & { __HERMES_PLUGIN_SDK__?: HermesPluginSdk })
    .__HERMES_PLUGIN_SDK__;
  return sdk && typeof sdk.fetchJSON === 'function' ? sdk : null;
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T>> {
  // Fail closed before any network activity when the plugin is opened outside
  // the trusted Hermes Dashboard host. No client-side token or fallback exists.
  if (!getTrustedHostSdk()) {
    throw new ApiError(403, 'host-unavailable', '仅支持 Hermes Dashboard 宿主访问');
  }

  try {
    return await getTrustedHostSdk()!.fetchJSON<ApiResponse<T>>(`${API_BASE}${path}`);
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error
      ? Number((error as { status: unknown }).status)
      : 0;
    if (status === 401 || status === 403) {
      throw new ApiError(status, 'forbidden', '无访问权限：请在受信任的 Dashboard 宿主中打开');
    }
    throw new ApiError(status, 'offline', '无法连接服务');
  }
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
