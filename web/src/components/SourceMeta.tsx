import type { SourceMeta } from '@/types/api';

const freshnessConfig: Record<string, { label: string; color: string }> = {
  fresh: { label: '新鲜', color: 'text-emerald-400' },
  stale: { label: '过期', color: 'text-amber-400' },
  empty: { label: '空', color: 'text-slate-500' },
  error: { label: '错误', color: 'text-red-400' },
  offline: { label: '离线', color: 'text-slate-600' },
  conflict: { label: '冲突', color: 'text-orange-400' },
};

export function FreshnessBadge({ freshness }: { freshness: string }) {
  const cfg = freshnessConfig[freshness] ?? freshnessConfig.empty;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export function SourceMetaCard({ meta }: { meta: SourceMeta | null }) {
  if (!meta) return null;
  const time = meta.last_synced_at
    ? new Date(meta.last_synced_at).toLocaleString('zh-CN')
    : '—';
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
      <FreshnessBadge freshness={meta.freshness} />
      <span>来源: <code className="text-slate-300">{meta.source_ref}</code></span>
      {meta.source_hash && (
        <span>哈希: <code className="text-slate-300">{meta.source_hash.slice(0, 8)}</code></span>
      )}
      <span>同步: {time}</span>
    </div>
  );
}
