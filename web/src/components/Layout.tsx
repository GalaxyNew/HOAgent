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
    <aside className="cockpit-sidebar fixed inset-y-0 left-0 z-40 w-56 border-r border-[#D6E1DB] bg-white/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 border-b border-[#D6E1DB] px-5">
        <span className="text-lg">✦</span>
        <span className="text-sm font-semibold tracking-tight text-[#12201C]">
          Charlie Cockpit
        </span>
      </div>
      <nav className="cockpit-nav space-y-0.5 p-3">
        {navItems.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => navigate(item.view)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              view === item.view
                ? 'bg-[#DDF3EC] text-[#0F766E]'
                : 'text-[#64716B] hover:bg-[#EAF2EE] hover:text-[#12201C]'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="cockpit-sidebar-footer absolute bottom-0 w-full border-t border-[#D6E1DB] p-4">
        <p className="text-xs text-[#809089]">
          HOAgent · 只读模式
          <br />
          v0.1.0 MVP
        </p>
      </div>
    </aside>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="cockpit-main pl-56">
        <div className="cockpit-content mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
