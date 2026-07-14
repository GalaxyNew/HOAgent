import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function AgentsPage() {
  const { data, meta, status, error } = useApi(() => api.agents());
  const empty = !data || data.length === 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">Agent</h1>
      <p className="mt-1 text-sm text-slate-500">已注册 Agent 清单（只读）</p>

      <div className="mt-4">
        <SourceMetaCard meta={meta} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
        <StateContainer status={status} error={error} empty={empty}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left font-medium">Agent ID</th>
                <th className="px-4 py-3 text-left font-medium">名称</th>
                <th className="px-4 py-3 text-left font-medium">角色</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.map((a: any) => (
                <tr key={a.agent_id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.agent_id}</td>
                  <td className="px-4 py-3 text-slate-200">{a.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{a.role ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      a.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
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
