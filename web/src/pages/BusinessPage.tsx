import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function BusinessPage() {
  const entities = useApi(() => api.entities());
  const rels = useApi(() => api.relationships());

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">业务</h1>
      <p className="mt-1 text-sm text-slate-500">业务实体与关系（只读）</p>

      {/* Entities */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">实体</h2>
          {entities.meta && <SourceMetaCard meta={entities.meta} />}
        </div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-800">
          <StateContainer status={entities.status} error={entities.error} empty={!entities.data || entities.data.length === 0}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-left font-medium">实体 ID</th>
                  <th className="px-4 py-3 text-left font-medium">名称</th>
                  <th className="px-4 py-3 text-left font-medium">类型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {entities.data?.map((e: any) => (
                  <tr key={e.entity_id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.entity_id}</td>
                    <td className="px-4 py-3 text-slate-200">{e.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{e.type ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StateContainer>
        </div>
      </div>

      {/* Relationships */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">关系</h2>
          {rels.meta && <SourceMetaCard meta={rels.meta} />}
        </div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-800">
          <StateContainer status={rels.status} error={rels.error} empty={!rels.data || rels.data.length === 0}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-left font-medium">关系 ID</th>
                  <th className="px-4 py-3 text-left font-medium">来源</th>
                  <th className="px-4 py-3 text-left font-medium">目标</th>
                  <th className="px-4 py-3 text-left font-medium">类型</th>
                  <th className="px-4 py-3 text-left font-medium">生效时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rels.data?.map((r: any) => (
                  <tr key={r.relationship_id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.relationship_id}</td>
                    <td className="px-4 py-3 text-slate-200">{r.from_entity ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-200">{r.to_entity ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.kind ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.effective_from ? new Date(r.effective_from).toLocaleDateString('zh-CN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StateContainer>
        </div>
      </div>
    </div>
  );
}
