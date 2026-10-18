import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, CloudUpload, MessageSquare, CreditCard, Save, CheckCircle2 } from 'lucide-react';

export const TenantSettingsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { settings, tenant } = useTenant();

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Profile Form
  const [orgNameEn, setOrgNameEn] = useState<string>(settings?.orgName?.en || 'Jagorani Development Society');
  const [orgNameBn, setOrgNameBn] = useState<string>(settings?.orgName?.bn || 'জাগরণী উন্নয়ন সমিতি');
  const [regNumber, setRegNumber] = useState<string>(settings?.regNumber || 'NGO-DH-2024-892');
  const [phone, setPhone] = useState<string>(settings?.phone || '01711-223344');
  const [email, setEmail] = useState<string>(settings?.email || 'info@jagorani.org');
  const [addressEn, setAddressEn] = useState<string>(settings?.address?.en || 'House 14, Road 5, Dhanmondi, Dhaka');
  const [addressBn, setAddressBn] = useState<string>(settings?.address?.bn || 'বাড়ি ১৪, রোড ৫, ধানমন্ডি, ঢাকা');
  const [primaryColor, setPrimaryColor] = useState<string>(settings?.primaryColor || '#0d9488');

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
    localStorage.setItem(`ngo_settings_${tenant?.id}`, JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'প্রতিষ্ঠান ও সিস্টেম সেটিংস' : 'Organization & System Settings'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'এনজিও প্রোফাইল, ক্লাউডিনারি মিডিয়া, বাল্ক এসএমএস এবং বিকাশ/নগদ পেমেন্ট কনফিগারেশন।'
              : 'Manage NGO profile, Cloudinary storage, SMS gateways, and mobile financial services.'}
          </p>
        </div>

        <Button onClick={handleSave} className="text-xs h-9">
          <Save className="w-4 h-4 mr-1.5" />
          {isBangla ? 'সেটিংস সংরক্ষণ করুন' : 'Save Changes'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{isBangla ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings updated and saved successfully!'}</span>
        </div>
      )}

      {/* 1. Organization Profile */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>{isBangla ? 'এনজিওর সাধারণ তথ্য' : 'Organization Profile'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'এনজিওর নাম (ইংরেজি)' : 'Name (English)'}</label>
              <Input value={orgNameEn} onChange={(e) => setOrgNameEn(e.target.value)} />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold">{isBangla ? 'এনজিওর নাম (বাংলা)' : 'Name (Bangla)'}</label>
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
              <label className="text-muted-foreground font-semibold">{isBangla ? 'হটলাইন / মোবাইল' : 'Contact Phone'}</label>
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

      {/* 2. Cloudinary Media Storage */}
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

      {/* 3. Bangladeshi Bulk SMS Gateway */}
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

      {/* 4. Mobile Financial Services (bKash & Nagad) */}
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
