import React, { useState, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useAuth } from '../../core/auth/AuthContext';
import { Tenant, toBanglaDigits, formatCurrency } from '@ngo-erp/shared';
import { isTenantDeleted } from '../../core/tenant/tenantCleanupService';
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
    id: 'tgps',
    clientId: 'TGPS',
    subdomain: 'tgps',
    domain: 'tgps.ngoerp.xyz',
    name: {
      en: 'Thakurgaon Green Practice Society (TGPS)',
      bn: 'ঠাকুরগাঁও গ্রীন প্র্যাকটিস সোসাইটি (TGPS)'
    },
    planId: 'enterprise',
    status: 'active',
    deploymentMode: 'MODE_A',
    enabledModules: ['dashboard', 'organization', 'members', 'projects', 'microcredit', 'donors_grants', 'accounts', 'field_ops', 'hr_payroll', 'inventory', 'website', 'reports', 'settings'],
    quotas: {
      usersCount: 15,
      branchesCount: 4,
      estimatedDailyReads: 1250,
      estimatedDailyWrites: 180,
      smsCreditsRemaining: 4500
    },
    ownerEmail: 'shopthakurgaon@gmail.com',
    ownerMobile: '01811544992',
    defaultPassword: 'NgoPass2026!',
    ownerPassword: 'NgoPass2026!',
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
    expiresAt: Date.now() + 335 * 86400000
  }
];

export const SuperAdminDashboard: React.FC<{ onNavigateToTenantApp: (tenantId: string) => void }> = ({
  onNavigateToTenantApp
}) => {
  const { isBangla, t } = useI18n();
  const { switchTenant } = useTenant();
  const { loginAsTenantMock } = useAuth();

  // Initialize and load registered tenants
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    let list: Tenant[] = [];
    const saved = localStorage.getItem('ngo_registered_tenants');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed.filter((t: any) => !isTenantDeleted(t.id) && !isTenantDeleted(t.clientId));
        }
      } catch (e) {
        console.warn('Failed to parse saved tenants:', e);
      }
    }

    const hasTgps = list.some((t) => t.id === 'tgps' || t.clientId?.toUpperCase() === 'TGPS');
    if (!hasTgps) {
      list = [...INITIAL_DEMO_TENANTS, ...list];
    }
    localStorage.setItem('ngo_registered_tenants', JSON.stringify(list));
    return list;
  });

  const refreshTenants = () => {
    const saved = localStorage.getItem('ngo_registered_tenants');
    let list: Tenant[] = [];
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed.filter((t: any) => !isTenantDeleted(t.id) && !isTenantDeleted(t.clientId));
        }
      } catch (e) {
        console.warn('Failed to refresh tenants:', e);
      }
    }
    const hasTgps = list.some((t) => t.id === 'tgps' || t.clientId?.toUpperCase() === 'TGPS');
    if (!hasTgps) {
      list = [...INITIAL_DEMO_TENANTS, ...list];
    }
    setTenants(list);
  };

  useEffect(() => {
    const handleTenantDeleted = () => {
      refreshTenants();
    };
    window.addEventListener('ngo_tenant_deleted', handleTenantDeleted);
    window.addEventListener('storage', handleTenantDeleted);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('ngo_tenant_channel');
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'TENANT_DELETED') {
          refreshTenants();
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('ngo_tenant_deleted', handleTenantDeleted);
      window.removeEventListener('storage', handleTenantDeleted);
      bc?.close();
    };
  }, []);

  const handleImpersonate = async (tenantId: string) => {
    await switchTenant(tenantId);
    loginAsTenantMock('owner', tenantId);
    onNavigateToTenantApp(tenantId);
  };

  const handleToggleStatus = (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = tenants.map((t) => (t.id === tenantId ? { ...t, status: newStatus as any } : t));
    setTenants(updated);
    localStorage.setItem('ngo_registered_tenants', JSON.stringify(updated));
  };

  const handleDeleteTenant = (tenantId: string) => {
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
