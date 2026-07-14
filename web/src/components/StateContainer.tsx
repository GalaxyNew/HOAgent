import type { ReactNode } from 'react';

export function StateContainer({
  status,
  error,
  empty,
  onRecover,
  children,
}: {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: { kind: string; message: string } | null;
  empty?: boolean;
  onRecover?: () => void;
  children: ReactNode;
}) {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--cc-border-strong)] border-t-[var(--cc-brand)]" />
        <span className="cc-muted ml-3 text-sm">加载中…</span>
      </div>
    );
  }

  if (status === 'error' && error) {
    const isForbidden = error.kind === 'forbidden';
    const isHostUnavailable = error.kind === 'host-unavailable';
    const isOffline = error.kind === 'offline';
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isForbidden || isHostUnavailable ? 'bg-[var(--cc-danger-soft)]' : isOffline ? 'bg-[#EEF3F0]' : 'bg-[var(--cc-warning-soft)]'}`}>
          <span className="text-2xl">
            {isForbidden || isHostUnavailable ? '🔒' : isOffline ? '📡' : '⚠️'}
          </span>
        </div>
        <p className="cc-page-title mt-3 text-sm font-medium">
          {isHostUnavailable ? '仅支持 Hermes Dashboard 宿主访问' : isForbidden ? '403 禁止访问' : isOffline ? '服务离线' : '请求出错'}
        </p>
        <p className="cc-muted mt-1 text-xs">{error.message}</p>
        {onRecover && (
          <button type="button" onClick={onRecover} className="cc-recovery-button mt-5 px-4 text-sm font-medium">
            重试
          </button>
        )}
      </div>
    );
  }

  if (status === 'success' && empty) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3F0]">
          <span className="text-2xl">📭</span>
        </div>
        <p className="cc-muted mt-3 text-sm">暂无数据</p>
        {onRecover && (
          <button type="button" onClick={onRecover} className="cc-recovery-button mt-5 px-4 text-sm font-medium">
            刷新数据
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
