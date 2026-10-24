export interface SliderItem {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  imageUrl: string;
  badgeBn?: string;
  badgeEn?: string;
  ctaTextBn: string;
  ctaTextEn: string;
  ctaLink: string;
  secondaryCtaTextBn?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaLink?: string;
}

export interface NewsTickerItem {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  isUrgent?: boolean;
}

export interface MenuItem {
  id: string;
  labelBn: string;
  labelEn: string;
  href: string;
}

export interface NgoWebsiteConfig {
  tenantId: string;
  clientId: string;
  customDomain?: string;

  // Branding & Browser Metadata
  brandNameBn: string;
  brandNameEn: string;
  sloganBn: string;
  sloganEn: string;
  logoUrl: string;
  faviconUrl: string;
  govRegNo: string;
  primaryColor: string;
  accentColor: string;

  // SEO & OpenGraph
  browserTitleBn: string;
  browserTitleEn: string;
  seoDescriptionBn: string;
  seoDescriptionEn: string;
  seoKeywords: string;
  ogImageUrl: string;

  // Top Bar
  topBarEnabled: boolean;
  hotline: string;
  email: string;
  officeHoursBn: string;
  officeHoursEn: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  showLoginBtnInTopBar: boolean;

  // Header Menu
  headerMenus: MenuItem[];
  showSearchBar: boolean;
  donateButtonTextBn: string;
  donateButtonTextEn: string;

  // News Ticker
  newsTickerEnabled: boolean;
  newsTickerTitleBn: string;
  newsTickerTitleEn: string;
  newsTickerItems: NewsTickerItem[];

  // Hero Slider
  sliderEnabled: boolean;
  sliderItems: SliderItem[];

  // Footer Configuration
  footerColumnsCount: 2 | 3 | 4;
  footerAboutBn: string;
  footerAboutEn: string;
  footerQuickLinks: Array<{ labelBn: string; labelEn: string; href: string }>;
  footerContactAddressBn: string;
  footerContactAddressEn: string;
  footerHelpline: string;
  footerNewsletterTextBn: string;
  footerNewsletterTextEn: string;
  footerMraBadgeEnabled: boolean;
  footerCopyrightTextBn: string;
  footerCopyrightTextEn: string;

  // Contact Form & Inquiries Controls
  contactFormEnabled: boolean;
  contactFormClosedNoticeBn: string;
  contactFormClosedNoticeEn: string;
}

export const DEFAULT_WEBSITE_CONFIG: NgoWebsiteConfig = {
  tenantId: 'sheba-manobik',
  clientId: 'SHEBA',
  customDomain: 'www.sheba-bd.org',

  brandNameBn: 'সেবা মানবিক উন্নয়ন কেন্দ্র',
  brandNameEn: 'Sheba Manobik Unnayan Kendra',
  sloganBn: 'প্রান্তিক মানুষের অর্থনৈতিক ক্ষমতায়ন ও টেকসই সামাজিক উন্নয়ন',
  sloganEn: 'Economic Empowerment & Sustainable Social Impact',
  logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&auto=format&fit=crop&q=80',
  faviconUrl: 'https://cdn-icons-png.flaticon.com/512/3252/3252912.png',
  govRegNo: 'MRA লাইসেন্স নং: ০০৯২১-০৫ | সমাজসেবা রেজি: ঢ-০৪১৮৯',
  primaryColor: '#059669', // Emerald 600
  accentColor: '#0284c7', // Sky 600

  browserTitleBn: 'সেবা মানবিক উন্নয়ন কেন্দ্র — ক্ষুদ্রঋণ ও সমাজকল্যাণ সংস্থা',
  browserTitleEn: 'Sheba Manobik Unnayan Kendra — Microcredit & Welfare Organization',
  seoDescriptionBn: 'বাংলাদেশের প্রান্তিক সুবিধাবঞ্চিত মানুষের ক্ষমতায়নে প্রতিশ্রুতিবদ্ধ একটি শীর্ষস্থানীয় এমআরএ অনুমোদিত এনজিও সংস্থা।',
  seoDescriptionEn: 'A leading MRA-licensed microfinance and community development NGO in Bangladesh.',
  seoKeywords: 'এনজিও, ক্ষুদ্রঋণ, সঞ্চয়, ডিপিএস, বাংলাদেশ, অনুদান, microcredit bangladesh, ngo erp, sheba, mra registered',
  ogImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',

  topBarEnabled: true,
  hotline: '০১৭০০-০০০০০০',
  email: 'info@sheba-bd.org',
  officeHoursBn: 'রবি - বৃহস্পতি: সকাল ৯:০০ - বিকাল ৫:০০ টা',
  officeHoursEn: 'Sun - Thu: 9:00 AM - 5:00 PM',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  linkedinUrl: 'https://linkedin.com',
  twitterUrl: 'https://twitter.com',
  showLoginBtnInTopBar: true,

  headerMenus: [
    { id: 'm-home', labelBn: 'হোম', labelEn: 'Home', href: '#home' },
    { id: 'm-about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us', href: '#about' },
    { id: 'm-microfinance', labelBn: 'সঞ্চয় ও ঋণ কর্মসূচি', labelEn: 'Microfinance', href: '#microfinance' },
    { id: 'm-projects', labelBn: 'উন্নয়ন প্রকল্প', labelEn: 'Projects', href: '#projects' },
    { id: 'm-calculator', labelBn: 'কিস্তি ক্যালকুলেটর', labelEn: 'Calculator', href: '#calculator' },
    { id: 'm-notices', labelBn: 'নোটিশ ও রিপোর্ট', labelEn: 'Notices', href: '#notices' },
    { id: 'm-contact', labelBn: 'যোগাযোগ', labelEn: 'Contact', href: '#contact' }
  ],
  showSearchBar: true,
  donateButtonTextBn: 'অনলাইনে অনুদান দিন',
  donateButtonTextEn: 'Donate Now',

  newsTickerEnabled: true,
  newsTickerTitleBn: 'জরুরি নোটিশ / ঘোষণা',
  newsTickerTitleEn: 'Breaking Notices',
  newsTickerItems: [
    {
      id: 'tick-1',
      titleBn: 'জরুরি ত্রাণ তৎপরতা: বন্যাকবলিত এলাকার সদস্যদের জন্য বিশেষ জরুরি ত্রাণ ও কিস্তি পুনর্বিন্যাস কার্যক্রম চলমান রয়েছে।',
      titleEn: 'Disaster Relief: Flood emergency support and installment deferral active for impacted members.',
      date: '১৭ অক্টোবর ২০২৬',
      isUrgent: true
    },
    {
      id: 'tick-2',
      titleBn: 'নতুন সঞ্চয় স্কিম: মাত্র ১,৩৫০ টাকা মাসিক কিস্তিতে ৫ বছর মেয়াদী লাখপতি ডিপিএস অ্যাকাউন্ট উদ্বোধন করা হয়েছে।',
      titleEn: 'New Scheme: 5-Year Lakhopoti DPS opened at BDT 1,350 monthly installment.',
      date: '১৫ অক্টোবর ২০২৬',
      isUrgent: false
    },
    {
      id: 'tick-3',
      titleBn: 'সদস্য সচেতনতা: সকল কিস্তি ও সঞ্চয়ের টাকা শুধুমাত্র কেন্দ্র সভায় মাঠ কর্মকর্তার উপস্থিতিতে পরিশোধ করুন এবং ডিজিটাল স্লিপ বুঝে নিন।',
      titleEn: 'Member Alert: Pay installments only in samity meetings and collect instant digital receipts.',
      date: '১২ অক্টোবর ২০২৬',
      isUrgent: false
    },
    {
      id: 'tick-4',
      titleBn: 'এমআরএ অনুমোদিত বার্ষিক নিরীক্ষা প্রতিবেদন ২০২৩-২৪ সাধারণ সদস্যদের অবগতির জন্য ওয়েবসাইটে উন্মুক্ত করা হয়েছে।',
      titleEn: 'Annual Audit Report 2023-24 published online for public review under MRA guidelines.',
      date: '১০ অক্টোবর ২০২৬',
      isUrgent: false
    }
  ],

  sliderEnabled: true,
  sliderItems: [
    {
      id: 'sl-1',
      titleBn: 'প্রান্তিক জনগোষ্ঠীর অর্থনৈতিক মুক্তি ও টেকসই উন্নয়ন',
      titleEn: 'Grassroots Economic Empowerment & Sustainable Growth',
      subtitleBn: 'সহজ শর্তে ক্ষুদ্রঋণ, ডিপিএস সঞ্চয় ও দক্ষতা বৃদ্ধির মাধ্যমে দারিদ্র্যমুক্ত একটি স্বাবলম্বী বাংলাদেশ গড়ার প্রত্যয়।',
      subtitleEn: 'Fostering financial inclusion, microcredit loans, and women entrepreneurship across rural Bangladesh.',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80',
      badgeBn: 'এমআরএ লাইসেন্সপ্রাপ্ত ও নির্ভরযোগ্য',
      badgeEn: 'MRA Licensed & Verified Microfinance',
      ctaTextBn: 'ঋণ ও সঞ্চয় কর্মসূচি জানুন',
      ctaTextEn: 'Explore Microfinance',
      ctaLink: '#microfinance',
      secondaryCtaTextBn: 'সদস্য হিসেবে যুক্ত হোন',
      secondaryCtaTextEn: 'Join as Member',
      secondaryCtaLink: '#contact'
    },
    {
      id: 'sl-2',
      titleBn: 'নারী উদ্যোক্তা ও পারিবারিক ডিপিএস সঞ্চয় প্রকল্প',
      titleEn: 'Women Entrepreneurship & Family Savings Schemes',
      subtitleBn: 'ঘরে বসেই কুটির শিল্প, হাঁস-মুরগি ও গাভী পালনে ক্ষুদ্রঋণ নিয়ে স্বাবলম্বী হয়েছেন হাজারো গ্রামীণ নারী।',
      subtitleEn: 'Empowering over 15,000 rural women through cottage industries, poultry farming, and micro-enterprises.',
      imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=1600&auto=format&fit=crop&q=80',
      badgeBn: 'নারী স্বাবলম্বীকরণ কর্মসূচি',
      badgeEn: 'Women Self-Reliance Drive',
      ctaTextBn: 'ডিপিএস স্কিমসমূহ দেখুন',
      ctaTextEn: 'View DPS Schemes',
      ctaLink: '#microfinance',
      secondaryCtaTextBn: 'কিস্তি ক্যালকুলেটর',
      secondaryCtaTextEn: 'Installment Calculator',
      secondaryCtaLink: '#calculator'
    },
    {
      id: 'sl-3',
      titleBn: 'জরুরি মানবিক সহায়তা, শিক্ষা ও বিনামূল্যে স্বাস্থ্যসেবা',
      titleEn: 'Humanitarian Emergency Relief & Free Healthcare',
      subtitleBn: 'প্রাকৃতিক দুর্যোগ, বন্যা ও মহামারীতে দরিদ্র মানুষের দোড়গোড়ায় খাদ্য, বিশুদ্ধ পানি ও চিকিৎসা পৌঁছে দিতে নিবেদিত।',
      subtitleEn: 'Providing emergency flood relief, free community medical camps, and children education scholarships.',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80',
      badgeBn: 'সামাজিক দায়বদ্ধতা ও সেবা',
      badgeEn: 'Community Health & Education',
      ctaTextBn: 'অনলাইনে অনুদান দিন',
      ctaTextEn: 'Donate Now',
      ctaLink: '#donate',
      secondaryCtaTextBn: 'আমাদের উন্নয়ন প্রকল্প',
      secondaryCtaTextEn: 'Our Projects',
      secondaryCtaLink: '#projects'
    }
  ],

  footerColumnsCount: 4,
  footerAboutBn: 'সেবা মানবিক উন্নয়ন কেন্দ্র বাংলাদেশ সরকারের মাইক্রোক্রেডিট রেগুলেটরি অথরিটি (MRA) কর্তৃক অনুমোদিত একটি শীর্ষস্থানীয় উন্নয়ন সংস্থা। ১৯৯৮ সাল থেকে প্রান্তিক জনগোষ্ঠীর দারিদ্র্য বিমোচন ও স্বাবলম্বীকরণে আমরা প্রতিশ্রুতিবদ্ধ।',
  footerAboutEn: 'Sheba Manobik Unnayan Kendra is an MRA-licensed leading non-profit humanitarian and microfinance organization committed to eradicating poverty and empowering communities across Bangladesh since 1998.',
  footerQuickLinks: [
    { labelBn: 'আমাদের লক্ষ্য ও উদ্দেশ্য', labelEn: 'Mission & Vision', href: '#about' },
    { labelBn: 'ক্ষুদ্রঋণ ও সঞ্চয় নীতিমালা', labelEn: 'Microcredit & Savings Policy', href: '#microfinance' },
    { labelBn: 'শাখা কার্যালয় নেটওয়ার্ক', labelEn: 'Branch Network', href: '#contact' },
    { labelBn: 'নাগরিক সেবা সনদ (Citizen Charter)', labelEn: 'Citizen Charter', href: '#notices' },
    { labelBn: 'বার্ষিক অডিট প্রতিবেদন', labelEn: 'Annual Audit Reports', href: '#notices' },
    { labelBn: 'কর্মী ও সদস্য লগইন', labelEn: 'Staff & Member Login', href: '/cerp' }
  ],
  footerContactAddressBn: 'প্রধান কার্যালয়: বাড়ি ১৪, রোড ৫, ধানমন্ডি আ/এ, ঢাকা-১২০৫, বাংলাদেশ।',
  footerContactAddressEn: 'Head Office: House 14, Road 5, Dhanmondi R/A, Dhaka-1205, Bangladesh.',
  footerHelpline: '০১৭০০-০০০০০০ / ০৯৬১১-০০০০০০',
  footerNewsletterTextBn: 'নিয়মিত সামাজিক উদ্যোগ, বৃত্তির খবর ও নোটিশের আপডেট পেতে আপনার ইমেইল যুক্ত করুন।',
  footerNewsletterTextEn: 'Subscribe to our newsletter for development updates and circulars.',
  footerMraBadgeEnabled: true,
  footerCopyrightTextBn: '© ২০২৬ সেবা মানবিক উন্নয়ন কেন্দ্র। সর্বস্বত্ব সংরক্ষিত।',
  footerCopyrightTextEn: '© 2026 Sheba Manobik Unnayan Kendra. All rights reserved.',

  contactFormEnabled: true,
  contactFormClosedNoticeBn: 'সম্মানিত গ্রাহক ও সদস্যবৃন্দ, বর্তমানে আমাদের অনলাইন বার্তা গ্রহণ সাময়িকভাবে বন্ধ আছে। জরুরি সেবা, সঞ্চয় ও ঋণের তথ্যের জন্য অনুগ্রহ করে আমাদের হেল্পলাইন নম্বরে সরাসরি যোগাযোগ করুন।',
  contactFormClosedNoticeEn: 'Online message submissions are temporarily paused. Please reach out to our branch office or helpline for urgent services.'
};

export const buildTenantWebsiteConfig = (tenant: any): NgoWebsiteConfig => {
  const brandBn = tenant?.name?.bn || 'এনজিও উন্নয়ন সংস্থা';
  const brandEn = tenant?.name?.en || 'NGO Development Society';
  const clientId = tenant?.clientId || 'NGO';
  const phone = tenant?.ownerMobile || '০১৮১১-৫৪৪৯৯২';
  const email = tenant?.ownerEmail || 'info@ngoerp.xyz';
  const domain = tenant?.domain || `${tenant?.subdomain || 'ngo'}.ngoerp.xyz`;

  return {
    ...DEFAULT_WEBSITE_CONFIG,
    tenantId: tenant?.id || 'tgps',
    clientId,
    customDomain: domain,
    brandNameBn: brandBn,
    brandNameEn: brandEn,
    sloganBn: 'প্রান্তিক মানুষের অর্থনৈতিক ক্ষমতায়ন, দারিদ্র্য বিমোচন ও টেকসই সামাজিক উন্নয়ন',
    sloganEn: 'Empowering Communities, Eliminating Poverty & Sustainable Growth',
    browserTitleBn: `${brandBn} — ক্ষুদ্রঋণ, সঞ্চয় ও সমাজকল্যাণ সংস্থা`,
    browserTitleEn: `${brandEn} — Microfinance & Community Development NGO`,
    seoDescriptionBn: `${brandBn} বাংলাদেশের সুবিধাবঞ্চিত ও প্রান্তিক জনগোষ্ঠীর ক্ষমতায়নে নিবেদিত একটি শীর্ষস্থানীয় ক্ষুদ্রঋণ ও সমাজসেবামূলক প্রতিষ্ঠান।`,
    seoDescriptionEn: `${brandEn} is dedicated to grassroots economic empowerment, transparent microfinance and sustainable community welfare.`,
    hotline: phone,
    email: email,
    govRegNo: `MRA লাইসেন্স নং: ০০${Math.floor(100 + Math.random() * 899)}-${clientId} | সমাজসেবা রেজি: নং-০৭${Math.floor(100 + Math.random() * 899)}`,
    sliderItems: [
      {
        id: 'slide-1',
        titleBn: `${brandBn}-এর সাথে স্বাবলম্বী ভবিষ্যতের পথে`,
        titleEn: `Towards a Self-Reliant Future with ${brandEn}`,
        subtitleBn: 'সহজ কিস্তি, স্বল্প মুনাফায় ক্ষুদ্রঋণ এবং আকর্ষণীয় সঞ্চয় স্কিমের মাধ্যমে আপনার স্বপ্ন বাস্তবায়নে আমরা প্রতিশ্রুতিবদ্ধ।',
        subtitleEn: 'Empowering grassroots entrepreneurs with accessible credit, low interest and high-yield savings.',
        badgeBn: 'এমআরএ (MRA) লাইসেন্সপ্রাপ্ত ও বিশ্বস্ত প্রতিষ্ঠান',
        badgeEn: 'MRA Licensed & Trusted Organization',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80',
        ctaTextBn: 'সঞ্চয় ও ঋণ সেবা দেখুন',
        ctaTextEn: 'Explore Services',
        ctaLink: '#microfinance',
        secondaryCtaTextBn: 'যোগাযোগ ও আবেদন',
        secondaryCtaTextEn: 'Apply / Contact',
        secondaryCtaLink: '#contact'
      },
      {
        id: 'slide-2',
        titleBn: 'নারী উদ্যোক্তা ও প্রান্তিক খামারিদের স্বপ্নপূরণে বিশেষ আর্থিক সহায়তা',
        titleEn: 'Empowering Women Entrepreneurs & Grassroots Farmers',
        subtitleBn: 'কোনো গোপন চার্জ নেই, স্বচ্ছ হিসাবরক্ষণ এবং দ্রুততম সময়ে ঋণ বিতরণ সুবিধা।',
        subtitleEn: 'Zero hidden fees, transparent accounting, and expedited disbursement.',
        badgeBn: 'বিশেষ নারী উদ্যোক্তা প্যাকেজ',
        badgeEn: 'Special Women Entrepreneur Package',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1600&auto=format&fit=crop&q=80',
        ctaTextBn: 'মুনাফা ক্যালকুলেটর',
        ctaTextEn: 'Profit Calculator',
        ctaLink: '#calculator',
        secondaryCtaTextBn: 'নাগরিক সেবা সনদ',
        secondaryCtaTextEn: 'Citizen Charter',
        secondaryCtaLink: '#notices'
      },
      {
        id: 'slide-3',
        titleBn: 'সামাজিক কল্যাণ, ফ্রি চিকিৎসাসেবা ও শিক্ষাবৃত্তি কর্মসূচি',
        titleEn: 'Community Healthcare & Student Scholarship Initiatives',
        subtitleBn: 'আর্থ-সামাজিক উন্নয়নে সদস্য ও তাঁদের পরিবারের কল্যাণে নিয়মিত সামাজিক কর্মসূচি পরিচালনা করছি।',
        subtitleEn: 'Comprehensive CSR initiatives designed for family healthcare and children education.',
        badgeBn: 'সামাজিক দায়বদ্ধতা প্রকল্প (CSR)',
        badgeEn: 'CSR & Community Welfare',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80',
        ctaTextBn: 'দান বা সহায়তা করুন',
        ctaTextEn: 'Support / Donate',
        ctaLink: '#contact'
      }
    ],
    newsTickerItems: [
      {
        id: 'tick-1',
        titleBn: `${brandBn}-এর আওতাধীন সকল শাখায় নতুন অর্থবছরে সহজ শর্তে কৃষি ও ডেইরি ঋণ আবেদন চলছে।`,
        titleEn: 'Agricultural & Dairy microloan applications are now open across all branches.',
        date: '২০২৬-১০-২৪',
        isUrgent: true
      },
      {
        id: 'tick-2',
        titleBn: 'মেধাবী ছাত্র-ছাত্রীদের মাঝে ২০২৬ শিক্ষাবর্ষের এককালীন শিক্ষাবৃত্তি প্রদান অনুষ্ঠান আগামী সপ্তাহে।',
        titleEn: 'Annual Student Scholarship ceremony scheduled for next week.',
        date: '২০২৬-১০-২২'
      },
      {
        id: 'tick-3',
        titleBn: 'সদস্যদের সুবিধার্থে সাপ্তাহিক সঞ্চয় ও ডিপিএস কিস্তি ডিজিটাল উপায়ে পরিশোধের ব্যবস্থা চালু হয়েছে।',
        titleEn: 'Digital payment facilities now available for weekly savings and DPS installments.',
        date: '২০২৬-১০-২০'
      }
    ],
    footerAboutBn: `${brandBn} একটি নিবেদিতপ্রাণ ক্ষুদ্রঋণ ও সমাজসেবামূলক প্রতিষ্ঠান। আমরা দারিদ্র্য বিমোচন, নারীর ক্ষমতায়ন এবং তৃণমূল অর্থনীতির টেকসই উন্নয়নে অবিচল।`,
    footerAboutEn: `${brandEn} is a dedicated microfinance and community development institution committed to poverty reduction and women empowerment.`,
    footerHelpline: `${phone} / ০১৭০০-০০০০০০`,
    footerCopyrightTextBn: `© ২০২৬ ${brandBn}। সর্বস্বত্ব সংরক্ষিত।`,
    footerCopyrightTextEn: `© 2026 ${brandEn}. All rights reserved.`
  };
};

export const getStoredWebsiteConfig = (tenantId?: string): NgoWebsiteConfig => {
  const tid = tenantId || 'sheba-manobik';
  const saved = localStorage.getItem(`ngo_website_config_${tid}`);
  if (saved) {
    try {
      return { ...DEFAULT_WEBSITE_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      // ignore
    }
  }

  // If not saved, look up the registered tenant details to auto-construct rich website config
  try {
    const raw = localStorage.getItem('ngo_registered_tenants');
    const tenants = raw ? JSON.parse(raw) : [];
    const matched = tenants.find(
      (t: any) =>
        t.id === tid ||
        t.clientId?.toUpperCase() === tid.toUpperCase() ||
        t.subdomain?.toLowerCase() === tid.toLowerCase()
    );
    if (matched) {
      const generated = buildTenantWebsiteConfig(matched);
      // Persist it so changes can be edited later
      localStorage.setItem(`ngo_website_config_${tid}`, JSON.stringify(generated));
      return generated;
    }
  } catch {}

  // Fallback if tenant is tgps
  if (tid.toLowerCase().includes('tgps')) {
    const tgpsFallback = buildTenantWebsiteConfig({
      id: 'tgps',
      clientId: 'TGPS',
      subdomain: 'tgps',
      domain: 'tgps.ngoerp.xyz',
      name: {
        bn: 'ঠাকুরগাঁও গ্রীন প্র্যাকটিস সোসাইটি (TGPS)',
        en: 'Thakurgaon Green Practice Society (TGPS)'
      },
      ownerMobile: '01811544992',
      ownerEmail: 'shopthakurgaon@gmail.com'
    });
    localStorage.setItem(`ngo_website_config_${tid}`, JSON.stringify(tgpsFallback));
    return tgpsFallback;
  }

  return DEFAULT_WEBSITE_CONFIG;
};

export const saveWebsiteConfig = (config: NgoWebsiteConfig) => {
  localStorage.setItem(`ngo_website_config_${config.tenantId}`, JSON.stringify(config));

  // Instant broadcast to in-window listeners & other open tabs
  try {
    window.dispatchEvent(new CustomEvent('ngo_tenant_config_changed', { detail: config }));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(`ngo_tenant_${config.tenantId}_config_channel`);
      bc.postMessage(config);
      bc.close();
    }
  } catch {}

  // Sync custom domain to lookup cache and registered tenants
  if (config.customDomain) {
    try {
      const clean = config.customDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .split(':')[0];

      if (clean) {
        const dir = JSON.parse(localStorage.getItem('ngo_tenant_directory_cache') || '{}');
        dir[clean] = config.tenantId;
        dir['www.' + clean] = config.tenantId;
        localStorage.setItem('ngo_tenant_directory_cache', JSON.stringify(dir));

        const savedTenants = JSON.parse(localStorage.getItem('ngo_registered_tenants') || '[]');
        if (savedTenants.length > 0) {
          const updated = savedTenants.map((t: any) =>
            t.id === config.tenantId || t.clientId === config.clientId
              ? { ...t, domain: config.customDomain }
              : t
          );
          localStorage.setItem('ngo_registered_tenants', JSON.stringify(updated));
        }
      }
    } catch {}
  }

  // Also sync branding colors & favicon dynamically to document
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
  if (config.browserTitleBn) {
    document.title = config.browserTitleBn;
  }
};
