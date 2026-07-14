import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function TasksPage() {
  const { data, meta, status, error } = useApi(() => api.tasks());
  const empty = !data || data.length === 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#12201C]">任务</h1>
      <p className="mt-1 text-sm text-[#64716B]">全部任务投影（只读）</p>

      <div className="mt-4">
        <SourceMetaCard meta={meta} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#D6E1DB]">
        <StateContainer status={status} error={error} empty={empty}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D6E1DB] bg-[#F7FAF8] text-xs uppercase tracking-wide text-[#64716B]">
                <th className="px-4 py-3 text-left font-medium">任务 ID</th>
                <th className="px-4 py-3 text-left font-medium">标题</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">优先级</th>
                <th className="px-4 py-3 text-left font-medium">负责人</th>
                <th className="px-4 py-3 text-left font-medium">更新时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5ECE8]">
              {data?.map((t: any) => (
                <tr key={t.task_id} className="hover:bg-[#F0F6F3]">
                  <td className="px-4 py-3 font-mono text-xs text-[#64716B]">{t.task_id}</td>
                  <td className="px-4 py-3 text-[#12201C]">{t.title ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-[#64716B]">{t.priority ?? '—'}</td>
                  <td className="px-4 py-3 text-[#64716B]">{t.owner_ref ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#64716B]">
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
    done: 'bg-emerald-500/10 text-[#0F766E]',
    completed: 'bg-emerald-500/10 text-[#0F766E]',
    in_progress: 'bg-[#E0F0EE] text-[#0F766E]',
    blocked: 'bg-[#FDEBE7] text-[#B42318]',
    review: 'bg-[#FFF1DD] text-[#B45309]',
    pending: 'bg-[#EEF3F0] text-[#64716B]',
  };
  const cls = colors[s?.toLowerCase()] ?? 'bg-[#EEF3F0] text-[#64716B]';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {s ?? '—'}
    </span>
  );
}
