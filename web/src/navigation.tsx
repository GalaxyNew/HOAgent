import { createContext, useContext } from '@/host-react';

export type View = 'overview' | 'tasks' | 'agents' | 'business' | 'audit' | 'search';

export const viewPaths: Record<View, string> = {
  overview: '/',
  tasks: '/tasks',
  agents: '/agents',
  business: '/business',
  audit: '/audit',
  search: '/search',
};

export const NavigationContext = createContext<{
  view: View;
  navigate: (view: View) => void;
} | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('CharlieCockpitPage must provide NavigationContext');
  return context;
}
