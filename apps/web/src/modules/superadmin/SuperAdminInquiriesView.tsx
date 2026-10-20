import React, { useState, useEffect } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import {
  InquiryMessage,
  getPlatformInquiries,
  markPlatformInquiryAsRead,
  deletePlatformInquiry,
  getPlatformUnreadCount,
  fetchPlatformInquiriesFromCloud
} from '../../core/inquiry/inquiryService';
import {
  getStoredPlatformCmsConfig,
  saveStoredPlatformCmsConfig,
  PlatformCmsConfig
} from '../platform-landing/platformCmsConfig';
import {
  MessageSquare,
  Phone,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Power,
  AlertCircle,
  Eye,
  RefreshCw,
  Filter,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export const SuperAdminInquiriesView: React.FC = () => {
  const { isBangla } = useI18n();

  // CMS Config for ON/OFF toggle & closed notice
  const [cmsConfig, setCmsConfig] = useState<PlatformCmsConfig>(() => getStoredPlatformCmsConfig());
  const [isEditingNotice, setIsEditingNotice] = useState<boolean>(false);
  const [customNoticeBn, setCustomNoticeBn] = useState<string>(cmsConfig.contactFormClosedNoticeBn);
  const [customNoticeEn, setCustomNoticeEn] = useState<string>(cmsConfig.contactFormClosedNoticeEn);

  // Inquiries State
  const [inquiries, setInquiries] = useState<InquiryMessage[]>(() => getPlatformInquiries());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryMessage | null>(null);

  // Load inquiries (both localStorage & Firestore cloud)
  const reloadInquiries = () => {
    setInquiries(getPlatformInquiries());
    fetchPlatformInquiriesFromCloud().then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setInquiries(cloudList);
      }
    });
  };

  useEffect(() => {
    reloadInquiries();

    // In-window custom event when inquiry is added or status updated
    const handleInquiryChange = () => {
      reloadInquiries();
    };
    window.addEventListener('ngo_platform_inquiry_added', handleInquiryChange);
    window.addEventListener('ngo_platform_inquiry_updated', handleInquiryChange);

    // Cross-tab storage change
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ngo_platform_inquiries') {
        reloadInquiries();
      }
      if (e.key === 'ngo_platform_website_cms') {
        setCmsConfig(getStoredPlatformCmsConfig());
      }
    };
    window.addEventListener('storage', handleStorage);

    // Cross-tab BroadcastChannel
    let bcInq: BroadcastChannel | null = null;
    let bcCfg: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bcInq = new BroadcastChannel('ngo_platform_inquiries_channel');
        bcInq.onmessage = () => {
          reloadInquiries();
        };

        bcCfg = new BroadcastChannel('ngo_platform_config_channel');
        bcCfg.onmessage = (ev) => {
          if (ev.data) setCmsConfig(ev.data);
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('ngo_platform_inquiry_added', handleInquiryChange);
      window.removeEventListener('ngo_platform_inquiry_updated', handleInquiryChange);
      window.removeEventListener('storage', handleStorage);
      if (bcInq) bcInq.close();
      if (bcCfg) bcCfg.close();
    };
  }, []);

  // Toggle Contact Form ON/OFF
  const handleToggleFormStatus = () => {
    const updated = {
      ...cmsConfig,
      contactFormEnabled: !cmsConfig.contactFormEnabled
    };
    saveStoredPlatformCmsConfig(updated);
    setCmsConfig(updated);
  };

  // Save Custom Notice
  const handleSaveNotice = () => {
    const updated = {
      ...cmsConfig,
      contactFormClosedNoticeBn: customNoticeBn,
      contactFormClosedNoticeEn: customNoticeEn
    };
    saveStoredPlatformCmsConfig(updated);
    setCmsConfig(updated);
    setIsEditingNotice(false);
  };

  // Mark as Read
  const handleMarkAsRead = (id: string) => {
    markPlatformInquiryAsRead(id);
    reloadInquiries();
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev: InquiryMessage | null) => (prev ? { ...prev, status: 'read' } : null));
    }
  };

  // Delete Inquiry
  const handleDelete = (id: string) => {
    if (window.confirm(isBangla ? 'আপনি কি নিশ্চিত যে এই বার্তাটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this message?')) {
      deletePlatformInquiry(id);
      reloadInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  // Filtered List
  const filteredInquiries = inquiries.filter((item) => {
    const matchesFilter =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unread'
        ? item.status === 'unread'
        : item.status === 'read';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.senderName.toLowerCase().includes(q) ||
      item.senderPhone.includes(q) ||
      (item.organization && item.organization.toLowerCase().includes(q)) ||
      (item.subjectOrService && item.subjectOrService.toLowerCase().includes(q)) ||
      item.message.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const unreadCount = inquiries.filter((i) => i.status === 'unread').length;
  const readCount = inquiries.filter((i) => i.status === 'read').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isBangla ? 'প্ল্যাটফর্ম ওয়েবসাইট ইনবক্স ও কন্টাক্ট লিডস' : 'Platform Website Inquiries & Leads'}
            </h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="font-mono text-xs px-2 py-0.5 animate-pulse">
                {unreadCount} {isBangla ? 'নতুন' : 'New'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isBangla
              ? 'মূল প্ল্যাটফর্ম ওয়েবসাইট থেকে ভিজিটরদের পাঠানো সফটওয়্যার ডেমো বুকিং ও পরামর্শ অনুরোধের তালিকা।'
              : 'Incoming demo booking inquiries and consultation requests from the main promotional platform.'}
          </p>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cmsConfig.contactFormEnabled ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <div className="text-xs">
              <span className="font-semibold block text-foreground">
                {isBangla ? 'কন্টাক্ট ফর্ম স্ট্যাটাস:' : 'Form Status:'}
              </span>
              <span className={`text-[11px] font-bold ${cmsConfig.contactFormEnabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                {cmsConfig.contactFormEnabled
                  ? isBangla ? 'চালু (বার্তা গ্রহণ চলছে)' : 'ACTIVE (Receiving)'
                  : isBangla ? 'স্থগিত (অফ রাখা হয়েছে)' : 'PAUSED (Turned Off)'}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant={cmsConfig.contactFormEnabled ? 'destructive' : 'default'}
            onClick={handleToggleFormStatus}
            className="text-xs font-bold gap-1.5 h-8 px-3"
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              {cmsConfig.contactFormEnabled
                ? isBangla ? 'অফ করুন' : 'Turn Off'
                : isBangla ? 'অন করুন' : 'Turn On'}
            </span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditingNotice(!isEditingNotice)}
            className="text-xs h-8 px-2.5"
            title={isBangla ? 'বন্ধকালীন নোটিশ বার্তা সম্পাদনা' : 'Edit Closed Notice'}
          >
            {isBangla ? 'নোটিশ বার্তা' : 'Notice'}
          </Button>
        </div>
      </div>

      {/* 2. Notice Editor Accordion (If Opened) */}
      {isEditingNotice && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 shadow-sm animate-in fade-in-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>
                {isBangla ? 'ফর্ম বন্ধ থাকাকালীন দর্শনার্থীদের প্রদর্শিত বার্তা নির্ধারণ' : 'Customize Notice Shown When Form is Paused'}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {isBangla
                ? 'অতিরিক্ত বার্তার চাপের কারণে ফর্মটি অফ রাখা হলে ভিজিটররা এই নোটিশটি দেখতে পাবেন।'
                : 'Visitors will see this friendly announcement when the contact form is switched OFF.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'বাংলা নোটিশ বার্তা:' : 'Notice Message (Bengali):'}
              </label>
              <textarea
                rows={2}
                value={customNoticeBn}
                onChange={(e) => setCustomNoticeBn(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'ইংরেজি নোটিশ বার্তা:' : 'Notice Message (English):'}
              </label>
              <textarea
                rows={2}
                value={customNoticeEn}
                onChange={(e) => setCustomNoticeEn(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setIsEditingNotice(false)} className="text-xs">
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleSaveNotice} className="text-xs font-bold">
                {isBangla ? 'সংরক্ষণ করুন' : 'Save Notice'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBangla ? 'সর্বমোট প্রাপ্ত বার্তা' : 'Total Inquiries'}
              </p>
              <h3 className="text-2xl font-extrabold font-mono text-foreground mt-0.5">
                {inquiries.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
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
                {unreadCount}
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
                {isBangla ? 'যাচাইকৃত / পঠিত' : 'Read / Actioned'}
              </p>
              <h3 className="text-2xl font-extrabold font-mono text-emerald-600 mt-0.5">
                {readCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBangla ? 'ইনবক্স গেটওয়ে' : 'Inbox Gateway'}
              </p>
              <h3 className="text-sm font-bold text-foreground mt-1">
                {cmsConfig.contactFormEnabled ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isBangla ? 'সক্রিয় গ্রহণ' : 'Online & Open'}
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {isBangla ? 'স্থগিত রাখা' : 'Paused Notice'}
                  </span>
                )}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {isBangla ? 'সবগুলো' : 'All'} ({inquiries.length})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'unread'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{isBangla ? 'নতুন অপঠিত' : 'Unread'}</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'read'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {isBangla ? 'পঠিত' : 'Read'} ({readCount})
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'নাম, মোবাইল বা প্রতিষ্ঠান দিয়ে খুঁজুন...' : 'Search name, phone, org...'}
              className="h-8 pl-8 text-xs w-full"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={reloadInquiries}
            className="h-8 px-2.5"
            title={isBangla ? 'রিলোড করুন' : 'Refresh'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 5. Inquiries Table / Cards */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filteredInquiries.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {isBangla ? 'কোনো বার্তা পাওয়া যায়নি' : 'No inquiries found'}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {isBangla
                  ? 'ফিল্টার পরিবর্তন করে দেখুন অথবা মূল ওয়েবসাইটের কন্টাক্ট ফর্ম থেকে একটি পরীক্ষামূলক বার্তা পাঠান।'
                  : 'Adjust your search filters or test submitting an inquiry from the public landing page.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">{isBangla ? 'প্রেরক ও প্রতিষ্ঠান' : 'Sender & Org'}</th>
                    <th className="px-4 py-3">{isBangla ? 'মোবাইল ও যোগাযোগ' : 'Phone'}</th>
                    <th className="px-4 py-3">{isBangla ? 'আগ্রহী সফটওয়্যার' : 'Service'}</th>
                    <th className="px-4 py-3">{isBangla ? 'সংক্ষিপ্ত বার্তা' : 'Message'}</th>
                    <th className="px-4 py-3">{isBangla ? 'সময়' : 'Date'}</th>
                    <th className="px-4 py-3">{isBangla ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-4 py-3 text-right">{isBangla ? 'একশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInquiries.map((item) => {
                    const isUnread = item.status === 'unread';
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-muted/40 cursor-pointer ${
                          isUnread ? 'bg-primary/5 font-medium' : ''
                        }`}
                        onClick={() => {
                          setSelectedInquiry(item);
                          if (isUnread) handleMarkAsRead(item.id);
                        }}
                      >
                        {/* Sender */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                            <span>{item.senderName}</span>
                          </div>
                          {item.organization ? (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 shrink-0 text-primary" />
                              <span className="truncate max-w-[160px]">{item.organization}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              {isBangla ? 'ব্যক্তিগত' : 'Personal'}
                            </span>
                          )}
                        </td>

                        {/* Phone */}
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

                        {/* Service */}
                        <td className="px-4 py-3.5">
                          <Badge variant="outline" className="text-[11px] font-semibold">
                            {item.subjectOrService || (isBangla ? 'সাধারণ তথ্য' : 'General')}
                          </Badge>
                        </td>

                        {/* Message */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {item.message}
                          </p>
                        </td>

                        {/* Date */}
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

                        {/* Status */}
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

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedInquiry(item);
                                if (isUnread) handleMarkAsRead(item.id);
                              }}
                              className="h-7 w-7 p-0"
                              title={isBangla ? 'বিস্তারিত দেখুন' : 'View Details'}
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              title={isBangla ? 'মুছে ফেলুন' : 'Delete'}
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
          )}
        </CardContent>
      </Card>

      {/* 6. Message Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-foreground border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {selectedInquiry.senderName}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {selectedInquiry.organization || (isBangla ? 'ব্যক্তিগত অনুসন্ধান' : 'Personal Inquiry')}
                  </div>
                </div>
              </div>
              <Badge variant={selectedInquiry.status === 'unread' ? 'destructive' : 'secondary'}>
                {selectedInquiry.status === 'unread'
                  ? isBangla ? 'নতুন' : 'Unread'
                  : isBangla ? 'পঠিত' : 'Read'}
              </Badge>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isBangla ? 'মোবাইল নম্বর:' : 'Mobile:'}
                  </span>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {selectedInquiry.senderPhone}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isBangla ? 'আগ্রহের সফটওয়্যার:' : 'Service:'}
                  </span>
                  <span className="font-bold text-primary">
                    {selectedInquiry.subjectOrService || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isBangla ? 'প্রাপ্তির সময়:' : 'Received At:'}
                  </span>
                  <span className="text-foreground">
                    {new Date(selectedInquiry.createdAt).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {isBangla ? 'উৎস পাতা:' : 'Source Page:'}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {selectedInquiry.sourcePage || '/'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">
                  {isBangla ? 'বার্তা ও প্রয়োজনীয়তার বিবরণ:' : 'Message Details:'}
                </label>
                <div className="p-3.5 rounded-xl border border-border bg-background leading-relaxed whitespace-pre-wrap text-foreground">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedInquiry.senderPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'সরাসরি কল' : 'Call'}</span>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedInquiry(null)}
                  className="text-xs"
                >
                  {isBangla ? 'বন্ধ করুন' : 'Close'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>{isBangla ? 'মুছুন' : 'Delete'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
