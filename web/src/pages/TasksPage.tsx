import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function TasksPage() {
  const { data, meta, status, error } = useApi(() => api.tasks());
  const empty = !data || data.length === 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">任务</h1>
      <p className="mt-1 text-sm text-slate-500">全部任务投影（只读）</p>

      <div className="mt-4">
        <SourceMetaCard meta={meta} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
        <StateContainer status={status} error={error} empty={empty}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left font-medium">任务 ID</th>
                <th className="px-4 py-3 text-left font-medium">标题</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">优先级</th>
                <th className="px-4 py-3 text-left font-medium">负责人</th>
                <th className="px-4 py-3 text-left font-medium">更新时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.map((t: any) => (
                <tr key={t.task_id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.task_id}</td>
                  <td className="px-4 py-3 text-slate-200">{t.title ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.priority ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{t.owner_ref ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {t.updated_at ? new Date(t.updated_at).toLocaleString('zh-CN') : '—'}
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

function StatusPill({ status: s }: { status: string }) {
  const colors: Record<string, string> = {
    done: 'bg-emerald-500/10 text-emerald-400',
    completed: 'bg-emerald-500/10 text-emerald-400',
    in_progress: 'bg-blue-500/10 text-blue-400',
    blocked: 'bg-red-500/10 text-red-400',
    review: 'bg-amber-500/10 text-amber-400',
    pending: 'bg-slate-500/10 text-slate-400',
  };
  const cls = colors[s?.toLowerCase()] ?? 'bg-slate-500/10 text-slate-400';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {s ?? '—'}
    </span>
  );
}
