import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useAuth } from '../../core/auth/AuthContext';
import { ERP_MODULES, ErpModuleMeta, toBanglaDigits } from '@ngo-erp/shared';
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

  // Live Bengali Day, Date & Clock for Top Header Bar
  const [currentBanglaDateTime, setCurrentBanglaDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const banglaMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const dayName = banglaDays[now.getDay()];
      const dayNum = toBanglaDigits(now.getDate());
      const monthName = banglaMonths[now.getMonth()];
      const year = toBanglaDigits(now.getFullYear());

      let hours = now.getHours();
      const minutes = toBanglaDigits(now.getMinutes().toString().padStart(2, '0'));
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = toBanglaDigits(hours.toString().padStart(2, '0'));

      setCurrentBanglaDateTime(`${dayName}, ${dayNum} ${monthName} ${year} | ${hoursStr}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

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
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card justify-between shrink-0 h-screen sticky top-0 overflow-hidden shadow-xs">
          {/* Top Section: Brand Header & Categorized Navigation */}
          <div className="flex flex-col flex-1 min-h-0 p-3 pb-1">
            {/* Tenant Brand Identity */}
            <div className="flex items-center gap-2.5 px-1 py-1 mb-2.5 shrink-0 border-b border-border/80 pb-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shadow-xs shrink-0 transition-transform hover:scale-105"
                style={{ backgroundColor: settings?.primaryColor || '#059669' }}
              >
                {tenant?.clientId?.slice(0, 2) || 'NG'}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-xs leading-tight text-slate-900 truncate" title={isBangla ? tenant?.name.bn : tenant?.name.en}>
                  {isBangla ? tenant?.name.bn : tenant?.name.en}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {tenant?.clientId}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isBangla ? 'সক্রিয়' : 'Live'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scroll-Free Non-Dropdown Categorized Navigation */}
            <nav className="flex-1 overflow-hidden space-y-1 pr-0.5 selection:bg-transparent">
              {categories.map((cat) => {
                const catModules = enabledModulesList.filter((m) => cat.moduleIds.includes(m.id));
                if (catModules.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-0.5">
                    {/* Clean Category Header Label (High Contrast, Static) */}
                    <div className="px-2 py-0.5 flex items-center justify-between rounded bg-slate-100/90 border border-slate-200/60 mb-0.5">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wide text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{isBangla ? cat.name.bn : cat.name.en}</span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.1 rounded bg-white text-slate-600 border border-slate-200">
                        {catModules.length}
                      </span>
                    </div>

                    {/* Category Modules - High Contrast, Compact & Scroll-Free */}
                    <div className="space-y-0.5">
                      {catModules.map((mod) => {
                        const Icon = ICON_MAP[mod.icon] || LayoutDashboard;
                        const isActive = currentModule === mod.id;
                        const unreadBadge = mod.id === 'website' ? getTenantUnreadCount(tenant?.id) : 0;

                        return (
                          <button
                            key={mod.id}
                            onClick={() => onModuleChange(mod.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11.5px] transition-all group ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-bold'
                                : 'text-slate-800 font-semibold hover:text-emerald-700 hover:bg-emerald-50/90'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-105 ${
                                isActive ? 'text-white' : 'text-slate-600 group-hover:text-emerald-600'
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

          {/* Bottom Section: Compact Full Backup & Restore Trigger Only (Scroll-Free) */}
          <div className="p-2.5 border-t border-border bg-card shrink-0">
            <button
              type="button"
              onClick={() => setShowBackupModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-2 text-[11.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'ডাটা ব্যাকআপ ও রিস্টোর' : 'Data Backup & Restore'}</span>
            </button>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* Main Content Area: Responsive Header, Breadcrumbs, Views */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {/* Desktop & Tablet Top Bar (With Logout, NGO Name, Safe Timer, Logo, Bar & Date) */}
          <header className="h-16 border-b border-border bg-card/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Left: Mobile Drawer Trigger, Current Section Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-white text-xs shadow-2xs shrink-0 md:hidden"
                  style={{ backgroundColor: settings?.primaryColor || '#059669' }}
                >
                  {tenant?.clientId?.slice(0, 2) || 'NG'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-none">
                      {enabledModulesList.find((m) => m.id === currentModule)?.name[isBangla ? 'bn' : 'en'] || 'Overview'}
                    </h2>
                    <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {tenant?.clientId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate hidden sm:block mt-0.5">
                    {isBangla ? tenant?.name.bn : tenant?.name.en}
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Live Bengali Day, Date & Clock */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold font-sans tracking-wide">
                {currentBanglaDateTime}
              </span>
            </div>

            {/* Right: Inactivity Timer, Role Selector, User Profile Card, Public Site, Super Admin Return, and Explicit LOGOUT */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Safe Inactivity Session Indicator (৬০ মিনিট) */}
              <div
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs"
                title="৬০ মিনিট ইনএকটিভ থাকলে নিরাপত্তার জন্য স্বয়ংক্রিয়ভাবে লগআউট হবে"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isBangla ? 'নিরাপদ সময়: ৬০মি.' : 'Safe Session: 60m'}</span>
              </div>

              {/* User Profile Badge (Director / Owner) */}
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                  {currentUser?.displayName?.bn?.slice(0, 2) || currentUser?.displayName?.en?.slice(0, 2) || 'নি'}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-bold text-[11px] text-slate-900 truncate leading-none">
                    {currentUser?.displayName?.bn || currentUser?.displayName?.en || 'নির্বাহী পরিচালক'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 leading-none">
                    {isBangla ? 'মালিক / পরিচালক' : role}
                  </div>
                </div>
              </div>

              {/* View Public Website */}
              {onViewPublicSite && (
                <button
                  onClick={onViewPublicSite}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  title={isBangla ? 'পাবলিক ওয়েবসাইট দেখুন' : 'View Public Website'}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">{isBangla ? 'ওয়েবসাইট' : 'Website'}</span>
                </button>
              )}

              {/* Switch to Super Admin Portal if authorized or impersonating */}
              {(isImpersonating || currentUser?.email?.includes('superadmin')) && (
                <button
                  onClick={onSwitchToSuperAdmin}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
                  title="সুপার এডমিন পোর্টালে ফিরে যান"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-[11px]">{isBangla ? 'সুপার এডমিন' : 'Super Admin'}</span>
                </button>
              )}

              {/* Language Switcher */}
              <LanguageToggle />

              {/* Dedicated Top Bar "লগআউট" Button */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-sm"
                title={isBangla ? 'নিরাপদে লগআউট করুন' : 'Sign Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isBangla ? 'লগআউট' : 'Sign Out'}</span>
              </button>
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
