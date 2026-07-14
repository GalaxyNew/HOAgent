import type { ReactNode } from 'react';

export function StateContainer({
  status,
  error,
  empty,
  children,
}: {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: { kind: string; message: string } | null;
  empty?: boolean;
  children: ReactNode;
}) {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#9AA9A1] border-t-[#0F766E]" />
        <span className="ml-3 text-sm text-[#64716B]">加载中…</span>
      </div>
    );
  }

  if (status === 'error' && error) {
    const isForbidden = error.kind === 'forbidden';
    const isHostUnavailable = error.kind === 'host-unavailable';
    const isOffline = error.kind === 'offline';
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className={`h-12 w-12 rounded-full ${isForbidden || isHostUnavailable ? 'bg-[#FDEBE7]' : isOffline ? 'bg-[#EEF3F0]' : 'bg-[#FFF1DD]'} flex items-center justify-center`}>
          <span className="text-2xl">
            {isForbidden || isHostUnavailable ? '🔒' : isOffline ? '📡' : '⚠️'}
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-[#12201C]">
          {isHostUnavailable ? '仅支持 Hermes Dashboard 宿主访问' : isForbidden ? '403 禁止访问' : isOffline ? '服务离线' : '请求出错'}
        </p>
        <p className="mt-1 text-xs text-[#64716B]">{error.message}</p>
      </div>
    );
  }

  if (status === 'success' && empty) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-12 w-12 rounded-full bg-[#EEF3F0] flex items-center justify-center">
          <span className="text-2xl">📭</span>
        </div>
        <p className="mt-3 text-sm text-[#64716B]">暂无数据</p>
      </div>
    );
  }

  return <>{children}</>;
}
