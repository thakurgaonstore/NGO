import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { purgeDeletedTenantTraces } from './core/tenant/tenantCleanupService';

// Automatically purge any lingering traces of blacklisted/deleted tenants (e.g. Jagorani)
try {
  purgeDeletedTenantTraces();
} catch {}

// Unconditionally enforce light theme across all pages
try {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
  localStorage.removeItem('theme');
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
