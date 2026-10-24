import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useAuth } from '../../core/auth/AuthContext';
import { ERP_MODULES, ErpModuleMeta } from '@ngo-erp/shared';
import { getTenantUnreadCount } from '../../core/inquiry/inquiryService';
import { LanguageToggle } from '../../components/shared/LanguageToggle';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { useInactivityTimer } from '../../core/auth/useInactivityTimer';
import {
  Building2,
  LogOut,
  UserCheck,
  ArrowLeft,
  Menu,
  X,
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
  Store,
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  Layers,
  SlidersHorizontal,
  Home,
  Database
} from 'lucide-react';
import { DataBackupModal } from '../backup/DataBackupModal';

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

interface NavCategory {
  id: string;
  name: { bn: string; en: string };
  icon: any;
  moduleIds: string[];
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
  const [mobileSearchQuery, setMobileSearchQuery] = useState<string>('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);

  // 60-Minute Inactivity Auto-Logout Hook
  useInactivityTimer({
    timeoutMinutes: 60,
    onTimeout: signOut,
    enabled: !!currentUser,
    isBangla
  });

  // Role Access Switcher / Simulation state
  const [activeRoleView, setActiveRoleView] = useState<string>(() => role || 'owner');
  const effectiveRole = activeRoleView;

  // Field Officer and Manager Module Scoping
  const FIELD_OFFICER_MODULES = ['dashboard', 'members', 'microcredit', 'field_ops', 'notices'];
  const MANAGER_MODULES = [
    'dashboard', 'organization', 'members', 'projects', 'field_ops',
    'accounts', 'microcredit', 'social_business', 'hr_payroll',
    'inventory', 'reports', 'documents', 'notices', 'audit'
  ];

  // Filter modules based on role
  const enabledModulesList = useMemo(() => {
    return ERP_MODULES.filter((m) => {
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
  }, [effectiveRole, tenant?.enabledModules]);

  // Group modules into 4 elegant functional categories for scroll-free navigation
  const categories: NavCategory[] = useMemo(() => {
    return [
      {
        id: 'core',
        name: { bn: 'প্রধান ওভারভিউ', en: 'Core Overview' },
        icon: LayoutDashboard,
        moduleIds: ['dashboard', 'reports']
      },
      {
        id: 'operations',
        name: { bn: 'মাঠ ও ক্ষুদ্রঋণ কার্যক্রম', en: 'Field & Microcredit' },
        icon: Users,
        moduleIds: ['members', 'microcredit', 'projects', 'field_ops', 'social_business', 'inventory']
      },
      {
        id: 'finance',
        name: { bn: 'হিসাব ও তহবিল', en: 'Accounts & Grants' },
        icon: Receipt,
        moduleIds: ['accounts', 'donors_grants']
      },
      {
        id: 'admin',
        name: { bn: 'প্রশাসন ও সিস্টেম', en: 'Admin & Systems' },
        icon: Settings,
        moduleIds: ['organization', 'users', 'roles', 'hr_payroll', 'website', 'notices', 'documents', 'integrations', 'audit', 'settings']
      }
    ];
  }, []);

  // Determine which category contains the current module
  const currentCategory = useMemo(() => {
    for (const cat of categories) {
      if (cat.moduleIds.includes(currentModule)) {
        return cat.id;
      }
    }
    return 'core';
  }, [categories, currentModule]);

  // Expanded categories state - keep current active category open by default
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    core: true,
    operations: true,
    finance: false,
    admin: false
  });

  // Whenever current module changes, auto-expand its parent category
  useEffect(() => {
    setExpandedCats((prev) => ({
      ...prev,
      [currentCategory]: true
    }));
  }, [currentCategory]);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* 1. Super Admin Impersonation Alert Banner */}
      {isImpersonating && (
        <div className="bg-amber-500 text-black px-4 py-1.5 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isBangla
                ? `ছদ্মবেশে লগইন: "${tenant?.name.bn || tenant?.name.en}" (মালিক হিসেবে কার্যক্রম চলছে)`
                : `Impersonating: "${tenant?.name.en}" with Owner privileges.`}
            </span>
          </div>
          <button
            onClick={() => {
              clearImpersonation();
              onSwitchToSuperAdmin();
            }}
            className="px-3 py-0.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-black/80 transition-colors shrink-0 ml-2"
          >
            {isBangla ? 'সুপার এডমিনে ফিরুন' : 'Exit Impersonation'}
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* ======================================================== */}
        {/* Desktop Sidebar: Scroll-Free, Non-Dropdown Categorized    */}
        {/* ======================================================== */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/85 backdrop-blur-md justify-between shrink-0 h-screen sticky top-0 overflow-hidden shadow-xs">
          {/* Top Section: Brand Header & Categorized Navigation */}
          <div className="flex flex-col flex-1 min-h-0 p-3 pb-1">
            {/* Tenant Brand Identity */}
            <div className="flex items-center gap-2.5 px-1 py-1 mb-2 shrink-0 border-b border-border/70 pb-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 transition-transform hover:scale-105"
                style={{ backgroundColor: settings?.primaryColor || 'hsl(var(--primary))' }}
              >
                {tenant?.clientId?.slice(0, 2) || 'NG'}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-xs leading-tight text-foreground truncate" title={isBangla ? tenant?.name.bn : tenant?.name.en}>
                  {isBangla ? tenant?.name.bn : tenant?.name.en}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-muted text-muted-foreground border border-border">
                    {tenant?.clientId}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isBangla ? 'সক্রিয়' : 'Live'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scroll-Free Non-Dropdown Categorized Navigation */}
            <nav className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 selection:bg-transparent">
              {categories.map((cat) => {
                const catModules = enabledModulesList.filter((m) => cat.moduleIds.includes(m.id));
                if (catModules.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-0.5">
                    {/* Clean Category Header Label (Static, Non-Dropdown) */}
                    <div className="px-1.5 pt-1 pb-0.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{isBangla ? cat.name.bn : cat.name.en}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.1 rounded bg-muted/60 text-muted-foreground">
                        {catModules.length}
                      </span>
                    </div>

                    {/* Category Modules - Compact & Scroll-Free */}
                    <div className="space-y-0.5">
                      {catModules.map((mod) => {
                        const Icon = ICON_MAP[mod.icon] || LayoutDashboard;
                        const isActive = currentModule === mod.id;
                        const unreadBadge = mod.id === 'website' ? getTenantUnreadCount(tenant?.id) : 0;

                        return (
                          <button
                            key={mod.id}
                            onClick={() => onModuleChange(mod.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all group ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-105 ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                              }`} />
                              <span className="truncate leading-none">{isBangla ? mod.name.bn : mod.name.en}</span>
                            </div>
                            {unreadBadge > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-600 text-white animate-pulse">
                                {unreadBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Profile, Backup Button, Inactivity Indicator & Explicit "লগআউট" Button */}
          <div className="p-3 border-t border-border bg-card/95 space-y-2 shrink-0">
            {/* Quick Full Backup & Restore Trigger */}
            <button
              type="button"
              onClick={() => setShowBackupModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBangla ? 'ডাটা ব্যাকআপ ও রিস্টোর' : 'Data Backup & Restore'}</span>
            </button>

            {/* User Profile Card with Avatar */}
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 border border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                  {currentUser?.displayName?.bn?.slice(0, 2) || currentUser?.displayName?.en?.slice(0, 2) || 'OP'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] truncate text-foreground leading-tight">
                    {currentUser?.displayName?.bn || currentUser?.displayName?.en || 'নির্বাহী পরিচালক'}
                  </div>
                  <div className="text-[9.5px] text-muted-foreground truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{isBangla ? 'মালিক / পরিচালক' : role}</span>
                  </div>
                </div>
              </div>

              {/* Inactivity Auto-Lock Shield Indicator */}
              <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60" title="৬০ মিনিট ইনএকটিভ থাকলে অটোমেটিক লগআউট হবে">
                <Clock className="w-2.5 h-2.5" />
                <span>৬০মি</span>
              </div>
            </div>

            {/* Dedicated Explicit "লগআউট" Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full h-8 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-1.5 rounded-lg transition-all shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>{isBangla ? 'লগআউট' : 'Sign Out'}</span>
            </Button>

            {/* Switch to Super Admin Portal if authorized */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwitchToSuperAdmin}
              className="w-full text-[10.5px] justify-start h-7 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3 h-3 mr-1.5 shrink-0" />
              <span className="truncate">{isBangla ? 'সুপার এডমিন পোর্টাল' : 'Super Admin Portal'}</span>
            </Button>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* Main Content Area: Responsive Header, Breadcrumbs, Views */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {/* Desktop & Tablet Top Bar */}
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Left: Mobile Drawer Trigger & Current Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary hidden sm:block" />
                <h2 className="font-bold text-sm sm:text-base text-foreground">
                  {enabledModulesList.find((m) => m.id === currentModule)?.name[isBangla ? 'bn' : 'en'] || 'Overview'}
                </h2>
              </div>
            </div>

            {/* Right: Role Perspective Switcher, Public Website, Language Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Perspective Switcher */}
              <div className="hidden lg:flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-xl text-xs border border-border">
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
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
                  className="bg-background text-foreground font-bold text-xs h-7 px-2 rounded-lg border border-input focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                >
                  <option value="owner">{isBangla ? 'নির্বাহী পরিচালক (মালিক)' : 'Executive Director'}</option>
                  <option value="manager">{isBangla ? 'শাখা ব্যবস্থাপক (ম্যানেজার)' : 'Branch Manager'}</option>
                  <option value="field_officer">{isBangla ? 'মাঠ কর্মকর্তা (কিস্তি আদায়)' : 'Field Officer'}</option>
                </select>
              </div>

              {/* View Public Website */}
              {onViewPublicSite && (
                <button
                  onClick={onViewPublicSite}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-colors shadow-xs"
                  title={isBangla ? 'পাবলিক ওয়েবসাইট দেখুন' : 'View Public Website'}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isBangla ? 'ওয়েবসাইট দেখুন' : 'View Site'}</span>
                </button>
              )}

              {/* Language Switcher */}
              <LanguageToggle />
            </div>
          </header>

          {/* ======================================================== */}
          {/* Mobile Off-Canvas Navigation Drawer                       */}
          {/* ======================================================== */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer Container */}
              <div className="relative w-4/5 max-w-xs bg-card border-r border-border h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
                <div className="p-4 flex flex-col flex-1 min-h-0">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: settings?.primaryColor || 'hsl(var(--primary))' }}
                      >
                        {tenant?.clientId?.slice(0, 2) || 'NG'}
                      </div>
                      <span className="font-bold text-xs truncate max-w-[170px]">
                        {isBangla ? tenant?.name.bn : tenant?.name.en}
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Modules Filter */}
                  <div className="relative my-3">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder={isBangla ? 'মেনু খুঁজুন...' : 'Search modules...'}
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs bg-background"
                    />
                  </div>

                  {/* Drawer Module List */}
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {enabledModulesList
                      .filter((m) => {
                        if (!mobileSearchQuery.trim()) return true;
                        const q = mobileSearchQuery.toLowerCase();
                        return (
                          m.name.bn.toLowerCase().includes(q) ||
                          m.name.en.toLowerCase().includes(q)
                        );
                      })
                      .map((mod) => {
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
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{isBangla ? mod.name.bn : mod.name.en}</span>
                            </div>
                            {unreadBadge > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                                {unreadBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Mobile Drawer Footer with Logout */}
                <div className="p-4 border-t border-border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="truncate">{currentUser?.displayName?.bn || currentUser?.displayName?.en || 'মালিক'}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    {isBangla ? 'লগআউট করুন' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Main Module Content Slot                                  */}
          {/* ======================================================== */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {children}
          </main>

          {/* ======================================================== */}
          {/* Mobile Bottom Navigation Touch Bar                        */}
          {/* ======================================================== */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 z-40 shadow-lg">
            <button
              onClick={() => onModuleChange('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                currentModule === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>{isBangla ? 'ড্যাশবোর্ড' : 'Home'}</span>
            </button>

            <button
              onClick={() => onModuleChange('members')}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                currentModule === 'members' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              <span>{isBangla ? 'সদস্য' : 'Members'}</span>
            </button>

            <button
              onClick={() => onModuleChange('microcredit')}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                currentModule === 'microcredit' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <PiggyBank className="w-4 h-4 mb-0.5" />
              <span>{isBangla ? 'ক্ষুদ্রঋণ' : 'Loans'}</span>
            </button>

            <button
              onClick={() => onModuleChange('accounts')}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
                currentModule === 'accounts' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Receipt className="w-4 h-4 mb-0.5" />
              <span>{isBangla ? 'হিসাব' : 'Accounts'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-4 h-4 mb-0.5" />
              <span>{isBangla ? 'মেনু' : 'Menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Logout Confirmation Dialog Modal                          */}
      {/* ======================================================== */}
      <Dialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={
          <div className="flex items-center gap-2 text-foreground font-bold">
            <LogOut className="w-5 h-5 text-destructive" />
            <span>{isBangla ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Logout'}</span>
          </div>
        }
        description={
          isBangla
            ? 'আপনি কি নিশ্চিতভাবে এই এনজিও ইআরপি অ্যাকাউন্ট থেকে লগআউট করতে চান?'
            : 'Are you sure you want to sign out from your NGO ERP workspace?'
        }
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl border bg-muted/30 text-xs text-muted-foreground">
            <p>
              {isBangla
                ? 'লগআউট করার পর পুনরায় প্রবেশ করতে আপনার ইউজার আইডি এবং পাসওয়ার্ড প্রয়োজন হবে।'
                : 'You will need to enter your credentials again to log in.'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
              className="text-xs"
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              {isBangla ? 'হ্যাঁ, লগআউট করুন' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Full Tenant Data Backup & Restore Modal */}
      <DataBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
    </div>
  );
};
