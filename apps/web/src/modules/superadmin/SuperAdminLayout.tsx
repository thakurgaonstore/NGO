import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useAuth } from '../../core/auth/AuthContext';
import { LanguageToggle } from '../../components/shared/LanguageToggle';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { QuotaBadge } from '../../components/shared/QuotaBadge';
import { Button } from '../../components/ui/button';
import {
  LayoutDashboard,
  Building2,
  SlidersHorizontal,
  Database,
  Settings,
  LogOut,
  Shield,
  Layers,
  Menu,
  X,
  Globe
} from 'lucide-react';

interface SuperAdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onExitSuperAdmin: () => void;
  onViewPlatformHome?: () => void;
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onExitSuperAdmin,
  onViewPlatformHome,
  children
}) => {
  const { isBangla, t } = useI18n();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'overview', label: isBangla ? 'গ্লোবাল ড্যাশবোর্ড' : 'Overview', icon: LayoutDashboard },
    { id: 'tenants', label: isBangla ? 'এনজিও টেন্যান্টসমূহ' : 'Tenants', icon: Building2 },
    { id: 'plans', label: isBangla ? 'সাবস্ক্রিপশন প্ল্যান' : 'Plans & Pricing', icon: SlidersHorizontal },
    { id: 'platform_cms', label: isBangla ? 'প্ল্যাটফর্ম ওয়েবসাইট সিএমএস' : 'Platform Website CMS', icon: Globe },
    { id: 'quotas', label: isBangla ? 'স্পার্ক কোটা গার্ড' : 'Spark Quota Guard', icon: Database },
    { id: 'settings', label: isBangla ? 'প্ল্যাটফর্ম সেটিংস' : 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-sm p-4 justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight">NGO ERP SaaS</h1>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Shield className="w-3 h-3" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer in Sidebar */}
        <div className="pt-4 border-t border-border space-y-2">
          {onViewPlatformHome && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewPlatformHome}
              className="w-full text-xs justify-start text-primary border-primary/30 hover:bg-primary/10"
            >
              <Globe className="w-4 h-4 mr-2" />
              {isBangla ? 'মূল ওয়েবসাইট দেখুন' : 'View Platform Website'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onExitSuperAdmin}
            className="w-full text-xs justify-start text-muted-foreground hover:text-foreground"
          >
            <Building2 className="w-4 h-4 mr-2" />
            {isBangla ? 'ক্লায়েন্ট পোর্টালে যান' : 'Go to Client ERP'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full text-xs justify-start text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isBangla ? 'লগআউট' : 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="font-bold text-sm sm:text-base hidden sm:block">
              {navItems.find((n) => n.id === currentTab)?.label}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <QuotaBadge reads={4960} maxReads={50000} />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 border-b bg-card space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
