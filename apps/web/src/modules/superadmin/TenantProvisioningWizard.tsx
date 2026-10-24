import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import {
  ERP_MODULES,
  DEFAULT_SUBSCRIPTION_PLANS,
  DEFAULT_NGO_CHART_OF_ACCOUNTS,
  DEFAULT_TENANT_ROLES,
  DeploymentMode,
  TenantFirebaseConfig,
  formatCurrency,
  toBanglaDigits
} from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  CheckCircle2,
  Building,
  Globe,
  Sliders,
  UserCheck,
  Rocket,
  ShieldCheck,
  Server
} from 'lucide-react';
import { buildTenantWebsiteConfig } from '../website/websiteConfig';

interface ProvisioningWizardProps {
  onSuccess: (newTenantId: string) => void;
  onCancel: () => void;
}

export const TenantProvisioningWizard: React.FC<ProvisioningWizardProps> = ({ onSuccess, onCancel }) => {
  const { isBangla, t } = useI18n();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState<string>('');
  const [nameBn, setNameBn] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#0d9488'); // Teal 600

  // Deployment Mode
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('MODE_A');
  const [firebaseConfigJson, setFirebaseConfigJson] = useState<string>('');
  const [parsedFirebaseConfig, setParsedFirebaseConfig] = useState<TenantFirebaseConfig | null>(null);

  // Plan & Modules
  const [selectedPlanId, setSelectedPlanId] = useState<string>('growth');
  const [enabledModules, setEnabledModules] = useState<string[]>([
    'dashboard',
    'organization',
    'members',
    'projects',
    'field_ops',
    'accounts',
    'hr_payroll',
    'inventory',
    'website',
    'reports',
    'settings'
  ]);

  // Owner Account
  const [ownerNameEn, setOwnerNameEn] = useState<string>('');
  const [ownerNameBn, setOwnerNameBn] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [ownerMobile, setOwnerMobile] = useState<string>('');
  const [ownerPassword, setOwnerPassword] = useState<string>('NgoPass2026!');
  const [seedDemoData, setSeedDemoData] = useState<boolean>(true);

  const handleModeChange = (mode: DeploymentMode) => {
    setDeploymentMode(mode);
    if (mode === 'MODE_B' && !firebaseConfigJson) {
      setFirebaseConfigJson(
        JSON.stringify(
          {
            apiKey: 'AIzaSyExampleDedicatedTenantKey...',
            authDomain: `${subdomain}.firebaseapp.com`,
            projectId: `${subdomain}-ngo-project`,
            storageBucket: `${subdomain}-ngo.appspot.com`,
            messagingSenderId: '1234567890',
            appId: '1:1234567890:web:abcdef123456'
          },
          null,
          2
        )
      );
    }
  };

  const handleModuleToggle = (modId: string) => {
    // Core modules are required
    const mod = ERP_MODULES.find((m) => m.id === modId);
    if (mod?.required) return;

    if (enabledModules.includes(modId)) {
      setEnabledModules(enabledModules.filter((id) => id !== modId));
    } else {
      setEnabledModules([...enabledModules, modId]);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (plan) {
      setEnabledModules(plan.allowedModules);
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!nameEn || !nameBn || !clientId) {
        setError(isBangla ? 'অনুগ্রহ করে এনজিওর ইংরেজি ও বাংলা নাম এবং ক্লায়েন্ট কোড প্রদান করুন' : 'Please provide NGO name and Client Code');
        return;
      }
    }
    if (step === 2) {
      if (!subdomain) {
        setError(isBangla ? 'সাব-ডোমেইন আবশ্যক' : 'Subdomain is required');
        return;
      }
      if (deploymentMode === 'MODE_B') {
        try {
          const parsed = JSON.parse(firebaseConfigJson);
          if (!parsed.apiKey || !parsed.projectId) {
            throw new Error('Missing apiKey or projectId');
          }
          setParsedFirebaseConfig(parsed);
        } catch {
          setError(isBangla ? 'সঠিক ফায়ারবেস কনফিগারেশন JSON প্রদান করুন' : 'Invalid Firebase Config JSON');
          return;
        }
      }
    }
    if (step === 4) {
      if (!ownerEmail || !ownerPassword || !ownerNameEn) {
        setError(isBangla ? 'মালিক অ্যাকাউন্টের সম্পূর্ণ তথ্য প্রদান করুন' : 'Please provide all owner account fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleProvisionTenant = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const tenantId = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

      const newTenant = {
        id: tenantId,
        clientId: clientId.toUpperCase(),
        subdomain,
        domain: domain || undefined,
        name: { en: nameEn, bn: nameBn },
        planId: selectedPlanId,
        status: 'active',
        deploymentMode,
        firebaseConfig: deploymentMode === 'MODE_B' ? parsedFirebaseConfig : undefined,
        enabledModules,
        quotas: {
          usersCount: 1,
          branchesCount: 1,
          estimatedDailyReads: 50,
          estimatedDailyWrites: 10,
          smsCreditsRemaining: selectedPlanId === 'enterprise' ? 5000 : selectedPlanId === 'growth' ? 1000 : 200
        },
        ownerEmail,
        ownerMobile,
        defaultPassword: ownerPassword,
        ownerPassword,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + 365 * 86400000 // 1 year
      };

      // Save to local storage registry or Firestore in client
      const existingTenants = JSON.parse(localStorage.getItem('ngo_registered_tenants') || '[]');
      const updated = [newTenant, ...existingTenants.filter((t: any) => t.id !== tenantId)];
      localStorage.setItem('ngo_registered_tenants', JSON.stringify(updated));

      // Register in domain directory lookup
      const directory = JSON.parse(localStorage.getItem('ngo_tenant_directory_cache') || '{}');
      directory[`${subdomain}.ngoerp.xyz`] = tenantId;
      directory[`${subdomain}.localhost`] = tenantId;
      if (domain) {
        directory[domain] = tenantId;
      }
      localStorage.setItem('ngo_tenant_directory_cache', JSON.stringify(directory));

      // Auto-provision initial settings, owner user, default chart of accounts, and roles
      localStorage.setItem(`ngo_settings_${tenantId}`, JSON.stringify({
        orgName: { en: nameEn, bn: nameBn },
        regNumber: 'NGO-REG-2026',
        email: ownerEmail,
        phone: ownerMobile,
        address: { en: 'Head Office', bn: 'প্রধান কার্যালয়' },
        primaryColor: '#0d9488'
      }));
      localStorage.setItem(`ngo_tenant_${tenantId}_settings`, JSON.stringify({
        orgName: { en: nameEn, bn: nameBn },
        regNumber: 'NGO-REG-2026',
        email: ownerEmail,
        phone: ownerMobile,
        address: { en: 'Head Office', bn: 'প্রধান কার্যালয়' },
        primaryColor: '#0d9488'
      }));
      localStorage.setItem(`ngo_users_${tenantId}`, JSON.stringify([{
        uid: `owner_${tenantId}`,
        tenantId,
        email: ownerEmail,
        mobile: ownerMobile,
        displayName: { en: ownerNameEn, bn: ownerNameBn },
        roleId: 'owner',
        branchId: 'all',
        status: 'active',
        password: ownerPassword,
        defaultPassword: ownerPassword,
        createdAt: Date.now()
      }]));
      localStorage.setItem(`ngo_tenant_${tenantId}_coa`, JSON.stringify(DEFAULT_NGO_CHART_OF_ACCOUNTS));
      localStorage.setItem(`ngo_tenant_${tenantId}_roles`, JSON.stringify(DEFAULT_TENANT_ROLES));
      localStorage.setItem(`ngo_website_config_${tenantId}`, JSON.stringify(buildTenantWebsiteConfig(newTenant)));

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(tenantId);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Provisioning failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b pb-4">
        {[
          { num: 1, label: isBangla ? 'সাধারণ তথ্য' : 'Organization', icon: Building },
          { num: 2, label: isBangla ? 'ডোমেইন ও হোস্টিং' : 'Domain & Cloud', icon: Globe },
          { num: 3, label: isBangla ? 'প্ল্যান ও মডিউল' : 'Plan & Modules', icon: Sliders },
          { num: 4, label: isBangla ? 'মালিক অ্যাকাউন্ট' : 'Owner Admin', icon: UserCheck },
          { num: 5, label: isBangla ? 'প্রভিশন' : 'Deploy', icon: Rocket }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : isBangla ? toBanglaDigits(s.num) : s.num}
              </div>
              <span className={`text-xs hidden md:inline font-medium ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'এনজিওর নাম (ইংরেজি) *' : 'NGO Name (English) *'}
              </label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Jagorani Development Foundation"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'এনজিওর নাম (বাংলা) *' : 'NGO Name (Bangla) *'}
              </label>
              <Input
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: জাগরণী উন্নয়ন ফাউন্ডেশন"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'ক্লায়েন্ট কোড / আইডি *' : 'Client ID Code *'}
              </label>
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value.toUpperCase())}
                placeholder="e.g. JAGORANI"
              />
              <span className="text-[11px] text-muted-foreground">
                {isBangla ? 'সদস্য কোড ও ভাউচারের প্রফিক্স হিসেবে ব্যবহৃত হবে' : 'Used as prefix for vouchers and member IDs'}
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'থিম প্রাইমারি কালার' : 'Brand Theme Color'}
              </label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border p-0.5"
                />
                <span className="text-xs font-mono">{primaryColor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Domain & Mode */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'সাব-ডোমেইন এড্রেস *' : 'Tenant Subdomain URL *'}
            </label>
            <div className="flex items-center">
              <Input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="jagorani"
                className="rounded-r-none font-mono"
              />
              <div className="px-3 h-10 border border-l-0 rounded-r-md bg-muted flex items-center text-xs text-muted-foreground font-mono">
                .ngoerp.xyz
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'কাস্টম ডোমেইন (ঐচ্ছিক)' : 'Custom Domain (Optional)'}
            </label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. www.jagoranibd.org"
            />
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {isBangla ? 'ফায়ারবেস হোস্টিং ও কোটা মোড *' : 'Firebase Deployment & Quota Mode *'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => handleModeChange('MODE_A')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  deploymentMode === 'MODE_A'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Server className="w-4 h-4 text-primary" />
                  <span>{isBangla ? 'মোড এ: প্ল্যাটফর্ম সেন্ট্রাল স্পার্ক' : 'Mode A: Shared Platform Spark'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isBangla
                    ? 'আমাদের সেন্ট্রাল ফায়ারবেস স্পার্ক প্রজেক্টে ডেটা থাকবে। দ্রুত ৩ সেকেন্ডে প্রভিশন।'
                    : 'Hosted on our central Firebase Spark project. Zero setup required.'}
                </p>
                <Badge variant="secondary" className="mt-3">
                  {isBangla ? 'ছোট এনজিওদের জন্য উপযুক্ত' : 'Recommended for Starter'}
                </Badge>
              </div>

              <div
                onClick={() => handleModeChange('MODE_B')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  deploymentMode === 'MODE_B'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isBangla ? 'মোড বি: স্বতন্ত্র ফায়ারবেস প্রজেক্ট' : 'Mode B: Tenant-Dedicated Project'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isBangla
                    ? 'এনজিওর নিজস্ব ফ্রি ফায়ারবেস প্রজেক্ট। এতে তাদের নিজস্ব ৫০,০০০ রিড/দিন কোটা বিচ্ছিন্ন থাকবে।'
                    : 'Tenant uses their own free Firebase Spark tier. Dedicated 50K daily reads.'}
                </p>
                <Badge variant="success" className="mt-3">
                  {isBangla ? 'কোটা আইসোলেশন (আনলিমিটেড স্কেল)' : '100% Free Quota Isolation'}
                </Badge>
              </div>
            </div>
          </div>

          {deploymentMode === 'MODE_B' && (
            <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
              <label className="text-xs font-semibold">
                {isBangla ? 'এনজিওর ফায়ারবেস ওয়েব কনফিগ (JSON) পেস্ট করুন *' : 'Paste Tenant Firebase Web Config JSON *'}
              </label>
              <textarea
                rows={6}
                value={firebaseConfigJson}
                onChange={(e) => setFirebaseConfigJson(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Plan & Modules */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-3">
              {isBangla ? 'সাবস্ক্রিপশন প্যাকেজ নির্বাচন করুন *' : 'Select Subscription Package *'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEFAULT_SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                    selectedPlanId === plan.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {plan.isPopular && (
                    <Badge variant="default" className="absolute -top-2.5 right-3 text-[10px]">
                      {isBangla ? 'জনপ্রিয়' : 'Popular'}
                    </Badge>
                  )}
                  <h4 className="font-bold text-sm">{plan.name}</h4>
                  <div className="text-lg font-bold text-primary mt-1">
                    {formatCurrency(plan.priceBDT, { useBanglaNumerals: isBangla })}
                    <span className="text-xs font-normal text-muted-foreground">/{isBangla ? 'মাস' : 'mo'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                  <div className="mt-3 text-[11px] text-muted-foreground space-y-1">
                    <div>• {plan.limits.users} {isBangla ? 'জন ব্যবহারকারী' : 'Users limit'}</div>
                    <div>• {plan.limits.branches} {isBangla ? 'টি শাখা' : 'Branches'}</div>
                    <div>• {plan.limits.smsCredits} {isBangla ? 'টি ফ্রি এসএমএস' : 'SMS Credits'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {isBangla ? 'মডিউল সক্রিয় / নিষ্ক্রিয় করুন' : 'Enable / Disable Modules'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ERP_MODULES.map((mod) => {
                const isEnabled = enabledModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleModuleToggle(mod.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      isEnabled
                        ? 'border-primary/50 bg-primary/5 font-semibold text-foreground'
                        : 'border-border text-muted-foreground opacity-60'
                    }`}
                  >
                    <span>{isBangla ? mod.name.bn : mod.name.en}</span>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      disabled={mod.required}
                      onChange={() => {}}
                      className="rounded text-primary cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Owner Account */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            {isBangla
              ? 'এই অ্যাকাউন্টটি এনজিওর নির্বাহী পরিচালক / প্রধানের এডমিন একাউন্ট হবে।'
              : 'This account will serve as the Executive Director / Root Owner account for this NGO.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'মালিকের নাম (ইংরেজি) *' : 'Owner Name (English) *'}
              </label>
              <Input
                value={ownerNameEn}
                onChange={(e) => setOwnerNameEn(e.target.value)}
                placeholder="Dr. Aminul Islam"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'মালিকের নাম (বাংলা) *' : 'Owner Name (Bangla) *'}
              </label>
              <Input
                value={ownerNameBn}
                onChange={(e) => setOwnerNameBn(e.target.value)}
                placeholder="ড. আমিনুল ইসলাম"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'ইমেইল এড্রেস (লগইন) *' : 'Email Address (Login) *'}
              </label>
              <Input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="director@ngo.org"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
              </label>
              <Input
                value={ownerMobile}
                onChange={(e) => setOwnerMobile(e.target.value)}
                placeholder="01712345678"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'লগইন পাসওয়ার্ড *' : 'Login Password *'}
              </label>
              <Input
                type="text"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="SecurePass123!"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={seedDemoData}
                onChange={(e) => setSeedDemoData(e.target.checked)}
                className="rounded text-primary"
              />
              <span className="font-medium">
                {isBangla
                  ? 'এনজিওর জন্য স্ট্যান্ডার্ড চার্ট অফ অ্যাকাউন্টস (হিসাব পরিকল্পনা) ও প্রাথমিক শাখা যুক্ত করুন'
                  : 'Automatically seed Standard NGO Chart of Accounts and Initial Head Office Branch'}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Deploy */}
      {step === 5 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{nameEn} ({nameBn})</span>
                <Badge variant="success">{deploymentMode}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-3 border-b">
                <div>
                  <span className="text-muted-foreground">{isBangla ? 'সাব-ডোমেইন:' : 'Subdomain:'}</span>{' '}
                  <span className="font-mono font-semibold">{subdomain}.ngoerp.xyz</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isBangla ? 'ক্লায়েন্ট আইডি:' : 'Client ID:'}</span>{' '}
                  <span className="font-semibold">{clientId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isBangla ? 'প্যাকেজ:' : 'Plan:'}</span>{' '}
                  <span className="font-semibold uppercase">{selectedPlanId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isBangla ? 'অ্যাডমিন ইমেইল:' : 'Admin Email:'}</span>{' '}
                  <span className="font-semibold">{ownerEmail}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground font-semibold block mb-1">
                  {isBangla ? 'সক্রিয় মডিউলসমূহ:' : 'Enabled Modules:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {enabledModules.map((m) => (
                    <Badge key={m} variant="secondary" className="text-[10px]">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <span className="font-bold text-foreground">
                  {isBangla ? 'স্বয়ংক্রিয় প্রভিশনিং অন্তর্ভুক্ত:' : 'Automated Provisioning Package:'}
                </span>
                <div>✔ {DEFAULT_NGO_CHART_OF_ACCOUNTS.length} {isBangla ? 'টি স্ট্যান্ডার্ড এনজিও একাউন্ট হেড' : 'Default Chart of Accounts heads'}</div>
                <div>✔ {DEFAULT_TENANT_ROLES.length} {isBangla ? 'টি সিস্টেম রোল (মালিক, ব্যবস্থাপক, মাঠ কর্মকর্তা, কর্মী)' : 'System Roles with RBAC permissions'}</div>
                <div>✔ {isBangla ? 'পাবলিক ওয়েবসাইট সিএমএস স্কেলিটন ও এসইও মেটা' : 'Public NGO Website CMS Skeleton & Meta'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
          {step === 1 ? (isBangla ? 'বাতিল' : 'Cancel') : (isBangla ? 'আগের ধাপ' : 'Previous')}
        </Button>

        {step < 5 ? (
          <Button onClick={handleNextStep}>
            {isBangla ? 'পরবর্তী ধাপ' : 'Next Step'}
          </Button>
        ) : (
          <Button
            onClick={handleProvisionTenant}
            isLoading={isSubmitting}
            variant="success"
            className="px-6"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {isBangla ? 'এনজিও প্রভিশন সম্পন্ন করুন' : 'Confirm & Provision NGO'}
          </Button>
        )}
      </div>
    </div>
  );
};
