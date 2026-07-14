import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function BusinessPage() {
  const entities = useApi(() => api.entities());
  const rels = useApi(() => api.relationships());

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#12201C]">业务</h1>
      <p className="mt-1 text-sm text-[#64716B]">业务实体与关系（只读）</p>

      {/* Entities */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#263B34]">实体</h2>
          {entities.meta && <SourceMetaCard meta={entities.meta} />}
        </div>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#D6E1DB]">
          <StateContainer status={entities.status} error={entities.error} empty={!entities.data || entities.data.length === 0} onRecover={entities.refetch}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D6E1DB] bg-[#F7FAF8] text-xs uppercase tracking-wide text-[#64716B]">
                  <th className="px-4 py-3 text-left font-medium">实体 ID</th>
                  <th className="px-4 py-3 text-left font-medium">名称</th>
                  <th className="px-4 py-3 text-left font-medium">类型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE8]">
                {entities.data?.map((e: any) => (
                  <tr key={e.entity_id} className="hover:bg-[#F0F6F3]">
                    <td className="px-4 py-3 font-mono text-xs text-[#64716B]">{e.entity_id}</td>
                    <td className="px-4 py-3 text-[#12201C]">{e.name ?? '—'}</td>
                    <td className="px-4 py-3 text-[#64716B]">{e.entity_kind ?? '—'}</td>
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
          <h2 className="text-sm font-medium text-[#263B34]">关系</h2>
          {rels.meta && <SourceMetaCard meta={rels.meta} />}
        </div>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#D6E1DB]">
          <StateContainer status={rels.status} error={rels.error} empty={!rels.data || rels.data.length === 0} onRecover={rels.refetch}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D6E1DB] bg-[#F7FAF8] text-xs uppercase tracking-wide text-[#64716B]">
                  <th className="px-4 py-3 text-left font-medium">关系 ID</th>
                  <th className="px-4 py-3 text-left font-medium">来源</th>
                  <th className="px-4 py-3 text-left font-medium">目标</th>
                  <th className="px-4 py-3 text-left font-medium">类型</th>
                  <th className="px-4 py-3 text-left font-medium">生效时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE8]">
                {rels.data?.map((r: any) => (
                  <tr key={r.relationship_id} className="hover:bg-[#F0F6F3]">
                    <td className="px-4 py-3 font-mono text-xs text-[#64716B]">{r.relationship_id}</td>
                    <td className="px-4 py-3 text-[#12201C]">{r.left_entity_id ?? '—'}</td>
                    <td className="px-4 py-3 text-[#12201C]">{r.right_entity_id ?? '—'}</td>
                    <td className="px-4 py-3 text-[#64716B]">{r.relation_type ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#64716B]">
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
