import React, { useState, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { Tenant, toBanglaDigits, formatCurrency } from '@ngo-erp/shared';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { TenantsList } from './TenantsList';
import {
  Building2,
  Users,
  Database,
  Activity,
  AlertTriangle,
  Server,
  ShieldCheck,
  Zap
} from 'lucide-react';

const INITIAL_DEMO_TENANTS: Tenant[] = [
  {
    id: 'demo-jagorani',
    clientId: 'JAGORANI',
    subdomain: 'jagorani',
    domain: 'www.jagoranibd.org',
    name: {
      en: 'Jagorani Development Foundation',
      bn: 'জাগরণী উন্নয়ন ফাউন্ডেশন'
    },
    planId: 'growth',
    status: 'active',
    deploymentMode: 'MODE_A',
    enabledModules: ['dashboard', 'organization', 'members', 'projects', 'accounts', 'field_ops', 'hr_payroll', 'website', 'reports', 'settings'],
    quotas: {
      usersCount: 8,
      branchesCount: 3,
      estimatedDailyReads: 1450,
      estimatedDailyWrites: 120,
      smsCreditsRemaining: 680
    },
    ownerEmail: 'director@jagorani.org',
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now(),
    expiresAt: Date.now() + 305 * 86400000
  },
  {
    id: 'sheba-manobik',
    clientId: 'SHEBA',
    subdomain: 'sheba',
    name: {
      en: 'Sheba Manobik Unnayan Kendra',
      bn: 'সেবা মানবিক উন্নয়ন কেন্দ্র'
    },
    planId: 'enterprise',
    status: 'active',
    deploymentMode: 'MODE_B', // Dedicated Firebase
    firebaseConfig: {
      apiKey: 'AIzaSyDemoSheba...',
      authDomain: 'sheba-ngo.firebaseapp.com',
      projectId: 'sheba-ngo-prod',
      appId: '1:987654:web:sheba'
    },
    enabledModules: ['dashboard', 'organization', 'members', 'projects', 'microcredit', 'donors_grants', 'accounts', 'field_ops', 'hr_payroll', 'inventory', 'website', 'reports', 'settings'],
    quotas: {
      usersCount: 22,
      branchesCount: 6,
      estimatedDailyReads: 3200,
      estimatedDailyWrites: 340,
      smsCreditsRemaining: 3400
    },
    ownerEmail: 'admin@shebangoc.org',
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now(),
    expiresAt: Date.now() + 275 * 86400000
  },
  {
    id: 'alok-shikkha',
    clientId: 'ALOK',
    subdomain: 'alok',
    name: {
      en: 'Alok Shikkha & Shasthya Foundation',
      bn: 'আলোক শিক্ষা ও স্বাস্থ্য ফাউন্ডেশন'
    },
    planId: 'starter',
    status: 'trial',
    deploymentMode: 'MODE_A',
    enabledModules: ['dashboard', 'organization', 'members', 'projects', 'accounts', 'website', 'settings'],
    quotas: {
      usersCount: 2,
      branchesCount: 1,
      estimatedDailyReads: 310,
      estimatedDailyWrites: 25,
      smsCreditsRemaining: 150
    },
    ownerEmail: 'info@alokbd.org',
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now(),
    expiresAt: Date.now() + 5 * 86400000 // 5 days left in trial
  }
];

export const SuperAdminDashboard: React.FC<{ onNavigateToTenantApp: (tenantId: string) => void }> = ({
  onNavigateToTenantApp
}) => {
  const { isBangla, t } = useI18n();
  const { switchTenant } = useTenant();

  // Initialize and load registered tenants
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('ngo_registered_tenants');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved tenants:', e);
      }
    }
    return INITIAL_DEMO_TENANTS;
  });

  useEffect(() => {
    if (!localStorage.getItem('ngo_registered_tenants')) {
      localStorage.setItem('ngo_registered_tenants', JSON.stringify(INITIAL_DEMO_TENANTS));
    }
  }, []);

  const refreshTenants = () => {
    const saved = localStorage.getItem('ngo_registered_tenants');
    if (saved !== null) {
      try {
        setTenants(JSON.parse(saved));
        return;
      } catch (e) {
        console.warn('Failed to refresh tenants:', e);
      }
    }
    setTenants(INITIAL_DEMO_TENANTS);
  };

  const handleImpersonate = async (tenantId: string) => {
    await switchTenant(tenantId);
    onNavigateToTenantApp(tenantId);
  };

  const handleToggleStatus = (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = tenants.map((t) => (t.id === tenantId ? { ...t, status: newStatus as any } : t));
    setTenants(updated);
    localStorage.setItem('ngo_registered_tenants', JSON.stringify(updated));
  };

  const handleDeleteTenant = (tenantId: string) => {
    // Handled in TenantsList confirmation modal
    refreshTenants();
  };

  // Metrics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const trialTenants = tenants.filter((t) => t.status === 'trial').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended').length;

  const totalDailyReads = tenants.reduce((acc, curr) => acc + (curr.quotas?.estimatedDailyReads || 0), 0);
  const totalDailyWrites = tenants.reduce((acc, curr) => acc + (curr.quotas?.estimatedDailyWrites || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'মোট রেজিস্টার্ড এনজিও' : 'Total NGO Tenants'}
            </CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {isBangla ? toBanglaDigits(totalTenants) : totalTenants}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isBangla ? 'প্ল্যাটফর্মে নিবন্ধিত এনজিও' : 'Registered multi-tenant workspaces'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'সক্রিয় সাবস্ক্রিপশন' : 'Active Subscriptions'}
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {isBangla ? toBanglaDigits(activeTenants) : activeTenants}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isBangla
                ? `${toBanglaDigits(trialTenants)} টি ট্রায়াল মোডে চলমান`
                : `${trialTenants} in trial evaluation`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'স্পার্ক কোটা ব্যবহার (দৈনিক)' : 'Spark Read Quota'}
            </CardTitle>
            <Database className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {isBangla ? toBanglaDigits(totalDailyReads) : totalDailyReads.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground"> / 50K</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (totalDailyReads / 50000) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'সিস্টেম স্ট্যাটাস ও মোড' : 'Architecture Health'}
            </CardTitle>
            <Server className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isBangla ? 'সকল সিস্টেম কার্যকর' : '100% Operational'}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isBangla ? 'ক্লাউডফ্লেয়ার ওয়ার্কার + স্পার্ক' : 'Cloudflare Workers + Spark'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Management Section */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'এনজিও টেন্যান্টদের তালিকা' : 'NGO Tenant Directory'}</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {isBangla ? `মোট ${toBanglaDigits(tenants.length)} টি এনজিও` : `${tenants.length} Tenants`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <TenantsList
            tenants={tenants}
            onRefresh={refreshTenants}
            onImpersonate={handleImpersonate}
            onToggleStatus={handleToggleStatus}
            onDeleteTenant={handleDeleteTenant}
          />
        </CardContent>
      </Card>
    </div>
  );
};
