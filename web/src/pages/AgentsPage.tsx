import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function AgentsPage() {
  const { data, meta, status, error, refetch } = useApi(() => api.agents());
  const empty = !data || data.length === 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#12201C]">Agent</h1>
      <p className="mt-1 text-sm text-[#64716B]">已注册 Agent 清单（只读）</p>

      <div className="mt-4">
        <SourceMetaCard meta={meta} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#D6E1DB]">
        <StateContainer status={status} error={error} empty={empty} onRecover={refetch}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D6E1DB] bg-[#F7FAF8] text-xs uppercase tracking-wide text-[#64716B]">
                <th className="px-4 py-3 text-left font-medium">Agent ID</th>
                <th className="px-4 py-3 text-left font-medium">名称</th>
                <th className="px-4 py-3 text-left font-medium">角色</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5ECE8]">
              {data?.map((a: any) => (
                <tr key={a.agent_id} className="hover:bg-[#F0F6F3]">
                  <td className="px-4 py-3 font-mono text-xs text-[#64716B]">{a.agent_id}</td>
                  <td className="px-4 py-3 text-[#12201C]">{a.name ?? '—'}</td>
                  <td className="px-4 py-3 text-[#64716B]">{a.role ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      a.status === 'active' ? 'bg-emerald-500/10 text-[#0F766E]' : 'bg-[#EEF3F0] text-[#64716B]'
                    }`}>
                      {a.status ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StateContainer>
      </div>
    </div>
  );
}
