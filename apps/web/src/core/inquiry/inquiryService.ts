import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { getOrCreateFirebaseInstance } from '../firebase/firebaseClient';

export interface WebsiteInquiry {
  id: string;
  source: 'platform' | 'tenant';
  tenantId?: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  organization?: string;
  subjectOrService: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  sourcePage?: string;
  createdAt: number;
}

const PLATFORM_INQUIRIES_KEY = 'ngo_platform_inquiries';
const TENANT_INQUIRIES_PREFIX = 'ngo_tenant_inquiries_';

const DEMO_PLATFORM_INQUIRIES: WebsiteInquiry[] = [
  {
    id: 'inq-sa-1',
    source: 'platform',
    senderName: 'মো: হাসানুর রহমান',
    senderPhone: '01712-345678',
    senderEmail: 'hasan@gramin-unnayan.org',
    organization: 'গ্রামীণ উন্নয়ন সংস্থা (কুষ্টিয়া)',
    subjectOrService: 'School Management System & NGO ERP',
    message: 'আমাদের সংস্থার অধীনে ৫টি প্রাথমিক বিদ্যালয় ও ৩টি ফিল্ড মাইক্রোক্রেডিট শাখা রয়েছে। আমরা পূর্ণাঙ্গ ক্লাউড সলিউশন নিতে আগ্রহী। ডেমো ও প্রাইজ কোটেশন পাঠালে উপকৃত হব।',
    status: 'unread',
    createdAt: Date.now() - 2 * 3600000 // 2 hours ago
  },
  {
    id: 'inq-sa-2',
    source: 'platform',
    senderName: 'ডা: রফিকুল ইসলাম',
    senderPhone: '01819-876543',
    senderEmail: 'info@alor-dishari.org',
    organization: 'আলোকিত কমিউনিটি ক্লিনিক ট্রাস্ট',
    subjectOrService: 'Hospital Management & Prescription',
    message: 'আমরা দরিদ্র রোগীদের জন্য স্বল্পমূল্যের চিকিৎসা কেন্দ্র চালাই। প্রেসক্রিপশন ও ফার্মাসি মডিউলের জন্য সফটওয়্যার খুঁজছি।',
    status: 'read',
    createdAt: Date.now() - 24 * 3600000 // 1 day ago
  }
];

const DEMO_TENANT_INQUIRIES: Record<string, WebsiteInquiry[]> = {
  'demo-jagorani': [
    {
      id: 'inq-t-1',
      source: 'tenant',
      tenantId: 'demo-jagorani',
      senderName: 'মোছা: রহিমা বেগম',
      senderPhone: '01911-223344',
      organization: 'সাভার মহিলা সমিতি',
      subjectOrService: 'নারী উদ্যোক্তা ও ডিপিএস সঞ্চয় স্কিম',
      message: 'আমি ঘরে বসে হাঁস-মুরগি পালনের জন্য ৫০,০০০ টাকা ক্ষুদ্রঋণ এবং মাসিক ১,০০০ টাকার একটি ডিপিএস খুলতে চাচ্ছি। নিকটস্থ সাভার শাখা থেকে যোগাযোগ করলে ভালো হয়।',
      status: 'unread',
      createdAt: Date.now() - 3 * 3600000
    },
    {
      id: 'inq-t-2',
      source: 'tenant',
      tenantId: 'demo-jagorani',
      senderName: 'আনোয়ার হোসেন',
      senderPhone: '01711-998877',
      senderEmail: 'anwar.h@gmail.com',
      subjectOrService: 'লাখপতি ডিপিএস প্রকল্প (৫ বছর)',
      message: 'মাসিক ৩,০০০ টাকা কিস্তিতে ৫ বছর মেয়াদী সঞ্চয় প্রকল্পে মেয়াদান্তে কত টাকা ফেরত পাওয়া যাবে এবং নমিনির কি কি কাগজপত্র লাগবে?',
      status: 'read',
      createdAt: Date.now() - 36 * 3600000
    }
  ]
};

// ==========================================
// 1. SUPER ADMIN PLATFORM INQUIRIES
// ==========================================

export const getPlatformInquiries = (): WebsiteInquiry[] => {
  try {
    const raw = localStorage.getItem(PLATFORM_INQUIRIES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  localStorage.setItem(PLATFORM_INQUIRIES_KEY, JSON.stringify(DEMO_PLATFORM_INQUIRIES));
  return DEMO_PLATFORM_INQUIRIES;
};

export const savePlatformInquiry = (
  data: Omit<WebsiteInquiry, 'id' | 'source' | 'status' | 'createdAt'>
): WebsiteInquiry => {
  const newInquiry: WebsiteInquiry = {
    ...data,
    id: `inq-sa-${Date.now()}`,
    source: 'platform',
    status: 'unread',
    createdAt: Date.now()
  };

  const existing = getPlatformInquiries();
  const updated = [newInquiry, ...existing];
  localStorage.setItem(PLATFORM_INQUIRIES_KEY, JSON.stringify(updated));

  // Instant broadcast to in-window listeners & other open tabs
  try {
    window.dispatchEvent(new CustomEvent('ngo_platform_inquiry_added', { detail: newInquiry }));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('ngo_platform_inquiries_channel');
      bc.postMessage(newInquiry);
      bc.close();
    }
  } catch {}

  // Sync to Firestore superadmin collection (background)
  try {
    const { firestore } = getOrCreateFirebaseInstance();
    const docRef = doc(firestore, 'superadmin_inquiries', newInquiry.id);
    setDoc(docRef, newInquiry).catch(() => {});
  } catch {}

  return newInquiry;
};

export const fetchPlatformInquiriesFromCloud = async (): Promise<WebsiteInquiry[]> => {
  try {
    const { firestore } = getOrCreateFirebaseInstance();
    const snap = await getDocs(collection(firestore, 'superadmin_inquiries'));
    if (!snap.empty) {
      const cloudList: WebsiteInquiry[] = [];
      snap.forEach((d) => {
        cloudList.push(d.data() as WebsiteInquiry);
      });

      const existing = getPlatformInquiries();
      const existingIds = new Set(existing.map((i) => i.id));
      const newItems = cloudList.filter((i) => !existingIds.has(i.id));

      if (newItems.length > 0) {
        const merged = [...newItems, ...existing];
        merged.sort((a, b) => b.createdAt - a.createdAt);
        localStorage.setItem(PLATFORM_INQUIRIES_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch platform inquiries from cloud:', err);
  }
  return getPlatformInquiries();
};

export type InquiryMessage = WebsiteInquiry;

export const updatePlatformInquiryStatus = (id: string, status: 'unread' | 'read' | 'archived') => {
  const existing = getPlatformInquiries();
  const updated = existing.map((i) => (i.id === id ? { ...i, status } : i));
  localStorage.setItem(PLATFORM_INQUIRIES_KEY, JSON.stringify(updated));
  try {
    window.dispatchEvent(new CustomEvent('ngo_platform_inquiry_updated'));
  } catch {}
};

export const markPlatformInquiryAsRead = (id: string) => {
  updatePlatformInquiryStatus(id, 'read');
};

export const deletePlatformInquiry = (id: string) => {
  const existing = getPlatformInquiries();
  const updated = existing.filter((i) => i.id !== id);
  localStorage.setItem(PLATFORM_INQUIRIES_KEY, JSON.stringify(updated));
  try {
    window.dispatchEvent(new CustomEvent('ngo_platform_inquiry_updated'));
  } catch {}
};

export const getPlatformUnreadCount = (): number => {
  const list = getPlatformInquiries();
  return list.filter((i) => i.status === 'unread').length;
};

// ==========================================
// 2. CLIENT NGO TENANT INQUIRIES
// ==========================================

export const getTenantInquiries = (tenantId: string = 'demo-jagorani'): WebsiteInquiry[] => {
  const effectiveTenantId = tenantId || 'demo-jagorani';
  const key = `${TENANT_INQUIRIES_PREFIX}${effectiveTenantId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const defaults = DEMO_TENANT_INQUIRIES[effectiveTenantId] || DEMO_TENANT_INQUIRIES['demo-jagorani'] || [];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

export const saveTenantInquiry = (
  tenantId: string = 'demo-jagorani',
  data: Omit<WebsiteInquiry, 'id' | 'source' | 'status' | 'createdAt'>
): WebsiteInquiry => {
  const effectiveTenantId = tenantId || 'demo-jagorani';
  const key = `${TENANT_INQUIRIES_PREFIX}${effectiveTenantId}`;
  const newInquiry: WebsiteInquiry = {
    ...data,
    id: `inq-${effectiveTenantId}-${Date.now()}`,
    source: 'tenant',
    tenantId: effectiveTenantId,
    status: 'unread',
    createdAt: Date.now()
  };

  const existing = getTenantInquiries(effectiveTenantId);
  const updated = [newInquiry, ...existing];
  localStorage.setItem(key, JSON.stringify(updated));

  // Instant broadcast to in-window listeners & other open tabs
  try {
    window.dispatchEvent(
      new CustomEvent('ngo_tenant_inquiry_added', {
        detail: { tenantId: effectiveTenantId, inquiry: newInquiry }
      })
    );
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(`ngo_tenant_${effectiveTenantId}_inquiries_channel`);
      bc.postMessage(newInquiry);
      bc.close();
    }
  } catch {}

  // Sync to Firestore tenant collection background (non-blocking)
  try {
    const { firestore } = getOrCreateFirebaseInstance();
    const docRef = doc(firestore, 'tenants', effectiveTenantId, 'inquiries', newInquiry.id);
    setDoc(docRef, newInquiry).catch(() => {});
  } catch {}

  return newInquiry;
};

export const fetchTenantInquiriesFromCloud = async (
  tenantId: string = 'demo-jagorani'
): Promise<WebsiteInquiry[]> => {
  const effectiveTenantId = tenantId || 'demo-jagorani';
  const key = `${TENANT_INQUIRIES_PREFIX}${effectiveTenantId}`;
  try {
    const { firestore } = getOrCreateFirebaseInstance();
    const snap = await getDocs(collection(firestore, 'tenants', effectiveTenantId, 'inquiries'));
    if (!snap.empty) {
      const cloudList: WebsiteInquiry[] = [];
      snap.forEach((d) => {
        cloudList.push(d.data() as WebsiteInquiry);
      });

      const existing = getTenantInquiries(effectiveTenantId);
      const existingIds = new Set(existing.map((i) => i.id));
      const newItems = cloudList.filter((i) => !existingIds.has(i.id));

      if (newItems.length > 0) {
        const merged = [...newItems, ...existing];
        merged.sort((a, b) => b.createdAt - a.createdAt);
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch tenant inquiries from cloud:', err);
  }
  return getTenantInquiries(effectiveTenantId);
};

export const updateTenantInquiryStatus = (
  tenantId: string = 'demo-jagorani',
  id: string,
  status: 'unread' | 'read' | 'archived'
) => {
  const effectiveTenantId = tenantId || 'demo-jagorani';
  const key = `${TENANT_INQUIRIES_PREFIX}${effectiveTenantId}`;
  const existing = getTenantInquiries(effectiveTenantId);
  const updated = existing.map((i) => (i.id === id ? { ...i, status } : i));
  localStorage.setItem(key, JSON.stringify(updated));
};

export const markTenantInquiryAsRead = (tenantId: string = 'demo-jagorani', id: string) => {
  updateTenantInquiryStatus(tenantId, id, 'read');
};

export const deleteTenantInquiry = (tenantId: string = 'demo-jagorani', id: string) => {
  const effectiveTenantId = tenantId || 'demo-jagorani';
  const key = `${TENANT_INQUIRIES_PREFIX}${effectiveTenantId}`;
  const existing = getTenantInquiries(effectiveTenantId);
  const updated = existing.filter((i) => i.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
};

export const getTenantUnreadCount = (tenantId: string = 'demo-jagorani'): number => {
  const effectiveTenantId = tenantId || 'demo-jagorani';
  const list = getTenantInquiries(effectiveTenantId);
  return list.filter((i) => i.status === 'unread').length;
};
