import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getOrCreateFirebaseInstance } from '../../core/firebase/firebaseClient';

export interface PlatformServiceItem {
  id: string;
  iconName: string;
  titleBn: string;
  titleEn: string;
  badgeBn?: string;
  badgeEn?: string;
  descriptionBn: string;
  descriptionEn: string;
  featuresBn: string[];
  featuresEn: string[];
  ctaTextBn: string;
  ctaTextEn: string;
  ctaLink: string;
  isPopular?: boolean;
}

export interface PlatformPricingPlan {
  id: string;
  nameBn: string;
  nameEn: string;
  badgeBn?: string;
  badgeEn?: string;
  priceMonthly: number;
  priceYearly: number;
  descriptionBn: string;
  descriptionEn: string;
  featuresBn: string[];
  featuresEn: string[];
  isPopular?: boolean;
  ctaTextBn: string;
  ctaTextEn: string;
}

export interface PlatformSliderSlide {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  badgeBn?: string;
  badgeEn?: string;
  imageUrl?: string;
  ctaPrimaryTextBn: string;
  ctaPrimaryTextEn: string;
  ctaPrimaryLink: string;
  ctaSecondaryTextBn?: string;
  ctaSecondaryTextEn?: string;
  ctaSecondaryLink?: string;
}

export interface PlatformWebsiteConfig {
  // General & Branding
  brandNameBn: string;
  brandNameEn: string;
  taglineBn: string;
  taglineEn: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;

  // Contact & Social
  hotline: string;
  whatsapp: string;
  email: string;
  officeAddressBn: string;
  officeAddressEn: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;

  // Header Nav
  headerMenuItems: Array<{ id: string; labelBn: string; labelEn: string; href: string }>;
  showClientLoginBtn: boolean;
  showSuperAdminLoginBtn: boolean;

  // Hero Section / Slider
  sliderEnabled: boolean;
  heroSlides: PlatformSliderSlide[];

  // NGO ERP Highlights
  stats: Array<{ id: string; numberBn: string; numberEn: string; labelBn: string; labelEn: string }>;

  // Services Catalog
  servicesHeadingBn: string;
  servicesHeadingEn: string;
  servicesSubtitleBn: string;
  servicesSubtitleEn: string;
  services: PlatformServiceItem[];

  // Pricing Plans
  pricingHeadingBn: string;
  pricingHeadingEn: string;
  pricingSubtitleBn: string;
  pricingSubtitleEn: string;
  pricingPlans: PlatformPricingPlan[];

  // Client NGO Live Demos
  demoHeadingBn: string;
  demoHeadingEn: string;
  demoSubtitleBn: string;
  demoSubtitleEn: string;

  // 4-Column Footer
  footerCol1AboutBn: string;
  footerCol1AboutEn: string;
  footerCol2TitleBn: string;
  footerCol2TitleEn: string;
  footerCol2Links: Array<{ labelBn: string; labelEn: string; href: string }>;
  footerCol3TitleBn: string;
  footerCol3TitleEn: string;
  footerCol3Links: Array<{ labelBn: string; labelEn: string; href: string }>;
  footerCol4TitleBn: string;
  footerCol4TitleEn: string;
  copyrightTextBn: string;
  copyrightTextEn: string;

  // SEO & Meta
  metaTitleBn: string;
  metaTitleEn: string;
  metaDescriptionBn: string;
  metaDescriptionEn: string;
  metaKeywords: string;
}

export const DEFAULT_PLATFORM_CONFIG: PlatformWebsiteConfig = {
  brandNameBn: 'এন্টিগ্র্যাভিটি আইটি সলিউশনস',
  brandNameEn: 'Antigravity IT Solutions',
  taglineBn: 'আধুনিক এনজিও ইআরপি ও এন্টারপ্রাইজ সফটওয়্যার প্ল্যাটফর্ম',
  taglineEn: 'Next-Gen NGO ERP & Enterprise Software Ecosystem',
  logoUrl: '',
  faviconUrl: '/favicon.svg',
  primaryColor: '#0d9488',
  accentColor: '#0284c7',

  hotline: '০১৭০০-১২৩৪৫৬',
  whatsapp: '০১৭০০-১২৩৪৫৬',
  email: 'contact@antigravityit.com',
  officeAddressBn: 'লেভেল ৪, সফটওয়্যার টেকনোলজি পার্ক, কাওরান বাজার, ঢাকা-১২১৫',
  officeAddressEn: 'Level 4, Software Technology Park, Karwan Bazar, Dhaka-1215',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  linkedinUrl: 'https://linkedin.com',
  githubUrl: 'https://github.com/thakurgaonstore/NGO',

  headerMenuItems: [
    { id: 'home', labelBn: 'হোম', labelEn: 'Home', href: '#home' },
    { id: 'ngo-erp', labelBn: 'এনজিও ইআরপি', labelEn: 'NGO ERP', href: '#ngo-erp' },
    { id: 'services', labelBn: 'সকল সফটওয়্যার সার্ভিস', labelEn: 'All Services', href: '#services' },
    { id: 'pricing', labelBn: 'প্রাইসিং প্ল্যান', labelEn: 'Pricing Plans', href: '#pricing' },
    { id: 'client-demos', labelBn: 'লাইভ ডেমো পোর্টাল', labelEn: 'Client Demos', href: '#client-demos' },
    { id: 'contact', labelBn: 'যোগাযোগ', labelEn: 'Contact', href: '#contact' }
  ],
  showClientLoginBtn: true,
  showSuperAdminLoginBtn: true,

  sliderEnabled: true,
  heroSlides: [
    {
      id: 'slide-1',
      titleBn: 'বাংলাদেশের এনজিও ও মাইক্রোফাইন্যান্সের জন্য সম্পূর্ণ ক্লাউড ইআরপি',
      titleEn: 'Complete Cloud ERP for NGOs & Microfinance in Bangladesh',
      subtitleBn: 'এমআরএ (MRA) কমপ্লায়েন্ট ক্ষুদ্রঋণ, সঞ্চয় হিসাব, ফিল্ড অফিসার মোবাইল কালেকশন, ডাবল-এন্ট্রি অ্যাকাউন্টিং এবং প্রতিটি এনজিওর নিজস্ব ওয়েবসাইট এক প্ল্যাটফর্মে।',
      subtitleEn: 'MRA-compliant microfinance, savings, field officer mobile collection app, double-entry accounts, and dedicated website in one unified cloud suite.',
      badgeBn: '🚀 মাল্টি-টেন্যান্ট ক্লাউড আর্কিটেকচার',
      badgeEn: '🚀 Multi-Tenant Cloud Architecture',
      ctaPrimaryTextBn: 'ফ্রি লাইভ ডেমো দেখুন',
      ctaPrimaryTextEn: 'Explore Live Demo',
      ctaPrimaryLink: '#client-demos',
      ctaSecondaryTextBn: 'প্যাকেজ ও মূল্য তালিকা',
      ctaSecondaryTextEn: 'Pricing Plans',
      ctaSecondaryLink: '#pricing'
    },
    {
      id: 'slide-2',
      titleBn: 'স্কুল, হাসপাতাল, পিওএস ও কাস্টম সফটওয়্যার সলিউশন',
      titleEn: 'School ERP, Hospital & POS Software Ecosystem',
      subtitleBn: 'আপনার ব্যবসা ও প্রতিষ্ঠানের সম্পূর্ণ ডিজিটাল অটোমেশনের জন্য সেরা প্রযুক্তিনির্ভর আধুনিক সফটওয়্যার ও ওয়েবসাইট তৈরি সেবা।',
      subtitleEn: 'State-of-the-art enterprise software and custom web development designed for operational excellence.',
      badgeBn: '💼 অল-ইন-ওয়ান বিজনেস আইটি স্যুট',
      badgeEn: '💼 All-in-One Business IT Suite',
      ctaPrimaryTextBn: 'আমাদের সার্ভিসসমূহ',
      ctaPrimaryTextEn: 'Our Services',
      ctaPrimaryLink: '#services',
      ctaSecondaryTextBn: 'সরাসরি পরামর্শ নিন',
      ctaSecondaryTextEn: 'Consultation',
      ctaSecondaryLink: '#contact'
    }
  ],

  stats: [
    { id: 's1', numberBn: '৫০+', numberEn: '50+', labelBn: 'সফল ক্লায়েন্ট এনজিও', labelEn: 'Client NGOs' },
    { id: 's2', numberBn: '১,৫০,০০০+', numberEn: '150,000+', labelBn: 'সুবিধাভোগী ও সদস্য', labelEn: 'Active Members' },
    { id: 's3', numberBn: '৯৯.৯%', numberEn: '99.9%', labelBn: 'আপটাইম গ্যারান্টি', labelEn: 'Uptime SLA' },
    { id: 's4', numberBn: '২৪/৭', numberEn: '24/7', labelBn: 'ডেডিকেটেড টেক সাপোর্ট', labelEn: 'Support Team' }
  ],

  servicesHeadingBn: 'আমাদের এন্টারপ্রাইজ সফটওয়্যার ও ডিজিটাল সার্ভিসসমূহ',
  servicesHeadingEn: 'Our Enterprise Software & Digital Solutions',
  servicesSubtitleBn: 'এনজিও ইআরপির পাশাপাশি শিক্ষা প্রতিষ্ঠান, ব্যবসা প্রতিষ্ঠান, হাসপাতাল ও রিটেইলের জন্য আধুনিক সফটওয়্যার সলিউশন',
  servicesSubtitleEn: 'Comprehensive IT solutions tailored for educational institutions, healthcare, retail, and modern businesses.',

  services: [
    {
      id: 'ngo-erp',
      iconName: 'Building2',
      titleBn: 'NGO & Microcredit ERP System',
      titleEn: 'NGO & Microcredit ERP System',
      badgeBn: 'প্রধান পণ্য',
      badgeEn: 'Flagship Product',
      descriptionBn: 'ক্ষুদ্রঋণ, সঞ্চয় পাসবুক, ব্রাঞ্চ ইনভেন্টরি, ডাবল এন্ট্রি একাউন্টিং, ক্যাশ রিকনসিলিয়েশন ও ফিল্ড অফিসার কালেকশন মোবাইল অ্যাপ।',
      descriptionEn: 'End-to-end microfinance, savings passbooks, branch inventory, accounting, and mobile field collection suite.',
      featuresBn: [
        'MRA বাংলাদেশ নিয়ন্ত্রক নীতিমালা অনুযায়ী রিপোর্ট',
        'সাপ্তাহিক ও মাসিক কিস্তি আদায় শিডিউল',
        'ফিল্ড অফিসারদের জন্য অফলাইন সিঙ্ক মোবাইল অ্যাপ',
        'প্রতিটি এনজিওর নিজস্ব স্বতন্ত্র পাবলিক ওয়েবসাইট'
      ],
      featuresEn: [
        'MRA Bangladesh regulatory reporting compliance',
        'Weekly & monthly installment schedules',
        'Field officer offline sync mobile app',
        'Individual public portal for each NGO'
      ],
      ctaTextBn: 'বিস্তারিত ও ডেমো',
      ctaTextEn: 'Details & Demo',
      ctaLink: '#client-demos',
      isPopular: true
    },
    {
      id: 'school-management',
      iconName: 'GraduationCap',
      titleBn: 'School Management System (SMS)',
      titleEn: 'School Management System (SMS)',
      badgeBn: 'জনপ্রিয়',
      badgeEn: 'Popular',
      descriptionBn: 'স্কুল, কলেজ ও মাদ্রাসার জন্য অনলাইন ভর্তি, অটোমেটিক রেজাল্ট শিট, ডিজিটাল হাজিরা (RFID/বায়োমেট্রিক) ও ফি আদায় সফটওয়্যার।',
      descriptionEn: 'Comprehensive campus management for schools, colleges, and madrasas with fees, attendance, and exam grades.',
      featuresBn: [
        'স্টুডেন্ট ডাটাবেস ও ডিজিটাল আইডি কার্ড জেনারেশন',
        'ট্যাবুলেশন শিট ও প্রোগ্রেস রিপোর্ট কার্ড তৈরি',
        'অভিভাবকদের স্বয়ংক্রিয় এসএমএস অ্যালার্ট',
        'অনলাইন ফি পেমেন্ট ও অ্যাকাউন্টস ইন্টিগ্রেশন'
      ],
      featuresEn: [
        'Student directory & automated ID cards',
        'Tabulation sheets & GPA report cards',
        'Automated parent SMS alerts on absence',
        'Online student fee collection & ledger'
      ],
      ctaTextBn: 'স্কুল ইআরপি বুক করুন',
      ctaTextEn: 'Inquire School ERP',
      ctaLink: '#contact'
    },
    {
      id: 'pos-billing',
      iconName: 'ShoppingCart',
      titleBn: 'Smart POS & Retail Billing',
      titleEn: 'Smart POS & Retail Billing',
      badgeBn: 'সুপার ফাস্ট',
      badgeEn: 'Superfast',
      descriptionBn: 'সুপারশপ, শোরুম ও রিটেইল দোকানের জন্য বারকোড স্ক্যানার ও থার্মাল রিসিট প্রিন্টিং সুবিধা সম্পন্ন ক্লাউড পিওএস সফটওয়্যার।',
      descriptionEn: 'High-speed cloud POS billing with thermal receipt printers, barcode scanning, and multi-counter cash registers.',
      featuresBn: [
        'কয়েক সেকেন্ডে বারকোড স্ক্যান ও দ্রুত বিলিং',
        'ভ্যাট, ক্যাশব্যাক ও কুপন ডিসকাউন্ট ম্যানেজমেন্ট',
        'দৈনিক ক্যাশ ক্লোজিং ও প্রফিট/লস হিসেব',
        'অফলাইনে কাজ করার ক্ষমতা ও ক্লাউড ব্যাকআপ'
      ],
      featuresEn: [
        'Instant barcode scanning & billing',
        'VAT, discounts, and customer loyalty points',
        'Daily cash drawer closing & P&L audits',
        'Offline billing capability with auto-sync'
      ],
      ctaTextBn: 'পিওএস ডেমো দেখুন',
      ctaTextEn: 'View POS Demo',
      ctaLink: '#contact'
    },
    {
      id: 'shop-inventory',
      iconName: 'Store',
      titleBn: 'Shop & Multi-Store Inventory',
      titleEn: 'Shop & Multi-Store Inventory',
      badgeBn: 'স্টক গার্ড',
      badgeEn: 'Stock Guard',
      descriptionBn: 'গোডাউন ও একাধিক ব্রাঞ্চের স্টক ট্র্যাকিং, সাপ্লায়ার ও কাস্টমার বাকির খাতা, পণ্য ক্রয়-বিক্রয় ও এক্সপায়ারি অ্যালার্ট।',
      descriptionEn: 'Multi-warehouse stock control, supplier & customer ledger, purchase orders, and low-stock alerts.',
      featuresBn: [
        'আইটেম ওয়াইজ লাইভ স্টক ব্যালেন্স ও হিস্ট্রি',
        'সাপ্লায়ার ও কাস্টমার বাকির খাতা ও নোটিশ এসএমএস',
        'পণ্য ক্রয়ের চালান ও ওয়্যারহাউজ ট্রান্সফার',
        'মেয়াদোত্তীর্ণ ও ক্ষতিগ্রস্থ পণ্যের রিপোর্ট'
      ],
      featuresEn: [
        'Real-time warehouse inventory valuation',
        'Customer credit accounts & payment reminders',
        'Purchase orders & inter-branch transfers',
        'Product batch expiry tracking'
      ],
      ctaTextBn: 'ইনভেন্টরি সফটওয়্যার',
      ctaTextEn: 'Explore Inventory',
      ctaLink: '#contact'
    },
    {
      id: 'hospital-management',
      iconName: 'Hospital',
      titleBn: 'Hospital & Diagnostic Management',
      titleEn: 'Hospital & Diagnostic Management',
      badgeBn: 'মেডিকেল স্যুট',
      badgeEn: 'Medical Suite',
      descriptionBn: 'হাসপাতাল ও ডায়াগনস্টিক সেন্টারের রোগী ভর্তি, প্যাথলজি ও রেডিওলজি টেস্ট বিলিং, ডক্টর কমিশন ও বেড ম্যানেজমেন্ট।',
      descriptionEn: 'Complete clinical software covering patient admission, pathology & radiology tests, and bed allocations.',
      featuresBn: [
        'প্যাথলজি ও রেডিওলজি টেস্ট রিপোর্ট এডিটর',
        'রেফারেন্স ডক্টর কমিশন ক্যালকুলেটর',
        'ইনডোর বেড, কেবিন ও আইসিইউ ম্যানেজমেন্ট',
        'ফার্মেসি ও ওটি বিলিং সেন্ট্রাল ইন্টিগ্রেশন'
      ],
      featuresEn: [
        'Pathology & radiology test report generation',
        'Referral doctor commission management',
        'Inpatient bed, cabin, and ICU tracker',
        'Integrated pharmacy & OT billing'
      ],
      ctaTextBn: 'হাসপাতাল ইআরপি ডেমো',
      ctaTextEn: 'Hospital ERP Demo',
      ctaLink: '#contact'
    },
    {
      id: 'doctor-prescription',
      iconName: 'Stethoscope',
      titleBn: 'Doctor Prescription & Serial System',
      titleEn: 'Doctor Prescription & Serial System',
      badgeBn: 'স্মার্ট চেম্বার',
      badgeEn: 'Smart Clinic',
      descriptionBn: 'চিকিৎসকদের চেম্বারের জন্য ড্রাগ ডাটাবেসসহ ডিজিটাল প্রেসক্রিপশন জেনারেটর, পেশেন্ট হিস্ট্রি ও রোগী সিরিয়াল সফটওয়্যার।',
      descriptionEn: 'Smart digital prescription pad with drug library, patient history repository, and queue booking system.',
      featuresBn: [
        'ব্র্যান্ড ও জেনেরিক নামের ড্রাগ ডাটাবেস ও ডোজ শিডিউল',
        'রোগীর পূর্বের ভিজিট, টেস্ট রিপোর্ট ও হিস্ট্রি সংরক্ষণ',
        'প্রিন্টেবল প্রেসক্রিপশন ও প্রি-প্রিন্টেড প্যাড সাপোর্ট',
        'রোগী সিরিয়াল অ্যাপয়েন্টমেন্ট ও টোকেন কাউন্টার'
      ],
      featuresEn: [
        'Pre-loaded Bangladesh drug dictionary & dosages',
        'Comprehensive patient case history tracking',
        'Custom prescription pad design & printing',
        'Token queue & serial appointment desk'
      ],
      ctaTextBn: 'প্রেসক্রিপশন প্যাড দেখুন',
      ctaTextEn: 'Prescription Pad Demo',
      ctaLink: '#contact'
    },
    {
      id: 'website-design',
      iconName: 'Globe',
      titleBn: 'Custom Website & Web Application',
      titleEn: 'Custom Website & Web Application',
      badgeBn: 'প্রিমিয়াম ডিজাইন',
      badgeEn: 'Premium Design',
      descriptionBn: 'কর্পোরেট প্রতিষ্ঠান, ই-কমার্স ও স্টার্টআপের জন্য আধুনিক, এসইও-বান্ধব ও আল্ট্রা-ফাস্ট রেসপন্সিভ ওয়েবসাইট ডেভেলপমেন্ট।',
      descriptionEn: 'High-converting custom web applications, e-commerce storefronts, and dynamic portals.',
      featuresBn: [
        'আধুনিক ও আই-ক্যাচিং রেসপন্সিভ মোবাইল ফ্রেন্ডলি ডিজাইন',
        'বিকাশ, নগদ, রকেট ও ভিসা/মাস্টারকার্ড পেমেন্ট গেটওয়ে',
        'গুগল সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)',
        'ক্লাউডফ্লেয়ার ও ক্লাউড হোস্টিংয়ে ১ সেকেন্ডে পেজ লোড'
      ],
      featuresEn: [
        'Bespoke, dynamic, mobile-first UI/UX',
        'bKash, Nagad, and credit card gateway integration',
        'Built-in Google search engine ranking (SEO)',
        'Cloudflare Global Edge acceleration'
      ],
      ctaTextBn: 'ওয়েবসাইট বানাতে চান?',
      ctaTextEn: 'Build Your Website',
      ctaLink: '#contact'
    },
    {
      id: 'mobile-app',
      iconName: 'Smartphone',
      titleBn: 'Mobile App Development',
      titleEn: 'Mobile App Development',
      badgeBn: 'অ্যান্ড্রয়েড + iOS',
      badgeEn: 'Android + iOS',
      descriptionBn: 'আপনার ব্যবসা বা সেবার জন্য কাস্টম অ্যান্ড্রয়েড ও আইওএস মোবাইল অ্যাপ্লিকেশন তৈরি ও গুগল প্লে-স্টোর পাবলিশিং।',
      descriptionEn: 'Native-feel Flutter and React Native cross-platform mobile apps for business workflows.',
      featuresBn: [
        'অফলাইন ফার্স্ট আর্কিটেকচার (ইন্টারনেট ছাড়াও কাজ করবে)',
        'পুশ নোটিফিকেশন ও এসএমএস ভেরিফিকেশন',
        'লাইভ জিপিএস লোকেশন ও জিও-ফেন্সিং ট্র্যাকিং',
        'প্লে-স্টোর ও অ্যাপ-স্টোরে অফিসিয়াল পাবলিশিং'
      ],
      featuresEn: [
        'Offline-first synchronization with local cache',
        'Real-time push notifications & OTP SMS',
        'GPS location tracking & geofencing',
        'App store & Play store setup and deployment'
      ],
      ctaTextBn: 'অ্যাপ বানাতে পরামর্শ নিন',
      ctaTextEn: 'Consult App Project',
      ctaLink: '#contact'
    }
  ],

  pricingHeadingBn: 'স্বচ্ছ ও সাশ্রয়ী এনজিও ইআরপি সাবস্ক্রিপশন প্ল্যান',
  pricingHeadingEn: 'Transparent & Flexible SaaS Pricing Plans',
  pricingSubtitleBn: 'আপনার এনজিওর আকার ও ব্রাঞ্চ সংখ্যা অনুযায়ী সবচেয়ে উপযুক্ত প্ল্যান বেছে নিন। কোনো গোপন চার্জ নেই।',
  pricingSubtitleEn: 'Select the optimal plan according to your NGO size and branches. Transparent, zero hidden costs.',

  pricingPlans: [
    {
      id: 'starter',
      nameBn: 'Starter NGO (ক্ষুদ্র এনজিও)',
      nameEn: 'Starter NGO Package',
      badgeBn: 'নতুন এনজিওর জন্য',
      badgeEn: 'Entry Level',
      priceMonthly: 2500,
      priceYearly: 24000,
      descriptionBn: 'নতুন ও আঞ্চলিক এনজিওদের জন্য যারা প্রাথমিক ঋণ ও সঞ্চয় কার্যক্রম পরিচালনা করছেন।',
      descriptionEn: 'Ideal for local and emerging NGOs initiating microcredit programs.',
      featuresBn: [
        'সর্বোচ্চ ১টি শাখা অফিস ও ৫ জন কর্মী',
        '১,০০০ জন পর্যন্ত সদস্য ও ঋণী প্রোফাইল',
        'সঞ্চয় হিসাব ও সাপ্তাহিক কিস্তি আদায়',
        'বেসিক ডেবিট/ক্রেডিট ভাউচার ও ক্যাশ বুক',
        'বিনামূল্যে একটি স্ট্যান্ডার্ড পাবলিক ওয়েবসাইট',
        'প্রতি মাসে ২০০ টি ফ্রি এসএমএস ক্রেডিট'
      ],
      featuresEn: [
        '1 Branch office & up to 5 staff',
        'Up to 1,000 active members & loan files',
        'Savings passbook & weekly collections',
        'Basic accounting vouchers & cash book',
        'Free standard public landing website',
        '200 Free SMS credits monthly'
      ],
      ctaTextBn: 'স্টার্টার প্ল্যান শুরু করুন',
      ctaTextEn: 'Choose Starter',
      isPopular: false
    },
    {
      id: 'growth',
      nameBn: 'Standard / Growth (গ্রোথ প্ল্যান)',
      nameEn: 'Standard / Growth Plan',
      badgeBn: 'সর্বাধিক জনপ্রিয়',
      badgeEn: 'Most Popular',
      priceMonthly: 5500,
      priceYearly: 55000,
      descriptionBn: 'মাঝারি এনজিও ও বহুমুখী সামাজিক উন্নয়ন সংস্থার জন্য স্বয়ংসম্পূর্ণ ও স্মার্ট সলিউশন।',
      descriptionEn: 'The full-featured solution for established multi-branch NGOs.',
      featuresBn: [
        'সর্বোচ্চ ৫টি শাখা অফিস ও ২৫ জন কর্মী',
        '১০,০০০ জন পর্যন্ত সদস্য ও ঋণ গ্রহীতা',
        'ফিল্ড অফিসারদের জন্য অফলাইন মোবাইল অ্যাপ',
        'শাখাভিত্তিক ইনভেন্টরি ও ত্রাণ/মালামাল বিতরণ',
        'সম্পূর্ণ ডাবল এন্ট্রি একাউন্টিং ও ট্রায়াল ব্যালেন্স',
        'কাস্টম ডোমেইন সংযোগ ও ডায়নামিক সিএমএস',
        'প্রতি মাসে ১,০০০ টি ফ্রি এসএমএস ক্রেডিট',
        '২৪/৭ প্রায়োরিটি ফোন ও হোয়াটসঅ্যাপ সাপোর্ট'
      ],
      featuresEn: [
        'Up to 5 Branches & 25 staff accounts',
        'Up to 10,000 active members',
        'Field officer offline collection mobile app',
        'Multi-branch inventory & relief tracking',
        'Double-entry balance sheets & audit ledgers',
        'Custom domain binding with full CMS',
        '1,000 Free SMS credits monthly',
        '24/7 Priority phone & WhatsApp support'
      ],
      ctaTextBn: 'গ্রোথ প্ল্যান বেছে নিন',
      ctaTextEn: 'Choose Growth',
      isPopular: true
    },
    {
      id: 'enterprise',
      nameBn: 'Enterprise / Microfinance (এন্টারপ্রাইজ)',
      nameEn: 'Enterprise / Microfinance',
      badgeBn: 'সম্পূর্ণ নিয়ন্ত্রিত',
      badgeEn: 'Dedicated Cloud',
      priceMonthly: 12000,
      priceYearly: 120000,
      descriptionBn: 'বৃহৎ ক্ষুদ্রঋণ প্রতিষ্ঠান, এমআরএ লাইসেন্সপ্রাপ্ত সমিতি ও ডেডিকেটেড ফায়ারবেস ক্লাউড ক্লায়েন্ট।',
      descriptionEn: 'For large microfinance institutions needing isolated cloud hosting and enterprise scalability.',
      featuresBn: [
        'আনলিমিটেড শাখা অফিস ও ফিল্ড কর্মকর্তা',
        'আনলিমিটেড সদস্য, কিস্তি ও ডিপিএস খাতা',
        'ডেডিকেটেড নিজস্ব ফায়ারবেস ক্লাউড ডাটাবেস (Mode B)',
        'সামাজিক ব্যবসা ও এন্টারপ্রাইজ ইনভেন্টরি মডেল',
        'ক্যাশ রিকনসিলিয়েশন ও ব্যাংক অটোমেশন',
        'কাস্টম ব্রান্ডেড অ্যান্ড্রয়েড মোবাইল অ্যাপ',
        'প্রতি মাসে ৫,০০০ টি ফ্রি এসএমএস ক্রেডিট',
        'ডেডিকেটেড সিনিয়র ইঞ্জিনিয়ার সাপোর্ট'
      ],
      featuresEn: [
        'Unlimited branches & staff users',
        'Unlimited members & microcredit portfolios',
        'Dedicated Firebase Cloud project (Mode B)',
        'Social business enterprise valuation',
        'Cash drawer reconciliation & bank reconciliation',
        'Custom branded Android mobile app',
        '5,000 Free SMS credits monthly',
        'Dedicated Senior Engineer support manager'
      ],
      ctaTextBn: 'এন্টারপ্রাইজ ডেমো নিন',
      ctaTextEn: 'Contact Enterprise',
      isPopular: false
    }
  ],

  demoHeadingBn: 'আমাদের ক্লায়েন্ট এনজিওদের লাইভ ডেমো পোর্টাল দেখুন',
  demoHeadingEn: 'Explore Live Client NGO Web Portals',
  demoSubtitleBn: 'নিচের যে কোনো ডেমো এনজিও পোর্টালে ক্লিক করে তাদের সম্পূর্ণ ওয়েবসাইট ও কার্যক্রম দেখে নিন:',
  demoSubtitleEn: 'Click any registered tenant below to experience their isolated public portal and ERP entrance:',

  footerCol1AboutBn: 'এন্টিগ্র্যাভিটি আইটি সলিউশনস বাংলাদেশের এনজিও, মাইক্রোফাইন্যান্স, শিক্ষাপ্রতিষ্ঠান এবং বাণিজ্যিক উদ্যোগের জন্য সর্বাধুনিক প্রযুক্তিভিত্তিক ইআরপি ও সফটওয়্যার সেবা প্রদানে অঙ্গীকারবদ্ধ।',
  footerCol1AboutEn: 'Antigravity IT Solutions is dedicated to delivering state-of-the-art enterprise software, ERP, and web technologies for NGOs, schools, healthcare, and retail businesses.',
  footerCol2TitleBn: 'আমাদের সফটওয়্যার সলিউশন',
  footerCol2TitleEn: 'Software Solutions',
  footerCol2Links: [
    { labelBn: 'NGO & Microcredit ERP', labelEn: 'NGO & Microcredit ERP', href: '#services' },
    { labelBn: 'School Management System', labelEn: 'School Management System', href: '#services' },
    { labelBn: 'Smart POS & Retail Billing', labelEn: 'Smart POS & Retail Billing', href: '#services' },
    { labelBn: 'Hospital Management System', labelEn: 'Hospital Management System', href: '#services' },
    { labelBn: 'Doctor Prescription Software', labelEn: 'Doctor Prescription Software', href: '#services' },
    { labelBn: 'Website & App Development', labelEn: 'Website & App Development', href: '#services' }
  ],
  footerCol3TitleBn: 'প্ল্যাটফর্ম ও ক্লায়েন্ট লিংক',
  footerCol3TitleEn: 'Platform & Portals',
  footerCol3Links: [
    { labelBn: 'এনজিও ফিচার পরিচিতি', labelEn: 'NGO ERP Features', href: '#ngo-erp' },
    { labelBn: 'সাবস্ক্রিপশন প্রাইসিং', labelEn: 'Pricing Plans', href: '#pricing' },
    { labelBn: 'ক্লায়েন্ট লাইভ ডেমো', labelEn: 'Client Demos', href: '#client-demos' },
    { labelBn: 'ক্লায়েন্ট স্টাফ লগইন (/cerp)', labelEn: 'Client Staff Login (/cerp)', href: '/cerp' },
    { labelBn: 'সুপার এডমিন লগইন (/mahinerp)', labelEn: 'Super Admin Portal (/mahinerp)', href: '/mahinerp' }
  ],
  footerCol4TitleBn: 'যোগাযোগ ও সাপোর্ট',
  footerCol4TitleEn: 'Contact & Support',
  copyrightTextBn: '© ২০২৬ এন্টিগ্র্যাভিটি আইটি সলিউশনস। সর্বস্বত্ব সংরক্ষিত।',
  copyrightTextEn: '© 2026 Antigravity IT Solutions. All rights reserved.',

  metaTitleBn: 'Antigravity IT — আধুনিক এনজিও ইআরপি ও এন্টারপ্রাইজ সফটওয়্যার',
  metaTitleEn: 'Antigravity IT — NGO ERP & Enterprise Software Solutions',
  metaDescriptionBn: 'বাংলাদেশের এনজিও, স্কুল, হাসপাতাল ও রিটেইলের জন্য আধুনিক ক্লাউড সফটওয়্যার ও ওয়েবসাইট তৈরি সেবা।',
  metaDescriptionEn: 'Leading cloud-native ERP and IT solutions for NGOs, microfinance, schools, and enterprise businesses.',
  metaKeywords: 'NGO ERP, microfinance software, school management, pos billing, hospital software, web design bangladesh'
};

const STORAGE_KEY = 'ngo_platform_website_cms';

export function loadPlatformWebsiteConfig(): PlatformWebsiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PLATFORM_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Could not read platform CMS from local storage, using defaults:', err);
  }
  return DEFAULT_PLATFORM_CONFIG;
}

export function savePlatformWebsiteConfig(config: PlatformWebsiteConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Asynchronously sync to central firestore if connected
    try {
      const { firestore } = getOrCreateFirebaseInstance();
      const docRef = doc(firestore, 'superadmin', 'platform_cms');
      setDoc(docRef, config, { merge: true }).catch(() => {});
    } catch {}
  } catch (err) {
    console.warn('Could not save platform CMS:', err);
  }
}
