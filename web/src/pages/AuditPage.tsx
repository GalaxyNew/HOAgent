import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function AuditPage() {
  const { data, meta, status, error } = useApi(() => api.audit());
  const empty = !data || data.length === 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">审计</h1>
      <p className="mt-1 text-sm text-slate-500">审计事件流（只读）</p>

      <div className="mt-4">
        <SourceMetaCard meta={meta} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
        <StateContainer status={status} error={error} empty={empty}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left font-medium">事件 ID</th>
                <th className="px-4 py-3 text-left font-medium">结果</th>
                <th className="px-4 py-3 text-left font-medium">动作</th>
                <th className="px-4 py-3 text-left font-medium">发生时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.map((e: any) => (
                <tr key={e.audit_id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.audit_id}</td>
                  <td className="px-4 py-3 text-slate-400">{e.result ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-200">{e.action ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {e.occurred_at ? new Date(e.occurred_at).toLocaleString('zh-CN') : '—'}
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
