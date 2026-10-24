import React, { useState, useEffect } from 'react';
import {
  NgoWebsiteConfig,
  getStoredWebsiteConfig,
  SliderItem,
  NewsTickerItem
} from './websiteConfig';
import {
  Phone,
  Mail,
  Clock,
  Globe,
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  PiggyBank,
  TrendingUp,
  Building2,
  FileText,
  Download,
  Calculator,
  ArrowRight,
  ExternalLink,
  MapPin,
  Send,
  X,
  Sparkles,
  Smartphone,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Award,
  BookOpen,
  DollarSign,
  AlertCircle,
  Database
} from 'lucide-react';
import { saveTenantInquiry } from '../../core/inquiry/inquiryService';
import { SimpleCaptcha } from '../../components/shared/SimpleCaptcha';
import { isTenantDeleted } from '../../core/tenant/tenantCleanupService';

interface PublicLandingPageProps {
  tenantId?: string;
  onNavigateToLogin?: () => void;
  onNavigateToErp?: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  tenantId = 'sheba-manobik',
  onNavigateToLogin,
  onNavigateToErp
}) => {
  if (!tenantId || isTenantDeleted(tenantId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm border border-rose-200">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          এনজিওটি খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে
        </h2>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          এই এনজিও অ্যাকাউন্টটি বর্তমানে সিস্টেমে বিদ্যমান নেই অথবা সুপার এডমিন কর্তৃক স্থায়ীভাবে ডিলিট করা হয়েছে।
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-all"
          >
            ← মূল প্ল্যাটফর্ম হোমপেজ
          </button>
          <button
            onClick={() => {
              window.location.href = '/mahinerp';
            }}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all shadow-sm"
          >
            সুপার এডমিন পোর্টাল
          </button>
        </div>
      </div>
    );
  }

  const [config, setConfig] = useState<NgoWebsiteConfig>(() => getStoredWebsiteConfig(tenantId));
  const [isBangla, setIsBangla] = useState<boolean>(true);

  // Tenant Contact Form State
  const [senderName, setSenderName] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [senderBranch, setSenderBranch] = useState<string>('সাভার মূল শাখা (ঢাকা)');
  const [senderInterest, setSenderInterest] = useState<string>('');
  const [senderCaptchaInput, setSenderCaptchaInput] = useState<string>('');
  const [expectedSenderCaptcha, setExpectedSenderCaptcha] = useState<number>(0);
  const [senderCaptchaError, setSenderCaptchaError] = useState<boolean>(false);
  const [senderSubmitted, setSenderSubmitted] = useState<boolean>(false);

  // Active Hero Slide
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Donate Modal
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [donateAmount, setDonateAmount] = useState<number>(1000);
  const [donateMethod, setDonateMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [donateSuccess, setDonateSuccess] = useState<boolean>(false);

  // Live Calculator State
  const [calcType, setCalcType] = useState<'dps' | 'loan'>('dps');
  const [calcMonthly, setCalcMonthly] = useState<number>(1000);
  const [calcYears, setCalcYears] = useState<number>(5);
  const [calcLoanAmount, setCalcLoanAmount] = useState<number>(30000);
  const [calcLoanWeeks, setCalcLoanWeeks] = useState<number>(44);

  // 1. Dynamic SEO, Title, Meta and Favicon injection
  useEffect(() => {
    // Page Title
    document.title = isBangla ? config.browserTitleBn : config.browserTitleEn;

    // Favicon
    if (config.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.faviconUrl;
    }

    // Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', isBangla ? config.seoDescriptionBn : config.seoDescriptionEn);

    // Meta Keywords
    let metaKeywords = document.querySelector("meta[name='keywords']");
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', config.seoKeywords);

    // OpenGraph Title & Image
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.getElementsByTagName('head')[0].appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', isBangla ? config.browserTitleBn : config.browserTitleEn);

    let ogImage = document.querySelector("meta[property='og:image']");
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.getElementsByTagName('head')[0].appendChild(ogImage);
    }
    ogImage.setAttribute('content', config.ogImageUrl);
  }, [config, isBangla]);

  // Real-time listener for tenant config changes across tabs and windows
  useEffect(() => {
    const handleTenantConfigUpdate = (e: any) => {
      if (e.detail && (!e.detail.tenantId || e.detail.tenantId === tenantId)) {
        setConfig(e.detail);
      } else {
        setConfig(getStoredWebsiteConfig(tenantId));
      }
    };
    window.addEventListener('ngo_tenant_config_changed', handleTenantConfigUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `ngo_website_config_${tenantId}`) {
        setConfig(getStoredWebsiteConfig(tenantId));
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(`ngo_tenant_${tenantId}_config_channel`);
        bc.onmessage = (ev) => {
          if (ev.data) setConfig(ev.data);
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('ngo_tenant_config_changed', handleTenantConfigUpdate);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [tenantId]);

  // 2. Auto-advance slider
  useEffect(() => {
    if (!config.sliderEnabled || config.sliderItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % config.sliderItems.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [config.sliderEnabled, config.sliderItems.length]);

  const currentSlide = config.sliderItems[currentSlideIndex] || config.sliderItems[0];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % config.sliderItems.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + config.sliderItems.length) % config.sliderItems.length);
  };

  // DPS Calculation
  const calculateDpsTotal = (monthly: number, years: number) => {
    const rate = 11.5 / 100 / 12;
    const months = years * 12;
    const fv = monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    return Math.round(fv);
  };

  // Search Results
  const searchResults = [
    { title: '৩ বছর মেয়াদী ডিপিএস স্কিম (DPS-03YR)', category: 'সঞ্চয় স্কিম', link: '#microfinance' },
    { title: '৫ বছর মেয়াদী লাখপতি সঞ্চয় প্রকল্প (DPS-05YR)', category: 'সঞ্চয় স্কিম', link: '#microfinance' },
    { title: 'ক্ষুদ্র ব্যবসা ও নারী উদ্যোক্তা ঋণ সহায়তা', category: 'ঋণ কর্মসূচি', link: '#microfinance' },
    { title: 'প্রান্তিক নারী উদ্যোক্তা ও দুর্যোগকালীন পুনর্বাসন প্রকল্প', category: 'উন্নয়ন প্রকল্প', link: '#projects' },
    { title: 'জরুরি নোটিশ: বন্যা ও প্রাকৃতিক দুর্যোগকালীন ত্রাণ সহায়তা', category: 'নোটিশ', link: '#notices' },
    { title: 'বার্ষিক নিরীক্ষা ও এমআরএ কমপ্লায়েন্স রিপোর্ট ২০২৪', category: 'ডাউনলোড', link: '#notices' },
    { title: 'সাভার ও চট্টগ্রাম আঞ্চলিক শাখা কার্যালয় তালিকা', category: 'শাখা নেটওয়ার্ক', link: '#contact' }
  ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleGoToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.href = '/cerp';
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '/cerp' || href.endsWith('/cerp') || href.includes('/cerp')) {
      e.preventDefault();
      handleGoToLogin();
      return;
    }
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleTenantContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert(isBangla ? 'অনুগ্রহ করে আপনার নাম প্রদান করুন।' : 'Please provide your name.');
      return;
    }
    if (!senderPhone.trim()) {
      alert(isBangla ? 'অনুগ্রহ করে আপনার মোবাইল নম্বর দিন।' : 'Please provide your mobile number.');
      return;
    }

    if (!senderCaptchaInput.trim()) {
      setSenderCaptchaError(true);
      alert(isBangla ? 'অনুগ্রহ করে সিকিউরিটি ক্যাপচার যোগফল লিখুন।' : 'Please enter the captcha answer.');
      return;
    }

    const normalizedCaptcha = senderCaptchaInput
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
      .trim();
    if (parseInt(normalizedCaptcha, 10) !== expectedSenderCaptcha) {
      setSenderCaptchaError(true);
      alert(
        isBangla
          ? 'ক্যাপচার উত্তর সঠিক হয়নি! পুনরায় হিসাব করে লিখুন।'
          : 'Incorrect captcha sum! Please calculate and try again.'
      );
      return;
    }
    setSenderCaptchaError(false);

    saveTenantInquiry(tenantId, {
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim(),
      subjectOrService: senderBranch,
      message: senderInterest.trim() || (isBangla ? 'সদস্য ভর্তি ও সাধারণ সেবা অনুসন্ধান' : 'General inquiry')
    });

    setSenderSubmitted(true);
    alert(
      isBangla
        ? 'ধন্যবাদ! আপনার বার্তা শাখা ব্যবস্থাপক ও এডমিনের নিকট সফলভাবে পাঠানো হয়েছে।'
        : 'Thank you! Your inquiry has been sent to branch management.'
    );
    setSenderName('');
    setSenderPhone('');
    setSenderInterest('');
    setSenderCaptchaInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP BAR                                                                */}
      {/* ========================================================================= */}
      {config.topBarEnabled && (
        <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-semibold">{config.hotline}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-white transition-colors hidden sm:flex">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{config.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 hidden md:flex">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBangla ? config.officeHoursBn : config.officeHoursEn}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              {/* Social Media Links */}
              <div className="flex items-center gap-2.5 text-slate-400">
                {config.facebookUrl && (
                  <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                )}
                {config.youtubeUrl && (
                  <a href={config.youtubeUrl} target="_blank" rel="noreferrer" className="hover:text-rose-400 transition-colors">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
                {config.linkedinUrl && (
                  <a href={config.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="h-3 w-px bg-slate-700 hidden sm:block" />

              {/* Language Switcher */}
              <button
                onClick={() => setIsBangla(!isBangla)}
                className="flex items-center gap-1 hover:text-white font-bold bg-slate-800 px-2 py-0.5 rounded text-[10px]"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>{isBangla ? 'English' : 'বাংলা'}</span>
              </button>

              {/* Member / Staff Login CTA Button */}
              {config.showLoginBtnInTopBar && (
                <button
                  onClick={handleGoToLogin}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-md text-[11px] shadow-sm flex items-center gap-1 transition-all"
                >
                  <Users className="w-3 h-3" />
                  <span>{isBangla ? 'সদস্য / স্টাফ লগইন' : 'ERP Login'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN HEADER & NAVIGATION                                               */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-3 group shrink-0"
          >
            <img
              src={config.logoUrl}
              alt={config.brandNameEn}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  {isBangla ? config.brandNameBn : config.brandNameEn}
                </span>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  MRA Reg
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-xs sm:max-w-md">
                {isBangla ? config.sloganBn : config.sloganEn}
              </p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            {config.headerMenus.map((menu) => (
              <a
                key={menu.id}
                href={menu.href}
                onClick={(e) => handleNavClick(e, menu.href)}
                className="hover:text-emerald-600 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-600 hover:after:w-full after:transition-all"
              >
                {isBangla ? menu.labelBn : menu.labelEn}
              </a>
            ))}
          </nav>

          {/* Action CTAs: Search & Donate Now */}
          <div className="flex items-center gap-2.5">
            {config.showSearchBar && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                title="সার্চ করুন"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsDonateOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300 animate-pulse" />
              <span>{isBangla ? config.donateButtonTextBn : config.donateButtonTextEn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. NEWS TICKER / BREAKING ANNOUNCEMENTS (INFINITE MARQUEE)                */}
      {/* ========================================================================= */}
      {config.newsTickerEnabled && config.newsTickerItems.length > 0 && (
        <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-900 py-2 px-4 text-xs overflow-hidden relative select-none">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded shadow-sm shrink-0 uppercase tracking-wider flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3" />
              <span>{isBangla ? config.newsTickerTitleBn : config.newsTickerTitleEn}</span>
            </div>

            <div className="flex-1 overflow-hidden whitespace-nowrap relative">
              <div className="animate-marquee inline-flex items-center space-x-12 cursor-pointer">
                {[...config.newsTickerItems, ...config.newsTickerItems].map((item, idx) => (
                  <span
                    key={`${item.id}-${idx}`}
                    onClick={(e) => handleNavClick(e as any, '#notices')}
                    className="inline-flex items-center gap-2 text-[12px] font-medium text-emerald-200 shrink-0 hover:text-white transition-colors"
                  >
                    {item.isUrgent && (
                      <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded animate-pulse">
                        জরুরি
                      </span>
                    )}
                    <span>{isBangla ? item.titleBn : item.titleEn}</span>
                    <span className="text-emerald-400 font-mono text-[10px]">({item.date})</span>
                    <span className="text-emerald-600">★</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HERO BANNER SLIDER / CAROUSEL                                          */}
      {/* ========================================================================= */}
      {config.sliderEnabled && config.sliderItems.length > 0 && (
        <section id="home" className="relative bg-slate-900 text-white min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
            style={{
              backgroundImage: `url(${currentSlide.imageUrl})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10 w-full">
            <div className="max-w-2xl space-y-5">
              {currentSlide.badgeBn && (
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full shadow-inner">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isBangla ? currentSlide.badgeBn : currentSlide.badgeEn}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                {isBangla ? currentSlide.titleBn : currentSlide.titleEn}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed drop-shadow">
                {isBangla ? currentSlide.subtitleBn : currentSlide.subtitleEn}
              </p>

              {/* Slider Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <a
                  href={currentSlide.ctaLink}
                  onClick={(e) => handleNavClick(e, currentSlide.ctaLink)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                >
                  <span>{isBangla ? currentSlide.ctaTextBn : currentSlide.ctaTextEn}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {currentSlide.secondaryCtaTextBn && (
                  <a
                    href={currentSlide.secondaryCtaLink || '#contact'}
                    onClick={(e) => handleNavClick(e, currentSlide.secondaryCtaLink || '#contact')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 transition-all"
                  >
                    {isBangla ? currentSlide.secondaryCtaTextBn : currentSlide.secondaryCtaTextEn}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Slider Prev / Next Controls */}
          {config.sliderItems.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white border border-white/10 backdrop-blur-md transition-all z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white border border-white/10 backdrop-blur-md transition-all z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slider Dot Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {config.sliderItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlideIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. LIVE IMPACT METRIC COUNTERS                                            */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200 py-10 relative -mt-6 z-20 mx-4 sm:mx-8 rounded-2xl shadow-xl max-w-7xl lg:mx-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">১৬,৫০০+</div>
            <p className="text-xs text-slate-500 font-semibold">{isBangla ? 'সক্রিয় সদস্য ও পরিবার' : 'Active Members'}</p>
          </div>

          <div className="pt-4 md:pt-0 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">৳ ৪৮+ কোটি</div>
            <p className="text-xs text-slate-500 font-semibold">{isBangla ? 'মোট বিতরণকৃত ক্ষুদ্রঋণ' : 'Total Loans Disbursed'}</p>
          </div>

          <div className="pt-4 md:pt-0 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">৳ ১৪+ কোটি</div>
            <p className="text-xs text-slate-500 font-semibold">{isBangla ? 'সদস্য সঞ্চয় ও ডিপিএস তহবিল' : 'Savings & DPS Fund'}</p>
          </div>

          <div className="pt-4 md:pt-0 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">৪টি শাখা, ২৮ কেন্দ্র</div>
            <p className="text-xs text-slate-500 font-semibold">{isBangla ? 'মাঠ নেটওয়ার্ক ও সমিতি' : 'Branch & Center Network'}</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ABOUT US & REGULATORY COMPLIANCE                                       */}
      {/* ========================================================================= */}
      <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              <Award className="w-3.5 h-3.5" />
              <span>{isBangla ? 'সরকার অনুমোদিত এমআরএ লাইসেন্সপ্রাপ্ত' : 'Govt Registered & MRA Licensed'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {isBangla ? 'স্বচ্ছতা, জবাবদিহিতা ও দারিদ্র্যমুক্ত বাংলাদেশ বিনির্মাণে আমরা প্রতিশ্রুতিবদ্ধ' : 'Building Resilient Grassroots Communities with Dignity & Trust'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isBangla ? config.footerAboutBn : config.footerAboutEn}
            </p>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>সরকারি নিবন্ধন ও কমপ্লায়েন্স সনদ:</span>
              </div>
              <p className="text-xs font-mono text-emerald-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                {config.govRegNo}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                ১
              </div>
              <h4 className="font-bold text-sm text-slate-900">{isBangla ? 'নারী অর্থনৈতিক স্বাবলম্বীকরণ' : 'Women Empowerment'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                আমাদের মোট সদস্যদের ৯৬% এর বেশি নারী, যারা পরিবারে আত্মবিশ্বাস ও অর্থনৈতিক শক্তি জুগিয়েছেন।
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                ২
              </div>
              <h4 className="font-bold text-sm text-slate-900">{isBangla ? 'ডিজিটাল ও নির্ভুল ব্যবস্থাপনা' : '100% Digital ERP'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                মোবাইল এসএমএস রসিদ, ডিজিটাল পাসবই এবং দুর্নীতিমুক্ত ক্যাশ রিকনসিলিয়েশন সিস্টেমে পরিচালিত।
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                ৩
              </div>
              <h4 className="font-bold text-sm text-slate-900">{isBangla ? 'আকর্ষণীয় সঞ্চয় ও ডিপিএস' : 'High Return DPS'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ৩, ৫ ও ৭ বছর মেয়াদে ১০.৫% - ১১.৫% হারে লাভজনক সঞ্চয় ও পেনশন স্কিমের নিশ্চয়তা।
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                ৪
              </div>
              <h4 className="font-bold text-sm text-slate-900">{isBangla ? 'জরুরি মানবসেবা ও স্বাস্থ্য' : 'Healthcare & Relief'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                বন্যা, খরা ও যেকোনো দুর্যোগে সদস্যদের স্বাস্থ্য ক্যাম্প ও সুদমুক্ত জরুরি পুনর্বাসন সহায়তা।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PROGRAMS & MICROFINANCE PRODUCTS SHOWCASE                              */}
      {/* ========================================================================= */}
      <section id="microfinance" className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">আমাদের স্কিম ও সার্ভিসসমূহ</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isBangla ? 'ক্ষুদ্রঋণ ও আকর্ষণীয় সঞ্চয় স্কিমসমূহ' : 'Microcredit & Savings Products'}
            </h2>
            <p className="text-xs text-slate-500">
              সহজ কিস্তি, কোনো গোপন চার্জ নেই এবং সরকার নির্ধারিত এমআরএ নীতিমালার আলোকে পরিচালিত।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: 3-Year DPS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  DPS-03YR
                </span>
                <span className="text-xs font-bold text-emerald-600 font-mono">১০.৫% বাৎসরিক মুনাফা</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">৩ বছর মেয়াদী মাসিক ডিপিএস স্কিম</h3>
                <p className="text-xs text-slate-500 mt-1">প্রতি মাসে মাত্র ১,০০০ টাকা কিস্তিতে মেয়াদ শেষে মুনাফাসহ প্রায় ৪২,৫০০ টাকা রিটার্ন।</p>
              </div>
              <div className="pt-3 border-t text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>মাসিক কিস্তি:</span>
                  <span className="font-bold text-slate-900">৳ ১,০০০</span>
                </div>
                <div className="flex justify-between">
                  <span>মেয়াদ:</span>
                  <span className="font-bold text-slate-900">৩৬ মাস (৩ বছর)</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>সম্ভাব্য ম্যাচুরিটি:</span>
                  <span>৳ ৪২,৫০০</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCalcType('dps');
                  setCalcMonthly(1000);
                  setCalcYears(3);
                  const el = document.getElementById('calculator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                হিসেব দেখুন (Calculator)
              </button>
            </div>

            {/* Card 2: 5-Year Lakhopoti DPS */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-md hover:shadow-lg transition-all space-y-4 relative">
              <span className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                সর্বাধিক জনপ্রিয়
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  DPS-05YR
                </span>
                <span className="text-xs font-bold text-emerald-600 font-mono">১১.৫% বাৎসরিক মুনাফা</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">৫ বছর মেয়াদী লাখপতি ডিপিএস স্কিম</h3>
                <p className="text-xs text-slate-500 mt-1">প্রতি মাসে ১,৩৫০ টাকা জমা দিয়ে ৫ বছর পর নিশ্চিত ১ লক্ষ টাকারও বেশি সঞ্চয় গড়ে তুলুন।</p>
              </div>
              <div className="pt-3 border-t text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>মাসিক কিস্তি:</span>
                  <span className="font-bold text-slate-900">৳ ১,৩৫০</span>
                </div>
                <div className="flex justify-between">
                  <span>মেয়াদ:</span>
                  <span className="font-bold text-slate-900">৬০ মাস (৫ বছর)</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>সম্ভাব্য ম্যাচুরিটি:</span>
                  <span>৳ ১,০৫,০০০+</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCalcType('dps');
                  setCalcMonthly(1350);
                  setCalcYears(5);
                  const el = document.getElementById('calculator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                হিসেব দেখুন (Calculator)
              </button>
            </div>

            {/* Card 3: Micro Business Loan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-200 font-mono">
                  LOAN-MSME
                </span>
                <span className="text-xs font-bold text-sky-600 font-mono">১০% ডিক্লাইনিং সার্ভিস চার্জ</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">ক্ষুদ্র ব্যবসা ও কৃষি বিকাশ ঋণ</h3>
                <p className="text-xs text-slate-500 mt-1">দোকান, হাঁস-মুরগি, ডেইরি ফার্ম ও কুটির শিল্পের প্রসারে ২৫,০০০ থেকে ১,৫০,০০০ টাকা পর্যন্ত ঋণ।</p>
              </div>
              <div className="pt-3 border-t text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>ঋণ সীমা:</span>
                  <span className="font-bold text-slate-900">৳ ২৫,০০০ - ১,৫০,০০০</span>
                </div>
                <div className="flex justify-between">
                  <span>পরিশোধ পদ্ধতি:</span>
                  <span className="font-bold text-slate-900">সাপ্তাহিক ৪৪ কিস্তি</span>
                </div>
                <div className="flex justify-between text-sky-600 font-bold">
                  <span>ডিজিটাল ট্র্যাকিং:</span>
                  <span>মোবাইল এসএমএস রসিদ</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCalcType('loan');
                  setCalcLoanAmount(35000);
                  const el = document.getElementById('calculator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                কিস্তি হিসেব করুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7.5. DEVELOPMENT PROJECTS & SOCIAL WELFARE SHOWCASE                        */}
      {/* ========================================================================= */}
      <section id="projects" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {isBangla ? 'টেকসই সামাজিক উদ্যোগ ও কর্মসূচি' : 'Sustainable Social Initiatives'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isBangla ? 'উন্নয়ন প্রকল্প ও সামাজিক কল্যাণমূলক কার্যক্রম' : 'Development Projects & Community Impact'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBangla
                ? 'কেবলমাত্র ঋণ বিতরণ নয়, প্রান্তিক জনগোষ্ঠীর শিক্ষা, স্বাস্থ্য, নারী ক্ষমতায়ন ও দুর্যোগ মোকাবিলায় আমাদের বহুমুখী প্রকল্পসমূহ।'
                : 'Beyond microfinance: our comprehensive interventions in healthcare, female education, and disaster resilience.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Project 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=500&auto=format&fit=crop&q=80"
                  alt="নারী উদ্যোক্তা প্রকল্প"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  চলমান প্রকল্প
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {isBangla ? 'প্রান্তিক নারী উদ্যোক্তা ও কুটির শিল্প উন্নয়ন' : 'Women Micro-Enterprise & Handicrafts'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isBangla
                      ? 'গ্রামীণ নারীদের দর্জিবিজ্ঞান, হস্তশিল্প ও নকশিকাঁথা কাজের প্রশিক্ষণ এবং সহজ শর্তে চলতি পুঁজি প্রদান।'
                      : 'Skill training and seed funding for rural women artisans to build home-based handicraft micro-enterprises.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">সুবিধাভোগী:</span>
                  <span className="font-mono font-bold text-emerald-700">৫,২০০+ নারী</span>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&auto=format&fit=crop&q=80"
                  alt="বন্যা ও দুর্যোগ পুনর্বাসন"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  জরুরি সহায়তা
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                    {isBangla ? 'বন্যা ও প্রাকৃতিক দুর্যোগকালীন পুনর্বাসন' : 'Disaster Relief & Climate Resilience'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isBangla
                      ? 'বন্যাদুর্গত এলাকার সদস্যদের সুদমুক্ত খাদ্য সহায়তা, নিরাপদ পানি, স্যালাইন ও ক্ষতিগ্রস্ত ঘরবাড়ি মেরামতে জরুরি অনুদান।'
                      : 'Emergency food, pure drinking water kits, and shelter repair grants for flood-affected families.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">সহায়তা তহবিল:</span>
                  <span className="font-mono font-bold text-amber-700">৳ ১.২+ কোটি</span>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80"
                  alt="মা ও শিশু স্বাস্থ্য ক্যাম্প"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  স্বাস্থ্যসেবা
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                    {isBangla ? 'বিনামূল্যে মা ও শিশু স্বাস্থ্যসেবা ক্যাম্প' : 'Free Mother & Child Health Camps'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isBangla
                      ? 'প্রতি মাসে মাঠপর্যায়ে অভিজ্ঞ চিকিৎসকদের মাধ্যমে রক্ত পরীক্ষা, ডায়াবেটিস স্ক্রিনিং ও বিনামূল্যে ওষুধ বিতরণ।'
                      : 'Monthly medical camps offering general diagnostics, maternal health checkups, and free essential medicines.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">সেবা গ্রহণকারী:</span>
                  <span className="font-mono font-bold text-sky-700">৮,৫০০+ জন</span>
                </div>
              </div>
            </div>

            {/* Project 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop&q=80"
                  alt="শিশু শিক্ষা পাঠশালা"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  শিক্ষা বিস্তার
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                    {isBangla ? 'ঝরে পড়া শিশুদের আনন্দ পাঠশালা ও উপবৃত্তি' : 'Non-formal Child Education & Stipend'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isBangla
                      ? 'দরিদ্র সদস্যদের সন্তানদের প্রাথমিক শিক্ষা নিশ্চিতকরণ, বই-খাতা-ব্যাগ বিতরণ ও মেধাভিত্তিক শিক্ষাবৃত্তি।'
                      : 'Providing basic literacy, school supplies, and merit stipends to underprivileged children in remote areas.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">আনন্দ স্কুল:</span>
                  <span className="font-mono font-bold text-purple-700">১২টি কেন্দ্র</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. INTERACTIVE LOAN & DPS CALCULATOR ON LANDING PAGE                       */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>স্মার্ট ফিনান্সিয়াল ক্যালকুলেটর</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBangla ? 'আপনার সঞ্চয় ও ঋণের কিস্তি সরাসরি হিসেব করুন' : 'Live Installment & DPS Maturity Calculator'}
            </h2>
            <p className="text-xs text-slate-300">
              আপনি কত টাকা জমা করবেন বা কত টাকা ঋণ নিতে চান তা নির্বাচন করুন।
            </p>
          </div>

          {/* Toggle Type */}
          <div className="flex justify-center">
            <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-white/20">
              <button
                onClick={() => setCalcType('dps')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  calcType === 'dps' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                ডিপিএস সঞ্চয় ক্যালকুলেটর (DPS)
              </button>
              <button
                onClick={() => setCalcType('loan')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  calcType === 'loan' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                ক্ষুদ্রঋণ কিস্তি ক্যালকুলেটর (Loan)
              </button>
            </div>
          </div>

          {/* Calculator Inputs */}
          {calcType === 'dps' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>মাসিক কিস্তির পরিমাণ (BDT):</span>
                    <span className="font-mono text-emerald-400 text-sm font-bold">৳ {calcMonthly.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={250}
                    value={calcMonthly}
                    onChange={(e) => setCalcMonthly(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>৳ ৫০০</span>
                    <span>৳ ৫,০০০</span>
                    <span>৳ ১০,০০০</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-2">মেয়াদ নির্বাচন করুন (বছর):</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setCalcYears(yr)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          calcYears === yr
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {yr} বছর ({yr * 12} মাস)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-emerald-900/60 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider block">মেয়াদান্তে সর্বমোট প্রাপ্য (Estimated Return)</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-300">
                  ৳ {calculateDpsTotal(calcMonthly, calcYears).toLocaleString()}
                </div>
                <div className="text-xs text-slate-300 border-t border-emerald-500/30 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>আপনার মোট জমা:</span>
                    <span className="font-mono font-bold text-white">৳ {(calcMonthly * calcYears * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>মুনাফা ও লাভ:</span>
                    <span className="font-mono">৳ {(calculateDpsTotal(calcMonthly, calcYears) - calcMonthly * calcYears * 12).toLocaleString()}</span>
                  </div>
                </div>
                <a
                  href="#contact"
                  className="inline-block w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors mt-2"
                >
                  আজই ডিপিএস একাউন্ট খুলুন
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>প্রস্তাবিত ঋণের পরিমাণ (BDT):</span>
                    <span className="font-mono text-emerald-400 text-sm font-bold">৳ {calcLoanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={150000}
                    step={5000}
                    value={calcLoanAmount}
                    onChange={(e) => setCalcLoanAmount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>৳ ১০,০০০</span>
                    <span>৳ ৭৫,০০০</span>
                    <span>৳ ১,৫০,০০০</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-2">পরিশোধ মেয়াদ (সাপ্তাহিক কিস্তি):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCalcLoanWeeks(44)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        calcLoanWeeks === 44 ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      ৪৪ সপ্তাহ (১ বছর)
                    </button>
                    <button
                      onClick={() => setCalcLoanWeeks(88)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        calcLoanWeeks === 88 ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      ৮৮ সপ্তাহ (২ বছর)
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-sky-950/70 border border-sky-500/40 p-6 rounded-2xl text-center space-y-3">
                <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider block">সাপ্তাহিক কিস্তির পরিমাণ (Weekly Installment)</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-sky-300">
                  ৳ {Math.round((calcLoanAmount * 1.1) / calcLoanWeeks).toLocaleString()}
                </div>
                <div className="text-xs text-slate-300 border-t border-sky-500/30 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>আসল ঋণ:</span>
                    <span className="font-mono font-bold text-white">৳ {calcLoanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>মোট প্রদেয় (সার্ভিস চার্জ সহ):</span>
                    <span className="font-mono font-bold text-sky-400">৳ {Math.round(calcLoanAmount * 1.1).toLocaleString()}</span>
                  </div>
                </div>
                <a
                  href="#contact"
                  className="inline-block w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors mt-2"
                >
                  ঋণের জন্য যোগাযোগ করুন
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. NOTICES & ANNUAL REPORT DOWNLOADS                                      */}
      {/* ========================================================================= */}
      <section id="notices" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">সার্কুলার ও অফিসিয়াল প্রকাশনা</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isBangla ? 'নোটিশ বোর্ড ও বার্ষিক অডিট রিপোর্ট' : 'Notices & Reports Download'}
              </h2>
            </div>
            <a href="#contact" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>{isBangla ? 'সকল নোটিশ দেখুন' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
              <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                ১৭ অক্টোবর ২০২৬
              </span>
              <h4 className="font-bold text-sm text-slate-900">এমআরএ বার্ষিক অডিট প্রতিবেদন ২০২৩-২০২৪</h4>
              <p className="text-xs text-slate-500">মাইক্রোক্রেডিট রেগুলেটরি অথরিটির নীতিমালা অনুযায়ী প্রস্তুতকৃত নিরীক্ষিত আর্থিক প্রতিবেদন।</p>
              <button
                onClick={() => alert('পিডিএফ ডাউনলোড শুরু হয়েছে...')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>পিডিএফ ডাউনলোড (2.4 MB)</span>
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
              <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                ১২ অক্টোবর ২০২৬
              </span>
              <h4 className="font-bold text-sm text-slate-900">নাগরিক সেবা সনদ (Citizen Charter) ২০২৬</h4>
              <p className="text-xs text-slate-500">সদস্যদের অধিকার, সঞ্চয় ফেরতের নিয়মাবলী ও কিস্তি আদায় সংক্রান্ত অঙ্গীকারনামা।</p>
              <button
                onClick={() => alert('পিডিএফ ডাউনলোড শুরু হয়েছে...')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>পিডিএফ ডাউনলোড (1.1 MB)</span>
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
              <span className="text-[10px] font-bold font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                জরুরি নোটিশ
              </span>
              <h4 className="font-bold text-sm text-slate-900">সদস্য সতর্কতা ও ডিজিটাল রসিদ নির্দেশিকা</h4>
              <p className="text-xs text-slate-500">টাকা জমা দেওয়ার পর সাথে সাথে মোবাইলে আসা কনফার্মেশন এসএমএস ও পাসবই মিলিয়ে নেওয়ার অনুরোধ।</p>
              <button
                onClick={() => alert('পিডিএফ ডাউনলোড শুরু হয়েছে...')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>নির্দেশিকা দেখুন (0.8 MB)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CONTACT US & BRANCH LOCATIONS                                         */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">সার্বক্ষণিক সেবা ও যোগাযোগ</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isBangla ? 'আমাদের শাখা কার্যালয় ও হেল্পলাইনে যোগাযোগ করুন' : 'Contact Head Office & Branches'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              সদস্যপদ গ্রহণ, ঋণ বা সঞ্চয় সংক্রান্ত যেকোনো তথ্য বা অভিযোগ জানাতে আমাদের কেন্দ্র, শাখা বা কেন্দ্রীয় হটলাইনে যোগাযোগ করুন।
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">{isBangla ? 'প্রধান কার্যালয়:' : 'Head Office:'}</strong>
                  <span className="text-slate-600">{isBangla ? config.footerContactAddressBn : config.footerContactAddressEn}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">{isBangla ? '২৪/৭ অভিযোগ ও সেবা হটলাইন:' : '24/7 Helpline:'}</strong>
                  <span className="font-mono text-emerald-700 font-bold">{config.footerHelpline}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">{isBangla ? 'ইমেইল যোগাযোগ:' : 'Official Email:'}</strong>
                  <span className="font-mono text-slate-700">{config.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            {config.contactFormEnabled === false ? (
              <div className="p-6 bg-amber-50/90 border border-amber-200 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">
                    {isBangla ? 'অনলাইন বার্তা পাঠানো সাময়িকভাবে স্থগিত' : 'Online Messaging Temporarily Paused'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    {isBangla
                      ? config.contactFormClosedNoticeBn || 'অতিরিক্ত বার্তার চাপের কারণে অনলাইন ইনবক্স সাময়িকভাবে বন্ধ আছে। জরুরি তথ্যে হটলাইনে যোগাযোগ করুন।'
                      : config.contactFormClosedNoticeEn || 'Due to high inquiry volume, online submissions are paused. Please reach us via hotline.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={`tel:${config.hotline}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'হটলাইনে কল করুন' : 'Call Hotline'}</span>
                  </a>
                  <a
                    href={`mailto:${config.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'ইমেইল পাঠান' : 'Send Email'}</span>
                  </a>
                </div>
              </div>
            ) : senderSubmitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">
                    {isBangla ? 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে!' : 'Message Received Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    {isBangla
                      ? 'ধন্যবাদ! আপনার বার্তা সংশ্লিষ্ট শাখা ব্যবস্থাপক ও এনজিও অ্যাডমিনের নিকট পাঠানো হয়েছে। অতি দ্রুত আপনার সাথে যোগাযোগ করা হবে।'
                      : 'Thank you! Your inquiry has reached our branch management. We will get in touch soon.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSenderSubmitted(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  {isBangla ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTenantContactSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900">
                    {isBangla ? 'সদস্য ভর্তি বা তথ্য অনুসন্ধান বার্তা পাঠান' : 'Send Message / Inquire'}
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isBangla ? 'সরাসরি এডমিন ইনবক্স' : 'Direct to Admin'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isBangla ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder={isBangla ? 'যেমন: রহিমা বেগম' : 'e.g. Rohima Begum'}
                      className="w-full text-xs h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="01712-000000"
                      className="w-full text-xs h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isBangla ? 'নিকটস্থ শাখা বা কেন্দ্র' : 'Nearest Branch / Center'}
                  </label>
                  <select
                    value={senderBranch}
                    onChange={(e) => setSenderBranch(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="সাভার মূল শাখা (ঢাকা)">সাভার মূল শাখা (ঢাকা)</option>
                    <option value="চট্টগ্রাম আঞ্চলিক শাখা (আগ্রাবাদ)">চট্টগ্রাম আঞ্চলিক শাখা (আগ্রাবাদ)</option>
                    <option value="রাজশাহী মাঠ শাখা">রাজশাহী মাঠ শাখা</option>
                    <option value="শিবগঞ্জ শাপলা কেন্দ্র (বগুড়া)">শিবগঞ্জ শাপলা কেন্দ্র (বগুড়া)</option>
                    <option value="সাধারণ অনুসন্ধান (হেড অফিস)">সাধারণ অনুসন্ধান (হেড অফিস)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isBangla ? 'বার্তার বিষয় / আগ্রহ' : 'Message / Topic of Interest'}
                  </label>
                  <textarea
                    rows={3}
                    value={senderInterest}
                    onChange={(e) => setSenderInterest(e.target.value)}
                    placeholder={
                      isBangla
                        ? 'আপনার আগ্রহের বিষয় (ডিপিএস সঞ্চয় / ক্ষুদ্রঋণ / সদস্য আবেদন ইত্যাদি)...'
                        : 'Your inquiry details (DPS Savings / Microloan / Membership)...'
                    }
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Anti-Bot Math Captcha */}
                <div className="pt-1">
                  <SimpleCaptcha
                    isBangla={isBangla}
                    value={senderCaptchaInput}
                    onChange={setSenderCaptchaInput}
                    onAnswerChange={setExpectedSenderCaptcha}
                    hasError={senderCaptchaError}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <span>{isBangla ? 'বার্তা পাঠান' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. CUSTOMIZABLE FOOTER (২, ৩ বা ৪ কলাম)                                  */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Columns Grid */}
          <div
            className={`grid gap-10 ${
              config.footerColumnsCount === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : config.footerColumnsCount === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {/* COLUMN 1: About & Reg Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={config.logoUrl}
                  alt={config.brandNameEn}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-500"
                />
                <span className="font-extrabold text-base text-white tracking-tight leading-none">
                  {isBangla ? config.brandNameBn : config.brandNameEn}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isBangla ? config.footerAboutBn : config.footerAboutEn}
              </p>
              {config.footerMraBadgeEnabled && (
                <div className="inline-block bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded">
                  {config.govRegNo}
                </div>
              )}
            </div>

            {/* COLUMN 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">{isBangla ? 'গুরুত্বপূর্ণ লিংক' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-xs">
                {config.footerQuickLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-emerald-600">›</span>
                      <span>{isBangla ? link.labelBn : link.labelEn}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: Contact & Hotline */}
            {(config.footerColumnsCount === 3 || config.footerColumnsCount === 4) && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white">{isBangla ? 'যোগাযোগ ও হেল্পলাইন' : 'Contact & Helpline'}</h4>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{isBangla ? config.footerContactAddressBn : config.footerContactAddressEn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono font-bold text-emerald-400">{config.footerHelpline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{config.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* COLUMN 4: Mobile PWA App & Newsletter */}
            {config.footerColumnsCount === 4 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white">{isBangla ? 'ফিল্ড PWA মোবাইল অ্যাপ' : 'Mobile App & Updates'}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  মাঠকর্মীদের কিস্তি আদায় ও সদস্যদের পাসবই চেক করার জন্য মোবাইল অ্যাপ ব্যবহার করুন।
                </p>
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-xs shadow transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>PWA মোবাইল অ্যাপ খুলুন</span>
                </button>
                <div className="text-[10px] text-slate-500 pt-1">
                  কোনো ইন্সটলেশন দরকার নেই, ব্রাউজার থেকেই সাথে সাথে ইনস্টল হয়।
                </div>
              </div>
            )}
          </div>

          {/* Bottom Copyright & SaaS Attribution */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              {isBangla ? config.footerCopyrightTextBn : config.footerCopyrightTextEn}
            </div>

            <div className="flex items-center gap-4">
              <a href="#about" className="hover:text-slate-300">গোপনীয়তা নীতি (Privacy)</a>
              <span>•</span>
              <a href="#about" className="hover:text-slate-300">ব্যবহারের শর্তাবলী (Terms)</a>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">Powered by NGO ERP SaaS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* SEARCH MODAL                                                              */}
      {/* ========================================================================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>ওয়েবসাইটে খুঁজুন (Search Notices, Schemes & Branches)</span>
              </div>
              <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="যেমন: ডিপিএস, ঋণ, সাভার শাখা, বার্ষিক অডিট..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs h-11 pl-4 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">কোনো ফলাফল পাওয়া যায়নি।</div>
              ) : (
                searchResults.map((res, i) => (
                  <a
                    key={i}
                    href={res.link}
                    onClick={(e) => {
                      handleNavClick(e, res.link);
                      setIsSearchOpen(false);
                    }}
                    className="block p-3 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{res.title}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {res.category}
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DONATE MODAL                                                              */}
      {/* ========================================================================= */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-bold text-base">অনলাইনে অনুদান প্রদান</h3>
              </div>
              <button onClick={() => setIsDonateOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {donateSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-slate-900">আপনার অনুদানের প্রতিশ্রুতি গৃহীত হয়েছে!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  আপনার মোবাইল নম্বরে একটি দান রসিদ ও ট্র্যাকিং নম্বর পাঠানো হয়েছে। মানব কল্যাণে পাশে থাকার জন্য আন্তরিক ধন্যবাদ।
                </p>
                <button
                  onClick={() => {
                    setDonateSuccess(false);
                    setIsDonateOpen(false);
                  }}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1.5">অনুদানের পরিমাণ নির্বাচন করুন (BDT):</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonateAmount(amt)}
                        className={`py-2 rounded-xl font-bold font-mono border transition-all ${
                          donateAmount === amt
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ৳ {amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 mt-2 text-xs rounded-xl border border-slate-300 font-mono font-bold"
                    placeholder="অন্যান্য পরিমাণ লিখুন"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1.5">পেমেন্ট গেটওয়ে নির্বাচন করুন:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDonateMethod('bkash')}
                      className={`p-2.5 rounded-xl border text-center font-bold ${
                        donateMethod === 'bkash' ? 'bg-pink-50 border-pink-500 text-pink-700 ring-2 ring-pink-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      বিকাশ (bKash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonateMethod('nagad')}
                      className={`p-2.5 rounded-xl border text-center font-bold ${
                        donateMethod === 'nagad' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-2 ring-orange-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      নগদ (Nagad)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonateMethod('bank')}
                      className={`p-2.5 rounded-xl border text-center font-bold ${
                        donateMethod === 'bank' ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      ব্যাংক ডিপোজিট
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="আপনার পূর্ণ নাম"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="মোবাইল নম্বর (এসএমএস রসিদের জন্য)"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setDonateSuccess(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>৳ {donateAmount.toLocaleString()} অনুদান সম্পন্ন করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
