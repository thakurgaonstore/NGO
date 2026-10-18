import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from './core/i18n/I18nContext';
import { TenantProvider, useTenant } from './core/tenant/TenantContext';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { LoginScreen } from './modules/auth/LoginScreen';
import { SuperAdminLayout } from './modules/superadmin/SuperAdminLayout';
import { SuperAdminDashboard } from './modules/superadmin/SuperAdminDashboard';
import { PlansList } from './modules/superadmin/PlansList';
import { ClientLayout } from './modules/client/ClientLayout';
import { ClientDashboardShell } from './modules/client/ClientDashboardShell';
import { SuspendedTenantScreen } from './modules/client/SuspendedTenantScreen';
import { Card, CardContent } from './components/ui/card';
import { Database } from 'lucide-react';

// Modules
import { OrganizationView } from './modules/organization/OrganizationView';
import { UsersListView } from './modules/users/UsersListView';
import { RolesManagementView } from './modules/roles/RolesManagementView';
import { MembersListView } from './modules/members/MembersListView';
import { ProjectsListView } from './modules/projects/ProjectsListView';
import { FieldOpsView } from './modules/field-ops/FieldOpsView';
import { AccountsView } from './modules/accounts/AccountsView';
import { HrPayrollView } from './modules/hr/HrPayrollView';
import { InventoryView } from './modules/inventory/InventoryView';
import { MicrocreditView } from './modules/microcredit/MicrocreditView';
import { SocialBusinessView } from './modules/social-business/SocialBusinessView';
import { DonorsGrantsView } from './modules/donors/DonorsGrantsView';
import { WebsiteCmsView } from './modules/website/WebsiteCmsView';
import { PublicLandingPage } from './modules/website/PublicLandingPage';
import { ReportsView } from './modules/reports/ReportsView';
import { DocumentRepositoryView } from './modules/documents/DocumentRepositoryView';
import { NoticeBoardView } from './modules/notices/NoticeBoardView';
import { TenantSettingsView } from './modules/settings/TenantSettingsView';
import { AuditLogsView } from './modules/audit/AuditLogsView';
import { IntegrationsView } from './modules/integrations/IntegrationsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache to protect Spark quota
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  }
});

const AppContent: React.FC = () => {
  const { tenant, isSuspended, resolution } = useTenant();
  const { currentUser, isSuperAdmin } = useAuth();

  // Determine initial view based on URL & resolution
  const getInitialView = (): 'public' | 'login' | 'client' | 'superadmin' => {
    const pathname = window.location.pathname.toLowerCase();

    // 1. Super Admin Portal
    if (pathname.startsWith('/mahinerp') || pathname.startsWith('/superadmin')) {
      return isSuperAdmin ? 'superadmin' : 'login';
    }

    // 2. Explicit Client ERP Login (/cerp or /login)
    if (pathname.startsWith('/cerp') || pathname === '/login') {
      return currentUser ? (isSuperAdmin ? 'superadmin' : 'client') : 'login';
    }

    // 3. Path-based client (/jagorani, /sheba) or custom domain public site
    if (resolution.isPublicLanding) {
      return 'public';
    }

    // 4. If logged in, go to ERP / SA
    if (currentUser) {
      return isSuperAdmin ? 'superadmin' : 'client';
    }

    // Default for guest visitors: show Public Landing page!
    return 'public';
  };

  const [currentView, setCurrentView] = useState<'public' | 'login' | 'client' | 'superadmin'>(getInitialView);
  const [superAdminTab, setSuperAdminTab] = useState<string>('overview');
  const [clientModule, setClientModule] = useState<string>('dashboard');

  // Listen to browser popstate (back / forward buttons) - guard against hash changes (#about, #projects)
  React.useEffect(() => {
    let lastPath = window.location.pathname;
    const handlePopState = () => {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        setCurrentView(getInitialView());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser, isSuperAdmin, resolution]);

  // Handle Public Landing Page View (domain/:clientId, custom domain, or preview)
  if (currentView === 'public') {
    const effectiveTenantId = tenant?.id || resolution.tenantId || 'demo-jagorani';
    return (
      <div className="relative">
        {/* If user is logged in as staff/admin, show a sleek top notification banner allowing quick return to ERP */}
        {currentUser && (
          <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 flex items-center justify-between border-b border-emerald-500/40 z-50 sticky top-0 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">
                অ্যাডমিন প্রিভিউ মোড: {tenant?.name?.bn || 'জাগরণী ফাউন্ডেশন'} ({resolution.clientId || 'JAGORANI'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/cerp');
                  setClientModule('website');
                  setCurrentView(isSuperAdmin ? 'superadmin' : 'client');
                }}
                className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors shadow-sm"
              >
                সিএমএস এডিট করুন
              </button>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/cerp');
                  setCurrentView(isSuperAdmin ? 'superadmin' : 'client');
                }}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors shadow-sm"
              >
                এডমিন প্যানেলে ফিরুন →
              </button>
            </div>
          </div>
        )}
        <PublicLandingPage
          tenantId={effectiveTenantId}
          onNavigateToLogin={() => {
            window.history.pushState({}, '', '/cerp');
            setCurrentView('login');
          }}
          onNavigateToErp={() => {
            setCurrentView(isSuperAdmin ? 'superadmin' : 'client');
          }}
        />
      </div>
    );
  }

  // If not logged in and on /cerp or /login or /mahinerp
  if (currentView === 'login' || !currentUser) {
    const targetPublicPath = resolution.clientId ? `/${resolution.clientId.toLowerCase()}` : '/';
    return (
      <div className="relative">
        <LoginScreen
          onLoginSuccess={(isSA) => {
            setCurrentView(isSA ? 'superadmin' : 'client');
          }}
        />
        {/* Return to Public Website Floating Button */}
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => {
              window.history.pushState({}, '', targetPublicPath);
              setCurrentView('public');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
          >
            <span>← মূল ওয়েবসাইট দেখুন</span>
          </button>
        </div>
      </div>
    );
  }

  // If Client view is active and tenant is suspended, show blocked screen
  if (currentView === 'client' && isSuspended) {
    return <SuspendedTenantScreen />;
  }

  // 1. Super Admin Platform View
  if (currentView === 'superadmin') {
    return (
      <SuperAdminLayout
        currentTab={superAdminTab}
        onTabChange={setSuperAdminTab}
        onExitSuperAdmin={() => setCurrentView('client')}
      >
        {superAdminTab === 'overview' && (
          <SuperAdminDashboard
            onNavigateToTenantApp={(tenantId) => {
              setCurrentView('client');
            }}
          />
        )}
        {superAdminTab === 'tenants' && (
          <SuperAdminDashboard
            onNavigateToTenantApp={(tenantId) => {
              setCurrentView('client');
            }}
          />
        )}
        {superAdminTab === 'plans' && <PlansList />}
        {superAdminTab === 'quotas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Spark Quota Guard & Cost Preservation</h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-xs">
                <div className="flex items-center gap-3 text-emerald-600 font-bold text-sm">
                  <Database className="w-5 h-5" />
                  <span>Platform Read Quota: 4,960 / 50,000 (9.9% consumed today)</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Our multi-tenant architecture uses denormalized aggregate documents, 5-minute TanStack Query caching, and edge-cached public websites. No N+1 queries exist.
                </p>
                <div className="p-3 bg-muted rounded-lg font-mono text-[11px]">
                  Mode B Dedicated Projects: 1 active (Sheba Manobik Unnayan Kendra) - 0 platform reads consumed!
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {superAdminTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Platform Global Settings</h2>
            <Card>
              <CardContent className="pt-6 text-xs text-muted-foreground">
                SMS gateway master configuration (bulksmsbd.net), payment merchant credentials, and system broadcast notifications.
              </CardContent>
            </Card>
          </div>
        )}
      </SuperAdminLayout>
    );
  }

  // 2. Client ERP Panel View
  return (
    <ClientLayout
      currentModule={clientModule}
      onModuleChange={setClientModule}
      onSwitchToSuperAdmin={() => setCurrentView('superadmin')}
      onViewPublicSite={() => {
        const targetSlug = resolution.clientId?.toLowerCase() || 'jagorani';
        window.history.pushState({}, '', `/${targetSlug}`);
        setCurrentView('public');
      }}
    >
      {clientModule === 'dashboard' && <ClientDashboardShell />}
      {clientModule === 'organization' && <OrganizationView />}
      {clientModule === 'users' && <UsersListView />}
      {clientModule === 'roles' && <RolesManagementView />}
      {clientModule === 'members' && <MembersListView />}
      {clientModule === 'projects' && <ProjectsListView />}
      {clientModule === 'field_ops' && <FieldOpsView />}
      {clientModule === 'accounts' && <AccountsView />}
      {clientModule === 'hr_payroll' && <HrPayrollView />}
      {clientModule === 'inventory' && <InventoryView />}
      {clientModule === 'microcredit' && <MicrocreditView />}
      {clientModule === 'social_business' && <SocialBusinessView />}
      {clientModule === 'donors_grants' && <DonorsGrantsView />}
      {clientModule === 'website' && <WebsiteCmsView />}
      {clientModule === 'reports' && <ReportsView />}
      {clientModule === 'documents' && <DocumentRepositoryView />}
      {clientModule === 'notices' && <NoticeBoardView />}
      {clientModule === 'settings' && <TenantSettingsView />}
      {clientModule === 'audit' && <AuditLogsView />}
      {clientModule === 'integrations' && <IntegrationsView />}
    </ClientLayout>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TenantProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </TenantProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
