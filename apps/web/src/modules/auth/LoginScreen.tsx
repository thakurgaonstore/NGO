import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useAuth } from '../../core/auth/AuthContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { UserRole } from '@ngo-erp/shared';
import { isTenantDeleted } from '../../core/tenant/tenantCleanupService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { LanguageToggle } from '../../components/shared/LanguageToggle';
import {
  Layers,
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Sparkles,
  Phone,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (isSuperAdmin: boolean) => void;
  initialPortal?: 'client' | 'superadmin';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, initialPortal }) => {
  const { isBangla, t } = useI18n();
  const {
    signInWithStaffCredentials,
    loginAsSuperAdminMock,
    loginAsTenantMock,
    mustChangePassword,
    updateUserPassword
  } = useAuth();
  const { tenant, resolution } = useTenant();

  // Detect if on /mahinerp path or custom domain
  const isMahinErpPath = window.location.pathname.startsWith('/mahinerp') || window.location.pathname.startsWith('/superadmin');
  const hasCustomDomain = Boolean(resolution.isCustomDomainOrSubdomain);
  const hasKnownDomain = Boolean(resolution.isCustomDomainOrSubdomain || (resolution.source === 'path' && resolution.clientId));

  const [activeTab, setActiveTab] = useState<'client' | 'superadmin'>(() => {
    if (hasCustomDomain) return 'client';
    if (initialPortal) return initialPortal;
    return isMahinErpPath ? 'superadmin' : 'client';
  });

  // Client Login Credentials (clean initial state, no leftover dummy pre-fills)
  const [clientId, setClientId] = useState<string>(() => resolution.clientId || (hasKnownDomain && tenant?.clientId ? tenant.clientId : ''));
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available registered tenants for quick fill
  const availableTenants = useMemo(() => {
    try {
      const raw = localStorage.getItem('ngo_registered_tenants');
      const list = raw ? JSON.parse(raw) : [];
      const active = Array.isArray(list) ? list.filter((t: any) => !isTenantDeleted(t.id) && !isTenantDeleted(t.clientId)) : [];
      if (active.length > 0) return active;
    } catch {}
    return [
      {
        id: 'tgps',
        clientId: 'TGPS',
        name: {
          bn: 'ঠাকুরগাঁও গ্রীন প্র্যাকটিস সোসাইটি (TGPS)',
          en: 'Thakurgaon Green Practice Society (TGPS)'
        },
        ownerMobile: '01811544992',
        defaultPassword: 'NgoPass2026!'
      }
    ];
  }, []);

  // Password Change Modal State
  const [isChangePassOpen, setIsChangePassOpen] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changePassSuccess, setChangePassSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (resolution.clientId) {
      setClientId(resolution.clientId);
    } else if (hasKnownDomain && tenant?.clientId) {
      setClientId(tenant.clientId);
    }
  }, [resolution.clientId, tenant?.clientId, hasKnownDomain]);

  useEffect(() => {
    if (mustChangePassword) {
      setIsChangePassOpen(true);
    }
  }, [mustChangePassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'superadmin') {
        if (identifier.includes('superadmin') || identifier === '01711000000' || password === 'MahinAdmin2026!' || password === 'NgoPass2026!') {
          loginAsSuperAdminMock();
          onLoginSuccess(true);
          return;
        }
        loginAsSuperAdminMock();
        onLoginSuccess(true);
      } else {
        const targetId = hasKnownDomain ? (tenant?.clientId || clientId) : clientId;
        const result = await signInWithStaffCredentials(targetId, identifier, password);
        if (result.success) {
          onLoginSuccess(false);
        } else {
          setError(result.error || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole, isSA: boolean = false) => {
    if (isSA) {
      loginAsSuperAdminMock();
      onLoginSuccess(true);
    } else {
      let targetTenantId = 'tgps';
      try {
        const raw = localStorage.getItem('ngo_registered_tenants');
        const list = raw ? JSON.parse(raw) : [];
        const match = list.find(
          (t: any) =>
            !isTenantDeleted(t.id) &&
            !isTenantDeleted(t.clientId) &&
            clientId &&
            (t.clientId?.toUpperCase() === clientId.trim().toUpperCase() ||
              t.id?.toLowerCase() === clientId.trim().toLowerCase() ||
              t.subdomain?.toLowerCase() === clientId.trim().toLowerCase())
        );
        if (match) targetTenantId = match.id;
      } catch {}

      loginAsTenantMock(demoRole, targetTenantId);
      onLoginSuccess(false);
    }
  };

  const handleSaveNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }
    await updateUserPassword(newPassword);
    setChangePassSuccess(true);
    setTimeout(() => {
      setIsChangePassOpen(false);
      setChangePassSuccess(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar with Language and Theme */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base block leading-none">
              {hasKnownDomain ? (isBangla ? tenant?.name.bn : tenant?.name.en) : 'NGO ERP SaaS'}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {hasKnownDomain ? `${tenant?.clientId} Portal` : 'Multi-Tenant Platform'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
        </div>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto my-6">
        <Card className="border-border shadow-2xl">
          <CardHeader className="text-center pb-3">
            {/* Tab switch between Client (/cerp) and SuperAdmin (/mahinerp) - hidden on custom domain */}
            {!hasCustomDomain && (
              <div className="flex p-1 bg-muted rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('client');
                    window.history.replaceState(null, '', '/cerp');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'client'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isBangla ? 'এনজিও কর্মী / গ্রাহক লগইন (/cerp)' : 'Client ERP Portal (/cerp)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('superadmin');
                    setIdentifier('superadmin@ngoerp.xyz');
                    window.history.replaceState(null, '', '/mahinerp');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'superadmin'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isBangla ? 'সুপার এডমিন (/mahinerp)' : 'Super Admin (/mahinerp)'}
                </button>
              </div>
            )}

            <CardTitle className="text-lg font-bold">
              {activeTab === 'superadmin'
                ? (isBangla ? 'সুপার এডমিন প্ল্যাটফর্ম পোর্টাল' : 'Super Admin Master Portal')
                : hasKnownDomain
                ? (isBangla ? `${tenant?.name.bn} পোর্টালে লগইন` : `Sign in to ${tenant?.name.en}`)
                : (isBangla ? 'এনজিও ইআরপি পোর্টালে লগইন' : 'NGO ERP Staff Login')}
            </CardTitle>
            <CardDescription className="text-xs">
              {activeTab === 'superadmin'
                ? (isBangla ? 'সেন্ট্রাল টেন্যান্ট ও সিস্টেম কন্ট্রোল' : 'Central Multi-Tenant Platform Control')
                : (isBangla ? 'আপনার এনজিও আইডি, মোবাইল ও পাসওয়ার্ড দিন' : 'Enter your NGO ID, Mobile & Password')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                  {error}
                </div>
              )}

              {/* 1. NGO ID Field — ONLY required if on main domain, BYPASSED if on custom domain */}
              {activeTab === 'client' && (
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'এনজিও আইডি / কোড (NGO ID) *' : 'NGO ID / Client Code *'}
                    </label>
                    {hasKnownDomain && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {isBangla ? 'ডোমেইন থেকে স্বয়ংক্রিয়ভাবে শনাক্ত' : 'Auto-detected by Domain'}
                      </span>
                    )}
                  </div>

                  {hasKnownDomain ? (
                    <div className="mt-1 p-2.5 rounded-lg border bg-muted/40 flex items-center justify-between text-xs font-mono font-bold text-primary">
                      <span>{tenant?.clientId}</span>
                      <span className="text-[10px] text-muted-foreground font-sans font-normal">
                        ({isBangla ? tenant?.name.bn : tenant?.name.en})
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 mt-1">
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value.toUpperCase())}
                          placeholder="e.g. TGPS"
                          className="pl-9 font-mono uppercase"
                          required
                        />
                      </div>
                      {availableTenants.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {isBangla ? 'ক্লিক করে পূরণ করুন:' : 'Quick Select:'}
                          </span>
                          {availableTenants.map((t: any) => (
                            <button
                              key={t.id || t.clientId}
                              type="button"
                              onClick={() => {
                                setClientId(t.clientId || t.id);
                                if (t.ownerMobile) setIdentifier(t.ownerMobile);
                                setPassword(t.defaultPassword || t.ownerPassword || 'NgoPass2026!');
                              }}
                              className="px-2 py-0.5 text-[10.5px] rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-2xs"
                              title="ক্লিক করলে এনজিও কোড, মোবাইল ও পাসওয়ার্ড পূরণ হবে"
                            >
                              <span className="font-mono font-bold text-emerald-700">{t.clientId}</span>
                              <span className="max-w-[140px] truncate">({t.name?.bn || t.name?.en})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Mobile or Email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  {activeTab === 'superadmin'
                    ? (isBangla ? 'সুপার এডমিন ইমেইল / মোবাইল' : 'Super Admin Email / Mobile')
                    : (isBangla ? 'মোবাইল নম্বর অথবা ইমেইল *' : 'Staff Mobile Number or Email *')}
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeTab === 'superadmin' ? 'superadmin@ngoerp.xyz' : '01712-345678 or name@ngo.org'}
                    className="pl-9 font-mono"
                    required
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'পাসওয়ার্ড (Password) *' : 'Password *'}
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {isBangla ? 'ডিফল্ট: NgoPass2026!' : 'Default: NgoPass2026!'}
                  </span>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full text-xs font-semibold mt-1 h-10">
                {isBangla ? 'লগইন করুন' : 'Sign In'}
              </Button>
            </form>

            {/* Quick Demo One-Click Sign In Bar */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between mb-2">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {isBangla ? 'এক ক্লিকে ডেমো লগইন:' : 'Quick One-Click Test Login:'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemoLogin('owner', true)}
                  className="h-8 text-[11px] justify-start text-primary font-bold"
                >
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  Super Admin
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemoLogin('field_officer', false)}
                  className="h-8 text-[11px] justify-start text-amber-600 font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  মাঠকর্মী (Field PWA)
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemoLogin('owner', false)}
                  className="h-8 text-[11px] justify-start text-emerald-600 font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  নির্বাহী পরিচালক (Owner)
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemoLogin('manager', false)}
                  className="h-8 text-[11px] justify-start text-sky-600 font-bold"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  ম্যানেজার (Manager)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Force Password Change Modal (Shown when logging in with Default Password) */}
      <Dialog
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <KeyRound className="w-5 h-5" />
            <span>{isBangla ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Default Password'}</span>
          </div>
        }
        description={
          isBangla
            ? 'আপনি প্রাথমিক ডিফল্ট পাসওয়ার্ড দিয়ে লগইন করেছেন। নিরাপত্তার স্বার্থে আপনার নতুন গোপন পাসওয়ার্ড সেট করুন।'
            : 'You are using a default password. Please choose a new secure password.'
        }
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {changePassSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isBangla ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password updated successfully!'}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'নতুন গোপন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'New Password *'}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'নতুন পাসওয়ার্ড আবার লিখুন (Confirm) *' : 'Confirm New Password *'}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsChangePassOpen(false)} className="text-xs">
              {isBangla ? 'পরে করব' : 'Later'}
            </Button>
            <Button onClick={handleSaveNewPassword} className="text-xs">
              {isBangla ? 'পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন' : 'Update Password'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-2">
        <span>© 2026 NGO ERP SaaS Platform • Super Admin: <code>/mahinerp</code> • Client: <code>/cerp</code></span>
      </footer>
    </div>
  );
};
