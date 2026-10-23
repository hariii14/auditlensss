import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/layout/Layout';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { VendorsPage } from './pages/VendorsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated / Core Platform Routes within Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/investigations" element={<InvestigationsPage />} />
            <Route path="/investigations/:id" element={<InvestigationDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
