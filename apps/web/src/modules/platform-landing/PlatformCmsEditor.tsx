import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import {
  PlatformWebsiteConfig,
  DEFAULT_PLATFORM_CONFIG,
  loadPlatformWebsiteConfig,
  savePlatformWebsiteConfig
} from './platformCmsConfig';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Globe,
  Save,
  RotateCcw,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  Database,
  Building2,
  Phone,
  Mail,
  MapPin,
  Check,
  Plus,
  Trash2,
  LayoutTemplate,
  Search,
  CheckCircle2
} from 'lucide-react';

export const PlatformCmsEditor: React.FC<{ onViewLiveWebsite: () => void }> = ({
  onViewLiveWebsite
}) => {
  const { isBangla } = useI18n();
  const [config, setConfig] = useState<PlatformWebsiteConfig>(loadPlatformWebsiteConfig);
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'services' | 'pricing' | 'footer' | 'seo'>('branding');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    savePlatformWebsiteConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm(isBangla ? 'আপনি কি নিশ্চিত যে সকল কাস্টমাইজেশন রিসেট করে ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Reset all platform website customizations to default?')) {
      setConfig(DEFAULT_PLATFORM_CONFIG);
      savePlatformWebsiteConfig(DEFAULT_PLATFORM_CONFIG);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {isBangla ? 'প্ল্যাটফর্ম ওয়েবসাইট সিএমএস কাস্টমাইজার' : 'Platform Website CMS Customizer'}
              </h2>
              <Badge variant="outline" className="text-[11px] text-primary border-primary/30">
                Super Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBangla
                ? 'মূল প্রমোশনাল ওয়েবসাইটের লোগো, স্লাইডার, সার্ভিসেস, প্রাইসিং, ফুটার ও এসইও নিয়ন্ত্রণ করুন।'
                : 'Customize brand identity, hero slider, software services, pricing plans, 4-column footer, and SEO.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={onViewLiveWebsite} className="text-xs flex-1 sm:flex-none">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            <span>{isBangla ? 'লাইভ সাইট দেখুন' : 'Preview Live'}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>{isBangla ? 'রিসেট' : 'Reset'}</span>
          </Button>

          <Button size="sm" onClick={handleSave} className="text-xs font-bold shadow-md flex-1 sm:flex-none">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>{isBangla ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{isBangla ? 'ওয়েবসাইট কন্টেন্ট সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!' : 'Website customization saved successfully!'}</span>
        </div>
      )}

      {/* Editor Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'branding', labelBn: 'ব্র্যান্ডিং ও যোগাযোগ', labelEn: 'Branding & Contact', icon: Layers },
          { id: 'hero', labelBn: 'হিরো স্লাইডার', labelEn: 'Hero Slider', icon: Sparkles },
          { id: 'services', labelBn: 'সার্ভিসেস ও সফটওয়্যার', labelEn: 'Services & Solutions', icon: Building2 },
          { id: 'pricing', labelBn: 'প্রাইসিং প্ল্যান', labelEn: 'Pricing Plans', icon: Sliders },
          { id: 'footer', labelBn: '৪-কলাম ফুটার', labelEn: '4-Column Footer', icon: LayoutTemplate },
          { id: 'seo', labelBn: 'এসইও ও মেটা ট্যাগ', labelEn: 'SEO & Metadata', icon: Globe }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isBangla ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRANDING & CONTACT */}
      {activeTab === 'branding' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'কোম্পানি পরিচিতি, লোগো ও অফিস কন্টাক্ট' : 'Brand Identity & Contact Details'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">কোম্পানির নাম (বাংলা)</label>
                <Input
                  value={config.brandNameBn}
                  onChange={(e) => setConfig({ ...config, brandNameBn: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Company Name (English)</label>
                <Input
                  value={config.brandNameEn}
                  onChange={(e) => setConfig({ ...config, brandNameEn: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">ট্যাগলাইন / স্লোগান (বাংলা)</label>
                <Input
                  value={config.taglineBn}
                  onChange={(e) => setConfig({ ...config, taglineBn: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Tagline (English)</label>
                <Input
                  value={config.taglineEn}
                  onChange={(e) => setConfig({ ...config, taglineEn: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">হটলাইন / ফোন নম্বর</label>
                <Input
                  value={config.hotline}
                  onChange={(e) => setConfig({ ...config, hotline: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">হোয়াটসঅ্যাপ নম্বর</label>
                <Input
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">সাপোর্ট ইমেইল</label>
                <Input
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">অফিসের ঠিকানা (বাংলা)</label>
                <Input
                  value={config.officeAddressBn}
                  onChange={(e) => setConfig({ ...config, officeAddressBn: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Office Address (English)</label>
                <Input
                  value={config.officeAddressEn}
                  onChange={(e) => setConfig({ ...config, officeAddressEn: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">ব্র্যান্ড প্রাইমারি কালার (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border p-0 cursor-pointer"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">লোগো ইমেজ লিঙ্ক (URL)</label>
                <Input
                  value={config.logoUrl}
                  placeholder="/favicon.svg"
                  onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">ফেভিকন লিঙ্ক (Favicon URL)</label>
                <Input
                  value={config.faviconUrl}
                  placeholder="/favicon.svg"
                  onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: HERO SLIDER */}
      {activeTab === 'hero' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'হোমপেজ হিরো স্লাইডার ও ব্যানার' : 'Homepage Hero Slider'}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={config.sliderEnabled}
                  onChange={(e) => setConfig({ ...config, sliderEnabled: e.target.checked })}
                  className="rounded text-primary"
                />
                <span>{isBangla ? 'স্লাইডার সক্রিয়' : 'Enable Slider'}</span>
              </label>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-6 text-xs">
            {config.heroSlides.map((slide, sIdx) => (
              <div key={slide.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-foreground">স্লাইড #{sIdx + 1}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {slide.id}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">হেডলাইন (বাংলা)</label>
                    <Input
                      value={slide.titleBn}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].titleBn = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">Headline (English)</label>
                    <Input
                      value={slide.titleEn}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].titleEn = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">সাব-টাইটেল (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={slide.subtitleBn}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].subtitleBn = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="w-full text-xs p-2 rounded-md border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">Subtitle (English)</label>
                    <textarea
                      rows={2}
                      value={slide.subtitleEn}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].subtitleEn = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="w-full text-xs p-2 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">টপ ব্যাজ টেক্সট</label>
                    <Input
                      value={slide.badgeBn || ''}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].badgeBn = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">প্রাইমারি বাটন টেক্সট</label>
                    <Input
                      value={slide.ctaPrimaryTextBn}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].ctaPrimaryTextBn = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">প্রাইমারি বাটন লিঙ্ক</label>
                    <Input
                      value={slide.ctaPrimaryLink}
                      onChange={(e) => {
                        const updated = [...config.heroSlides];
                        updated[sIdx].ctaPrimaryLink = e.target.value;
                        setConfig({ ...config, heroSlides: updated });
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SERVICES & SOLUTIONS */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'সফটওয়্যার প্রোডাক্ট ও সার্ভিস ক্যাটালগ' : 'Software Services & Solutions'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">সেকশন হেডিং (বাংলা)</label>
                <Input
                  value={config.servicesHeadingBn}
                  onChange={(e) => setConfig({ ...config, servicesHeadingBn: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Section Heading (English)</label>
                <Input
                  value={config.servicesHeadingEn}
                  onChange={(e) => setConfig({ ...config, servicesHeadingEn: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-foreground text-sm">
                {isBangla ? `মোট ${config.services.length} টি সার্ভিস অন্তর্ভুক্ত:` : `${config.services.length} Active Services:`}
              </div>

              {config.services.map((service, sIdx) => (
                <div key={service.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{service.titleBn}</span>
                      <span className="text-muted-foreground">({service.titleEn})</span>
                    </div>
                    <Badge variant={service.isPopular ? 'default' : 'secondary'} className="text-[10px]">
                      {service.badgeBn || 'সার্ভিস'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">বর্ণনা (বাংলা)</label>
                      <textarea
                        rows={2}
                        value={service.descriptionBn}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[sIdx].descriptionBn = e.target.value;
                          setConfig({ ...config, services: updated });
                        }}
                        className="w-full text-xs p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">Description (English)</label>
                      <textarea
                        rows={2}
                        value={service.descriptionEn}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[sIdx].descriptionEn = e.target.value;
                          setConfig({ ...config, services: updated });
                        }}
                        className="w-full text-xs p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">বাটন টেক্সট</label>
                      <Input
                        value={service.ctaTextBn}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[sIdx].ctaTextBn = e.target.value;
                          setConfig({ ...config, services: updated });
                        }}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">বাটন লিঙ্ক (Href)</label>
                      <Input
                        value={service.ctaLink}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[sIdx].ctaLink = e.target.value;
                          setConfig({ ...config, services: updated });
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PRICING PLANS */}
      {activeTab === 'pricing' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'এনজিও ইআরপি সাবস্ক্রিপশন প্যাকেজ ও প্রাইসিং' : 'SaaS Pricing Plans'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-6 text-xs">
            {config.pricingPlans.map((plan, pIdx) => (
              <div key={plan.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground text-sm">{plan.nameBn}</div>
                  <Badge variant={plan.isPopular ? 'default' : 'outline'} className="text-[10px]">
                    {plan.id}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">মাসিক ফি (৳ BDT)</label>
                    <Input
                      type="number"
                      value={plan.priceMonthly}
                      onChange={(e) => {
                        const updated = [...config.pricingPlans];
                        updated[pIdx].priceMonthly = Number(e.target.value);
                        setConfig({ ...config, pricingPlans: updated });
                      }}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">বাৎসরিক ফি (৳ BDT)</label>
                    <Input
                      type="number"
                      value={plan.priceYearly}
                      onChange={(e) => {
                        const updated = [...config.pricingPlans];
                        updated[pIdx].priceYearly = Number(e.target.value);
                        setConfig({ ...config, pricingPlans: updated });
                      }}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground mb-1 block">প্যাকেজ বর্ণনা</label>
                  <Input
                    value={plan.descriptionBn}
                    onChange={(e) => {
                      const updated = [...config.pricingPlans];
                      updated[pIdx].descriptionBn = e.target.value;
                      setConfig({ ...config, pricingPlans: updated });
                    }}
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: 4-COLUMN FOOTER */}
      {activeTab === 'footer' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-primary" />
              <span>{isBangla ? '৪-কলাম প্রফেশনাল ফুটার ও সোশ্যাল লিঙ্ক' : '4-Column Footer & Social Media'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground mb-1 block">কলাম ১: কোম্পানি পরিচিতি টেক্সট</label>
              <textarea
                rows={3}
                value={config.footerCol1AboutBn}
                onChange={(e) => setConfig({ ...config, footerCol1AboutBn: e.target.value })}
                className="w-full text-xs p-2 rounded-md border border-input bg-background"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">কলাম ২ শিরোনাম</label>
                <Input
                  value={config.footerCol2TitleBn}
                  onChange={(e) => setConfig({ ...config, footerCol2TitleBn: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">কলাম ৩ শিরোনাম</label>
                <Input
                  value={config.footerCol3TitleBn}
                  onChange={(e) => setConfig({ ...config, footerCol3TitleBn: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">কপিরাইট টেক্সট</label>
                <Input
                  value={config.copyrightTextBn}
                  onChange={(e) => setConfig({ ...config, copyrightTextBn: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">ফেসবুক পেজ লিঙ্ক</label>
                <Input
                  value={config.facebookUrl || ''}
                  onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: SEO & METADATA */}
      {activeTab === 'seo' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'সার্চ ইঞ্জিন অপটিমাইজেশন (SEO) ও মেটা ট্যাগ' : 'Search Engine Optimization (SEO)'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground mb-1 block">গুগল ব্রাউজার টাইটেল (Title Tag)</label>
              <Input
                value={config.metaTitleBn}
                onChange={(e) => setConfig({ ...config, metaTitleBn: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground mb-1 block">মেটা বিবরণী (Meta Description)</label>
              <textarea
                rows={3}
                value={config.metaDescriptionBn}
                onChange={(e) => setConfig({ ...config, metaDescriptionBn: e.target.value })}
                className="w-full text-xs p-2 rounded-md border border-input bg-background"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground mb-1 block">সার্চ কি-ওয়ার্ডস (Keywords - কমা দিয়ে পৃথক করুন)</label>
              <Input
                value={config.metaKeywords}
                onChange={(e) => setConfig({ ...config, metaKeywords: e.target.value })}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
