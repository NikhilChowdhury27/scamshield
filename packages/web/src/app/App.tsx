import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CheckMessagePage } from '@/pages/CheckMessagePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LearnPage } from '@/pages/LearnPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ExtensionPage } from '@/pages/ExtensionPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/check" replace />} />
        <Route path="check" element={<CheckMessagePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="extension" element={<ExtensionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/check" replace />} />
    </Routes>
  );
}
