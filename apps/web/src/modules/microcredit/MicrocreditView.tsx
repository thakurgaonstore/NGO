import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { triggerPrint } from '../../core/print/printHelper';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  PiggyBank,
  Users,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Smartphone,
  BookOpen,
  Calculator,
  Percent,
  Plus,
  Printer,
  Wifi,
  WifiOff,
  Send,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  FolderPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Receipt,
  Undo2,
  AlertTriangle,
  X,
  CreditCard,
  Lock,
  Phone,
  Hash,
  UserCheck,
  Banknote
} from 'lucide-react';
import { CashReconciliationDesk } from './CashReconciliationDesk';

export interface SamityGroup {
  id: string;
  code: string;
  name: string;
  meetingDay: string;
  fieldOfficer: string;
  membersCount: number;
  totalSavingsBDT: number;
  totalLoansOutstandingBDT: number;
}

export interface SavingsProduct {
  id: string;
  code: string;
  name: { en: string; bn: string };
  type: 'dps' | 'fdr' | 'general' | 'special';
  durationYears: number;
  profitRateAnnual: number;
  installmentBDT: number;
  minDepositBDT: number;
  estimatedMaturityBDT: number;
  totalSubscribers: number;
  totalDepositFundBDT: number;
  description: { en: string; bn: string };
}

export interface MicroMember {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  mobile: string;
  nid: string;
  samityId: string;
  samityName: string;
  fatherOrHusband: string;
  address: string;
  joinDate: string;
  status: 'active' | 'inactive';
  // Loan info
  hasLoan: boolean;
  loanNo?: string;
  principalBDT?: number;
  loanBalanceBDT?: number;
  weeklyInstallmentBDT?: number;
  installmentsTotal?: number;
  installmentsPaid?: number;
  currentInstallmentNo?: number;
  currentInstallmentMonth?: string;
  loanStatus?: 'active' | 'repaid' | 'overdue';
  // Savings info
  hasSavings: boolean;
  dpsProductCode?: string;
  dpsMonthlyInstallmentBDT?: number;
  dpsBalanceBDT?: number;
  generalSavingsBalanceBDT: number;
}

export interface LoanRecord {
  id: string;
  loanNo: string;
  memberCode: string;
  memberName: string;
  samityName: string;
  principalBDT: number;
  serviceChargeRate: number;
  interestMethod: 'flat' | 'declining';
  totalRepayableBDT: number;
  weeklyInstallmentBDT: number;
  installmentsTotal: number;
  installmentsPaid: number;
  balanceBDT: number;
  status: 'active' | 'repaid' | 'overdue';
}

export interface PassbookItem {
  id: string;
  date: string;
  receiptNo: string;
  type: 'deposit' | 'withdraw' | 'profit' | 'installment' | 'disburse';
  title: string;
  savingsInBDT: number;
  savingsOutBDT: number;
  savingsBalanceBDT: number;
  loanRepaidBDT: number;
  loanBalanceBDT: number;
  officer: string;
  isVoided?: boolean;
}

const INITIAL_SAMITIES: SamityGroup[] = [
  {
    id: 'sam-01',
    code: 'SMT-001',
    name: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    meetingDay: 'প্রতি সোমবার (সকাল ১০:০০ টা)',
    fieldOfficer: 'মো: তারিকুল ইসলাম',
    membersCount: 25,
    totalSavingsBDT: 345000,
    totalLoansOutstandingBDT: 620000
  },
  {
    id: 'sam-02',
    code: 'SMT-002',
    name: 'পদ্মা কৃষি সমবায় (হাটহাজারী)',
    meetingDay: 'প্রতি বুধবার (বিকাল ০৩:০০ টা)',
    fieldOfficer: 'মো: তারিকুল ইসলাম',
    membersCount: 30,
    totalSavingsBDT: 480000,
    totalLoansOutstandingBDT: 850000
  },
  {
    id: 'sam-03',
    code: 'SMT-003',
    name: 'শাপলা গ্রামীণ উন্নয়ন কেন্দ্র (শিবগঞ্জ)',
    meetingDay: 'প্রতি বৃহস্পতিবার (সকাল ১১:০০ টা)',
    fieldOfficer: 'ফারহানা ইয়াসমিন',
    membersCount: 22,
    totalSavingsBDT: 290000,
    totalLoansOutstandingBDT: 510000
  }
];

const INITIAL_PRODUCTS: SavingsProduct[] = [
  {
    id: 'prod-01',
    code: 'DPS-03YR',
    name: { en: '3-Year Micro DPS Pension Scheme', bn: '৩ বছর মেয়াদী মাসিক ডিপিএস স্কিম' },
    type: 'dps',
    durationYears: 3,
    profitRateAnnual: 10.5,
    installmentBDT: 1000,
    minDepositBDT: 1000,
    estimatedMaturityBDT: 42500,
    totalSubscribers: 142,
    totalDepositFundBDT: 2150000,
    description: {
      en: 'Monthly installment of BDT 1,000 for 3 years at 10.5% compounded annual profit rate.',
      bn: 'প্রতি মাসে ১,০০০ টাকা কিস্তি, মেয়াদ শেষে মুনাফাসহ প্রায় ৪২,৫০০ টাকা রিটার্ন।'
    }
  },
  {
    id: 'prod-02',
    code: 'DPS-05YR',
    name: { en: '5-Year Lakhopoti DPS Scheme', bn: '৫ বছর মেয়াদী লাখপতি ডিপিএস স্কিম' },
    type: 'dps',
    durationYears: 5,
    profitRateAnnual: 11.5,
    installmentBDT: 1350,
    minDepositBDT: 1350,
    estimatedMaturityBDT: 105000,
    totalSubscribers: 98,
    totalDepositFundBDT: 3420000,
    description: {
      en: 'Guaranteed BDT 100,000+ upon maturity in 5 years with regular monthly installments.',
      bn: '৫ বছর মেয়াদে প্রতি মাসে ১,৩৫০ টাকা জমা দিয়ে মেয়াদান্তে ১ লক্ষ টাকারও বেশি সঞ্চয়।'
    }
  },
  {
    id: 'prod-03',
    code: 'FDR-01YR',
    name: { en: '1-Year Fixed Deposit (FDR)', bn: '১ বছর মেয়াদী ফিক্সড ডিপোজিট (FDR)' },
    type: 'fdr',
    durationYears: 1,
    profitRateAnnual: 10.0,
    installmentBDT: 0,
    minDepositBDT: 25000,
    estimatedMaturityBDT: 27500,
    totalSubscribers: 45,
    totalDepositFundBDT: 4800000,
    description: {
      en: 'Lump-sum fixed investment with annual 10% profit paid monthly or at maturity.',
      bn: 'এককালীন স্থায়ী আমানত, বাৎসরিক ১০% হারে মাসিক বা ম্যাচুরিটিতে মুনাফা প্রদান।'
    }
  },
  {
    id: 'prod-04',
    code: 'SAV-GEN',
    name: { en: 'Daily General Savings', bn: 'দৈনিক ও সাপ্তাহিক সাধারণ সঞ্চয়' },
    type: 'general',
    durationYears: 0,
    profitRateAnnual: 7.5,
    installmentBDT: 100,
    minDepositBDT: 100,
    estimatedMaturityBDT: 0,
    totalSubscribers: 360,
    totalDepositFundBDT: 1980000,
    description: {
      en: 'Flexible daily or weekly deposits with 7.5% annual interest on lowest monthly balance.',
      bn: 'যেকোনো সময় জমা ও উত্তোলনের সুযোগ, মাসিক সর্বনিম্ন স্থিতির ওপর বার্ষিক ৭.৫% মুনাফা।'
    }
  },
  {
    id: 'prod-05',
    code: 'SP-HAJJ',
    name: { en: 'Hajj & Education Special Savings', bn: 'হজ্ব ও শিক্ষা কল্যাণ বিশেষ সঞ্চয়' },
    type: 'special',
    durationYears: 7,
    profitRateAnnual: 12.0,
    installmentBDT: 2000,
    minDepositBDT: 2000,
    estimatedMaturityBDT: 248000,
    totalSubscribers: 32,
    totalDepositFundBDT: 1650000,
    description: {
      en: 'Long-term high yield religious and educational savings product with maximum profit rate.',
      bn: 'দীর্ঘমেয়াদী ধর্মীয় ও শিক্ষা সঞ্চয় স্কিম, সর্বোচ্চ ১২% বাৎসরিক মুনাফা।'
    }
  }
];

const INITIAL_MEMBERS: MicroMember[] = [
  {
    id: 'mem-01',
    code: 'MEM-2026-0001',
    nameEn: 'Rahima Begum',
    nameBn: 'রহিমা বেগম',
    mobile: '01712-889901',
    nid: '19882691234567890',
    samityId: 'sam-01',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    fatherOrHusband: 'মো: রফিকুল ইসলাম (স্বামী)',
    address: 'গ্রাম: চাপাইন, সাভার, ঢাকা',
    joinDate: '2025-01-15',
    status: 'active',
    hasLoan: true,
    loanNo: 'LN-2026-0081',
    principalBDT: 30000,
    loanBalanceBDT: 19500,
    weeklyInstallmentBDT: 750,
    installmentsTotal: 44,
    installmentsPaid: 18,
    currentInstallmentNo: 19,
    currentInstallmentMonth: 'অক্টোবর ২০২৬',
    loanStatus: 'active',
    hasSavings: true,
    dpsProductCode: 'DPS-03YR',
    dpsMonthlyInstallmentBDT: 1000,
    dpsBalanceBDT: 3485,
    generalSavingsBalanceBDT: 1200
  },
  {
    id: 'mem-02',
    code: 'MEM-2026-0004',
    nameEn: 'Amena Khatun',
    nameBn: 'আমেনা খাতুন',
    mobile: '01819-334455',
    nid: '19912693456781234',
    samityId: 'sam-01',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    fatherOrHusband: 'আবুল কালাম (স্বামী)',
    address: 'আনন্দপুর, সাভার, ঢাকা',
    joinDate: '2025-03-10',
    status: 'active',
    hasLoan: true,
    loanNo: 'LN-2026-0083',
    principalBDT: 40000,
    loanBalanceBDT: 36320,
    weeklyInstallmentBDT: 1010,
    installmentsTotal: 44,
    installmentsPaid: 8,
    currentInstallmentNo: 9,
    currentInstallmentMonth: 'অক্টোবর ২০২৬',
    loanStatus: 'active',
    hasSavings: true,
    dpsProductCode: 'DPS-05YR',
    dpsMonthlyInstallmentBDT: 1350,
    dpsBalanceBDT: 5200,
    generalSavingsBalanceBDT: 850
  },
  {
    id: 'mem-03',
    code: 'MEM-2026-0007',
    nameEn: 'Fatema Begum',
    nameBn: 'ফাতেমা বেগম',
    mobile: '01911-554433',
    nid: '19852697890123456',
    samityId: 'sam-01',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    fatherOrHusband: 'মফিজুল হক (পিতা)',
    address: 'পোড়াবাড়ী, সাভার',
    joinDate: '2024-11-01',
    status: 'active',
    hasLoan: false,
    hasSavings: true,
    dpsProductCode: 'DPS-03YR',
    dpsMonthlyInstallmentBDT: 1000,
    dpsBalanceBDT: 12400,
    generalSavingsBalanceBDT: 2500
  },
  {
    id: 'mem-04',
    code: 'MEM-2026-0002',
    nameEn: 'Md. Abdul Karim',
    nameBn: 'মো: আব্দুল করিম',
    mobile: '01711-223344',
    nid: '19821591234567890',
    samityId: 'sam-02',
    samityName: 'পদ্মা কৃষি সমবায় (হাটহাজারী)',
    fatherOrHusband: 'মৃত সুলতান আহমেদ',
    address: 'ফতেহপুর, হাটহাজারী, চট্টগ্রাম',
    joinDate: '2024-06-12',
    status: 'active',
    hasLoan: true,
    loanNo: 'LN-2026-0082',
    principalBDT: 50000,
    loanBalanceBDT: 0,
    weeklyInstallmentBDT: 1250,
    installmentsTotal: 44,
    installmentsPaid: 44,
    currentInstallmentNo: 44,
    currentInstallmentMonth: 'পরিশোধিত',
    loanStatus: 'repaid',
    hasSavings: true,
    generalSavingsBalanceBDT: 15400
  },
  {
    id: 'mem-05',
    code: 'MEM-2026-0009',
    nameEn: 'Sufia Akter',
    nameBn: 'সুফিয়া আক্তার',
    mobile: '01814-778899',
    nid: '19941594567890123',
    samityId: 'sam-02',
    samityName: 'পদ্মা কৃষি সমবায় (হাটহাজারী)',
    fatherOrHusband: 'মো: জামশেদ আলী',
    address: 'উত্তর মির্জাপুর, চট্টগ্রাম',
    joinDate: '2025-02-20',
    status: 'active',
    hasLoan: true,
    loanNo: 'LN-2026-0085',
    principalBDT: 60000,
    loanBalanceBDT: 45000,
    weeklyInstallmentBDT: 1500,
    installmentsTotal: 44,
    installmentsPaid: 10,
    currentInstallmentNo: 11,
    currentInstallmentMonth: 'অক্টোবর ২০২৬',
    loanStatus: 'active',
    hasSavings: true,
    dpsProductCode: 'FDR-01YR',
    dpsBalanceBDT: 50000,
    generalSavingsBalanceBDT: 3200
  },
  {
    id: 'mem-06',
    code: 'MEM-2026-0012',
    nameEn: 'Rokeya Begum',
    nameBn: 'রোকেয়া বেগম',
    mobile: '01912-334499',
    nid: '19896791234567890',
    samityId: 'sam-03',
    samityName: 'শাপলা গ্রামীণ উন্নয়ন কেন্দ্র (শিবগঞ্জ)',
    fatherOrHusband: 'আজহারুল ইসলাম',
    address: 'মহাস্থান, শিবগঞ্জ, বগুড়া',
    joinDate: '2025-04-05',
    status: 'active',
    hasLoan: true,
    loanNo: 'LN-2026-0086',
    principalBDT: 35000,
    loanBalanceBDT: 28000,
    weeklyInstallmentBDT: 875,
    installmentsTotal: 44,
    installmentsPaid: 8,
    currentInstallmentNo: 9,
    currentInstallmentMonth: 'অক্টোবর ২০২৬',
    loanStatus: 'active',
    hasSavings: true,
    dpsProductCode: 'DPS-03YR',
    dpsMonthlyInstallmentBDT: 1000,
    dpsBalanceBDT: 4000,
    generalSavingsBalanceBDT: 1100
  },
  {
    id: 'mem-07',
    code: 'MEM-2026-0015',
    nameEn: 'Jahangir Alam',
    nameBn: 'জাহাঙ্গীর আলম',
    mobile: '01611-998877',
    nid: '19786799876543210',
    samityId: 'sam-03',
    samityName: 'শাপলা গ্রামীণ উন্নয়ন কেন্দ্র (শিবগঞ্জ)',
    fatherOrHusband: 'মজিবর রহমান',
    address: 'বুড়িগঞ্জ, শিবগঞ্জ',
    joinDate: '2024-09-18',
    status: 'active',
    hasLoan: false,
    hasSavings: true,
    dpsProductCode: 'FDR-01YR',
    dpsBalanceBDT: 100000,
    generalSavingsBalanceBDT: 8400
  },
  {
    id: 'mem-08',
    code: 'MEM-2026-0018',
    nameEn: 'Parvin Sultana',
    nameBn: 'পারভীন সুলতানা',
    mobile: '01715-667788',
    nid: '19932698765432109',
    samityId: 'sam-01',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    fatherOrHusband: 'হারুনুর রশীদ',
    address: 'তেঁতুলঝোড়া, সাভার',
    joinDate: '2025-05-14',
    status: 'active',
    hasLoan: true,
    loanNo: 'LN-2026-0088',
    principalBDT: 25000,
    loanBalanceBDT: 21250,
    weeklyInstallmentBDT: 625,
    installmentsTotal: 44,
    installmentsPaid: 6,
    currentInstallmentNo: 7,
    currentInstallmentMonth: 'অক্টোবর ২০২৬',
    loanStatus: 'active',
    hasSavings: true,
    dpsProductCode: 'SP-HAJJ',
    dpsMonthlyInstallmentBDT: 2000,
    dpsBalanceBDT: 18000,
    generalSavingsBalanceBDT: 1950
  }
];

const INITIAL_PASSBOOK: PassbookItem[] = [
  {
    id: 'pb-01',
    date: '2026-01-05',
    receiptNo: 'RC-1011',
    type: 'deposit',
    title: 'সাধারণ সঞ্চয় ও ৩ বছর ডিপিএস ১ম কিস্তি',
    savingsInBDT: 1100,
    savingsOutBDT: 0,
    savingsBalanceBDT: 1100,
    loanRepaidBDT: 0,
    loanBalanceBDT: 0,
    officer: 'মো: তারিকুল ইসলাম'
  },
  {
    id: 'pb-02',
    date: '2026-01-12',
    receiptNo: 'RC-1044',
    type: 'disburse',
    title: 'ক্ষুদ্রঋণ বিতরণ (গাভী পালন ও ক্ষুদ্র ব্যবসা)',
    savingsInBDT: 0,
    savingsOutBDT: 0,
    savingsBalanceBDT: 1100,
    loanRepaidBDT: 0,
    loanBalanceBDT: 33000,
    officer: 'মো: তারিকুল ইসলাম'
  },
  {
    id: 'pb-03',
    date: '2026-01-19',
    receiptNo: 'RC-1092',
    type: 'installment',
    title: '১ম কিস্তি আদায় + সাপ্তাহিক সঞ্চয় জমা',
    savingsInBDT: 100,
    savingsOutBDT: 0,
    savingsBalanceBDT: 1200,
    loanRepaidBDT: 750,
    loanBalanceBDT: 32250,
    officer: 'মো: তারিকুল ইসলাম'
  },
  {
    id: 'pb-04',
    date: '2026-02-02',
    receiptNo: 'RC-1145',
    type: 'deposit',
    title: 'ডিপিএস ২য় কিস্তি + সাপ্তাহিক সঞ্চয়',
    savingsInBDT: 1100,
    savingsOutBDT: 0,
    savingsBalanceBDT: 2300,
    loanRepaidBDT: 750,
    loanBalanceBDT: 30750,
    officer: 'মো: তারিকুল ইসলাম'
  },
  {
    id: 'pb-05',
    date: '2026-03-31',
    receiptNo: 'INT-3301',
    type: 'profit',
    title: 'ত্রৈমাসিক সঞ্চয় মুনাফা ক্রেডিট (৭.৫% রেট)',
    savingsInBDT: 85,
    savingsOutBDT: 0,
    savingsBalanceBDT: 3485,
    loanRepaidBDT: 0,
    loanBalanceBDT: 25500,
    officer: 'সিস্টেম স্বয়ংক্রিয়'
  }
];

export const MicrocreditView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  
  // Navigation Tabs
  const [tab, setTab] = useState<'search_collect' | 'reconciliation' | 'products' | 'pwa' | 'passbook' | 'loans' | 'collections' | 'samity'>('search_collect');
  
  const [samities] = useState<SamityGroup[]>(INITIAL_SAMITIES);
  
  // 1. Savings Products State (with Add/Edit/Delete)
  const [products, setProducts] = useState<SavingsProduct[]>(() => {
    const saved = localStorage.getItem(`ngo_products_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [members, setMembers] = useState<MicroMember[]>(() => {
    const saved = localStorage.getItem(`ngo_micro_members_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [passbookItems, setPassbookItems] = useState<PassbookItem[]>(INITIAL_PASSBOOK);

  // Universal Search & Filter State (Thousands of members search)
  const [selectedSamityFilter, setSelectedSamityFilter] = useState<string>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'loan_only' | 'savings_only' | 'due_today'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SAFE COLLECTION SLIP MODAL STATE (Prevents accidental 1-click mistakes!)
  const [collectingMember, setCollectingMember] = useState<MicroMember | null>(null);
  const [collectInstallmentAmount, setCollectInstallmentAmount] = useState<number>(0);
  const [collectDpsAmount, setCollectDpsAmount] = useState<number>(0);
  const [collectGenSavingsAmount, setCollectGenSavingsAmount] = useState<number>(100);
  const [collectLateFee, setCollectLateFee] = useState<number>(0);
  const [collectPaymentMethod, setCollectPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [collectMonth, setCollectMonth] = useState<string>('অক্টোবর ২০২৬');
  const [collectInstallmentNo, setCollectInstallmentNo] = useState<number>(1);
  const [isConfirmingSlip, setIsConfirmingSlip] = useState<boolean>(false);
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);

  // Product Add / Edit / Delete Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<SavingsProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<SavingsProduct | null>(null);
  
  const [prodFormCode, setProdFormCode] = useState<string>('');
  const [prodFormNameEn, setProdFormNameEn] = useState<string>('');
  const [prodFormNameBn, setProdFormNameBn] = useState<string>('');
  const [prodFormType, setProdFormType] = useState<SavingsProduct['type']>('dps');
  const [prodFormYears, setProdFormYears] = useState<number>(3);
  const [prodFormRate, setProdFormRate] = useState<number>(10.5);
  const [prodFormInstallment, setProdFormInstallment] = useState<number>(1000);
  const [prodFormDescEn, setProdFormDescEn] = useState<string>('');
  const [prodFormDescBn, setProdFormDescBn] = useState<string>('');

  // Live Calculator State
  const [calcMonthlyDeposit, setCalcMonthlyDeposit] = useState<number>(1000);
  const [calcYears, setCalcYears] = useState<number>(5);
  const [calcRate, setCalcRate] = useState<number>(11.5);

  // Field Officer PWA daily summary
  const [pwaDailyCollected, setPwaDailyCollected] = useState<number>(4750);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Loan Disburse Modal
  const [isDisburseOpen, setIsDisburseOpen] = useState<boolean>(false);
  const [disburseMemberId, setDisburseMemberId] = useState<string>(members[0]?.id || '');
  const [disbursePrincipal, setDisbursePrincipal] = useState<number>(35000);
  const [disburseMethod, setDisburseMethod] = useState<'flat' | 'declining'>('flat');
  const [disburseRate, setDisburseRate] = useState<number>(10);
  const [disburseWeeks, setDisburseWeeks] = useState<number>(44);

  const calculateDpsMaturity = (monthly: number, years: number, rate: number) => {
    if (years <= 0 || monthly <= 0) return 0;
    const months = years * 12;
    const r = rate / 100 / 12;
    const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    return Math.round(fv);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: SavingsProduct) => {
    setEditingProduct(prod);
    setProdFormCode(prod.code);
    setProdFormNameEn(prod.name.en);
    setProdFormNameBn(prod.name.bn);
    setProdFormType(prod.type);
    setProdFormYears(prod.durationYears);
    setProdFormRate(prod.profitRateAnnual);
    setProdFormInstallment(prod.installmentBDT || prod.minDepositBDT);
    setProdFormDescEn(prod.description.en);
    setProdFormDescBn(prod.description.bn);
    setIsProductModalOpen(true);
  };

  // Open Create Product Modal
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdFormCode(`DPS-${Math.floor(10 + Math.random() * 90)}`);
    setProdFormNameEn('');
    setProdFormNameBn('');
    setProdFormType('dps');
    setProdFormYears(3);
    setProdFormRate(10.5);
    setProdFormInstallment(1000);
    setProdFormDescEn('');
    setProdFormDescBn('');
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = () => {
    if (!prodFormNameEn && !prodFormNameBn) return;

    if (editingProduct) {
      // Update existing
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            code: prodFormCode || p.code,
            name: { en: prodFormNameEn || prodFormNameBn, bn: prodFormNameBn || prodFormNameEn },
            type: prodFormType,
            durationYears: prodFormYears,
            profitRateAnnual: prodFormRate,
            installmentBDT: prodFormType === 'dps' ? prodFormInstallment : 0,
            minDepositBDT: prodFormInstallment,
            estimatedMaturityBDT: calculateDpsMaturity(prodFormInstallment, prodFormYears, prodFormRate),
            description: {
              en: prodFormDescEn || `${prodFormYears}-year ${prodFormType} product at ${prodFormRate}% annual profit rate.`,
              bn: prodFormDescBn || `${toBanglaDigits(prodFormYears)} বছর মেয়াদী ${prodFormType} স্কিম, মুনাফা হার ${toBanglaDigits(prodFormRate)}%।`
            }
          };
        }
        return p;
      });
      setProducts(updated);
      localStorage.setItem(`ngo_products_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`সঞ্চয় প্রোডাক্ট "${prodFormNameBn || prodFormNameEn}" সফলভাবে আপডেট করা হয়েছে।`);
    } else {
      // Create new
      const newProd: SavingsProduct = {
        id: `prod-${Date.now()}`,
        code: prodFormCode || `${prodFormType.toUpperCase()}-${prodFormYears}YR`,
        name: { en: prodFormNameEn || prodFormNameBn, bn: prodFormNameBn || prodFormNameEn },
        type: prodFormType,
        durationYears: prodFormYears,
        profitRateAnnual: prodFormRate,
        installmentBDT: prodFormType === 'dps' ? prodFormInstallment : 0,
        minDepositBDT: prodFormInstallment,
        estimatedMaturityBDT: calculateDpsMaturity(prodFormInstallment, prodFormYears, prodFormRate),
        totalSubscribers: 1,
        totalDepositFundBDT: prodFormInstallment,
        description: {
          en: prodFormDescEn || `${prodFormYears}-year ${prodFormType} product at ${prodFormRate}% annual profit rate.`,
          bn: prodFormDescBn || `${toBanglaDigits(prodFormYears)} বছর মেয়াদী ${prodFormType} স্কিম, মুনাফা হার ${toBanglaDigits(prodFormRate)}%।`
        }
      };
      const updated = [newProd, ...products];
      setProducts(updated);
      localStorage.setItem(`ngo_products_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`নতুন সঞ্চয় প্রোডাক্ট "${prodFormNameBn || prodFormNameEn}" তৈরি হয়েছে।`);
    }

    setIsProductModalOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    const updated = products.filter((p) => p.id !== deletingProduct.id);
    setProducts(updated);
    localStorage.setItem(`ngo_products_${tenant?.id}`, JSON.stringify(updated));
    showNotify(`প্রোডাক্ট "${deletingProduct.name.bn}" মুছে ফেলা হয়েছে।`);
    setDeletingProduct(null);
  };

  // OPEN SAFE COLLECTION SLIP (Search-driven, safe, no accidental 1-click mistake!)
  const handleOpenCollectionSlip = (member: MicroMember) => {
    setCollectingMember(member);
    setCollectInstallmentAmount(member.weeklyInstallmentBDT || 0);
    setCollectDpsAmount(member.dpsMonthlyInstallmentBDT || 0);
    setCollectGenSavingsAmount(100);
    setCollectLateFee(0);
    setCollectPaymentMethod('cash');
    setCollectMonth(member.currentInstallmentMonth || 'অক্টোবর ২০২৬');
    setCollectInstallmentNo(member.currentInstallmentNo || 1);
    setIsConfirmingSlip(false);
  };

  // CONFIRM COLLECTION WORKFLOW
  const handleExecuteCollection = () => {
    if (!collectingMember) return;
    const totalCollected = collectInstallmentAmount + collectDpsAmount + collectGenSavingsAmount + collectLateFee;

    if (totalCollected <= 0) {
      alert('অনুগ্রহ করে আদায়ের পরিমাণ দিন।');
      return;
    }

    const receiptNo = `RC-${Date.now().toString().slice(-5)}`;

    // 1. Update member state
    const updatedMembers = members.map((m) => {
      if (m.id === collectingMember.id) {
        const newLoanBalance = Math.max(0, (m.loanBalanceBDT || 0) - collectInstallmentAmount);
        const newDpsBalance = (m.dpsBalanceBDT || 0) + collectDpsAmount;
        const newGenBalance = m.generalSavingsBalanceBDT + collectGenSavingsAmount;
        const newPaidCount = (m.installmentsPaid || 0) + (collectInstallmentAmount > 0 ? 1 : 0);
        const nextNo = (m.currentInstallmentNo || 1) + (collectInstallmentAmount > 0 ? 1 : 0);

        return {
          ...m,
          loanBalanceBDT: newLoanBalance,
          dpsBalanceBDT: newDpsBalance,
          generalSavingsBalanceBDT: newGenBalance,
          installmentsPaid: newPaidCount,
          currentInstallmentNo: nextNo,
          loanStatus: (newLoanBalance === 0 ? 'repaid' : 'active') as any
        };
      }
      return m;
    });

    setMembers(updatedMembers);
    localStorage.setItem(`ngo_micro_members_${tenant?.id}`, JSON.stringify(updatedMembers));

    // 2. Add passbook record
    const newPassbookItem: PassbookItem = {
      id: `pb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      receiptNo,
      type: collectInstallmentAmount > 0 ? 'installment' : 'deposit',
      title: `কিস্তি নং ${toBanglaDigits(collectInstallmentNo)} (${collectMonth}) আদায় + সঞ্চয় জমা`,
      savingsInBDT: collectDpsAmount + collectGenSavingsAmount,
      savingsOutBDT: 0,
      savingsBalanceBDT: (collectingMember.dpsBalanceBDT || 0) + collectDpsAmount + collectingMember.generalSavingsBalanceBDT + collectGenSavingsAmount,
      loanRepaidBDT: collectInstallmentAmount,
      loanBalanceBDT: Math.max(0, (collectingMember.loanBalanceBDT || 0) - collectInstallmentAmount),
      officer: 'মাঠ কর্মকর্তা (মো: তারিকুল ইসলাম)'
    };

    setPassbookItems([newPassbookItem, ...passbookItems]);
    setPwaDailyCollected((prev) => prev + totalCollected);

    // 3. Set digital receipt for preview & printing
    setPrintedReceipt({
      receiptNo,
      date: new Date().toLocaleDateString('bn-BD'),
      memberName: collectingMember.nameBn,
      memberCode: collectingMember.code,
      mobile: collectingMember.mobile,
      samity: collectingMember.samityName,
      installmentNo: collectInstallmentNo,
      month: collectMonth,
      loanRepaid: collectInstallmentAmount,
      dpsDeposit: collectDpsAmount,
      genSavings: collectGenSavingsAmount,
      lateFee: collectLateFee,
      total: totalCollected,
      paymentMethod: collectPaymentMethod,
      loanBalance: Math.max(0, (collectingMember.loanBalanceBDT || 0) - collectInstallmentAmount),
      collector: 'মো: তারিকুল ইসলাম'
    });

    showNotify(`${collectingMember.nameBn}-এর কিস্তি ও সঞ্চয় ৳ ${totalCollected.toLocaleString()} সফলভাবে আদায় হয়েছে! রসিদ জেনারেট করা হয়েছে।`);
    setCollectingMember(null);
  };

  // Void / Cancel Mistaken Collection Entry (Mistake Reversal)
  const handleVoidEntry = (pbId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই ভুল আদায় এন্ট্রিটি বাতিল (Void / Rollback) করতে চান? টাকা ব্যালেন্স থেকে সমন্বয় হবে।')) {
      return;
    }
    const target = passbookItems.find((p) => p.id === pbId);
    if (!target) return;

    const updated = passbookItems.map((p) => (p.id === pbId ? { ...p, isVoided: true, title: `[বাতিলকৃত/Void] ${p.title}` } : p));
    setPassbookItems(updated);
    setPwaDailyCollected((prev) => Math.max(0, prev - (target.loanRepaidBDT + target.savingsInBDT)));
    showNotify(`রসিদ ${target.receiptNo} সফলভাবে বাতিল ও সমন্বয় করা হয়েছে।`);
  };

  const showNotify = (msg: string) => {
    setSuccessNotification(msg);
    setTimeout(() => setSuccessNotification(null), 4500);
  };

  // Filter members among thousands!
  const filteredMembers = members.filter((m) => {
    // 1. Center / Samity Filter
    if (selectedSamityFilter !== 'all' && m.samityId !== selectedSamityFilter) {
      return false;
    }

    // 2. Account Type Filter
    if (accountTypeFilter === 'loan_only' && !m.hasLoan) return false;
    if (accountTypeFilter === 'savings_only' && !m.hasSavings) return false;
    if (accountTypeFilter === 'due_today' && (!m.hasLoan || m.loanBalanceBDT === 0)) return false;

    // 3. Search query: checks mobile, NID, member code, nameEn, nameBn
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchMobile = m.mobile.toLowerCase().includes(q) || m.mobile.replace(/[^0-9]/g, '').includes(q);
      const matchNid = m.nid.toLowerCase().includes(q);
      const matchCode = m.code.toLowerCase().includes(q);
      const matchNameBn = m.nameBn.toLowerCase().includes(q);
      const matchNameEn = m.nameEn.toLowerCase().includes(q);
      return matchMobile || matchNid || matchCode || matchNameBn || matchNameEn;
    }

    return true;
  });

  const totalOutstanding = members.reduce((sum, m) => sum + (m.loanBalanceBDT || 0), 0);
  const totalSavingsPool = products.reduce((sum, p) => sum + p.totalDepositFundBDT, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">
              {isBangla ? 'সঞ্চয় ও ক্ষুদ্রঋণ কার্যক্রম (Microfinance Core)' : 'Savings & Microcredit Core'}
            </h2>
            <Badge variant="default" className="text-[10px] bg-emerald-600 font-mono">
              Advanced Multi-Search Engine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'সঞ্চয় প্রোডাক্ট Add/Edit/Delete, হাজার হাজার সদস্যের কেন্দ্রভিত্তিক ও মোবাইল/NID সার্চ, এবং নিরাপদ কিস্তি ও মাসভিত্তিক আদায় স্লিপ।'
              : 'Add/Edit/Delete savings schemes, thousands-member universal search, and verified installment collection slip.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setTab('products')} variant="outline" className="text-xs h-9">
            <Percent className="w-4 h-4 mr-1.5 text-emerald-600" />
            {isBangla ? 'সঞ্চয় স্কিম ও রেট' : 'Savings Schemes'}
          </Button>

          <Button onClick={handleOpenCreateProduct} className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন সঞ্চয় প্রোডাক্ট যোগ' : 'Add Product'}
          </Button>
        </div>
      </div>

      {successNotification && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button onClick={() => setSuccessNotification(null)} className="p-1 hover:bg-black/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'মোট সঞ্চয় ও ডিপিএস স্থিতি' : 'Total Savings Deposits'}
              </p>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {formatCurrency(totalSavingsPool, { useBanglaNumerals: isBangla })}
              </div>
              <span className="text-[11px] text-muted-foreground">{products.length}টি সক্রিয় সঞ্চয় স্কিম</span>
            </div>
            <PiggyBank className="w-8 h-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'মোট অনাদায়ী ঋণ স্থিতি' : 'Active Loan Outstanding'}
              </p>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {formatCurrency(totalOutstanding, { useBanglaNumerals: isBangla })}
              </div>
              <span className="text-[11px] text-muted-foreground">১০%-১১% সার্ভিস চার্জ</span>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/30" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'আজকের মাঠ আদায়' : "Today's Field Collection"}
              </p>
              <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
                {formatCurrency(pwaDailyCollected, { useBanglaNumerals: isBangla })}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">আদায় সফল</span>
            </div>
            <Smartphone className="w-8 h-8 text-sky-600/30" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'নিবন্ধিত সদস্য সংখ্যা' : 'Registered Members'}
              </p>
              <div className="text-2xl font-bold font-mono text-violet-600 mt-1">
                {isBangla ? `${toBanglaDigits(members.length)} জন` : `${members.length} Members`}
              </div>
              <span className="text-[11px] text-muted-foreground">{samities.length}টি কেন্দ্র ও সমিতি</span>
            </div>
            <Users className="w-8 h-8 text-violet-600/30" />
          </CardContent>
        </Card>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex gap-1.5 border-b pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setTab('search_collect')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            tab === 'search_collect' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          {isBangla ? 'সদস্য অনুসন্ধান ও নিরাপদ কিস্তি আদায়' : 'Member Search & Safe Collection'}
        </button>

        <button
          onClick={() => setTab('reconciliation')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            tab === 'reconciliation' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          {isBangla ? 'মাঠকর্মী ক্যাশ হস্তান্তর ও ম্যানেজার মিলকরণ' : 'Cash Handover & Reconciliation'}
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 rounded px-1.5 py-0.5 font-bold">জিরো-ফ্রড</span>
        </button>

        <button
          onClick={() => setTab('products')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            tab === 'products' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          {isBangla ? 'সঞ্চয় প্রোডাক্ট ব্যবস্থাপনা (Add/Edit/Delete)' : 'Savings Products (Add/Edit/Delete)'}
        </button>

        <button
          onClick={() => setTab('passbook')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            tab === 'passbook' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {isBangla ? 'সদস্যের ডিজিটাল পাসবই খতিয়ান' : 'Member Digital Passbook'}
        </button>

        <button
          onClick={() => setTab('collections')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            tab === 'collections' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          {isBangla ? 'আজকের আদায় শিট ও ভুল বাতিল' : 'Daily Collection Sheet'}
        </button>

        <button
          onClick={() => setTab('samity')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            tab === 'samity' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {isBangla ? 'সমিতি ও কেন্দ্রসমূহ' : 'Samities & Groups'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UNIVERSAL SEARCH & SAFE COLLECTION SLIP ( হাজার হাজার সদস্যের সার্চ )  */}
      {/* ========================================================================= */}
      {tab === 'search_collect' && (
        <div className="space-y-4">
          {/* Advanced Multi-Search Control Bar */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    <span>{isBangla ? 'সদস্য অনুসন্ধান ও কিস্তি আদায় হাব' : 'Member Universal Search & Collection Hub'}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBangla
                      ? 'কেন্দ্র বা সমিতি নির্বাচন করে অথবা সদস্যের মোবাইল নম্বর, জাতীয় পরিচয়পত্র (NID), মেম্বার কোড বা নাম দিয়ে সহজেই খুঁজুন।'
                      : 'Search among thousands of members by Center, Mobile, NID, Member Code or Name.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    ফলাফল: {toBanglaDigits(filteredMembers.length)} জন সদস্য
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* 1. Center / Samity Dropdown */}
                <div className="md:col-span-4">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isBangla ? '১. কেন্দ্র / সমিতি নির্বাচন করুন:' : '1. Select Center / Samity:'}
                  </label>
                  <select
                    value={selectedSamityFilter}
                    onChange={(e) => setSelectedSamityFilter(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">{isBangla ? 'সকল কেন্দ্র ও সমিতি (All Centers)' : 'All Centers & Samities'}</option>
                    {samities.map((sam) => (
                      <option key={sam.id} value={sam.id}>
                        {sam.name} ({sam.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Account Category Filter (Loan vs Savings) */}
                <div className="md:col-span-3">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isBangla ? '২. হিসাবের ধরন:' : '2. Account Category:'}
                  </label>
                  <select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">{isBangla ? 'সকল হিসাবধারী (ঋণ ও সঞ্চয়)' : 'All Accounts'}</option>
                    <option value="loan_only">{isBangla ? 'শুধুমাত্র ঋণ গ্রহীতা (Active Loans)' : 'Active Loans Only'}</option>
                    <option value="savings_only">{isBangla ? 'শুধুমাত্র সঞ্চয় ও ডিপিএস গ্রাহক' : 'Savings / DPS Only'}</option>
                    <option value="due_today">{isBangla ? 'আজকের কিস্তি বকেয়া তালিকা' : 'Due Today'}</option>
                  </select>
                </div>

                {/* 3. Universal Search Input (Mobile, NID, Member ID, Name) */}
                <div className="md:col-span-5">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isBangla ? '৩. মোবাইল / NID / সদস্য আইডি / নাম দিয়ে খুঁজুন:' : '3. Search by Mobile, NID, Member ID:'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={isBangla ? 'যেমন: 01712, 198826..., MEM-0001, রহিমা...' : 'e.g. 01712, 198826..., MEM-0001...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8 h-10 text-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Master Table Layout (No accidental instant click; opens safe collection slip!) */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBangla ? 'সদস্যের তথ্য' : 'Member Info'}</TableHead>
                    <TableHead>{isBangla ? 'যোগাযোগ ও এনআইডি' : 'Contact & NID'}</TableHead>
                    <TableHead>{isBangla ? 'সমিতি / কেন্দ্র' : 'Center / Samity'}</TableHead>
                    <TableHead className="text-right text-emerald-600">{isBangla ? 'সঞ্চয় ও ডিপিএস স্থিতি' : 'Savings & DPS'}</TableHead>
                    <TableHead className="text-right text-rose-600">{isBangla ? 'ঋণ স্থিতি ও কিস্তি' : 'Loan & Installment'}</TableHead>
                    <TableHead className="text-center">{isBangla ? 'চলতি কিস্তি' : 'Due Status'}</TableHead>
                    <TableHead className="text-right">{isBangla ? 'নিরাপদ আদায়' : 'Action'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                        কোনো সদস্য পাওয়া যায়নি। অনুসন্ধান ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <span>{member.nameBn}</span>
                            <span className="text-[11px] text-muted-foreground font-normal">({member.nameEn})</span>
                          </div>
                          <div className="text-[11px] font-mono font-bold text-primary flex items-center gap-1 mt-0.5">
                            <Hash className="w-3 h-3 text-muted-foreground" />
                            <span>{member.code}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{member.fatherOrHusband}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-mono font-semibold flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            <span>{member.mobile}</span>
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            NID: {member.nid}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium">{member.samityName}</div>
                          <Badge variant="outline" className="text-[9px] mt-0.5">সদস্য যোগদান: {member.joinDate}</Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {member.hasSavings ? (
                            <div>
                              <div className="font-mono font-bold text-xs text-emerald-600">
                                ৳ {((member.dpsBalanceBDT || 0) + member.generalSavingsBalanceBDT).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {member.dpsProductCode ? `${member.dpsProductCode}: ৳ ${(member.dpsBalanceBDT || 0).toLocaleString()}` : ''}
                                {member.generalSavingsBalanceBDT > 0 ? ` | সাধারণ: ৳ ${member.generalSavingsBalanceBDT.toLocaleString()}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {member.hasLoan && (member.loanBalanceBDT || 0) > 0 ? (
                            <div>
                              <div className="font-mono font-bold text-xs text-rose-600">
                                ৳ {(member.loanBalanceBDT || 0).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                কিস্তি: <span className="font-bold text-foreground">৳ {(member.weeklyInstallmentBDT || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : member.hasLoan && member.loanBalanceBDT === 0 ? (
                            <Badge variant="success" className="text-[10px]">পরিশোধিত</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">ঋণ নেই</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {member.hasLoan && (member.loanBalanceBDT || 0) > 0 ? (
                            <div>
                              <Badge variant="secondary" className="font-mono text-[10px]">
                                কিস্তি {toBanglaDigits(member.currentInstallmentNo || 1)}/{toBanglaDigits(member.installmentsTotal || 44)}
                              </Badge>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{member.currentInstallmentMonth}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleOpenCollectionSlip(member)}
                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1" />
                            {isBangla ? 'আদায় ভাউচার' : 'Collect Slip'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CASH RECONCILIATION & MANAGER HANDOVER DESK ( ZERO-FRAUD AUDIT )     */}
      {/* ========================================================================= */}
      {tab === 'reconciliation' && <CashReconciliationDesk />}

      {/* ========================================================================= */}
      {/* TAB 2: SAVINGS PRODUCTS (ADD / EDIT / DELETE)                              */}
      {/* ========================================================================= */}
      {tab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30 p-4 rounded-xl border">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>{isBangla ? 'সঞ্চয় স্কিম ও মুনাফা রেট ব্যবস্থাপনা' : 'Savings Products & Profit Rate Management'}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBangla
                  ? 'ডিপিএস (DPS ৩/৫/৭/১০ বছর), এফডিআর (FDR), সাধারণ সঞ্চয় ও বিশেষ স্কিম তৈরি (Add), সম্পাদন (Edit) এবং মুছে ফেলার (Delete) সম্পূর্ণ নিয়ন্ত্রণ।'
                  : 'Complete Add, Edit, and Delete controls for DPS, FDR, General Savings, and special products.'}
              </p>
            </div>
            <Button onClick={handleOpenCreateProduct} className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1" />
              {isBangla ? 'নতুন সঞ্চয় প্রোডাক্ট তৈরি করুন' : 'Add New Product'}
            </Button>
          </div>

          {/* Product Cards Grid with EDIT & DELETE Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => {
              const typeBadge = {
                dps: { label: 'DPS (ডিপিএস)', color: 'bg-emerald-600 text-white' },
                fdr: { label: 'FDR (ফিক্সড ডিপোজিট)', color: 'bg-sky-600 text-white' },
                general: { label: 'সাধারণ সঞ্চয়', color: 'bg-amber-600 text-white' },
                special: { label: 'বিশেষ স্কিম', color: 'bg-purple-600 text-white' }
              }[prod.type];

              return (
                <Card key={prod.id} className="border-border hover:shadow-lg transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-[10px] ${typeBadge.color}`}>{typeBadge.label}</Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="h-7 w-7 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-500/10"
                          title="সম্পাদনা করুন (Edit)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingProduct(prod)}
                          className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                          title="মুছে ফেলুন (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-muted-foreground mt-1 block">{prod.code}</span>
                    <CardTitle className="text-sm font-bold mt-1">
                      {isBangla ? prod.name.bn : prod.name.en}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {isBangla ? prod.description.bn : prod.description.en}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-2 text-xs flex-1">
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-muted-foreground">{isBangla ? 'বাৎসরিক মুনাফা রেট:' : 'Annual Profit Rate:'}</span>
                      <span className="font-mono font-bold text-emerald-600 text-sm">
                        {isBangla ? `${toBanglaDigits(prod.profitRateAnnual)}%` : `${prod.profitRateAnnual}%`}
                      </span>
                    </div>

                    {prod.durationYears > 0 && (
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">{isBangla ? 'মেয়াদ কাল:' : 'Duration:'}</span>
                        <span className="font-semibold text-foreground">
                          {isBangla ? `${toBanglaDigits(prod.durationYears)} বছর` : `${prod.durationYears} Years`}
                        </span>
                      </div>
                    )}

                    {prod.installmentBDT > 0 && (
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">{isBangla ? 'মাসিক কিস্তির পরিমাণ:' : 'Monthly Installment:'}</span>
                        <span className="font-mono font-bold text-primary">
                          {formatCurrency(prod.installmentBDT, { useBanglaNumerals: isBangla })}
                        </span>
                      </div>
                    )}

                    {prod.estimatedMaturityBDT > 0 && (
                      <div className="flex justify-between items-center py-1 border-b bg-emerald-500/10 px-2 rounded">
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          {isBangla ? 'আনুমানিক ম্যাচুরিটি রিটার্ন:' : 'Estimated Maturity:'}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 text-sm">
                          {formatCurrency(prod.estimatedMaturityBDT, { useBanglaNumerals: isBangla })}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>{prod.totalSubscribers} {isBangla ? 'জন আমানতকারী' : 'Subscribers'}</span>
                      <span className="font-mono font-semibold text-foreground">
                        তহবিল: {formatCurrency(prod.totalDepositFundBDT, { useBanglaNumerals: isBangla })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Interactive Calculator */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3 border-b border-primary/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span>{isBangla ? 'ডিপিএস ও সঞ্চয় ম্যাচুরিটি ক্যালকুলেটর (লাইভ প্রজেকশন)' : 'DPS & Savings Maturity Calculator'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'মাসিক কিস্তির টাকা (BDT)' : 'Monthly Deposit (BDT)'}
                  </label>
                  <Input
                    type="number"
                    value={calcMonthlyDeposit}
                    onChange={(e) => setCalcMonthlyDeposit(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'মেয়াদ (বছর)' : 'Tenure (Years)'}
                  </label>
                  <select
                    value={calcYears}
                    onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  >
                    <option value={3}>৩ বছর (৩৬ মাস)</option>
                    <option value={5}>৫ বছর (৬০ মাস)</option>
                    <option value={7}>৭ বছর (৮৪ মাস)</option>
                    <option value={10}>১০ বছর (১২০ মাস)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'বাৎসরিক মুনাফা রেট (%)' : 'Annual Profit Rate (%)'}
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-card rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">
                    মোট মূলধন জমা: <span className="font-mono font-bold text-foreground">৳ {(calcMonthlyDeposit * calcYears * 12).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    মুনাফা ও প্রফিট রিটার্ন: <span className="font-mono font-bold text-emerald-600">৳ {(calculateDpsMaturity(calcMonthlyDeposit, calcYears, calcRate) - (calcMonthlyDeposit * calcYears * 12)).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-semibold">মেয়াদান্তে সর্বমোট প্রাপ্য (Maturity Return)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    ৳ {calculateDpsMaturity(calcMonthlyDeposit, calcYears, calcRate).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PASSBOOK LEDGER                                                    */}
      {/* ========================================================================= */}
      {tab === 'passbook' && (
        <Card className="border-border">
          <CardHeader className="pb-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-bold">
                  {isBangla ? 'সদস্যের ডিজিটাল পাসবই (লেনদেন খতিয়ান)' : 'Member Digital Passbook Ledger'}
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">MEM-2026-0001</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                সদস্য: <span className="font-semibold text-foreground">রহিমা বেগম (Rahima Begum)</span> | কেন্দ্র: সুর্যমুখী মহিলা সমিতি | মোবাইল: 01712-889901
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs h-8">
              <Printer className="w-3.5 h-3.5 mr-1" />
              {isBangla ? 'পাসবই প্রিন্ট করুন' : 'Print Passbook'}
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBangla ? 'রসিদ নং' : 'Receipt'}</TableHead>
                  <TableHead>{isBangla ? 'বিবরণ' : 'Particulars'}</TableHead>
                  <TableHead className="text-right text-emerald-600">{isBangla ? 'সঞ্চয় জমা' : 'Savings Deposit'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'সঞ্চয় স্থিতি' : 'Savings Balance'}</TableHead>
                  <TableHead className="text-right text-primary">{isBangla ? 'কিস্তি আদায়' : 'Loan Installment'}</TableHead>
                  <TableHead className="text-right text-rose-600">{isBangla ? 'ঋণ স্থিতি' : 'Loan Outstanding'}</TableHead>
                  <TableHead>{isBangla ? 'আদায়কারী' : 'Collector'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'বাতিল' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passbookItems.map((item) => (
                  <TableRow key={item.id} className={item.isVoided ? 'opacity-40 line-through bg-muted/20' : ''}>
                    <TableCell className="font-mono text-xs">{item.date}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">{item.receiptNo}</TableCell>
                    <TableCell className="text-xs font-medium">{item.title}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600 font-semibold">
                      {item.savingsInBDT > 0 ? `+৳ ${item.savingsInBDT.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      ৳ {item.savingsBalanceBDT.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-primary font-semibold">
                      {item.loanRepaidBDT > 0 ? `৳ ${item.loanRepaidBDT.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-rose-600">
                      ৳ {item.loanBalanceBDT.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{item.officer}</TableCell>
                    <TableCell className="text-right">
                      {!item.isVoided && item.type !== 'profit' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVoidEntry(item.id)}
                          className="h-6 text-[10px] text-rose-600 hover:bg-rose-500/10 px-1.5"
                          title="ভুল এন্ট্রি বাতিল করুন"
                        >
                          <Undo2 className="w-3 h-3 mr-0.5" />
                          বাতিল
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DAILY COLLECTION SHEET & VOID REVERSAL                              */}
      {/* ========================================================================= */}
      {tab === 'collections' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'সুর্যমুখী মহিলা সমিতি — সাপ্তাহিক কিস্তি আদায় শিট ও ভুল সংশোধন' : 'Weekly Collection Sheet & Mistake Void'}</span>
            </CardTitle>
            <Badge variant="success" className="text-xs font-mono">
              {isBangla ? `আজকের মোট সংগৃহীত: ৳ ${pwaDailyCollected.toLocaleString()}` : `Total Collected: ৳ ${pwaDailyCollected.toLocaleString()}`}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'সদস্যের নাম ও কোড' : 'Member'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'সাপ্তাহিক সঞ্চয়' : 'Savings'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'ঋণের কিস্তি' : 'Loan Installment'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মোট আদায়' : 'Total Due'}</TableHead>
                  <TableHead className="text-center">{isBangla ? 'অবস্থা' : 'Status'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'ভুল সংশোধন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.slice(0, 4).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-semibold text-xs">{m.nameBn}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{m.code} | {m.mobile}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600 font-semibold">
                      ৳ {(m.dpsMonthlyInstallmentBDT || 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-primary font-semibold">
                      ৳ {(m.weeklyInstallmentBDT || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                      ৳ {((m.dpsMonthlyInstallmentBDT || 100) + (m.weeklyInstallmentBDT || 0)).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success" className="text-[10px]">
                        গৃহীত (Paid)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => showNotify(`${m.nameBn}-এর এন্ট্রি নিরীক্ষা মোডে রয়েছে।`)}
                        className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        রসিদ প্রিন্ট
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SAMITY & CENTERS                                                   */}
      {/* ========================================================================= */}
      {tab === 'samity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samities.map((sam) => (
            <Card key={sam.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px]">{sam.code}</Badge>
                  <div className="text-xs text-muted-foreground font-semibold">
                    {sam.membersCount} {isBangla ? 'জন সদস্য' : 'Members'}
                  </div>
                </div>
                <CardTitle className="text-sm font-bold mt-2">{sam.name}</CardTitle>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{sam.meetingDay}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">{isBangla ? 'মোট সঞ্চয় জমা:' : 'Total Savings:'}</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatCurrency(sam.totalSavingsBDT, { useBanglaNumerals: isBangla })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">{isBangla ? 'ঋণ স্থিতি:' : 'Loan Outstanding:'}</span>
                  <span className="font-mono font-bold text-primary">
                    {formatCurrency(sam.totalLoansOutstandingBDT, { useBanglaNumerals: isBangla })}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  {isBangla ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা:' : 'Field Officer:'} <span className="font-semibold text-foreground">{sam.fieldOfficer}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAFE COLLECTION SLIP MODAL (আদায় ভাউচার ও কিস্তি অনুমোদন স্লিপ)               */}
      {/* ========================================================================= */}
      {collectingMember && (
        <Dialog
          isOpen={!!collectingMember}
          onClose={() => setCollectingMember(null)}
          title={
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>{isBangla ? 'সদস্য কিস্তি ও সঞ্চয় আদায় ভাউচার স্লিপ' : 'Installment & Savings Collection Slip'}</span>
            </div>
          }
          description={
            isBangla
              ? 'সদস্যের সকল হিসাব যাচাইপূর্বক কিস্তি ও মাস অনুযায়ী আদায় নিশ্চিত করুন। এটি ভুল এন্ট্রি প্রতিরোধ করে।'
              : 'Verify all balances, installment number, and month before confirming collection.'
          }
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            {/* 1. Member Profile & Identification Card */}
            <div className="p-3.5 bg-muted/40 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground">{collectingMember.nameBn}</span>
                  <Badge variant="outline" className="font-mono text-xs">{collectingMember.code}</Badge>
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-primary" /> {collectingMember.mobile}
                  </span>
                  <span>NID: <strong className="font-mono">{collectingMember.nid}</strong></span>
                  <span>কেন্দ্র: <strong>{collectingMember.samityName}</strong></span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:pl-4">
                <span className="text-[10px] text-muted-foreground block">মোট অনাদায়ী ঋণ স্থিতি</span>
                <span className="font-mono font-bold text-base text-rose-600">
                  ৳ {(collectingMember.loanBalanceBDT || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 2. Month & Installment Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-card p-3 rounded-xl border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  {isBangla ? 'আদায়ের মাস ও শিডিউল *' : 'Collection Month / Cycle *'}
                </label>
                <select
                  value={collectMonth}
                  onChange={(e) => setCollectMonth(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold"
                >
                  <option value="অক্টোবর ২০২৬">অক্টোবর ২০২৬ (চলতি মাস)</option>
                  <option value="নভেম্বর ২০২৬">নভেম্বর ২০২৬ (অগ্রিম কিস্তি)</option>
                  <option value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬ (বকেয়া কিস্তি)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  {isBangla ? 'কিস্তি নম্বর *' : 'Installment Number *'}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={collectInstallmentNo}
                    onChange={(e) => setCollectInstallmentNo(Number(e.target.value))}
                    className="font-mono font-bold"
                  />
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    / {collectingMember.installmentsTotal || 44} সপ্তাহ
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Detailed Collection Breakdown (Loan, DPS, Savings, Late Fee) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBangla ? 'আদায়ের টাকার পরিমাণ (ব্রেকডাউন)' : 'Collection Amount Breakdown'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Loan Installment */}
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold">ঋণের সাপ্তাহিক কিস্তি (Loan)</label>
                    <span className="text-[10px] text-muted-foreground">প্রস্তাবিত: ৳ {collectingMember.weeklyInstallmentBDT || 0}</span>
                  </div>
                  <Input
                    type="number"
                    value={collectInstallmentAmount}
                    onChange={(e) => setCollectInstallmentAmount(Number(e.target.value))}
                    className="font-mono font-bold text-primary"
                  />
                </div>

                {/* DPS Deposit */}
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold">ডিপিএস মাসিক কিস্তি (DPS)</label>
                    <span className="text-[10px] text-muted-foreground">প্রস্তাবিত: ৳ {collectingMember.dpsMonthlyInstallmentBDT || 0}</span>
                  </div>
                  <Input
                    type="number"
                    value={collectDpsAmount}
                    onChange={(e) => setCollectDpsAmount(Number(e.target.value))}
                    className="font-mono font-bold text-emerald-600"
                  />
                </div>

                {/* General Savings */}
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold">সাধারণ সঞ্চয় জমা (Savings)</label>
                    <span className="text-[10px] text-muted-foreground">বর্তমান স্থিতি: ৳ {collectingMember.generalSavingsBalanceBDT}</span>
                  </div>
                  <Input
                    type="number"
                    value={collectGenSavingsAmount}
                    onChange={(e) => setCollectGenSavingsAmount(Number(e.target.value))}
                    className="font-mono font-bold"
                  />
                </div>

                {/* Late Fee */}
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold">বিলম্ব ফি / জরিমানা (ঐচ্ছিক)</label>
                    <span className="text-[10px] text-muted-foreground">বকেয়া হলে প্রযোজ্য</span>
                  </div>
                  <Input
                    type="number"
                    value={collectLateFee}
                    onChange={(e) => setCollectLateFee(Number(e.target.value))}
                    className="font-mono text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* 4. Payment Method & Live Total */}
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  পেমেন্ট মাধ্যম (Payment Mode):
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectPaymentMethod('cash')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      collectPaymentMethod === 'cash' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-background border text-muted-foreground'
                    }`}
                  >
                    নগদ ক্যাশ (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectPaymentMethod('bkash')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      collectPaymentMethod === 'bkash' ? 'bg-pink-600 text-white shadow-sm' : 'bg-background border text-muted-foreground'
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectPaymentMethod('nagad')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      collectPaymentMethod === 'nagad' ? 'bg-orange-600 text-white shadow-sm' : 'bg-background border text-muted-foreground'
                    }`}
                  >
                    নগদ (Nagad)
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground font-semibold block">সর্বমোট আদায়ের পরিমাণ:</span>
                <span className="text-2xl font-bold font-mono text-emerald-600">
                  ৳ {(collectInstallmentAmount + collectDpsAmount + collectGenSavingsAmount + collectLateFee).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 5. Confirmation Verification Warning */}
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                সতর্কতা: আদায় নিশ্চিত করার পূর্বে টাকার পরিমাণ এবং সদস্যের পরিচয় মিলিয়ে নিন। নিশ্চিত করার পর রসিদ তৈরি হবে এবং ব্যালেন্স হালনাগাদ হবে।
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setCollectingMember(null)} className="text-xs">
                {isBangla ? 'বাতিল করুন' : 'Cancel'}
              </Button>
              <Button
                onClick={handleExecuteCollection}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {isBangla ? 'যাচাইপূর্বক আদায় নিশ্চিত করুন' : 'Confirm & Generate Slip'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* DIGITAL MONEY RECEIPT PREVIEW MODAL (প্রিন্টযোগ্য মানি রসিদ)                    */}
      {/* ========================================================================= */}
      {printedReceipt && (
        <Dialog
          isOpen={!!printedReceipt}
          onClose={() => setPrintedReceipt(null)}
          title={
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{isBangla ? 'আদায় মানি রসিদ স্লিপ' : 'Official Money Receipt'}</span>
            </div>
          }
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div id="printable-money-receipt" className="p-6 bg-white text-black border-2 border-dashed border-gray-400 rounded-xl font-mono text-xs space-y-2 font-sans">
              <div className="text-center pb-2 border-b">
                <h3 className="font-bold text-sm text-foreground">{tenant?.name.bn || 'এনজিও ক্ষুদ্রঋণ ও সঞ্চয় শাখা'}</h3>
                <p className="text-[11px] text-muted-foreground">{printedReceipt.samity}</p>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>রসিদ নং: <strong className="text-primary">{printedReceipt.receiptNo}</strong></span>
                  <span>তারিখ: {printedReceipt.date}</span>
                </div>
              </div>

              <div className="space-y-1 py-1 border-b">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">সদস্যের নাম:</span>
                  <span className="font-bold text-foreground">{printedReceipt.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">সদস্য কোড:</span>
                  <span>{printedReceipt.memberCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">কিস্তি নম্বর:</span>
                  <span>কিস্তি নং {toBanglaDigits(printedReceipt.installmentNo)} ({printedReceipt.month})</span>
                </div>
              </div>

              <div className="space-y-1 py-1 border-b">
                {printedReceipt.loanRepaid > 0 && (
                  <div className="flex justify-between">
                    <span>ঋণের কিস্তি জমা:</span>
                    <span className="font-bold">৳ {printedReceipt.loanRepaid.toLocaleString()}</span>
                  </div>
                )}
                {printedReceipt.dpsDeposit > 0 && (
                  <div className="flex justify-between">
                    <span>ডিপিএস সঞ্চয় জমা:</span>
                    <span className="font-bold">৳ {printedReceipt.dpsDeposit.toLocaleString()}</span>
                  </div>
                )}
                {printedReceipt.genSavings > 0 && (
                  <div className="flex justify-between">
                    <span>সাধারণ সঞ্চয় জমা:</span>
                    <span className="font-bold">৳ {printedReceipt.genSavings.toLocaleString()}</span>
                  </div>
                )}
                {printedReceipt.lateFee > 0 && (
                  <div className="flex justify-between">
                    <span>বিলম্ব ফি:</span>
                    <span>৳ {printedReceipt.lateFee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-1 text-sm font-bold text-emerald-600">
                <span>সর্বমোট পরিশোধ:</span>
                <span>৳ {printedReceipt.total.toLocaleString()}</span>
              </div>

              <div className="pt-2 text-[10px] text-muted-foreground flex justify-between border-t">
                <span>অবশিষ্ট ঋণ স্থিতি: ৳ {printedReceipt.loanBalance.toLocaleString()}</span>
                <span>আদায়কারী: {printedReceipt.collector}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> SMS কনফার্মেশন প্রেরিত
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerPrint('printable-money-receipt', `Money_Receipt_${printedReceipt.receiptNo}`)}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> প্রিন্ট স্লিপ
                </Button>
                <Button size="sm" onClick={() => setPrintedReceipt(null)} className="text-xs">
                  সম্পন্ন
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* SAVINGS PRODUCT ADD & EDIT MODAL (Product Add/Edit/Delete)                 */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={
          editingProduct
            ? (isBangla ? `সঞ্চয় প্রোডাক্ট সম্পাদনা: ${editingProduct.name.bn}` : `Edit Product: ${editingProduct.name.en}`)
            : (isBangla ? 'নতুন সঞ্চয় স্কিম ও মুনাফা রেট প্রোডাক্ট যুক্ত করুন' : 'Add New Savings Scheme')
        }
        description={
          isBangla
            ? 'ডিপিএস, এফডিআর বা সাধারণ সঞ্চয়ের মুনাফা হার, কিস্তির পরিমাণ ও মেয়াদ নির্ধারণ করুন।'
            : 'Configure annual profit rate, installment amount, and tenure.'
        }
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রোডাক্ট কোড *</label>
              <Input
                value={prodFormCode}
                onChange={(e) => setProdFormCode(e.target.value)}
                placeholder="e.g. DPS-05YR"
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">স্কিমের ধরন *</label>
              <select
                value={prodFormType}
                onChange={(e) => setProdFormType(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="dps">DPS (ডিপিএস - মাসিক কিস্তি স্কিম)</option>
                <option value="fdr">FDR (ফিক্সড ডিপোজিট - স্থায়ী আমানত)</option>
                <option value="general">সাধারণ সঞ্চয় (Daily / Weekly)</option>
                <option value="special">বিশেষ কল্যাণ স্কিম (Hajj/Education)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রোডাক্টের নাম (ইংরেজি) *</label>
              <Input
                value={prodFormNameEn}
                onChange={(e) => setProdFormNameEn(e.target.value)}
                placeholder="e.g. 5-Year Lakhopoti Scheme"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রোডাক্টের নাম (বাংলা) *</label>
              <Input
                value={prodFormNameBn}
                onChange={(e) => setProdFormNameBn(e.target.value)}
                placeholder="যেমন: ৫ বছর মেয়াদী লাখপতি স্কিম"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">মেয়াদ (বছর) *</label>
              <Input
                type="number"
                value={prodFormYears}
                onChange={(e) => setProdFormYears(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">বাৎসরিক মুনাফা রেট (%) *</label>
              <Input
                type="number"
                step="0.1"
                value={prodFormRate}
                onChange={(e) => setProdFormRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">মাসিক কিস্তি (BDT) *</label>
              <Input
                type="number"
                value={prodFormInstallment}
                onChange={(e) => setProdFormInstallment(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">বিবরণ (বাংলা)</label>
            <Input
              value={prodFormDescBn}
              onChange={(e) => setProdFormDescBn(e.target.value)}
              placeholder="স্কিম সম্পর্কে সংক্ষিপ্ত তথ্য..."
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">আনুমানিক ম্যাচুরিটি রিটার্ন:</span>
              <span className="font-bold text-emerald-600">
                ৳ {calculateDpsMaturity(prodFormInstallment, prodFormYears, prodFormRate).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveProduct} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Check className="w-4 h-4 mr-1.5" />
              {editingProduct ? (isBangla ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes') : (isBangla ? 'প্রোডাক্ট তৈরি করুন' : 'Create Product')}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deletingProduct && (
        <Dialog
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          title={
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{isBangla ? 'সঞ্চয় প্রোডাক্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Product Deletion'}</span>
            </div>
          }
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-foreground leading-relaxed">
              আপনি কি নিশ্চিত যে <strong>"{deletingProduct.name.bn}"</strong> ({deletingProduct.code}) সঞ্চয় স্কিমটি স্থায়ীভাবে মুছে ফেলতে চান?
            </p>
            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30 text-[11px] text-rose-700 dark:text-rose-300">
              সতর্কতা: এটি মুছে ফেললে নতুন গ্রাহক এই স্কিমে যুক্ত হতে পারবে না।
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDeletingProduct(null)} className="text-xs">
                বাতিল
              </Button>
              <Button onClick={handleDeleteProduct} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                হ্যাঁ, মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
