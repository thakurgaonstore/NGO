import React, { useState, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import {
  NgoWebsiteConfig,
  getStoredWebsiteConfig,
  saveWebsiteConfig,
  SliderItem,
  NewsTickerItem,
  MenuItem
} from './websiteConfig';
import { PublicLandingPage } from './PublicLandingPage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import {
  Globe,
  Layout,
  Eye,
  Send,
  Sparkles,
  Sliders,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Phone,
  Mail,
  Search,
  Heart,
  Image,
  Share2,
  Columns,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  Palette,
  Link as LinkIcon,
  Power,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  MessageCircle,
  Calendar,
  Building2
} from 'lucide-react';
import {
  InquiryMessage,
  getTenantInquiries,
  markTenantInquiryAsRead,
  deleteTenantInquiry,
  getTenantUnreadCount,
  fetchTenantInquiriesFromCloud
} from '../../core/inquiry/inquiryService';

export const WebsiteCmsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  const [config, setConfig] = useState<NgoWebsiteConfig>(() =>
    getStoredWebsiteConfig(tenant?.id)
  );

  const [activeTab, setActiveTab] = useState<
    'branding_seo' | 'topbar_header' | 'ticker' | 'slider' | 'footer' | 'inquiries'
  >('branding_seo');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Inquiries & Contact Form State
  const [inquiries, setInquiries] = useState<InquiryMessage[]>(() =>
    getTenantInquiries(tenant?.id)
  );
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryMessage | null>(null);

  const reloadInquiries = () => {
    setInquiries(getTenantInquiries(tenant?.id));
    fetchTenantInquiriesFromCloud(tenant?.id).then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setInquiries(cloudList);
      }
    });
  };

  useEffect(() => {
    reloadInquiries();

    const handleTenantInquiry = (e: any) => {
      if (!e.detail || !e.detail.tenantId || e.detail.tenantId === tenant?.id) {
        reloadInquiries();
      }
    };
    window.addEventListener('ngo_tenant_inquiry_added', handleTenantInquiry);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `ngo_tenant_inquiries_${tenant?.id || 'sheba-manobik'}`) {
        reloadInquiries();
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(`ngo_tenant_${tenant?.id || 'sheba-manobik'}_inquiries_channel`);
        bc.onmessage = () => {
          reloadInquiries();
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('ngo_tenant_inquiry_added', handleTenantInquiry);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [tenant?.id]);

  // Toggle Contact Form ON/OFF
  const handleToggleContactForm = () => {
    const updated = {
      ...config,
      contactFormEnabled: !config.contactFormEnabled
    };
    setConfig(updated);
    saveWebsiteConfig(updated);
  };

  // Mark inquiry as read
  const handleMarkInquiryAsRead = (id: string) => {
    markTenantInquiryAsRead(tenant?.id, id);
    reloadInquiries();
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev: InquiryMessage | null) => (prev ? { ...prev, status: 'read' } : null));
    }
  };

  // Delete inquiry
  const handleDeleteInquiry = (id: string) => {
    if (
      window.confirm(
        isBangla
          ? 'আপনি কি নিশ্চিত যে এই বার্তাটি মুছে ফেলতে চান?'
          : 'Are you sure you want to delete this message?'
      )
    ) {
      deleteTenantInquiry(tenant?.id, id);
      reloadInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  // Slide Add / Edit Modal State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState<boolean>(false);
  const [editingSlide, setEditingSlide] = useState<SliderItem | null>(null);
  const [slideTitleBn, setSlideTitleBn] = useState<string>('');
  const [slideTitleEn, setSlideTitleEn] = useState<string>('');
  const [slideSubtitleBn, setSlideSubtitleBn] = useState<string>('');
  const [slideSubtitleEn, setSlideSubtitleEn] = useState<string>('');
  const [slideImageUrl, setSlideImageUrl] = useState<string>('');
  const [slideBadgeBn, setSlideBadgeBn] = useState<string>('');
  const [slideCtaTextBn, setSlideCtaTextBn] = useState<string>('');
  const [slideCtaLink, setSlideCtaLink] = useState<string>('');

  // Ticker Item Add Modal State
  const [isTickerModalOpen, setIsTickerModalOpen] = useState<boolean>(false);
  const [tickerTextBn, setTickerTextBn] = useState<string>('');
  const [tickerTextEn, setTickerTextEn] = useState<string>('');
  const [tickerDate, setTickerDate] = useState<string>('১৭ অক্টোবর ২০২৬');
  const [tickerIsUrgent, setTickerIsUrgent] = useState<boolean>(false);

  // Menu Link Add Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [menuLabelBn, setMenuLabelBn] = useState<string>('');
  const [menuLabelEn, setMenuLabelEn] = useState<string>('');
  const [menuHref, setMenuHref] = useState<string>('#');

  const handleSaveAll = () => {
    saveWebsiteConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Open Slide Modal
  const handleOpenSlideModal = (slide?: SliderItem) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideTitleBn(slide.titleBn);
      setSlideTitleEn(slide.titleEn);
      setSlideSubtitleBn(slide.subtitleBn);
      setSlideSubtitleEn(slide.subtitleEn);
      setSlideImageUrl(slide.imageUrl);
      setSlideBadgeBn(slide.badgeBn || '');
      setSlideCtaTextBn(slide.ctaTextBn);
      setSlideCtaLink(slide.ctaLink);
    } else {
      setEditingSlide(null);
      setSlideTitleBn('');
      setSlideTitleEn('');
      setSlideSubtitleBn('');
      setSlideSubtitleEn('');
      setSlideImageUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80');
      setSlideBadgeBn('উন্নয়ন উদ্যোগ');
      setSlideCtaTextBn('বিস্তারিত জানুন');
      setSlideCtaLink('#microfinance');
    }
    setIsSlideModalOpen(true);
  };

  // Save Slide
  const handleSaveSlide = () => {
    if (!slideTitleBn.trim()) {
      alert('অনুগ্রহ করে স্লাইডের শিরোনাম দিন');
      return;
    }
    const newSlideObj: SliderItem = {
      id: editingSlide ? editingSlide.id : `sl-${Date.now()}`,
      titleBn: slideTitleBn,
      titleEn: slideTitleEn || slideTitleBn,
      subtitleBn: slideSubtitleBn,
      subtitleEn: slideSubtitleEn || slideSubtitleBn,
      imageUrl: slideImageUrl,
      badgeBn: slideBadgeBn,
      badgeEn: slideBadgeBn,
      ctaTextBn: slideCtaTextBn || 'বিস্তারিত জানুন',
      ctaTextEn: 'Learn More',
      ctaLink: slideCtaLink || '#contact'
    };

    let updatedSlides = [...config.sliderItems];
    if (editingSlide) {
      updatedSlides = updatedSlides.map((s) => (s.id === editingSlide.id ? newSlideObj : s));
    } else {
      updatedSlides.push(newSlideObj);
    }

    const updatedConfig = { ...config, sliderItems: updatedSlides };
    setConfig(updatedConfig);
    saveWebsiteConfig(updatedConfig);
    setIsSlideModalOpen(false);
  };

  // Delete Slide
  const handleDeleteSlide = (id: string) => {
    const updatedSlides = config.sliderItems.filter((s) => s.id !== id);
    const updatedConfig = { ...config, sliderItems: updatedSlides };
    setConfig(updatedConfig);
    saveWebsiteConfig(updatedConfig);
  };

  // Save Ticker
  const handleSaveTicker = () => {
    if (!tickerTextBn.trim()) return;
    const newItem: NewsTickerItem = {
      id: `tick-${Date.now()}`,
      titleBn: tickerTextBn,
      titleEn: tickerTextEn || tickerTextBn,
      date: tickerDate,
      isUrgent: tickerIsUrgent
    };
    const updatedTicker = [newItem, ...config.newsTickerItems];
    const updatedConfig = { ...config, newsTickerItems: updatedTicker };
    setConfig(updatedConfig);
    saveWebsiteConfig(updatedConfig);
    setIsTickerModalOpen(false);
    setTickerTextBn('');
    setTickerTextEn('');
  };

  const handleDeleteTicker = (id: string) => {
    const updated = config.newsTickerItems.filter((t) => t.id !== id);
    const updatedConfig = { ...config, newsTickerItems: updated };
    setConfig(updatedConfig);
    saveWebsiteConfig(updatedConfig);
  };

  // Save Menu
  const handleSaveMenu = () => {
    if (!menuLabelBn.trim()) return;
    const newMenu: MenuItem = {
      id: `m-${Date.now()}`,
      labelBn: menuLabelBn,
      labelEn: menuLabelEn || menuLabelBn,
      href: menuHref
    };
    const updatedMenus = [...config.headerMenus, newMenu];
    const updatedConfig = { ...config, headerMenus: updatedMenus };
    setConfig(updatedConfig);
    saveWebsiteConfig(updatedConfig);
    setIsMenuModalOpen(false);
    setMenuLabelBn('');
    setMenuLabelEn('');
    setMenuHref('#');
  };

  const handleDeleteMenu = (id: string) => {
    const updated = config.headerMenus.filter((m) => m.id !== id);
    const updatedConfig = { ...config, headerMenus: updated };
    setConfig(updatedConfig);
    saveWebsiteConfig(updatedConfig);
  };

  const cleanCustomDomain = config.customDomain
    ? config.customDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    : '';
  const publicUrl = cleanCustomDomain ? `https://${cleanCustomDomain}` : `/${config.clientId.toLowerCase()}`;
  const loginUrl = cleanCustomDomain ? `https://${cleanCustomDomain}/cerp` : `/${config.clientId.toLowerCase()}/cerp`;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Links */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {isBangla ? 'পাবলিক ওয়েবসাইট কাস্টমাইজার ও সিএমএস হাব' : 'Public Website CMS & Customizer'}
            </h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-300 font-mono text-[10px]">
              {cleanCustomDomain ? cleanCustomDomain : `/${config.clientId.toLowerCase()}`}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'লোগো, ফেভিকন, ব্রাউজার টাইটেল, এসইও কিওয়ার্ড, টপ বার, হেডার মেনু, সার্চ বার, নিউজ টিকার, স্লাইডার ও ২/৩/৪ কলাম ফুটার কনফিগারেশন।'
              : 'Customize Logo, Favicon, SEO Keywords, Top Bar, Header, Search Bar, Ticker, Carousel Slider & Footer.'}
          </p>
          {cleanCustomDomain && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                🌐 সাইট: <a href={publicUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-600">{publicUrl}</a>
              </span>
              <span className="text-sky-700 dark:text-sky-400 font-bold">
                🔐 স্টাফ লগইন: <a href={loginUrl} target="_blank" rel="noreferrer" className="underline hover:text-sky-600">{loginUrl}</a>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Public Website Open Link */}
          <button
            onClick={() => {
              if (cleanCustomDomain) {
                // Open simulated preview or direct URL
                window.open(`/?domain=${encodeURIComponent(cleanCustomDomain)}`, '_blank');
              } else {
                window.open(publicUrl, '_blank');
              }
            }}
            className="h-9 px-3 text-xs font-bold rounded-lg border border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isBangla ? 'পাবলিক সাইট দেখুন' : 'Visit Site'}</span>
          </button>

          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} className="text-xs h-9">
            <Eye className="w-4 h-4 mr-1.5" />
            {isBangla ? 'লাইভ প্রিভিউ' : 'Live Preview'}
          </Button>

          <Button onClick={handleSaveAll} className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 font-bold">
            <Send className="w-4 h-4 mr-1.5" />
            {isBangla ? 'সাইট পাবলিশ করুন' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {isBangla
              ? `ওয়েবসাইটের সকল পরিবর্তন সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে! লিঙ্ক: ${config.customDomain ? config.customDomain : publicUrl}`
              : `All changes compiled and published live!`}
          </span>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex gap-1.5 border-b pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('branding_seo')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'branding_seo' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBangla ? 'লোগো, ফেভিকন ও এসইও (SEO)' : 'Logo, Favicon & SEO'}</span>
        </button>

        <button
          onClick={() => setActiveTab('topbar_header')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'topbar_header' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>{isBangla ? 'টপ বার, হেডার ও সার্চ বার' : 'Top Bar & Header'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ticker')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'ticker' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isBangla ? 'নিউজ টিকার (জরুরি নোটিশ)' : 'News Ticker'}</span>
        </button>

        <button
          onClick={() => setActiveTab('slider')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'slider' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isBangla ? 'হোমপেজ স্লাইডার (Hero Slider)' : 'Hero Slider'}</span>
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'footer' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>{isBangla ? '২/৩/৪ কলাম ফুটার' : 'Footer Columns'}</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'inquiries' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{isBangla ? 'ওয়েবসাইট ইনবক্স ও বার্তা' : 'Website Inquiries'}</span>
          {inquiries.filter((i) => i.status === 'unread').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
              {inquiries.filter((i) => i.status === 'unread').length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BRANDING, LOGO, FAVICON & SEO KEYWORDS                             */}
      {/* ========================================================================= */}
      {activeTab === 'branding_seo' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                <span>{isBangla ? '১. লোগো, ফেভিকন ও ব্র্যান্ড পরিচয়' : 'Branding, Logo & Favicon'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'সংস্থার পূর্ণ নাম (বাংলা) *' : 'Organization Name (Bangla) *'}
                  </label>
                  <Input
                    value={config.brandNameBn}
                    onChange={(e) => setConfig({ ...config, brandNameBn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'সংস্থার পূর্ণ নাম (ইংরেজি) *' : 'Organization Name (English) *'}
                  </label>
                  <Input
                    value={config.brandNameEn}
                    onChange={(e) => setConfig({ ...config, brandNameEn: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'অফিসিয়াল লোগো লিঙ্ক (Logo URL):' : 'Logo Image URL:'}
                  </label>
                  <Input
                    value={config.logoUrl}
                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                  />
                  {config.logoUrl && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                      <img src={config.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover border" />
                      <span className="text-[11px] text-muted-foreground">লোগো প্রিভিউ</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'ব্রাউজার ট্যাব ফেভিকন লিঙ্ক (Favicon URL):' : 'Favicon Icon URL:'}
                  </label>
                  <Input
                    value={config.faviconUrl}
                    onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                  />
                  {config.faviconUrl && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                      <img src={config.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                      <span className="text-[11px] text-muted-foreground">ফেভিকন প্রিভিউ (ট্যাবে প্রদর্শিত হবে)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'সরকারি লাইসেন্স ও নিবন্ধন নম্বর (MRA / সমাজসেবা):' : 'Government MRA License / Reg No:'}
                </label>
                <Input
                  value={config.govRegNo}
                  onChange={(e) => setConfig({ ...config, govRegNo: e.target.value })}
                  placeholder="যেমন: MRA লাইসেন্স নং: ০০৯২১-০৫ | সমাজসেবা রেজি: ঢ-০৪১৮৯"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'ক্লায়েন্ট রাউটিং পাথ (Client ID):' : 'Client ID Path:'}
                  </label>
                  <Input
                    value={config.clientId}
                    onChange={(e) => setConfig({ ...config, clientId: e.target.value.toUpperCase() })}
                    className="font-mono font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    পাবলিক লিঙ্ক হবে: <strong className="text-primary font-mono">{`domain/${config.clientId.toLowerCase()}`}</strong>
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'কাস্টম ডোমেইন (যদি থাকে):' : 'Custom Domain (Optional):'}
                  </label>
                  <Input
                    value={config.customDomain || ''}
                    onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                    placeholder="যেমন: www.sheba-bd.org বা yourngo.org"
                    className="font-mono"
                  />
                  <div className="mt-1.5 space-y-0.5 text-[10px]">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold block">
                      ✓ ওয়েবসাইট লিংক: <strong className="font-mono underline">{config.customDomain ? `https://${config.customDomain.replace(/^https?:\/\//, '')}` : 'https://yourdomain.com'}</strong> (শেষে কোনো আইডি লাগবে না)
                    </span>
                    <span className="text-sky-700 dark:text-sky-400 font-semibold block">
                      ✓ স্টাফ ও মেম্বার লগইন: <strong className="font-mono underline">{config.customDomain ? `https://${config.customDomain.replace(/^https?:\/\//, '')}/cerp` : 'https://yourdomain.com/cerp'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO & Keywords Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isBangla ? '২. গুগল সার্চ ও এসইও কিওয়ার্ড সেটিংস (SEO Settings)' : 'Google SEO & Keywords'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'ব্রাউজার ট্যাব টাইটেল / গুগল সার্চ পেজ টাইটেল *' : 'Browser & Page Title *'}
                </label>
                <Input
                  value={config.browserTitleBn}
                  onChange={(e) => setConfig({ ...config, browserTitleBn: e.target.value })}
                  placeholder="যেমন: জাগরণী উন্নয়ন ফাউন্ডেশন — মাইক্রোফাইন্যান্স ও মানব কল্যাণ সংস্থা"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'এসইও মেটা বিবরণ (Meta Description - ১৫৫ অক্ষরের মধ্যে):' : 'Meta Description:'}
                </label>
                <textarea
                  value={config.seoDescriptionBn}
                  onChange={(e) => setConfig({ ...config, seoDescriptionBn: e.target.value })}
                  className="w-full h-18 p-2.5 rounded-lg border border-input bg-background text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'এসইও কিওয়ার্ডস (Keywords - কমা দিয়ে পৃথক করুন):' : 'SEO Keywords (Comma separated):'}
                </label>
                <Input
                  value={config.seoKeywords}
                  onChange={(e) => setConfig({ ...config, seoKeywords: e.target.value })}
                  placeholder="এনজিও, ক্ষুদ্রঋণ, সঞ্চয়, ডিপিএস, বাংলাদেশ, অনুদান, microcredit bangladesh"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'সোশ্যাল মিডিয়া শেয়ার ছবি লিঙ্ক (OpenGraph Image URL):' : 'Social Share Banner Image:'}
                </label>
                <Input
                  value={config.ogImageUrl}
                  onChange={(e) => setConfig({ ...config, ogImageUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOP BAR, HEADER & SEARCH BAR                                       */}
      {/* ========================================================================= */}
      {activeTab === 'topbar_header' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{isBangla ? 'টপ বার কনফিগারেশন' : 'Top Bar Configuration'}</span>
              </CardTitle>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.topBarEnabled}
                  onChange={(e) => setConfig({ ...config, topBarEnabled: e.target.checked })}
                  className="rounded text-primary h-4 w-4"
                />
                <span className="text-xs font-semibold">{isBangla ? 'টপ বার সক্রিয়' : 'Enable Top Bar'}</span>
              </label>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'জরুরি হেল্পলাইন নম্বর:' : 'Hotline Number:'}
                  </label>
                  <Input
                    value={config.hotline}
                    onChange={(e) => setConfig({ ...config, hotline: e.target.value })}
                    className="font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'অফিসিয়াল ইমেইল:' : 'Official Email:'}
                  </label>
                  <Input
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'অফিস সময়সূচী:' : 'Office Hours:'}
                  </label>
                  <Input
                    value={config.officeHoursBn}
                    onChange={(e) => setConfig({ ...config, officeHoursBn: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">Facebook URL</label>
                  <Input
                    value={config.facebookUrl || ''}
                    onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">YouTube URL</label>
                  <Input
                    value={config.youtubeUrl || ''}
                    onChange={(e) => setConfig({ ...config, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">LinkedIn URL</label>
                  <Input
                    value={config.linkedinUrl || ''}
                    onChange={(e) => setConfig({ ...config, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">Twitter URL</label>
                  <Input
                    value={config.twitterUrl || ''}
                    onChange={(e) => setConfig({ ...config, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header Menus & Search */}
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" />
                <span>{isBangla ? 'হেডার নেভিগেশন মেনু ও সার্চ বার' : 'Header Menus & Search'}</span>
              </CardTitle>
              <Button size="sm" onClick={() => setIsMenuModalOpen(true)} className="text-xs h-8">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {isBangla ? 'নতুন মেনু লিংক যোগ' : 'Add Menu Item'}
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.showSearchBar}
                    onChange={(e) => setConfig({ ...config, showSearchBar: e.target.checked })}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-semibold">{isBangla ? 'হেডারে লাইভ সার্চ বার প্রদর্শন করুন' : 'Show Live Search Bar in Header'}</span>
                </label>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-muted-foreground block">মেনু আইটেম তালিকা:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {config.headerMenus.map((menu) => (
                    <div key={menu.id} className="p-2.5 bg-card rounded-xl border flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground">{menu.labelBn}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{menu.href}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NEWS TICKER                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'ticker' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'নিউজ টিকার (চলমান জরুরি নোটিশ স্ক্রল)' : 'News Ticker Management'}</span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.newsTickerEnabled}
                  onChange={(e) => setConfig({ ...config, newsTickerEnabled: e.target.checked })}
                  className="rounded text-primary h-4 w-4"
                />
                <span className="text-xs font-semibold">{isBangla ? 'টিকার চালু' : 'Enable Ticker'}</span>
              </label>

              <Button size="sm" onClick={() => setIsTickerModalOpen(true)} className="text-xs h-8 bg-emerald-600">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {isBangla ? 'নতুন নোটিশ যোগ করুন' : 'Add Notice'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            {config.newsTickerItems.map((item) => (
              <div key={item.id} className="p-3 bg-card rounded-xl border flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.isUrgent && (
                      <Badge variant="destructive" className="text-[9px] py-0 px-1">
                        জরুরি
                      </Badge>
                    )}
                    <span className="font-semibold text-foreground">{item.titleBn}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                </div>

                <button
                  onClick={() => handleDeleteTicker(item.id)}
                  className="text-rose-500 hover:text-rose-700 p-1.5"
                  title="মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HERO SLIDER CAROUSEL                                               */}
      {/* ========================================================================= */}
      {activeTab === 'slider' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'হোমপেজ হিরো স্লাইডার ব্যানার' : 'Hero Slider Carousel'}</span>
            </CardTitle>
            <Button size="sm" onClick={() => handleOpenSlideModal()} className="text-xs h-8 bg-emerald-600">
              <Plus className="w-3.5 h-3.5 mr-1" />
              {isBangla ? 'নতুন স্লাইড তৈরি করুন' : 'Add New Slide'}
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.sliderItems.map((slide, idx) => (
                <div key={slide.id} className="bg-card rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="h-36 bg-cover bg-center relative" style={{ backgroundImage: `url(${slide.imageUrl})` }}>
                      <div className="absolute inset-0 bg-black/40" />
                      <Badge className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px]">
                        Slide #{idx + 1}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-foreground leading-snug">{slide.titleBn}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{slide.subtitleBn}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t mt-2 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">{slide.ctaTextBn}</span>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenSlideModal(slide)} className="h-7 w-7 p-0 text-sky-600">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSlide(slide.id)} className="h-7 w-7 p-0 text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 2 / 3 / 4 COLUMN FOOTER CUSTOMIZER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'footer' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Columns className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'ফুটার লেআউট ও কলাম সংখ্যা নির্বাচন (২ / ৩ / ৪ কলাম)' : 'Footer Column Layout Customizer'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6 text-xs">
            {/* Column Selector */}
            <div>
              <label className="font-bold text-foreground block mb-2">
                {isBangla ? 'ফুটারের কলাম সংখ্যা নির্বাচন করুন:' : 'Select Footer Columns Count:'}
              </label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setConfig({ ...config, footerColumnsCount: cols as any })}
                    className={`py-3 px-4 rounded-xl border text-center font-bold transition-all ${
                      config.footerColumnsCount === cols
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cols} কলাম লেআউট
                  </button>
                ))}
              </div>
            </div>

            {/* Column Content Customizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  কলাম ১: সংস্থার পরিচিতি বিবরণ (About Text):
                </label>
                <textarea
                  value={config.footerAboutBn}
                  onChange={(e) => setConfig({ ...config, footerAboutBn: e.target.value })}
                  className="w-full h-24 p-2.5 rounded-lg border border-input bg-background text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  কলাম ৩: হেড অফিস ঠিকানা ও হটলাইন:
                </label>
                <Input
                  value={config.footerContactAddressBn}
                  onChange={(e) => setConfig({ ...config, footerContactAddressBn: e.target.value })}
                  className="mb-2"
                />
                <Input
                  value={config.footerHelpline}
                  onChange={(e) => setConfig({ ...config, footerHelpline: e.target.value })}
                  placeholder="হটলাইন নম্বর"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                ফুটার কপিরাইট টেক্সট:
              </label>
              <Input
                value={config.footerCopyrightTextBn}
                onChange={(e) => setConfig({ ...config, footerCopyrightTextBn: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: WEBSITE INQUIRIES & CONTACT FORM MASTER SWITCH                     */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {/* Form Gateway Switch & Closed Notice Card */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{isBangla ? 'ওয়েবসাইট কন্টাক্ট ফর্ম গেটওয়ে ও বার্তা নিয়ন্ত্রণ' : 'Website Form Gateway & Controls'}</span>
                </CardTitle>

                {/* ON / OFF Switch */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        config.contactFormEnabled
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {config.contactFormEnabled
                        ? isBangla ? 'ফর্ম চালু (বার্তা গ্রহণ চলছে)' : 'ACTIVE (Receiving)'
                        : isBangla ? 'স্থগিত (অফ রাখা হয়েছে)' : 'PAUSED (Turned Off)'}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={config.contactFormEnabled ? 'destructive' : 'default'}
                    onClick={handleToggleContactForm}
                    className="text-xs font-bold h-8 px-3 gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {config.contactFormEnabled
                        ? isBangla ? 'ফর্ম অফ করুন' : 'Turn Off'
                        : isBangla ? 'ফর্ম অন করুন' : 'Turn On'}
                    </span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-start gap-2.5 text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {isBangla
                    ? 'অতিরিক্ত বার্তা আসা শুরু করলে অথবা ছুটির দিনে আপনি এই সুইচটির মাধ্যমে ওয়েবসাইটের কন্টাক্ট ফর্ম সাময়িকভাবে অফ করে রাখতে পারেন। অফ থাকলে দর্শনার্থীদের জন্য নিচের বন্ধকালীন নোটিশটি প্রদর্শিত হবে।'
                    : 'If message volume gets too high or during holidays, you can pause the website form. A customizable announcement will replace the form.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'ফর্ম বন্ধ থাকাকালীন নোটিশ বার্তা (বাংলা):' : 'Closed Notice Message (Bengali):'}
                  </label>
                  <textarea
                    rows={2}
                    value={config.contactFormClosedNoticeBn}
                    onChange={(e) => setConfig({ ...config, contactFormClosedNoticeBn: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    {isBangla ? 'ফর্ম বন্ধ থাকাকালীন নোটিশ বার্তা (ইংরেজি):' : 'Closed Notice Message (English):'}
                  </label>
                  <textarea
                    rows={2}
                    value={config.contactFormClosedNoticeEn}
                    onChange={(e) => setConfig({ ...config, contactFormClosedNoticeEn: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button size="sm" onClick={handleSaveAll} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>{isBangla ? 'নোটিশ সংরক্ষণ করুন' : 'Save Notice Settings'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isBangla ? 'মোট প্রাপ্ত বার্তা' : 'Total Inquiries'}
                  </p>
                  <h3 className="text-2xl font-extrabold font-mono text-foreground mt-0.5">
                    {inquiries.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isBangla ? 'নতুন / অপঠিত বার্তা' : 'Unread Messages'}
                  </p>
                  <h3 className="text-2xl font-extrabold font-mono text-rose-600 mt-0.5">
                    {inquiries.filter((i) => i.status === 'unread').length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isBangla ? 'যাচাইকৃত / সম্পন্ন' : 'Handled / Read'}
                  </p>
                  <h3 className="text-2xl font-extrabold font-mono text-emerald-600 mt-0.5">
                    {inquiries.filter((i) => i.status === 'read').length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setInquiryStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inquiryStatusFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {isBangla ? 'সকল বার্তা' : 'All'} ({inquiries.length})
              </button>
              <button
                onClick={() => setInquiryStatusFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  inquiryStatusFilter === 'unread'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{isBangla ? 'নতুন অপঠিত' : 'Unread'}</span>
                {inquiries.filter((i) => i.status === 'unread').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-extrabold">
                    {inquiries.filter((i) => i.status === 'unread').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setInquiryStatusFilter('read')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inquiryStatusFilter === 'read'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {isBangla ? 'পঠিত' : 'Read'} ({inquiries.filter((i) => i.status === 'read').length})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder={isBangla ? 'নাম, মোবাইল বা শাখা দিয়ে খুঁজুন...' : 'Search name, phone, branch...'}
                  className="h-8 pl-8 text-xs w-full"
                />
              </div>
              <Button size="sm" variant="outline" onClick={reloadInquiries} className="h-8 px-2.5" title="রিলোড">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Inquiries Table */}
          <Card className="border-border">
            <CardContent className="p-0">
              {(() => {
                const filtered = inquiries.filter((item) => {
                  const matchesFilter =
                    inquiryStatusFilter === 'all'
                      ? true
                      : inquiryStatusFilter === 'unread'
                      ? item.status === 'unread'
                      : item.status === 'read';

                  const q = inquirySearch.toLowerCase().trim();
                  const matchesSearch =
                    !q ||
                    item.senderName.toLowerCase().includes(q) ||
                    item.senderPhone.includes(q) ||
                    (item.subjectOrService && item.subjectOrService.toLowerCase().includes(q)) ||
                    item.message.toLowerCase().includes(q);

                  return matchesFilter && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-10 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                        <Mail className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">
                        {isBangla ? 'কোনো বার্তা পাওয়া যায়নি' : 'No inquiries found'}
                      </p>
                      <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                        {isBangla
                          ? 'আপনার পাবলিক ওয়েবসাইট থেকে ভিজিটর বা সম্ভাব্য সদস্যরা কোনো বার্তা পাঠালে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                          : 'Messages submitted by visitors from your public website contact form will appear here.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px]">
                        <tr>
                          <th className="px-4 py-3">{isBangla ? 'প্রেরক ও শাখা' : 'Sender & Branch'}</th>
                          <th className="px-4 py-3">{isBangla ? 'মোবাইল নম্বর' : 'Phone'}</th>
                          <th className="px-4 py-3">{isBangla ? 'বার্তার বিবরণ' : 'Message'}</th>
                          <th className="px-4 py-3">{isBangla ? 'সময়' : 'Date'}</th>
                          <th className="px-4 py-3">{isBangla ? 'স্ট্যাটাস' : 'Status'}</th>
                          <th className="px-4 py-3 text-right">{isBangla ? 'একশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filtered.map((item) => {
                          const isUnread = item.status === 'unread';
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors hover:bg-muted/40 cursor-pointer ${
                                isUnread ? 'bg-primary/5 font-medium' : ''
                              }`}
                              onClick={() => {
                                setSelectedInquiry(item);
                                if (isUnread) handleMarkInquiryAsRead(item.id);
                              }}
                            >
                              <td className="px-4 py-3.5">
                                <div className="font-bold text-foreground flex items-center gap-1.5">
                                  {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                                  <span>{item.senderName}</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-primary shrink-0" />
                                  <span>{item.subjectOrService || 'সাভার মূল শাখা'}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                <div className="font-mono font-bold text-foreground">{item.senderPhone}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <a
                                    href={`tel:${item.senderPhone}`}
                                    className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 font-bold"
                                  >
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{isBangla ? 'কল' : 'Call'}</span>
                                  </a>
                                  <a
                                    href={`https://wa.me/${item.senderPhone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-sky-600 hover:underline flex items-center gap-0.5 font-bold"
                                  >
                                    <MessageCircle className="w-2.5 h-2.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              </td>

                              <td className="px-4 py-3.5 max-w-xs">
                                <p className="text-muted-foreground line-clamp-2 text-xs">
                                  {item.message}
                                </p>
                              </td>

                              <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap text-[11px]">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span>
                                    {new Date(item.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                {isUnread ? (
                                  <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                                    {isBangla ? 'নতুন' : 'Unread'}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300">
                                    {isBangla ? 'পঠিত' : 'Read'}
                                  </Badge>
                                )}
                              </td>

                              <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedInquiry(item);
                                      if (isUnread) handleMarkInquiryAsRead(item.id);
                                    }}
                                    className="h-7 w-7 p-0"
                                    title={isBangla ? 'বিস্তারিত দেখুন' : 'View Details'}
                                  >
                                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteInquiry(item.id)}
                                    className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                    title={isBangla ? 'মুছুন' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Inquiry Modal */}
      {selectedInquiry && (
        <Dialog
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title={`বার্তা বিবরণ: ${selectedInquiry.senderName}`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <span className="text-muted-foreground block text-[11px]">মোবাইল নম্বর:</span>
                <span className="font-mono font-bold text-sm text-foreground">{selectedInquiry.senderPhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">শাখা বা কেন্দ্র:</span>
                <span className="font-bold text-primary">{selectedInquiry.subjectOrService || 'মূল শাখা'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block text-[11px]">প্রাপ্তির সময়:</span>
                <span className="text-foreground">{new Date(selectedInquiry.createdAt).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">বার্তার বিষয়বস্তু:</label>
              <div className="p-3 rounded-xl border border-border bg-background leading-relaxed whitespace-pre-wrap text-foreground">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedInquiry.senderPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>সরাসরি কল</span>
                </a>
                <a
                  href={`https://wa.me/${selectedInquiry.senderPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedInquiry(null)}>
                  বন্ধ করুন
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteInquiry(selectedInquiry.id)}>
                  মুছুন
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* SLIDE ADD / EDIT MODAL                                                    */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        title={editingSlide ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইডার ব্যানার যোগ করুন'}
        maxWidth="md"
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">স্লাইড প্রধান শিরোনাম (বাংলা) *</label>
            <Input value={slideTitleBn} onChange={(e) => setSlideTitleBn(e.target.value)} placeholder="যেমন: প্রান্তিক জনগোষ্ঠীর অর্থনৈতিক মুক্তি..." />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">স্লাইড শিরোনাম (ইংরেজি)</label>
            <Input value={slideTitleEn} onChange={(e) => setSlideTitleEn(e.target.value)} placeholder="e.g. Grassroots Economic Empowerment..." />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">উপ-শিরোনাম / বিস্তারিত বিবরণ</label>
            <Input value={slideSubtitleBn} onChange={(e) => setSlideSubtitleBn(e.target.value)} placeholder="যেমন: সহজ শর্তে ক্ষুদ্রঋণ ও ডিপিএস সঞ্চয়..." />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">ব্যাকগ্রাউন্ড ছবি লিঙ্ক (High Res URL) *</label>
            <Input value={slideImageUrl} onChange={(e) => setSlideImageUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">বাটন টেক্সট</label>
              <Input value={slideCtaTextBn} onChange={(e) => setSlideCtaTextBn(e.target.value)} placeholder="যেমন: কর্মসূচি জানুন" />
            </div>
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">বাটন লিঙ্ক (#সেকশন)</label>
              <Input value={slideCtaLink} onChange={(e) => setSlideCtaLink(e.target.value)} placeholder="#microfinance" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsSlideModalOpen(false)}>বাতিল</Button>
            <Button size="sm" onClick={handleSaveSlide} className="bg-emerald-600 font-bold">সংরক্ষণ করুন</Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* TICKER NOTICE MODAL                                                       */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isTickerModalOpen}
        onClose={() => setIsTickerModalOpen(false)}
        title="নতুন জরুরি নোটিশ টিকার যোগ করুন"
        maxWidth="sm"
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">নোটিশ টেক্সট *</label>
            <textarea
              value={tickerTextBn}
              onChange={(e) => setTickerTextBn(e.target.value)}
              placeholder="যেমন: জরুরি বিজ্ঞপ্তি: বন্যাদুর্গত সদস্যদের জন্য বিশেষ ত্রাণ সহায়তা..."
              className="w-full h-20 p-2.5 rounded-lg border border-input text-xs"
            />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">তারিখ</label>
            <Input value={tickerDate} onChange={(e) => setTickerDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tickerIsUrgent}
              onChange={(e) => setTickerIsUrgent(e.target.checked)}
              className="rounded text-rose-600"
            />
            <span className="font-bold text-rose-600">জরুরি রেড অ্যালার্ট নোটিশ</span>
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsTickerModalOpen(false)}>বাতিল</Button>
            <Button size="sm" onClick={handleSaveTicker} className="bg-emerald-600 font-bold">যোগ করুন</Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MENU ITEM MODAL                                                           */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        title="নতুন মেনু লিংক যোগ করুন"
        maxWidth="sm"
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">মেনুর নাম (বাংলা) *</label>
            <Input value={menuLabelBn} onChange={(e) => setMenuLabelBn(e.target.value)} placeholder="যেমন: গ্যালারি" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">মেনুর নাম (ইংরেজি)</label>
            <Input value={menuLabelEn} onChange={(e) => setMenuLabelEn(e.target.value)} placeholder="e.g. Gallery" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">লিঙ্ক বা সেকশন আইডি (#)</label>
            <Input value={menuHref} onChange={(e) => setMenuHref(e.target.value)} placeholder="#gallery" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsMenuModalOpen(false)}>বাতিল</Button>
            <Button size="sm" onClick={handleSaveMenu} className="bg-emerald-600 font-bold">সংরক্ষণ করুন</Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* LIVE FULLSCREEN PREVIEW MODAL                                             */}
      {/* ========================================================================= */}
      {isPreviewOpen && (
        <Dialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`পাবলিক ওয়েবসাইট লাইভ প্রিভিউ: ${config.customDomain ? config.customDomain : `domain${publicUrl}`}`}
          maxWidth="2xl"
        >
          <div className="max-h-[82vh] overflow-y-auto rounded-xl border shadow-inner">
            <PublicLandingPage
              tenantId={tenant?.id}
              onNavigateToLogin={() => alert('সদস্য/কর্মী লগইন পেজে রিডাইরেক্ট হবে।')}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};
