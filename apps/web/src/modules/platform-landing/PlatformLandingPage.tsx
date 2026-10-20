import React, { useState, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { LanguageToggle } from '../../components/shared/LanguageToggle';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  PlatformWebsiteConfig,
  PlatformServiceItem,
  loadPlatformWebsiteConfig
} from './platformCmsConfig';
import { Tenant, toBanglaDigits } from '@ngo-erp/shared';
import {
  Building2,
  GraduationCap,
  ShoppingCart,
  Store,
  Hospital,
  Stethoscope,
  Globe,
  Smartphone,
  Check,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Layers,
  Users,
  Award,
  MessageSquare,
  Send,
  Star,
  Laptop,
  CheckCircle2,
  Database,
  Lock,
  Headphones,
  Menu,
  X
} from 'lucide-react';

interface PlatformLandingPageProps {
  onNavigateToTenantPublic: (clientId: string) => void;
  onNavigateToClientLogin: () => void;
  onNavigateToSuperAdmin: () => void;
}

export const PlatformLandingPage: React.FC<PlatformLandingPageProps> = ({
  onNavigateToTenantPublic,
  onNavigateToClientLogin,
  onNavigateToSuperAdmin
}) => {
  const { isBangla } = useI18n();
  const [config, setConfig] = useState<PlatformWebsiteConfig>(loadPlatformWebsiteConfig);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Contact Form State
  const [contactName, setContactName] = useState<string>('');
  const [contactOrg, setContactOrg] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactService, setContactService] = useState<string>('NGO & Microcredit ERP System');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  // Registered Client NGOs (from localStorage or defaults)
  const [registeredTenants, setRegisteredTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem('ngo_registered_tenants');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Reload dynamic CMS config whenever mounted
    setConfig(loadPlatformWebsiteConfig());
  }, []);

  // Auto-advance slider
  useEffect(() => {
    if (!config.sliderEnabled || config.heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % config.heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [config.sliderEnabled, config.heroSlides.length]);

  const activeSlide = config.heroSlides[currentSlideIndex] || config.heroSlides[0];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) {
      alert(isBangla ? 'অনুগ্রহ করে আপনার মোবাইল নম্বর প্রদান করুন' : 'Please provide your mobile number');
      return;
    }
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactOrg('');
      setContactPhone('');
      setContactMessage('');
    }, 1000);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6 text-emerald-500" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-blue-500" />;
      case 'ShoppingCart': return <ShoppingCart className="w-6 h-6 text-amber-500" />;
      case 'Store': return <Store className="w-6 h-6 text-orange-500" />;
      case 'Hospital': return <Hospital className="w-6 h-6 text-rose-500" />;
      case 'Stethoscope': return <Stethoscope className="w-6 h-6 text-teal-500" />;
      case 'Globe': return <Globe className="w-6 h-6 text-sky-500" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-indigo-500" />;
      default: return <Laptop className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP INFORMATION BAR */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <a href={`tel:${config.hotline}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{config.hotline}</span>
            </a>
            <a href={`mailto:${config.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{config.email}</span>
            </a>
            <span className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{isBangla ? 'শনি - বৃহস্পতি: সকাল ৯:০০ - সন্ধ্যা ৬:০০' : 'Sat - Thu: 9:00 AM - 6:00 PM'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {config.showClientLoginBtn && (
              <button
                onClick={onNavigateToClientLogin}
                className="px-2.5 py-1 text-[11px] font-bold rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {isBangla ? 'এনজিও স্টাফ লগইন' : 'Staff Login'}
              </button>
            )}
            {config.showSuperAdminLoginBtn && (
              <button
                onClick={onNavigateToSuperAdmin}
                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
              >
                {isBangla ? 'সুপার এডমিন' : 'Super Admin'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-foreground">
                {isBangla ? config.brandNameBn : config.brandNameEn}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5 line-clamp-1">
                {isBangla ? config.taglineBn : config.taglineEn}
              </p>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-6">
            {config.headerMenuItems.map((menu) => (
              <a
                key={menu.id}
                href={menu.href}
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1 relative"
              >
                {isBangla ? menu.labelBn : menu.labelEn}
              </a>
            ))}
          </nav>

          {/* Header Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all hover:shadow-primary/25 hover:shadow-lg"
            >
              <span>{isBangla ? 'সরাসরি পরামর্শ নিন' : 'Request Consultation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md border text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-4 border-t bg-card space-y-3 animate-in slide-in-from-top-2">
            {config.headerMenuItems.map((menu) => (
              <a
                key={menu.id}
                href={menu.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-muted-foreground hover:text-primary py-1.5"
              >
                {isBangla ? menu.labelBn : menu.labelEn}
              </a>
            ))}
            <div className="pt-2 border-t flex flex-col gap-2">
              <Button size="sm" onClick={onNavigateToClientLogin} className="w-full text-xs">
                {isBangla ? 'এনজিও স্টাফ লগইন (/cerp)' : 'Client Staff Login'}
              </Button>
              <Button size="sm" variant="outline" onClick={onNavigateToSuperAdmin} className="w-full text-xs">
                {isBangla ? 'সুপার এডমিন পোর্টাল (/mahinerp)' : 'Super Admin Portal'}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION / DYNAMIC SLIDER */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24 border-b border-border">
        {/* Background Decorative Rings */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Highlight Badge */}
            {activeSlide?.badgeBn && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-bold animate-pulse">
                <span>{isBangla ? activeSlide.badgeBn : activeSlide.badgeEn}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {isBangla ? activeSlide?.titleBn : activeSlide?.titleEn}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isBangla ? activeSlide?.subtitleBn : activeSlide?.subtitleEn}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={activeSlide?.ctaPrimaryLink || '#client-demos'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95 hover:scale-105 transition-all"
              >
                <span>{isBangla ? activeSlide?.ctaPrimaryTextBn : activeSlide?.ctaPrimaryTextEn}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {activeSlide?.ctaSecondaryTextBn && (
                <a
                  href={activeSlide.ctaSecondaryLink || '#pricing'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-input bg-card text-foreground hover:bg-muted transition-all"
                >
                  <span>{isBangla ? activeSlide.ctaSecondaryTextBn : activeSlide.ctaSecondaryTextEn}</span>
                </a>
              )}
            </div>

            {/* Slider Dots */}
            {config.heroSlides.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {config.heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlideIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. KEY METRICS STATS BAR */}
      <section className="py-10 border-b border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {config.stats.map((stat) => (
              <div key={stat.id} className="p-4 rounded-xl bg-card border border-border/60 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">
                  {isBangla ? stat.numberBn : stat.numberEn}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1">
                  {isBangla ? stat.labelBn : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NGO ERP FLAGSHIP SHOWCASE (#ngo-erp) */}
      <section id="ngo-erp" className="py-16 sm:py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 uppercase tracking-wider">
              {isBangla ? 'ফ্ল্যাগশিপ এনজিও সমাধান' : 'Flagship NGO ERP Solution'}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              {isBangla ? 'একটি পূর্ণাঙ্গ এনজিও পরিচালনা করতে যা যা প্রয়োজন' : 'Everything an NGO Needs in One Platform'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isBangla
                ? 'বাংলাদেশের ক্ষুদ্রঋণ নিয়ন্ত্রণকারী কর্তৃপক্ষ (MRA) এর সকল নিয়ম মেনে তৈরি আধুনিক মাল্টি-টেন্যান্ট ক্লাউড সিস্টেম।'
                : 'Built from ground up following Microcredit Regulatory Authority (MRA) standards with isolated multi-tenant architecture.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  {isBangla ? 'সদস্য, ঋণ ও সঞ্চয় ব্যবস্থাপনা' : 'Members, Loans & Savings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>{isBangla ? 'সাপ্তাহিক ও মাসিক কিস্তি শিডিউল, জরিমানা ও রেবেট ক্যালকুলেটর, নমিনি ডাটা এবং পাসবুক লেজার।' : 'Weekly & monthly schedules, overdue penalty calculator, nominee details, and passbooks.'}</p>
                <div className="font-semibold text-foreground pt-1 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isBangla ? 'অটোমেটিক কিস্তি আদায় তালিকা' : 'Automated collection sheets'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  {isBangla ? 'ফিল্ড অফিসার কালেকশন অ্যাপ' : 'Field Officer Mobile App'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>{isBangla ? 'মাঠ পর্যায়ে ইন্টারনেট না থাকলেও অফলাইনে কিস্তি সংগ্রহ, ব্লুটুথ থার্মাল প্রিন্টারে রসিদ ও গ্রাহককে এসএমএস।' : 'Offline collection in rural zones, Bluetooth thermal receipts, and real-time SMS delivery.'}</p>
                <div className="font-semibold text-foreground pt-1 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isBangla ? 'অফলাইন ডাটা সিঙ্ক ইঞ্জিন' : 'Offline sync architecture'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center mb-2">
                  <Database className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  {isBangla ? 'সেন্ট্রাল অ্যাকাউন্টিং ও ক্যাশ ডেস্ক' : 'Central Accounts & Cash Desk'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>{isBangla ? 'ডাবল এন্ট্রি ভাউচার, শাখাভিত্তিক ক্যাশ রিকনসিলিয়েশন, ব্যালেন্স শিট, প্রফিট-লস এবং ইনভেন্টরি স্টক নিয়ন্ত্রণ।' : 'Double-entry vouchers, daily cash drawer balancing, audit balance sheets, and inventory control.'}</p>
                <div className="font-semibold text-foreground pt-1 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                  <span>{isBangla ? 'MRA অনুমোদিত অডিট রিপোর্ট' : 'MRA compliant audit reports'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. ALL SERVICES CATALOG (#services) */}
      <section id="services" className="py-16 sm:py-24 bg-card/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 uppercase tracking-wider">
              {isBangla ? 'আমাদের সার্ভিসসমূহ' : 'Our Product Portfolio'}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              {isBangla ? config.servicesHeadingBn : config.servicesHeadingEn}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isBangla ? config.servicesSubtitleBn : config.servicesSubtitleEn}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.services.map((service) => (
              <div
                key={service.id}
                className={`flex flex-col justify-between p-5 rounded-xl border bg-card hover:shadow-lg transition-all group ${
                  service.isPopular ? 'border-primary ring-1 ring-primary/30 shadow-sm' : 'border-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-muted/80 group-hover:scale-110 transition-transform">
                      {getServiceIcon(service.iconName)}
                    </div>
                    {service.badgeBn && (
                      <Badge variant={service.isPopular ? 'default' : 'secondary'} className="text-[10px]">
                        {isBangla ? service.badgeBn : service.badgeEn}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground mb-2 leading-snug">
                    {isBangla ? service.titleBn : service.titleEn}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {isBangla ? service.descriptionBn : service.descriptionEn}
                  </p>

                  <div className="space-y-1.5 border-t border-border/60 pt-3">
                    {(isBangla ? service.featuresBn : service.featuresEn).map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5">
                  <a
                    href={service.ctaLink || '#contact'}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-input bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <span>{isBangla ? service.ctaTextBn : service.ctaTextEn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SAAS PRICING PLANS (#pricing) */}
      <section id="pricing" className="py-16 sm:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 uppercase tracking-wider">
              {isBangla ? 'প্যাকেজ ও মূল্য তালিকা' : 'Pricing Plans'}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              {isBangla ? config.pricingHeadingBn : config.pricingHeadingEn}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isBangla ? config.pricingSubtitleBn : config.pricingSubtitleEn}
            </p>

            {/* Monthly / Yearly Switch */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isBangla ? 'মাসিক বিলিং' : 'Monthly'}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span>{isBangla ? 'বাৎসরিক বিলিং' : 'Yearly'}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 text-[10px] font-black">
                  {isBangla ? '২০% ছাড়' : '20% OFF'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {config.pricingPlans.map((plan) => {
              const price = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all ${
                    plan.isPopular ? 'border-primary ring-2 ring-primary/40 shadow-md scale-105' : 'border-border'
                  }`}
                >
                  {plan.badgeBn && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                        {isBangla ? plan.badgeBn : plan.badgeEn}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="text-base font-bold text-foreground">
                      {isBangla ? plan.nameBn : plan.nameEn}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      {isBangla ? plan.descriptionBn : plan.descriptionEn}
                    </p>

                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
                        ৳{isBangla ? toBanglaDigits(price) : price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{isBangla ? 'মাস' : 'month'}
                      </span>
                      {billingCycle === 'yearly' && (
                        <div className="text-[10px] text-emerald-600 font-semibold block ml-2">
                          {isBangla ? '(বাৎসরিক এককালীন)' : '(Billed annually)'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 border-t border-border pt-4">
                      {(isBangla ? plan.featuresBn : plan.featuresEn).map((f, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <a
                      href="#contact"
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        plan.isPopular
                          ? 'bg-primary text-primary-foreground shadow-md hover:opacity-90'
                          : 'border border-input bg-background hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{isBangla ? plan.ctaTextBn : plan.ctaTextEn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CLIENT NGO LIVE DEMOS (#client-demos) */}
      <section id="client-demos" className="py-16 sm:py-24 bg-card/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 uppercase tracking-wider">
              {isBangla ? 'ক্লায়েন্ট পোর্টাল এক্সপ্লোরার' : 'Live Client Portals'}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              {isBangla ? config.demoHeadingBn : config.demoHeadingEn}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isBangla ? config.demoSubtitleBn : config.demoSubtitleEn}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {registeredTenants.length > 0 ? (
              registeredTenants.map((tenant) => {
                const targetSlug = tenant.clientId?.toLowerCase() || tenant.id;
                return (
                  <div
                    key={tenant.id}
                    className="p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                          {tenant.clientId}
                        </Badge>
                        <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                          {tenant.status}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-base text-foreground">
                        {tenant.name.bn}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tenant.name.en}
                      </p>

                      <div className="text-xs font-mono text-muted-foreground mt-3 p-2 rounded bg-muted/50 border border-border/50">
                        URL: <span className="text-primary font-semibold">{window.location.origin}/{targetSlug}</span>
                      </div>
                    </div>

                    <div className="pt-5 flex items-center gap-2">
                      <button
                        onClick={() => onNavigateToTenantPublic(targetSlug)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isBangla ? 'ওয়েবসাইট দেখুন' : 'View Website'}</span>
                      </button>

                      <button
                        onClick={() => {
                          window.history.pushState({}, '', `/${targetSlug}/login`);
                          onNavigateToClientLogin();
                        }}
                        className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-semibold border border-input bg-background hover:bg-muted transition-all"
                        title={isBangla ? 'স্টাফ লগইন' : 'Staff Login'}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8 text-xs text-muted-foreground">
                {isBangla ? 'বর্তমানে কোনো ডেমো এনজিও নিবন্ধিত নেই।' : 'No registered tenants currently available.'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. CONTACT & CONSULTATION (#contact) */}
      <section id="contact" className="py-16 sm:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Info */}
            <div className="space-y-6">
              <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 uppercase tracking-wider">
                {isBangla ? 'সরাসরি যোগাযোগ' : 'Get In Touch'}
              </Badge>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
                {isBangla ? 'আপনার প্রতিষ্ঠানকে সম্পূর্ণ ডিজিটাল করতে আজই যোগাযোগ করুন' : 'Digitize Your Organization with Next-Gen Software'}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isBangla
                  ? 'এনজিও ইআরপি, স্কুল ম্যানেজমেন্ট, পিওএস কিংবা কাস্টম ওয়েবসাইট প্রজেক্টের জন্য আমাদের বিশেষজ্ঞ টিম আপনাকে তাৎক্ষণিক সহায়তা করতে প্রস্তুত।'
                  : 'Our engineering team is ready to consult, deploy, and support your digital transformation initiatives.'}
              </p>

              <div className="space-y-4 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{isBangla ? 'সরাসরি ফোন ও হোয়াটসঅ্যাপ' : 'Phone & WhatsApp'}</div>
                    <div className="text-muted-foreground mt-0.5">{config.hotline}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{isBangla ? 'ইমেইল সাপোর্ট' : 'Email Address'}</div>
                    <div className="text-muted-foreground mt-0.5">{config.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{isBangla ? 'অফিসের ঠিকানা' : 'Office Location'}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {isBangla ? config.officeAddressBn : config.officeAddressEn}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>{isBangla ? 'ফ্রি পরামর্শ ও ডেমো বুকিং ফর্ম' : 'Request Free Demo & Quote'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {contactSubmitted ? (
                  <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in zoom-in-95">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-base text-foreground">
                      {isBangla ? 'ধন্যবাদ! আপনার বার্তা গৃহীত হয়েছে।' : 'Thank You! Message Received.'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isBangla
                        ? 'আমাদের প্রতিনিধি অতি দ্রুত আপনার সাথে যোগাযোগ করে ডেমো প্রদর্শন করবেন।'
                        : 'Our specialist will contact you shortly to schedule your personalized live demo.'}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setContactSubmitted(false)} className="text-xs">
                      {isBangla ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-muted-foreground mb-1 block">
                          {isBangla ? 'আপনার নাম *' : 'Your Name *'}
                        </label>
                        <Input
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder={isBangla ? 'মো: মাহিন' : 'John Doe'}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-muted-foreground mb-1 block">
                          {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                        </label>
                        <Input
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="01700-123456"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-muted-foreground mb-1 block">
                          {isBangla ? 'প্রতিষ্ঠান / এনজিওর নাম' : 'Organization Name'}
                        </label>
                        <Input
                          value={contactOrg}
                          onChange={(e) => setContactOrg(e.target.value)}
                          placeholder={isBangla ? 'জাগরণী ফাউন্ডেশন' : 'Acme Foundation'}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-muted-foreground mb-1 block">
                          {isBangla ? 'কাঙ্ক্ষিত সফটওয়্যার সার্ভিস' : 'Service Interested In'}
                        </label>
                        <select
                          value={contactService}
                          onChange={(e) => setContactService(e.target.value)}
                          className="h-9 w-full px-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {config.services.map((s) => (
                            <option key={s.id} value={s.titleEn}>
                              {isBangla ? s.titleBn : s.titleEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">
                        {isBangla ? 'আপনার বার্তা বা প্রয়োজনীয়তা' : 'Message or Requirements'}
                      </label>
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder={isBangla ? 'আপনার শাখা সংখ্যা, কর্মী সংখ্যা বা বিশেষ চাহিদার বিবরণ লিখুন...' : 'Describe your branches, users, or requirements...'}
                        className="w-full text-xs p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <Button type="submit" className="w-full text-xs font-bold shadow-md">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      <span>{isBangla ? 'বার্তা পাঠান ও ডেমো শিডিউল করুন' : 'Submit & Book Demo'}</span>
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 10. 4-COLUMN PROFESSIONAL FOOTER */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            {/* Column 1: Company Profile */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-base text-white">
                  {isBangla ? config.brandNameBn : config.brandNameEn}
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isBangla ? config.footerCol1AboutBn : config.footerCol1AboutEn}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>MRA Compliance & ISO Certified</span>
              </div>
            </div>

            {/* Column 2: Software Solutions */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                {isBangla ? config.footerCol2TitleBn : config.footerCol2TitleEn}
              </h4>
              <ul className="space-y-2 text-xs">
                {config.footerCol2Links.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.href} className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      <span>{isBangla ? link.labelBn : link.labelEn}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Platform & Portals */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                {isBangla ? config.footerCol3TitleBn : config.footerCol3TitleEn}
              </h4>
              <ul className="space-y-2 text-xs">
                {config.footerCol3Links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href === '/cerp') {
                          e.preventDefault();
                          onNavigateToClientLogin();
                        } else if (link.href === '/mahinerp') {
                          e.preventDefault();
                          onNavigateToSuperAdmin();
                        }
                      }}
                      className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 text-primary" />
                      <span>{isBangla ? link.labelBn : link.labelEn}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact & Office */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                {isBangla ? config.footerCol4TitleBn : config.footerCol4TitleEn}
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{isBangla ? config.officeAddressBn : config.officeAddressEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{config.hotline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{config.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToClientLogin}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                >
                  {isBangla ? 'সদস্য / স্টাফ পোর্টাল প্রবেশ' : 'Client Staff Portal'}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>{isBangla ? config.copyrightTextBn : config.copyrightTextEn}</div>
            <div className="flex items-center gap-4">
              <span>Cloudflare Global Edge</span>
              <span>•</span>
              <span>Firebase Cloud DB</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">100% Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
