import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Building2,
  CloudUpload,
  MessageSquare,
  CreditCard,
  Save,
  CheckCircle2,
  Lock,
  Key,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react';

export const TenantSettingsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { settings, tenant } = useTenant();

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile Form - Initialize from tenant directly so custom tenants get their actual values
  const [orgNameEn, setOrgNameEn] = useState<string>(tenant?.name?.en || settings?.orgName?.en || 'NGO ERP');
  const [orgNameBn, setOrgNameBn] = useState<string>(tenant?.name?.bn || settings?.orgName?.bn || 'এনজিও ইআরপি');
  const [regNumber, setRegNumber] = useState<string>(settings?.regNumber || 'NGO-DH-2026-892');
  const [phone, setPhone] = useState<string>(tenant?.ownerMobile || settings?.phone || '01712-345678');
  const [email, setEmail] = useState<string>(tenant?.ownerEmail || settings?.email || 'info@ngoerp.xyz');
  const [addressEn, setAddressEn] = useState<string>(settings?.address?.en || 'Dhaka, Bangladesh');
  const [addressBn, setAddressBn] = useState<string>(settings?.address?.bn || 'ঢাকা, বাংলাদেশ');
  const [primaryColor, setPrimaryColor] = useState<string>(settings?.primaryColor || '#0d9488');

  // Password Update
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Cloudinary
  const [cloudName, setCloudName] = useState<string>(settings?.cloudinary?.cloudName || 'ngo-cloud-media');
  const [uploadPreset, setUploadPreset] = useState<string>(settings?.cloudinary?.unsignedPreset || 'ngo_unsigned_preset');

  // SMS
  const [smsProvider, setSmsProvider] = useState<'bulksmsbd' | 'mimsms' | 'generic'>(settings?.smsConfig?.provider || 'bulksmsbd');
  const [smsSenderId, setSmsSenderId] = useState<string>(settings?.smsConfig?.senderId || '8809612345678');
  const [smsApiKey, setSmsApiKey] = useState<string>(settings?.smsConfig?.apiKey || 'mock_api_key_bulksmsbd');

  // Payment
  const [bkashEnabled, setBkashEnabled] = useState<boolean>(settings?.paymentConfig?.bkashEnabled ?? true);
  const [bkashNumber, setBkashNumber] = useState<string>(settings?.paymentConfig?.bkashMerchantNumber || '01700-112233');
  const [nagadEnabled, setNagadEnabled] = useState<boolean>(settings?.paymentConfig?.nagadEnabled ?? true);
  const [nagadNumber, setNagadNumber] = useState<string>(settings?.paymentConfig?.nagadMerchantNumber || '01800-445566');

  const handleSave = () => {
    setPasswordError(null);

    if (newPassword) {
      if (newPassword.length < 6) {
        setPasswordError(isBangla ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!' : 'Password must be at least 6 characters!');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError(isBangla ? 'নতুন পাসওয়ার্ড দুটি মেলেনি!' : 'Passwords do not match!');
        return;
      }
    }

    const tenantId = tenant?.id || 'demo-ngo';

    const updated = {
      ...settings,
      orgName: { en: orgNameEn, bn: orgNameBn },
      regNumber,
      phone,
      email,
      address: { en: addressEn, bn: addressBn },
      primaryColor,
      cloudinary: { cloudName, unsignedPreset: uploadPreset },
      smsConfig: { provider: smsProvider, senderId: smsSenderId, apiKey: smsApiKey, enabled: true },
      paymentConfig: {
        bkashEnabled,
        bkashMerchantNumber: bkashNumber,
        nagadEnabled,
        nagadMerchantNumber: nagadNumber,
        rocketEnabled: false,
        sslCommerzEnabled: false
      }
    };

    // 1. Save settings in local storage
    localStorage.setItem(`ngo_settings_${tenantId}`, JSON.stringify(updated));
    localStorage.setItem(`ngo_tenant_${tenantId}_settings`, JSON.stringify(updated));

    // 2. Update tenant definition in registered tenants list
    let updatedTenantData: any = null;
    const rawTenants = localStorage.getItem('ngo_registered_tenants');
    if (rawTenants) {
      try {
        const list = JSON.parse(rawTenants);
        const newList = list.map((t: any) => {
          if (t.id === tenantId || t.clientId === tenant?.clientId) {
            const ut = {
              ...t,
              name: { en: orgNameEn, bn: orgNameBn },
              ownerEmail: email,
              ownerMobile: phone,
              defaultPassword: newPassword ? newPassword : (t.defaultPassword || 'NgoPass2026!'),
              ownerPassword: newPassword ? newPassword : (t.ownerPassword || 'NgoPass2026!'),
              updatedAt: Date.now()
            };
            updatedTenantData = ut;
            return ut;
          }
          return t;
        });
        localStorage.setItem('ngo_registered_tenants', JSON.stringify(newList));
      } catch {}
    }

    // 3. Update staff & owner user list
    const rawUsers = localStorage.getItem(`ngo_users_${tenantId}`);
    const usersList = rawUsers ? JSON.parse(rawUsers) : [];
    let hasOwner = false;
    const newUsersList = usersList.map((u: any) => {
      if (u.roleId === 'owner' || (u.email && u.email.toLowerCase() === tenant?.ownerEmail?.toLowerCase())) {
        hasOwner = true;
        return {
          ...u,
          email,
          mobile: phone,
          displayName: { en: orgNameEn, bn: orgNameBn },
          ...(newPassword ? { password: newPassword, defaultPassword: newPassword } : {})
        };
      }
      return u;
    });
    if (!hasOwner) {
      newUsersList.unshift({
        uid: `owner_${tenantId}`,
        tenantId,
        email,
        mobile: phone,
        displayName: { en: orgNameEn, bn: orgNameBn },
        roleId: 'owner',
        branchId: 'all',
        status: 'active',
        password: newPassword || 'NgoPass2026!',
        defaultPassword: newPassword || 'NgoPass2026!',
        createdAt: Date.now()
      });
    }
    localStorage.setItem(`ngo_users_${tenantId}`, JSON.stringify(newUsersList));

    // 4. Update active demo user session if owner
    const rawDemoUser = localStorage.getItem('ngo_demo_user');
    if (rawDemoUser) {
      try {
        const demoUser = JSON.parse(rawDemoUser);
        if (demoUser.tenantId === tenantId && demoUser.roleId === 'owner') {
          demoUser.email = email;
          demoUser.mobile = phone;
          demoUser.displayName = { en: orgNameEn, bn: orgNameBn };
          localStorage.setItem('ngo_demo_user', JSON.stringify(demoUser));
        }
      } catch {}
    }

    // 5. Broadcast tenant updated event
    if (updatedTenantData) {
      window.dispatchEvent(new CustomEvent('ngo_tenant_updated', { detail: updatedTenantData }));
    }
    window.dispatchEvent(new Event('storage'));

    setSavedSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isBangla ? 'প্রতিষ্ঠান ও সিস্টেম সেটিংস' : 'Organization & System Settings'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'এনজিও প্রোফাইল, মালিকের মোবাইল ও পাসওয়ার্ড পরিবর্তন, এসএমএস ও পেমেন্ট কনফিগারেশন।'
              : 'Manage NGO profile, owner mobile & password, SMS gateways, and payment services.'}
          </p>
        </div>

        <Button onClick={handleSave} className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs">
          <Save className="w-4 h-4 mr-1.5" />
          {isBangla ? 'সেটিংস সংরক্ষণ করুন' : 'Save Changes'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isBangla
              ? 'আলহামদুলিল্লাহ! এনজিওর তথ্য, মোবাইল নম্বর এবং পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে।'
              : 'NGO profile, mobile number, and password updated successfully!'}
          </span>
        </div>
      )}

      {passwordError && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{passwordError}</span>
        </div>
      )}

      {/* 1. Organization Profile */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>{isBangla ? 'এনজিওর সাধারণ তথ্য' : 'Organization Profile'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'এনজিওর নাম (ইংরেজি) *' : 'Name (English) *'}</label>
              <Input value={orgNameEn} onChange={(e) => setOrgNameEn(e.target.value)} />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'এনজিওর নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
              <Input value={orgNameBn} onChange={(e) => setOrgNameBn(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'নিবন্ধন নম্বর (NGOAB/সমাজসেবা)' : 'Registration No'}</label>
              <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'অফিসিয়াল ইমেইল' : 'Email Address'}</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'হটলাইন / মোবাইল নম্বর' : 'Contact Phone'}</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'ঠিকানা (ইংরেজি)' : 'Address (English)'}</label>
              <Input value={addressEn} onChange={(e) => setAddressEn(e.target.value)} />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'ঠিকানা (বাংলা)' : 'Address (Bangla)'}</label>
              <Input value={addressBn} onChange={(e) => setAddressBn(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Owner Account & Password Update */}
      <Card className="border-emerald-500/30">
        <CardHeader className="pb-3 border-b bg-emerald-500/5">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'মালিকের লগইন ক্রেডেনশিয়াল ও পাসওয়ার্ড পরিবর্তন' : 'Owner Login Credentials & Password'}</span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {tenant?.clientId || 'NGO'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <p className="text-muted-foreground">
            {isBangla
              ? 'মালিকের মোবাইল নম্বর ও পাসওয়ার্ড আপডেট করলে সুপার এডমিন প্যানেল এবং মোবাইল লগইন উভয় স্থানেই তাৎক্ষণিক পরিবর্তিত হবে।'
              : 'Updating mobile and password here will immediately sync with Super Admin and Universal Login.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{isBangla ? 'মালিকের লগইন ইমেইল *' : 'Owner Login Email *'}</span>
              </label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBangla ? 'মালিকের লগইন মোবাইল নম্বর *' : 'Owner Login Mobile *'}</span>
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01712-345678" />
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-3">
            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBangla ? 'পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)' : 'Change Login Password (Optional)'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">
                  {isBangla ? 'নতুন পাসওয়ার্ড লিখুন' : 'New Password'}
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর (যেমন: NgoPass2026!)"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">
                  {isBangla ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {isBangla
                ? 'পাসওয়ার্ড অপরিবর্তিত রাখতে চাইলে খালি রাখুন। পরিবর্তন করতে চাইলে লিখে "সেটিংস সংরক্ষণ করুন" বাটনে ক্লিক করুন।'
                : 'Leave blank to keep your current password. Type a new password and save to update.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Cloudinary Media Storage */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-sky-600" />
            <span>{isBangla ? 'ক্লাউডিনারি মিডিয়া স্টোরেজ' : 'Cloudinary Media Configuration'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <p className="text-muted-foreground">
            {isBangla
              ? 'সদস্যদের ছবি, এনআইডি স্ক্যান ও ভাউচার ডকুমেন্টস ক্লাউডিনারিতে আপলোড হবে। এতে ফায়ারবেস স্টোরেজ খরচ শূন্য থাকে।'
              : 'Member photos, NID scans, and voucher attachments are uploaded to Cloudinary, ensuring zero Firebase storage consumption.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold">Cloudinary Cloud Name</label>
              <Input value={cloudName} onChange={(e) => setCloudName(e.target.value)} />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">Unsigned Upload Preset</label>
              <Input value={uploadPreset} onChange={(e) => setUploadPreset(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Bangladeshi Bulk SMS Gateway */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{isBangla ? 'বাংলাদেশি বাল্ক এসএমএস গেটওয়ে' : 'Bangladeshi Bulk SMS Gateway'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'এসএমএস প্রোভাইডার' : 'SMS Provider'}</label>
              <select
                value={smsProvider}
                onChange={(e) => setSmsProvider(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="bulksmsbd">BulkSMSBD.net</option>
                <option value="mimsms">MiMSMS.com</option>
                <option value="generic">Generic REST API</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'অনুমোদিত সেন্ডার আইডি' : 'Approved Sender ID'}</label>
              <Input value={smsSenderId} onChange={(e) => setSmsSenderId(e.target.value)} placeholder="e.g. 88096..." />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">Gateway API Key</label>
              <Input type="password" value={smsApiKey} onChange={(e) => setSmsApiKey(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Mobile Financial Services (bKash & Nagad) */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-600" />
            <span>{isBangla ? 'মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (বিকাশ ও নগদ)' : 'Mobile Financial Services (bKash & Nagad)'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-rose-600">
                <input
                  type="checkbox"
                  checked={bkashEnabled}
                  onChange={(e) => setBkashEnabled(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>{isBangla ? 'বিকাশ মার্চেন্ট অ্যাকাউন্ট সক্রিয়' : 'Enable bKash Merchant'}</span>
              </label>
              <Input
                placeholder="bKash Merchant Wallet Number"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
              />
            </div>

            <div className="p-3 border rounded-lg space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-600">
                <input
                  type="checkbox"
                  checked={nagadEnabled}
                  onChange={(e) => setNagadEnabled(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>{isBangla ? 'নগদ মার্চেন্ট অ্যাকাউন্ট সক্রিয়' : 'Enable Nagad Merchant'}</span>
              </label>
              <Input
                placeholder="Nagad Merchant Wallet Number"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
