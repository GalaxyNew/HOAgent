import { useState } from '@/host-react';
import type { ComponentType } from 'react';
import { Layout } from '@/components/Layout';
import { OverviewPage } from '@/pages/OverviewPage';
import { TasksPage } from '@/pages/TasksPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { BusinessPage } from '@/pages/BusinessPage';
import { AuditPage } from '@/pages/AuditPage';
import { SearchPage } from '@/pages/SearchPage';
import { NavigationContext, type View } from '@/navigation';

const views: Record<View, ComponentType> = {
  overview: OverviewPage,
  tasks: TasksPage,
  agents: AgentsPage,
  business: BusinessPage,
  audit: AuditPage,
  search: SearchPage,
};

/**
 * Native Hermes Dashboard plugin root. The Dashboard owns React rendering,
 * authentication and browser history; this component owns only local view state.
 */
export function CharlieCockpitPage() {
  const [view, setView] = useState<View>('overview');
  const ActiveView = views[view];

  return (
    <NavigationContext.Provider value={{ view, navigate: setView }}>
      <Layout>
        <ActiveView />
      </Layout>
    </NavigationContext.Provider>
  );
}
