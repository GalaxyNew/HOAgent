import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';
import { Link } from 'react-router-dom';

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
    { label: '服务状态', value: serviceUp ? '运行中' : '未知', icon: '⚡', to: '/' },
    { label: '任务', value: String(taskCount), icon: '📋', to: '/tasks' },
    { label: 'Agent', value: String(agentCount), icon: '🤖', to: '/agents' },
    { label: '审计事件', value: String(auditCount), icon: '📜', to: '/audit' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">总览</h1>
      <p className="mt-1 text-sm text-slate-500">HOAgent 运营控制台 · 只读视图</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              {c.label === '服务状态' && (
                <span className={`h-2 w-2 rounded-full ${serviceUp ? 'bg-emerald-400' : 'bg-slate-600'} animate-pulse`} />
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-100">{c.value}</p>
            <p className="text-xs text-slate-500 group-hover:text-slate-400">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-medium text-slate-300">服务健康</h2>
        <div className="mt-3">
          <StateContainer status={health.status} error={health.error}>
            <div className="flex items-center gap-3 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${serviceUp ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-slate-200">{health.data?.service ?? '—'}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{serviceUp ? 'OK' : '异常'}</span>
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
