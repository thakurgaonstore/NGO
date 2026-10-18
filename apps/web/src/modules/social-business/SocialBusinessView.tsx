import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Store,
  DollarSign,
  TrendingUp,
  Users,
  Sprout,
  ShoppingBag,
  Plus,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  HeartHandshake,
  PieChart,
  Milk,
  Scissors,
  Fish,
  Leaf
} from 'lucide-react';

export interface SocialEnterprise {
  id: string;
  code: string;
  name: { en: string; bn: string };
  category: 'dairy' | 'handicrafts' | 'agriculture' | 'fisheries' | 'other';
  location: string;
  managerName: string;
  capitalInvestmentBDT: number;
  monthlyRevenueBDT: number;
  monthlyExpenseBDT: number;
  netProfitBDT: number;
  beneficiariesEmployed: number; // e.g. 45 rural women
  status: 'profitable' | 'break_even' | 'scaling';
  description: { en: string; bn: string };
  dividendForCommunityPercent: number; // e.g. 50% re-invested into free schooling/healthcare
}

export interface EnterpriseSalesLog {
  id: string;
  date: string;
  enterpriseName: string;
  productDescription: string;
  quantity: string;
  totalSaleBDT: number;
  buyerType: string;
}

const INITIAL_ENTERPRISES: SocialEnterprise[] = [
  {
    id: 'ent-01',
    code: 'ENT-DAIRY-01',
    name: { en: 'Green Pastures Dairy & Fresh Milk', bn: 'সবুজ চারণভূমি ডেইরি ফার্ম ও খাঁটি দুধ কেন্দ্র' },
    category: 'dairy',
    location: 'সাভার ডেইরি খামার, ঢাকা',
    managerName: 'মো: রফিকুল ইসলাম',
    capitalInvestmentBDT: 1200000,
    monthlyRevenueBDT: 485000,
    monthlyExpenseBDT: 310000,
    netProfitBDT: 175000,
    beneficiariesEmployed: 18,
    status: 'profitable',
    description: {
      en: 'High-yield dairy cattle breeding and daily pure milk distribution to local cooperatives.',
      bn: 'উন্নত জাতের গাভী পালন, প্রতিদিন ৪৫০+ লিটার খাঁটি দুধ উৎপাদন ও স্থানীয় বাজারে সরবরাহ।'
    },
    dividendForCommunityPercent: 60
  },
  {
    id: 'ent-02',
    code: 'ENT-CRAFT-02',
    name: { en: 'Rural Women Nakshi Kantha & Sewing Center', bn: 'পল্লী নারী নকশিকাঁথা ও সেলাই প্রশিক্ষণ কারখানা' },
    category: 'handicrafts',
    location: 'যশোর নকশিকাঁথা কেন্দ্র',
    managerName: 'ফারহানা আকতার',
    capitalInvestmentBDT: 650000,
    monthlyRevenueBDT: 320000,
    monthlyExpenseBDT: 195000,
    netProfitBDT: 125000,
    beneficiariesEmployed: 65,
    status: 'profitable',
    description: {
      en: 'Empowering ultra-poor rural women through traditional embroidery, boutique sewing, and eco-textiles.',
      bn: 'সুবিধাবঞ্চিত ও বিধবা নারীদের কর্মসংস্থান, হস্তশিল্প ও নকশিকাঁথা তৈরি এবং রপ্তানি ও মেলায় বিক্রয়।'
    },
    dividendForCommunityPercent: 70
  },
  {
    id: 'ent-03',
    code: 'ENT-AGRO-03',
    name: { en: 'Eco-Harvest Organic Fertilizer & Bio-Agro', bn: 'জৈব ট্রাইকো-কম্পোস্ট সার ও নিরাপদ সবজি প্রকল্প' },
    category: 'agriculture',
    location: 'বগুড়া সদর কৃষি খামার',
    managerName: 'কৃষিবিদ মাহাবুব আলম',
    capitalInvestmentBDT: 850000,
    monthlyRevenueBDT: 260000,
    monthlyExpenseBDT: 170000,
    netProfitBDT: 90000,
    beneficiariesEmployed: 24,
    status: 'profitable',
    description: {
      en: 'Chemical-free organic fertilizer processing and climate-resilient organic vegetable cultivation.',
      bn: 'রাসায়নিকমুক্ত পরিবেশবান্ধব জৈব সার উৎপাদন ও ক্ষুদ্র প্রান্তিক কৃষকদের মাঝে সাশ্রয়ী মূল্যে বিপণন।'
    },
    dividendForCommunityPercent: 50
  },
  {
    id: 'ent-04',
    code: 'ENT-FISH-04',
    name: { en: 'Community Carp Hatchery & Fish Culture', bn: 'সমন্বিত কার্প হ্যাচারি ও আধুনিক মৎস্য খামার' },
    category: 'fisheries',
    location: 'ময়মনসিংহ মৎস্য প্রকল্প',
    managerName: 'মো: আনোয়ার হোসেন',
    capitalInvestmentBDT: 950000,
    monthlyRevenueBDT: 390000,
    monthlyExpenseBDT: 240000,
    netProfitBDT: 150000,
    beneficiariesEmployed: 15,
    status: 'profitable',
    description: {
      en: 'Sustainable fresh-water fish breeding, fry distribution to marginal fish farmers.',
      bn: 'পুকুর ও জলাশয়ে বৈজ্ঞানিক উপায়ে মাছের পোনা উৎপাদন ও দরিদ্র মৎস্যজীবীদের সম্পৃক্তকরণ।'
    },
    dividendForCommunityPercent: 55
  }
];

const INITIAL_SALES_LOGS: EnterpriseSalesLog[] = [
  {
    id: 's-01',
    date: '2026-10-16',
    enterpriseName: 'সবুজ চারণভূমি ডেইরি ফার্ম',
    productDescription: 'খাঁটি তরল গরুর দুধ (সকাল ও বিকাল)',
    quantity: '৪২০ লিটার',
    totalSaleBDT: 29400,
    buyerType: 'স্থানীয় মিষ্টি প্রস্তুতকারক ও গ্রাহক'
  },
  {
    id: 's-02',
    date: '2026-10-15',
    enterpriseName: 'পল্লী নারী নকশিকাঁথা কারখানা',
    productDescription: 'হাতে সেলাইকৃত নকশিকাঁথা ও বুটিক চাদর',
    quantity: '১৮ পিস',
    totalSaleBDT: 45000,
    buyerType: 'ঢাকা আড়ং ও প্রদর্শনী মেলা'
  },
  {
    id: 's-03',
    date: '2026-10-14',
    enterpriseName: 'জৈব সার ও নিরাপদ সবজি প্রকল্প',
    productDescription: 'ট্রাইকো-কম্পোস্ট ভার্মিসার ৫০ কেজি বস্তা',
    quantity: '৮০ বস্তা',
    totalSaleBDT: 36000,
    buyerType: 'স্থানীয় কৃষক সমবায় সমিতি'
  }
];

export const SocialBusinessView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const [enterprises, setEnterprises] = useState<SocialEnterprise[]>(() => {
    const saved = localStorage.getItem(`ngo_social_enterprises_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_ENTERPRISES;
  });

  const [salesLogs, setSalesLogs] = useState<EnterpriseSalesLog[]>(INITIAL_SALES_LOGS);
  const [tab, setTab] = useState<'enterprises' | 'sales' | 'welfare'>('enterprises');

  // Modal State for New Enterprise
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [nameEn, setNameEn] = useState<string>('');
  const [nameBn, setNameBn] = useState<string>('');
  const [category, setCategory] = useState<SocialEnterprise['category']>('dairy');
  const [location, setLocation] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [capital, setCapital] = useState<number>(500000);
  const [beneficiaries, setBeneficiaries] = useState<number>(20);
  const [dividendPercent, setDividendPercent] = useState<number>(60);

  // Modal State for Sales Log
  const [isSalesModalOpen, setIsSalesModalOpen] = useState<boolean>(false);
  const [salesEntName, setSalesEntName] = useState<string>('সবুজ চারণভূমি ডেইরি ফার্ম');
  const [salesDesc, setSalesDesc] = useState<string>('');
  const [salesQty, setSalesQty] = useState<string>('');
  const [salesAmount, setSalesAmount] = useState<number>(15000);
  const [buyerType, setBuyerType] = useState<string>('খুচরা বাজার / গ্রাহক');

  const handleAddEnterprise = () => {
    if (!nameEn && !nameBn) return;
    const newEnt: SocialEnterprise = {
      id: `ent-${Date.now()}`,
      code: `ENT-${category.toUpperCase().slice(0, 4)}-${String(enterprises.length + 1).padStart(2, '0')}`,
      name: { en: nameEn || nameBn, bn: nameBn || nameEn },
      category,
      location,
      managerName,
      capitalInvestmentBDT: capital,
      monthlyRevenueBDT: 0,
      monthlyExpenseBDT: 0,
      netProfitBDT: 0,
      beneficiariesEmployed: beneficiaries,
      status: 'scaling',
      description: {
        en: `Social enterprise initiative in ${location}.`,
        bn: `${location}-এ পরিচালিত একটি টেকসই সামাজিক ব্যবসা প্রকল্প।`
      },
      dividendForCommunityPercent: dividendPercent
    };

    const updated = [newEnt, ...enterprises];
    setEnterprises(updated);
    localStorage.setItem(`ngo_social_enterprises_${tenant?.id}`, JSON.stringify(updated));
    setIsAddOpen(false);
  };

  const handleAddSalesLog = () => {
    if (!salesDesc || salesAmount <= 0) return;
    const newLog: EnterpriseSalesLog = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      enterpriseName: salesEntName,
      productDescription: salesDesc,
      quantity: salesQty,
      totalSaleBDT: salesAmount,
      buyerType
    };
    setSalesLogs([newLog, ...salesLogs]);
    setIsSalesModalOpen(false);
    setSalesDesc('');
    setSalesQty('');
  };

  // KPI Calculations
  const totalCapital = enterprises.reduce((sum, e) => sum + e.capitalInvestmentBDT, 0);
  const totalMonthlyRevenue = enterprises.reduce((sum, e) => sum + e.monthlyRevenueBDT, 0);
  const totalNetProfit = enterprises.reduce((sum, e) => sum + e.netProfitBDT, 0);
  const totalBeneficiaries = enterprises.reduce((sum, e) => sum + e.beneficiariesEmployed, 0);

  const getCategoryIcon = (cat: SocialEnterprise['category']) => {
    switch (cat) {
      case 'dairy':
        return <Milk className="w-5 h-5 text-sky-600" />;
      case 'handicrafts':
        return <Scissors className="w-5 h-5 text-rose-600" />;
      case 'agriculture':
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      case 'fisheries':
        return <Fish className="w-5 h-5 text-blue-600" />;
      default:
        return <Store className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">
              {isBangla ? 'সামাজিক ব্যবসা ও প্রকল্প (Social Business)' : 'Social Business & Enterprises'}
            </h2>
            <Badge variant="default" className="text-[10px] bg-primary font-mono">
              Self-Sustainable NGO
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'এনজিও পরিচালিত আয়বর্ধক প্রকল্প (ডেইরি, হস্তশিল্প, জৈব সার ও মৎস্য চাষ), কর্মসংস্থান এবং লভ্যাংশ বণ্টন।'
              : 'Revenue-generating social enterprises, local employment creation, and community welfare dividend distribution.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsSalesModalOpen(true)} variant="outline" className="text-xs h-9">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            {isBangla ? 'বিক্রয় ও উৎপাদন এন্ট্রি' : 'Record Sales'}
          </Button>

          <Button onClick={() => setIsAddOpen(true)} className="text-xs h-9">
            <Plus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন সামাজিক প্রকল্প শুরু করুন' : 'Launch New Enterprise'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'চলতি মাসের বিক্রয় রাজস্ব' : 'Monthly Sales Revenue'}
              </p>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {formatCurrency(totalMonthlyRevenue, { useBanglaNumerals: isBangla })}
              </div>
              <span className="text-[11px] text-muted-foreground">৪টি সক্রিয় সামাজিক উদ্যোগ</span>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'মাসিক নিট লাভ (Net Profit)' : 'Monthly Net Profit'}
              </p>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {formatCurrency(totalNetProfit, { useBanglaNumerals: isBangla })}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">লাভজনক স্বনির্ভর মডেল</span>
            </div>
            <DollarSign className="w-8 h-8 text-primary/30" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'সুবিধাভোগী নারী ও কর্মী' : 'Beneficiaries Employed'}
              </p>
              <div className="text-2xl font-bold font-mono text-violet-600 mt-1">
                {isBangla ? `${toBanglaDigits(totalBeneficiaries)} জন` : `${totalBeneficiaries} People`}
              </div>
              <span className="text-[11px] text-muted-foreground">প্রত্যক্ষ দারিদ্র্য বিমোচন</span>
            </div>
            <Users className="w-8 h-8 text-violet-600/30" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {isBangla ? 'মোট মূলধন বিনিয়োগ' : 'Capital Investment Pool'}
              </p>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                {formatCurrency(totalCapital, { useBanglaNumerals: isBangla })}
              </div>
              <span className="text-[11px] text-muted-foreground">এনজিও নিজস্ব ও ঋণ তহবিল</span>
            </div>
            <Store className="w-8 h-8 text-muted-foreground/30" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 text-xs font-semibold">
        <button
          onClick={() => setTab('enterprises')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tab === 'enterprises' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'সামাজিক ব্যবসা প্রকল্পসমূহ' : 'Active Enterprises'}
        </button>
        <button
          onClick={() => setTab('sales')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tab === 'sales' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'দৈনিক বিক্রয় ও উৎপাদন খতিয়ান' : 'Production & Sales Ledger'}
        </button>
        <button
          onClick={() => setTab('welfare')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tab === 'welfare' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'সামাজিক লভ্যাংশ ও কল্যাণ তহবিল' : 'Dividend & Welfare Reinvestment'}
        </button>
      </div>

      {/* TAB 1: ENTERPRISES LIST */}
      {tab === 'enterprises' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enterprises.map((ent) => (
            <Card key={ent.id} className="border-border hover:shadow-lg transition-all flex flex-col justify-between">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted">
                      {getCategoryIcon(ent.category)}
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-[10px]">{ent.code}</Badge>
                      <CardTitle className="text-sm font-bold mt-1">
                        {isBangla ? ent.name.bn : ent.name.en}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    {isBangla ? 'লাভজনক' : 'Profitable'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {isBangla ? ent.description.bn : ent.description.en}
                </p>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                  <span>অবস্থান:</span>
                  <span className="font-semibold text-foreground">{ent.location}</span>
                  <span className="mx-1">•</span>
                  <span>ব্যবস্থাপক:</span>
                  <span className="font-semibold text-foreground">{ent.managerName}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-xl font-mono text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">মাসিক আয়</span>
                    <span className="font-bold text-emerald-600 text-xs">
                      {formatCurrency(ent.monthlyRevenueBDT, { useBanglaNumerals: isBangla })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">মাসিক খরচ</span>
                    <span className="font-bold text-rose-600 text-xs">
                      {formatCurrency(ent.monthlyExpenseBDT, { useBanglaNumerals: isBangla })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">নিট লাভ</span>
                    <span className="font-bold text-primary text-xs">
                      {formatCurrency(ent.netProfitBDT, { useBanglaNumerals: isBangla })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">সুবিধাভোগী ও প্রান্তিক কর্মী:</span>
                  <span className="font-bold text-violet-600">
                    {isBangla ? `${toBanglaDigits(ent.beneficiariesEmployed)} জন` : `${ent.beneficiariesEmployed} People`}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">সামাজিক কল্যাণে লভ্যাংশ বণ্টন:</span>
                  <span className="font-bold text-emerald-600">
                    {isBangla ? `${toBanglaDigits(ent.dividendForCommunityPercent)}%` : `${ent.dividendForCommunityPercent}%`}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: SALES LOG */}
      {tab === 'sales' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'উৎপাদিত পণ্য বিক্রয় ও আয়ের তালিকা' : 'Daily Sales & Invoicing Log'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBangla ? 'উদ্যোগের নাম' : 'Enterprise'}</TableHead>
                  <TableHead>{isBangla ? 'পণ্যের বিবরণ' : 'Product'}</TableHead>
                  <TableHead>{isBangla ? 'পরিমাণ' : 'Quantity'}</TableHead>
                  <TableHead>{isBangla ? 'ক্রেতার ধরন' : 'Buyer'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মোট বিক্রয় (BDT)' : 'Sale Amount'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.date}</TableCell>
                    <TableCell className="font-semibold text-xs">{log.enterpriseName}</TableCell>
                    <TableCell className="text-xs">{log.productDescription}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.quantity}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.buyerType}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-emerald-600">
                      ৳ {log.totalSaleBDT.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: WELFARE REINVESTMENT */}
      {tab === 'welfare' && (
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-primary" />
                <span>{isBangla ? 'সামাজিক ব্যবসায় অর্জিত লাভের পুনর্বিনিয়োগ (Community Reinvestment)' : 'Welfare Fund Utilization'}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                সামাজিক ব্যবসার মূল নীতি: কোনো ব্যক্তিগত মুনাফা নয়। অর্জিত লাভ সরাসরি প্রান্তিক শিশুদের বিনা খরচে শিক্ষা, মাতৃস্বাস্থ্য এবং জরুরি দুর্যোগ তহবিলে ব্যয় করা হয়।
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-muted/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">দরিদ্র শিশুদের শিক্ষা তহবিল</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">৳ ১,৮০,০০০</span>
                  <p className="text-[11px] text-muted-foreground mt-1">১২০ জন শিক্ষার্থীর স্কুল ফি ও বই</p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">বিনামূল্যে গ্রামীণ মাতৃস্বাস্থ্য সেবা</span>
                  <span className="text-lg font-bold font-mono text-sky-600">৳ ১,৪০,০০০</span>
                  <p className="text-[11px] text-muted-foreground mt-1">প্রসূতি মায়েদের ওষুধ ও পুষ্টি সহায়তা</p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">জরুরি দুর্যোগ ও জলবায়ু তহবিল</span>
                  <span className="text-lg font-bold font-mono text-primary">৳ ২,২০,০০০</span>
                  <p className="text-[11px] text-muted-foreground mt-1">বন্যা ও খরায় ক্ষতিগ্রস্ত কৃষকদের অনুদান</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Enterprise Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isBangla ? 'নতুন সামাজিক ব্যবসা ও আয়বর্ধক প্রকল্প চালু করুন' : 'Launch New Social Enterprise'}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রকল্পের নাম (ইংরেজি) *</label>
              <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Pure Bee Honey Project" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রকল্পের নাম (বাংলা) *</label>
              <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="যেমন: সুন্দরবন মধু সংগ্রহ প্রকল্প" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">ক্যাটাগরি *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="dairy">ডেইরি খামার ও দুগ্ধ উৎপাদন</option>
                <option value="handicrafts">হস্তশিল্প ও নকশিকাঁথা কারখানা</option>
                <option value="agriculture">জৈব সার ও টেকসই কৃষি</option>
                <option value="fisheries">মৎস্য চাষ ও হ্যাচারি</option>
                <option value="other">অন্যান্য আয়বর্ধক উদ্যোগ</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রকল্প অবস্থান (স্থান) *</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="যেমন: চুয়াডাঙ্গা খামার" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">ব্যবস্থাপকের নাম *</label>
              <Input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="মো: রফিকুল ইসলাম" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রাথমিক মূলধন বিনিয়োগ (BDT) *</label>
              <Input type="number" value={capital} onChange={(e) => setCapital(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">সুবিধাভোগী কর্মসংস্থান সংখ্যা (জন) *</label>
              <Input type="number" value={beneficiaries} onChange={(e) => setBeneficiaries(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">সামাজিক কল্যাণে লভ্যাংশ (%) *</label>
              <Input type="number" value={dividendPercent} onChange={(e) => setDividendPercent(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleAddEnterprise} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'উদ্যোগ চালু করুন' : 'Confirm Launch'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Sales Entry Modal */}
      <Dialog
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
        title={isBangla ? 'নতুন পণ্য বিক্রয় ও রাজস্ব রেকর্ড করুন' : 'Record Enterprise Sales'}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">সামাজিক ব্যবসা প্রকল্প নির্বাচন করুন *</label>
            <select
              value={salesEntName}
              onChange={(e) => setSalesEntName(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
            >
              {enterprises.map((e) => (
                <option key={e.id} value={isBangla ? e.name.bn : e.name.en}>
                  {isBangla ? e.name.bn : e.name.en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">পণ্যের বিবরণ *</label>
              <Input value={salesDesc} onChange={(e) => setSalesDesc(e.target.value)} placeholder="যেমন: ৩০০ লিটার দুধ" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">পরিমাণ *</label>
              <Input value={salesQty} onChange={(e) => setSalesQty(e.target.value)} placeholder="যেমন: ৩০০ লিটার / ৫০ পিস" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">মোট বিক্রয়মূল্য (BDT) *</label>
              <Input type="number" value={salesAmount} onChange={(e) => setSalesAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">ক্রেতার বিবরণ / ধরন *</label>
              <Input value={buyerType} onChange={(e) => setBuyerType(e.target.value)} placeholder="স্থানীয় পাইকারি ক্রেতা" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsSalesModalOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleAddSalesLog} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'বিক্রয় সংরক্ষণ করুন' : 'Save Sale'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
