import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const navItems = [
  { to: '/', label: '总览', icon: '📊' },
  { to: '/tasks', label: '任务', icon: '📋' },
  { to: '/agents', label: 'Agent', icon: '🤖' },
  { to: '/business', label: '业务', icon: '🏢' },
  { to: '/audit', label: '审计', icon: '📜' },
  { to: '/search', label: '搜索', icon: '🔍' },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-56 border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-5">
        <span className="text-lg">✦</span>
        <span className="text-sm font-semibold tracking-tight text-slate-100">
          Charlie Cockpit
        </span>
      </div>
      <nav className="space-y-0.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
        <p className="text-xs text-slate-600">
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
      <main className="pl-56">
        <div className="mx-auto max-w-7xl px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
