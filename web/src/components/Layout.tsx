import type { ReactNode } from 'react';
import { useNavigation, type View } from '@/navigation';

const navItems: { view: View; label: string; icon: string }[] = [
  { view: 'overview', label: '总览', icon: '📊' },
  { view: 'tasks', label: '任务', icon: '📋' },
  { view: 'agents', label: 'Agent', icon: '🤖' },
  { view: 'business', label: '业务', icon: '🏢' },
  { view: 'audit', label: '审计', icon: '📜' },
  { view: 'search', label: '搜索', icon: '🔍' },
];

export function Sidebar() {
  const { view, navigate } = useNavigation();
  return (
    <aside className="cc-panel shrink-0 md:sticky md:top-4 md:w-56 md:self-start">
      <div className="flex min-h-14 items-center gap-2 border-b border-[var(--cc-border)] px-4">
        <span className="text-lg" aria-hidden="true">✦</span>
        <span className="cc-page-title text-sm font-semibold tracking-tight">Charlie Cockpit</span>
      </div>
      <nav aria-label="Charlie Cockpit 页面" className="flex gap-1 overflow-x-auto p-2 md:block md:space-y-0.5 md:overflow-visible md:p-3">
        {navItems.map((item) => (
          <button key={item.view} type="button" onClick={() => navigate(item.view)} aria-current={view === item.view ? 'page' : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors md:w-full ${
              view === item.view ? 'bg-[var(--cc-brand-soft)] font-medium text-[var(--cc-brand)]' : 'cc-muted hover:bg-[#EAF2EE] hover:text-[var(--cc-ink)]'
            }`}>
            <span className="text-base" aria-hidden="true">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="hidden border-t border-[var(--cc-border)] p-4 md:block">
        <p className="cc-muted-soft text-xs">HOAgent · 只读模式<br />v0.1.0 MVP</p>
      </div>
    </aside>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="charlie-cockpit w-full p-3 sm:p-4" aria-label="Charlie Cockpit">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row">
        <Sidebar />
        <main className="cc-panel min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </section>
  );
}
