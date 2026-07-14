import type { SourceMeta } from '@/types/api';

const freshnessConfig: Record<string, { label: string; color: string }> = {
  fresh: { label: '新鲜', color: 'text-[#0F766E]' },
  stale: { label: '过期', color: 'text-[#B45309]' },
  empty: { label: '空', color: 'text-[#64716B]' },
  error: { label: '错误', color: 'text-[#B42318]' },
  offline: { label: '离线', color: 'text-[#809089]' },
  conflict: { label: '冲突', color: 'text-[#B45309]' },
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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64716B]">
      <FreshnessBadge freshness={meta.freshness} />
      <span>来源: <code className="text-[#263B34]">{meta.source_ref}</code></span>
      {meta.source_hash && (
        <span>哈希: <code className="text-[#263B34]">{meta.source_hash.slice(0, 8)}</code></span>
      )}
      <span>同步: {time}</span>
    </div>
  );
}
