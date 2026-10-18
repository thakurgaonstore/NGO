export type TenantStatus = 'active' | 'suspended' | 'expired' | 'trial';

export type DeploymentMode = 'MODE_A' | 'MODE_B';

export interface TenantFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  unsignedPreset: string;
}

export interface SmsProviderConfig {
  provider: 'bulksmsbd' | 'mimsms' | 'generic';
  senderId?: string;
  apiKey?: string;
  enabled: boolean;
}

export interface PaymentGatewayConfig {
  bkashEnabled: boolean;
  bkashMerchantNumber?: string;
  nagadEnabled: boolean;
  nagadMerchantNumber?: string;
  rocketEnabled: boolean;
  sslCommerzEnabled: boolean;
  storeId?: string;
}

export interface TenantSettings {
  orgName: {
    en: string;
    bn: string;
  };
  regNumber: string;
  slogan?: {
    en: string;
    bn: string;
  };
  email: string;
  phone: string;
  address: {
    en: string;
    bn: string;
  };
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string; // Hex or HSL
  fiscalYearStartMonth: number; // 7 = July for Bangladesh
  currency: string; // "BDT"
  currencySymbol: string; // "৳"
  timeZone: string; // "Asia/Dhaka"
  dateFormat: string; // "DD/MM/YYYY"
  useBanglaNumerals: boolean;
  cloudinary?: CloudinaryConfig;
  smsConfig?: SmsProviderConfig;
  paymentConfig?: PaymentGatewayConfig;
}

export interface TenantPlan {
  id: string;
  name: string;
  description: string;
  priceBDT: number;
  billingCycle: 'monthly' | 'yearly';
  allowedModules: string[];
  limits: {
    users: number;
    branches: number;
    storageMB: number;
    smsCredits: number;
  };
  isPopular?: boolean;
}

export interface TenantQuotaUsage {
  usersCount: number;
  branchesCount: number;
  estimatedDailyReads: number;
  estimatedDailyWrites: number;
  smsCreditsRemaining: number;
  lastQuotaResetDate?: string;
}

export interface Tenant {
  id: string;
  clientId: string; // Human-friendly code: e.g. "T1001" or "JAGORANI"
  domain?: string; // Custom domain: "www.jagoranibd.org"
  subdomain: string; // Subdomain: "jagorani" (e.g. jagorani.ngoerp.xyz)
  name: {
    en: string;
    bn: string;
  };
  planId: string;
  status: TenantStatus;
  deploymentMode: DeploymentMode;
  firebaseConfig?: TenantFirebaseConfig; // Present if MODE_B
  enabledModules: string[];
  quotas: TenantQuotaUsage;
  ownerEmail: string;
  createdAt: number; // Unix epoch millis
  updatedAt: number;
  expiresAt: number;
}
