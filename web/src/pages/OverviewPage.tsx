import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';

export function OverviewPage() {
  const health = useApi(() => api.health());
  const tasks = useApi(() => api.tasks());
  const agents = useApi(() => api.agents());
  const audit = useApi(() => api.audit());

  const taskCount = tasks.data?.length ?? 0;
  const agentCount = agents.data?.length ?? 0;
  const auditCount = audit.data?.length ?? 0;
  const serviceUp = health.data?.status === 'ok';

  const cards = [
    { label: '服务状态', value: serviceUp ? '运行中' : '未知', icon: '⚡' },
    { label: '任务', value: String(taskCount), icon: '📋' },
    { label: 'Agent', value: String(agentCount), icon: '🤖' },
    { label: '审计事件', value: String(auditCount), icon: '📜' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#12201C]">总览</h1>
      <p className="mt-1 text-sm text-[#64716B]">HOAgent 运营控制台 · 只读视图</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group rounded-xl border border-[#D6E1DB] bg-white/95 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              {c.label === '服务状态' && (
                <span className={`h-2 w-2 rounded-full ${serviceUp ? 'bg-[#0F766E]' : 'bg-[#9AA9A1]'} animate-pulse`} />
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#12201C]">{c.value}</p>
            <p className="text-xs text-[#64716B] group-hover:text-[#64716B]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[#D6E1DB] bg-white/95 p-4">
        <h2 className="text-sm font-medium text-[#263B34]">服务健康</h2>
        <div className="mt-3">
          <StateContainer status={health.status} error={health.error}>
            <div className="flex items-center gap-3 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${serviceUp ? 'bg-[#0F766E]' : 'bg-red-400'}`} />
              <span className="text-[#12201C]">{health.data?.service ?? '—'}</span>
              <span className="text-[#64716B]">·</span>
              <span className="text-[#64716B]">{serviceUp ? 'OK' : '异常'}</span>
            </div>
            {health.meta && <div className="mt-3"><SourceMetaCard meta={health.meta} /></div>}
          </StateContainer>
        </div>
      </div>

      {tasks.meta && (
        <div className="mt-4">
          <SourceMetaCard meta={tasks.meta} />
        </div>
      )}
    </div>
  );
}
