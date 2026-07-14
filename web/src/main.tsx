import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Layout } from '@/components/Layout';
import { OverviewPage } from '@/pages/OverviewPage';
import { TasksPage } from '@/pages/TasksPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { BusinessPage } from '@/pages/BusinessPage';
import { AuditPage } from '@/pages/AuditPage';
import { SearchPage } from '@/pages/SearchPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
);
