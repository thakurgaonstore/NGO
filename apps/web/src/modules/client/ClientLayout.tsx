import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useAuth } from '../../core/auth/AuthContext';
import { ERP_MODULES } from '@ngo-erp/shared';
import { getTenantUnreadCount } from '../../core/inquiry/inquiryService';
import { LanguageToggle } from '../../components/shared/LanguageToggle';
import { QuotaBadge } from '../../components/shared/QuotaBadge';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Building2,
  LogOut,
  UserCheck,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardList,
  PiggyBank,
  HeartHandshake,
  Receipt,
  Briefcase,
  Boxes,
  Globe,
  BarChart3,
  Settings,
  Folder,
  Bell,
  MessageSquare,
  History,
  Shield,
  Store
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Building2,
  UserCheck,
  Shield,
  Users,
  FolderKanban,
  ClipboardList,
  PiggyBank,
  Store,
  HeartHandshake,
  Receipt,
  Briefcase,
  Boxes,
  Globe,
  BarChart3,
  Folder,
  Bell,
  MessageSquare,
  History,
  Settings
};

interface ClientLayoutProps {
  currentModule: string;
  onModuleChange: (mod: string) => void;
  onSwitchToSuperAdmin: () => void;
  onViewPublicSite?: () => void;
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({
  currentModule,
  onModuleChange,
  onSwitchToSuperAdmin,
  onViewPublicSite,
  children
}) => {
  const { isBangla } = useI18n();
  const { tenant, settings, isImpersonating, clearImpersonation } = useTenant();
  const { currentUser, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Field Officer allowed modules
  const FIELD_OFFICER_MODULES = ['dashboard', 'members', 'microcredit', 'field_ops', 'notices'];
  const MANAGER_MODULES = [
    'dashboard', 'organization', 'members', 'projects', 'field_ops',
    'accounts', 'microcredit', 'social_business', 'hr_payroll',
    'inventory', 'reports', 'documents', 'notices', 'audit'
  ];

  // Role Access Switcher / Simulation state
  const [activeRoleView, setActiveRoleView] = useState<string>(() => {
    return role || 'owner';
  });

  const effectiveRole = activeRoleView;

  // Filter modules strictly based on role
  const enabledModulesList = ERP_MODULES.filter((m) => {
    if (
      effectiveRole === 'field_officer' ||
      effectiveRole.includes('field') ||
      effectiveRole === 'credit_officer' ||
      effectiveRole === 'savings_mobilizer'
    ) {
      if (!FIELD_OFFICER_MODULES.includes(m.id)) return false;
    } else if (effectiveRole === 'manager') {
      if (!MANAGER_MODULES.includes(m.id)) return false;
    }
    return tenant?.enabledModules?.includes(m.id) || m.required || true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Super Admin Impersonation Alert Banner */}
      {isImpersonating && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>
              {isBangla
                ? `আপনি বর্তমানে "${tenant?.name.bn}" এর ছদ্মবেশে (Impersonating) লগইন রয়েছেন।`
                : `Currently impersonating "${tenant?.name.en}" with Owner privileges.`}
            </span>
          </div>
          <button
            onClick={() => {
              clearImpersonation();
              onSwitchToSuperAdmin();
            }}
            className="px-3 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-black/80 transition-colors"
          >
            {isBangla ? 'সুপার এডমিনে ফিরুন' : 'Exit Impersonation'}
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-sm p-3 justify-between shrink-0">
          <div className="space-y-4">
            {/* Tenant Brand */}
            <div className="flex items-center gap-3 px-2 py-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                style={{ backgroundColor: settings?.primaryColor || 'hsl(var(--primary))' }}
              >
                {tenant?.clientId?.slice(0, 2) || 'NG'}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm leading-tight truncate">
                  {isBangla ? tenant?.name.bn : tenant?.name.en}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                    {tenant?.clientId}
                  </Badge>
                  {tenant?.deploymentMode === 'MODE_B' && (
                    <span className="text-[10px] text-emerald-600 font-semibold">Mode B</span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Modules */}
            <nav className="space-y-0.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
              {enabledModulesList.map((mod) => {
                const Icon = ICON_MAP[mod.icon] || LayoutDashboard;
                const isActive = currentModule === mod.id;
                const unreadBadge = mod.id === 'website' ? getTenantUnreadCount(tenant?.id) : 0;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onModuleChange(mod.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{isBangla ? mod.name.bn : mod.name.en}</span>
                    </div>
                    {unreadBadge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                        {unreadBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile & Switch back */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="min-w-0">
                <div className="font-semibold truncate">{currentUser?.displayName?.en || 'Logged User'}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">{role}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToSuperAdmin}
              className="w-full text-xs justify-start text-muted-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              {isBangla ? 'সুপার অ্যাডমিন পোর্টাল' : 'Super Admin Portal'}
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border text-muted-foreground"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="font-bold text-sm sm:text-base hidden sm:block">
                {enabledModulesList.find((m) => m.id === currentModule)?.name[isBangla ? 'bn' : 'en'] || 'Overview'}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Role Perspective Switcher */}
              <div className="hidden lg:flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-xl text-xs border border-border">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {isBangla ? 'অ্যাক্সেস রোল:' : 'Role Access:'}
                </span>
                <select
                  value={activeRoleView}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setActiveRoleView(newRole);
                    if (newRole === 'field_officer' && !FIELD_OFFICER_MODULES.includes(currentModule)) {
                      onModuleChange('microcredit');
                    }
                  }}
                  className="bg-background text-foreground font-bold text-xs h-7 px-2 rounded-lg border border-input focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="owner">{isBangla ? 'নির্বাহী পরিচালক (মালিক)' : 'Executive Director'}</option>
                  <option value="manager">{isBangla ? 'শাখা ব্যবস্থাপক (ম্যানেজার)' : 'Branch Manager'}</option>
                  <option value="field_officer">{isBangla ? 'মাঠ কর্মকর্তা (কিস্তি আদায়)' : 'Field Officer'}</option>
                </select>
              </div>

              {onViewPublicSite && (
                <button
                  onClick={onViewPublicSite}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-colors shadow-sm"
                  title={isBangla ? 'পাবলিক ওয়েবসাইট দেখুন' : 'View Public Website'}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{isBangla ? 'ওয়েবসাইট দেখুন' : 'View Site'}</span>
                </button>
              )}

              <QuotaBadge
                reads={tenant?.quotas?.estimatedDailyReads || 320}
                maxReads={50000}
                writes={tenant?.quotas?.estimatedDailyWrites || 45}
              />
              <LanguageToggle />
            </div>
          </header>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden p-4 border-b bg-card space-y-1 max-h-96 overflow-y-auto">
              {enabledModulesList.map((mod) => {
                const Icon = ICON_MAP[mod.icon] || LayoutDashboard;
                const isActive = currentModule === mod.id;
                const unreadBadge = mod.id === 'website' ? getTenantUnreadCount(tenant?.id) : 0;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onModuleChange(mod.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{isBangla ? mod.name.bn : mod.name.en}</span>
                    </div>
                    {unreadBadge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                        {unreadBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Module Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
