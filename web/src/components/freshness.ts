export const freshnessConfig: Record<string, { label: string; color: string }> = {
  fresh: { label: '新鲜', color: 'text-[var(--cc-brand)]' },
  stale: { label: '过期', color: 'text-[var(--cc-warning)]' },
  empty: { label: '空', color: 'cc-muted' },
  error: { label: '错误', color: 'text-[var(--cc-danger)]' },
  offline: { label: '离线', color: 'cc-muted-soft' },
  conflict: { label: '冲突', color: 'text-[var(--cc-warning)]' },
  unknown: { label: '未知', color: 'cc-muted-soft' },
};

export function getFreshnessConfig(freshness: string) {
  return freshnessConfig[freshness] ?? freshnessConfig.unknown;
}
