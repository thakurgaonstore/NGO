import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from './core/i18n/I18nContext';
import { TenantProvider, useTenant } from './core/tenant/TenantContext';
import { TenantResolver } from './core/tenant/TenantResolver';
import { isTenantDeleted } from './core/tenant/tenantCleanupService';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { LoginScreen } from './modules/auth/LoginScreen';
import { SuperAdminLayout } from './modules/superadmin/SuperAdminLayout';
import { SuperAdminDashboard } from './modules/superadmin/SuperAdminDashboard';
import { PlansList } from './modules/superadmin/PlansList';
import { SuperAdminInquiriesView } from './modules/superadmin/SuperAdminInquiriesView';
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
import { PlatformLandingPage } from './modules/platform-landing/PlatformLandingPage';
import { PlatformCmsEditor } from './modules/platform-landing/PlatformCmsEditor';
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
  const getInitialView = (): 'platform_home' | 'public' | 'login' | 'client' | 'superadmin' | 'tenant_deleted' => {
    const pathname = window.location.pathname.toLowerCase();
    const firstSegment = pathname.split('/').filter(Boolean)[0] || '';

    // 1. Super Admin Portal (/mahinerp or /superadmin)
    if (pathname.startsWith('/mahinerp') || pathname.startsWith('/superadmin')) {
      return isSuperAdmin ? 'superadmin' : 'login';
    }

    // 2. Explicit Client ERP Login (/cerp or /login or :clientId/login)
    if (resolution.isTenantExplicitLogin || pathname.startsWith('/cerp') || pathname === '/login') {
      return currentUser ? (isSuperAdmin ? 'superadmin' : 'client') : 'login';
    }

    // 3. Check if path or tenant is deleted or not found
    if (
      resolution.isTenantDeleted ||
      isTenantDeleted(firstSegment) ||
      isTenantDeleted(resolution.tenantId) ||
      isTenantDeleted(resolution.clientId)
    ) {
      return 'tenant_deleted';
    }

    // 4. Path-based client (/sheba) or custom domain public site
    if (resolution.isPublicLanding && resolution.tenantId && !isTenantDeleted(resolution.tenantId)) {
      return 'public';
    }

    // If an unknown non-reserved path was requested, treat as not found / deleted
    if (firstSegment && !['mahinerp', 'superadmin', 'cerp', 'login', 'admin', 'api', 'home'].includes(firstSegment)) {
      return 'tenant_deleted';
    }

    // 5. Platform Home (root '/' or '/home')
    if (resolution.isPlatformHome || pathname === '/' || pathname === '/home') {
      return 'platform_home';
    }

    // 6. If logged in, go to ERP / SA
    if (currentUser) {
      return isSuperAdmin ? 'superadmin' : 'client';
    }

    return 'platform_home';
  };

  const [currentView, setCurrentView] = useState<'platform_home' | 'public' | 'login' | 'client' | 'superadmin' | 'tenant_deleted'>(getInitialView);
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

  // Handle Deleted / Not Found Tenant View
  if (currentView === 'tenant_deleted') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm border border-rose-200">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          এনজিওটি খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে
        </h2>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          এই এনজিও অ্যাকাউন্টটি বর্তমানে সিস্টেমে বিদ্যমান নেই অথবা সুপার এডমিন কর্তৃক স্থায়ীভাবে ডিলিট করা হয়েছে।
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('platform_home');
            }}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-all"
          >
            ← মূল প্ল্যাটফর্ম হোমপেজ
          </button>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/mahinerp');
              setCurrentView(isSuperAdmin ? 'superadmin' : 'login');
            }}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all shadow-sm"
          >
            সুপার এডমিন পোর্টাল
          </button>
        </div>
      </div>
    );
  }

  // Handle Main Platform Promotional Home Page (/)
  if (currentView === 'platform_home') {
    return (
      <PlatformLandingPage
        onNavigateToTenantPublic={(slug) => {
          window.history.pushState({}, '', `/${slug}`);
          TenantResolver.cacheTenantId(slug);
          setCurrentView('public');
        }}
        onNavigateToClientLogin={() => {
          window.history.pushState({}, '', '/cerp');
          setCurrentView('login');
        }}
        onNavigateToSuperAdmin={() => {
          window.history.pushState({}, '', '/mahinerp');
          setCurrentView(isSuperAdmin ? 'superadmin' : 'login');
        }}
      />
    );
  }

  // Handle Client NGO Public Landing Page View (domain/:clientId, custom domain, or preview)
  if (currentView === 'public') {
    const isTargetDeleted =
      resolution.isTenantDeleted ||
      isTenantDeleted(resolution.tenantId) ||
      isTenantDeleted(resolution.clientId) ||
      isTenantDeleted(tenant?.id);

    if (isTargetDeleted || (!tenant && !resolution.tenantId)) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
            <Database className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            এনজিওটি খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            এই এনজিও অ্যাকাউন্টটি বর্তমানে সিস্টেমে বিদ্যমান নেই অথবা সুপার এডমিন কর্তৃক স্থায়ীভাবে ডিলিট করা হয়েছে।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('platform_home');
              }}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 transition-all"
            >
              ← মূল প্ল্যাটফর্ম হোমপেজ
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/mahinerp');
                setCurrentView('superadmin');
              }}
              className="px-5 py-2.5 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all"
            >
              সুপার এডমিন পোর্টাল
            </button>
          </div>
        </div>
      );
    }

    const effectiveTenantId = tenant?.id || resolution.tenantId;
    if (!effectiveTenantId) {
      setCurrentView('platform_home');
      return null;
    }

    const isCustomDomain = resolution.isCustomDomainOrSubdomain;

    return (
      <div className="relative">
        {/* On custom domains, hide the platform banner completely for regular visitors, or show slim admin bar only when logged in */}
        {!isCustomDomain ? (
          <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 flex items-center justify-between border-b border-emerald-500/40 z-50 sticky top-0 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">
                ক্লায়েন্ট এনজিও পোর্টাল: {tenant?.name?.bn || 'এনজিও পোর্টাল'} ({resolution.clientId || tenant?.clientId || ''})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setCurrentView('platform_home');
                }}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors shadow-sm"
              >
                ← মূল প্ল্যাটফর্ম হোম
              </button>
              {currentUser && (
                <>
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
                    className="px-2.5 py-1 text-[11px] bg-primary text-primary-foreground rounded font-bold transition-colors shadow-sm"
                  >
                    এডমিন প্যানেলে ফিরুন →
                  </button>
                </>
              )}
            </div>
          </div>
        ) : currentUser ? (
          <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-emerald-500/30 z-50 sticky top-0 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-medium text-slate-300">
                {tenant?.name?.bn || 'এনজিও ওয়েবসাইট'} | লগইন ইউজার: {currentUser.displayName?.bn || currentUser.displayName?.en || currentUser.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/cerp');
                  setClientModule('website');
                  setCurrentView(isSuperAdmin ? 'superadmin' : 'client');
                }}
                className="px-2.5 py-0.5 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors"
              >
                সিএমএস এডিট
              </button>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/cerp');
                  setCurrentView(isSuperAdmin ? 'superadmin' : 'client');
                }}
                className="px-2.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded font-bold transition-colors"
              >
                ইআরপিতে ফিরুন →
              </button>
            </div>
          </div>
        ) : null}

        <PublicLandingPage
          tenantId={effectiveTenantId}
          onNavigateToLogin={() => {
            const loginPath = isCustomDomain ? '/cerp' : `/${resolution.clientId?.toLowerCase() || tenant?.clientId?.toLowerCase() || 'sheba'}/cerp`;
            window.history.pushState({}, '', loginPath);
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
    const isCustomDomain = resolution.isCustomDomainOrSubdomain;
    const targetPublicPath = isCustomDomain
      ? '/'
      : resolution.clientId
      ? `/${resolution.clientId.toLowerCase()}`
      : '/';

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
              if (isCustomDomain) {
                setCurrentView('public');
              } else {
                setCurrentView(targetPublicPath === '/' ? 'platform_home' : 'public');
              }
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
        onViewPlatformHome={() => {
          window.history.pushState({}, '', '/');
          setCurrentView('platform_home');
        }}
      >
        {superAdminTab === 'overview' && (
          <SuperAdminDashboard
            onNavigateToTenantApp={(tenantId) => {
              setCurrentView('client');
            }}
          />
        )}
        {superAdminTab === 'inquiries' && <SuperAdminInquiriesView />}
        {superAdminTab === 'tenants' && (
          <SuperAdminDashboard
            onNavigateToTenantApp={(tenantId) => {
              setCurrentView('client');
            }}
          />
        )}
        {superAdminTab === 'plans' && <PlansList />}
        {superAdminTab === 'platform_cms' && (
          <PlatformCmsEditor
            onViewLiveWebsite={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('platform_home');
            }}
          />
        )}
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
        const targetSlug = resolution.clientId?.toLowerCase() || tenant?.clientId?.toLowerCase() || 'sheba';
        window.history.pushState({}, '', `/${targetSlug}`);
        setCurrentView('public');
      }}
    >
      {clientModule === 'dashboard' && <ClientDashboardShell onNavigateToModule={setClientModule} />}
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
