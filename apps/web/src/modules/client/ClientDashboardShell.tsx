import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useAuth } from '../../core/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { formatCurrency, toBanglaDigits } from '@ngo-erp/shared';
import {
  Users,
  FolderKanban,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Briefcase,
  Building2,
  DollarSign,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Landmark,
  UserCheck,
  FileCheck,
  Check,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface ClientDashboardShellProps {
  onNavigateToModule?: (moduleId: string) => void;
}

export const ClientDashboardShell: React.FC<ClientDashboardShellProps> = ({
  onNavigateToModule
}) => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const { role, currentUser } = useAuth();

  const handleNavigate = (modId: string) => {
    if (onNavigateToModule) {
      onNavigateToModule(modId);
    }
  };

  // Branch Performance Data
  const branchMetrics = [
    { name: isBangla ? 'সাভার প্রধান শাখা (ঢাকা)' : 'Savar Main Branch', members: 650, loans: '৳ ১.১০ কোটি', rate: '৯৯.২%', active: true },
    { name: isBangla ? 'ধামরাই উপজেলা শাখা' : 'Dhamrai Branch', members: 420, loans: '৳ ৬৫.০০ লাখ', rate: '৯৮.৪%', active: true },
    { name: isBangla ? 'মানিকগঞ্জ সদর শাখা' : 'Manikganj Branch', members: 510, loans: '৳ ৮০.০০ লাখ', rate: '৯৭.৯%', active: true },
    { name: isBangla ? 'সিংগাইর আঞ্চলিক কেন্দ্র' : 'Singair Regional Center', members: 260, loans: '৳ ৩০.৫০ লাখ', rate: '৯৮.৮%', active: true }
  ];

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE WELCOME & RECOGNITION BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">
              {isBangla ? 'রিয়েল-টাইম মাল্টি-ব্রাঞ্চ ইআরপি সিস্টেম কার্যকর' : 'Multi-Branch Live Sync Active'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {isBangla
              ? `${tenant?.name.bn || 'এনজিও ইআরপি'} — কেন্দ্রীয় কমান্ড সেন্টার`
              : `${tenant?.name.en || 'NGO ERP'} — Executive Command Center`}
          </h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            {isBangla
              ? 'সুফলভোগী সদস্য, ঋণ ও সঞ্চয় পোর্টফোলিও, হিসাব পরিকল্পনা এবং মাঠ পর্যায়ের সকল আর্থিক কার্যক্রমের পূর্ণাঙ্গ ওভারভিউ।'
              : 'Holistic overview of beneficiaries, microfinance portfolio, double-entry financial ledger, and field operations.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <div>
              <span className="text-[10px] text-muted-foreground block leading-none">{isBangla ? 'অ্যাক্সেস প্রিভিলেজ' : 'Access Level'}</span>
              <span className="font-bold text-foreground text-xs leading-none">
                {isBangla ? 'নির্বাহী পরিচালক / মালিক' : 'Executive Owner'}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handleNavigate('reports')}
            className="text-xs font-bold shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            {isBangla ? 'পূর্ণাঙ্গ আর্থিক অডিট রিপোর্ট' : 'Audit Reports'}
          </Button>
        </div>
      </div>

      {/* 2. TOP 4 EXECUTIVE KEY PERFORMANCE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Beneficiaries CRM */}
        <Card className="hover:shadow-md transition-all border-border hover:border-primary/40 group cursor-pointer" onClick={() => handleNavigate('members')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'মোট সদস্য ও সুফলভোগী' : 'Total Beneficiaries'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {isBangla ? toBanglaDigits('1,840') : '1,840'}
              <span className="text-xs font-normal text-muted-foreground ml-1">{isBangla ? 'জন' : 'members'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-600 font-semibold mt-1.5">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{isBangla ? toBanglaDigits('85') : '85'} {isBangla ? 'চলতি মাসে ভর্তি' : 'new this month'}
              </span>
              <span className="text-muted-foreground font-normal">{isBangla ? 'নারী ৮২%' : '82% women'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Microcredit Loan Portfolio */}
        <Card className="hover:shadow-md transition-all border-border hover:border-amber-500/40 group cursor-pointer" onClick={() => handleNavigate('microcredit')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'ঋণ পোর্টফোলিও ও স্থিতি' : 'Microcredit Portfolio'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-amber-700">
              {formatCurrency(28550000, { useBanglaNumerals: isBangla })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold mt-1.5">
              <span className="text-emerald-600">
                {isBangla ? 'আদায় হার: ৯৮.৬%' : 'Recovery Rate: 98.6%'}
              </span>
              <span className="text-muted-foreground font-mono font-normal">
                {isBangla ? 'বকেয়া: ১.৪%' : 'PAR: 1.4%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Savings & Deposits */}
        <Card className="hover:shadow-md transition-all border-border hover:border-sky-500/40 group cursor-pointer" onClick={() => handleNavigate('microcredit')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'মোট সঞ্চয় ও আমানত স্থিতি' : 'Total Savings & Deposits'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
              <Landmark className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-sky-700">
              {formatCurrency(7420500, { useBanglaNumerals: isBangla })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
              <span>{isBangla ? 'সাধারণ সঞ্চয় + ডিপিএস' : 'General & DPS'}</span>
              <span className="text-emerald-600 font-semibold">{isBangla ? '১০০% সুরক্ষিত' : '100% Secured'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Cash & Bank Liquid Balance */}
        <Card className="hover:shadow-md transition-all border-border hover:border-emerald-500/40 group cursor-pointer" onClick={() => handleNavigate('accounts')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {isBangla ? 'হাতে নগদ ও ব্যাংক ব্যালেন্স' : 'Liquid Cash & Bank'}
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-emerald-600">
              {formatCurrency(2980500, { useBanglaNumerals: isBangla })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
              <span>{isBangla ? 'নগদ: ১.২ লাখ' : 'Cash: 1.2L'}</span>
              <span>{isBangla ? 'ব্যাংক: ২৮.৬ লাখ' : 'Bank: 28.6L'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TODAY'S OPERATIONS STREAM & PENDING APPROVALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Collection & Operational Progress (2 Columns) */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>{isBangla ? 'আজকের মাঠ আদায় ও সার্বিক কার্যক্রম' : "Today's Field Collection & Operations"}</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 font-semibold">
                {isBangla ? 'আজকের তারিখ: লাইভ' : 'Today: Live'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Collection Target vs Actual Progress Bar */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground">{isBangla ? 'আজকের কিস্তি আদায় লক্ষ্যমাত্রা:' : 'Daily Collection Target:'} </span>
                  <span className="font-bold font-mono text-foreground">{formatCurrency(350000, { useBanglaNumerals: isBangla })}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isBangla ? 'সংগৃহীত:' : 'Collected:'} </span>
                  <span className="font-bold font-mono text-emerald-600">{formatCurrency(336500, { useBanglaNumerals: isBangla })}</span>
                  <span className="font-bold text-xs text-primary ml-1.5">({isBangla ? toBanglaDigits('96.1') : '96.1'}%)</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: '96.1%' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>{isBangla ? 'বাকি আদায়: ৳ ১৩,৫০০' : 'Remaining: ৳ 13,500'}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isBangla ? '১২ জন মাঠ কর্মকর্তার সবাই মাঠে সক্রিয়' : '12 Field Officers Active on Duty'}
                </span>
              </div>
            </div>

            {/* Branch Performance Comparison List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>{isBangla ? 'শাখাভিত্তিক আদায় ও পারফরম্যান্স মেট্রিক্স' : 'Branch Performance Metrics'}</span>
                <span className="text-[10px] font-normal lowercase">{isBangla ? '৪টি শাখা' : '4 branches'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {branchMetrics.map((branch, i) => (
                  <div key={i} className="p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="truncate">{branch.name}</span>
                      <span className="text-emerald-600 font-mono text-[11px]">{branch.rate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{isBangla ? `সদস্য: ${toBanglaDigits(branch.members)} জন` : `Members: ${branch.members}`}</span>
                      <span className="font-mono">{branch.loans}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals & Action Items (1 Column) */}
        <Card className="border-border">
          <CardHeader className="border-b pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{isBangla ? 'অপেক্ষমাণ অনুমোদন ও ফাইল' : 'Pending Approvals'}</span>
              </CardTitle>
              <Badge variant="warning" className="text-[10px] font-bold">
                {isBangla ? `${toBanglaDigits('6')} টি ফাইল` : '6 Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {/* Item 1: Loan Approvals */}
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {isBangla ? 'নতুন ঋণ বিতরণ ফাইল' : 'New Loan Disbursements'}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {isBangla ? '৩টি আবেদন • মোট ৳ ১,৫০,০০০' : '3 applications • Total ৳ 1,50,000'}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleNavigate('microcredit')}
                  className="h-7 text-[11px] px-2.5 font-bold"
                >
                  {isBangla ? 'অনুমোদন' : 'Review'}
                </Button>
              </div>
            </div>

            {/* Item 2: Voucher Checker */}
            <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {isBangla ? 'মেকার-চেকার ভাউচার অনুমোদন' : 'Voucher Clearance'}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {isBangla ? '২টি ডেবিট ভাউচার • মোট ৳ ৪২,৫০০' : '2 debit vouchers • Total ৳ 42,500'}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNavigate('accounts')}
                  className="h-7 text-[11px] px-2.5 font-bold text-sky-700 border-sky-500/30 hover:bg-sky-50"
                >
                  {isBangla ? 'রিভিউ' : 'Check'}
                </Button>
              </div>
            </div>

            {/* Item 3: HR Leave Request */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {isBangla ? 'কর্মকর্তা ছুটির আবেদন' : 'Employee Leave Request'}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {isBangla ? 'মাঠ কর্মকর্তা (সাভার শাখা) • ৩ দিন' : 'Field Officer (Savar) • 3 Days'}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNavigate('hr_payroll')}
                  className="h-7 text-[11px] px-2.5 font-bold"
                >
                  {isBangla ? 'দেখুন' : 'View'}
                </Button>
              </div>
            </div>

            {/* Quick Note for Owner */}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              {isBangla
                ? 'মালিক হিসেবে আপনার অনুমোদনের পর লেনদেন চূড়ান্তভাবে কার্যকর হবে।'
                : 'All maker-checker items require your final owner signature to execute.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. ACTIVE COMMUNITY PROGRAMS & QUICK ACTION LAUNCHPAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Shortcuts (2 Columns) */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{isBangla ? 'জরুরি কাজের সরাসরি শর্টকাট' : 'Direct Action Launchpad'}</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {isBangla ? 'দ্রুত প্রবেশ' : 'Quick Access'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'members',
                title: isBangla ? 'নতুন সদস্য ভর্তি ফর্ম' : 'Register Member',
                subtitle: isBangla ? 'এনআইডি ও ছবিসহ নিবন্ধন' : 'Beneficiary onboarding',
                icon: Users,
                color: 'text-primary'
              },
              {
                id: 'microcredit',
                title: isBangla ? 'কিস্তি আদায় শিট এন্ট্রি' : 'Loan Collection Sheet',
                subtitle: isBangla ? 'সমিতিভিত্তিক কিস্তি জমা' : 'Daily samity collection',
                icon: PiggyBank,
                color: 'text-amber-600'
              },
              {
                id: 'accounts',
                title: isBangla ? 'ভাউচার এন্ট্রি (ক্যাশ/ব্যাংক)' : 'Create Voucher',
                subtitle: isBangla ? 'দ্বৈত দাখিলা ডেবিট/ক্রেডিট' : 'Double entry posting',
                icon: Receipt,
                color: 'text-emerald-600'
              },
              {
                id: 'field_ops',
                title: isBangla ? 'মাঠ জরিপ ফর্ম বিল্ডার' : 'Field Survey Forms',
                subtitle: isBangla ? 'অফলাইন ও মোবাইল জরিপ' : 'Dynamic field forms',
                icon: ClipboardList,
                color: 'text-sky-600'
              },
              {
                id: 'hr_payroll',
                title: isBangla ? 'কর্মকর্তা উপস্থিতি ও পে-স্লিপ' : 'HR & Payroll',
                subtitle: isBangla ? 'জিপিএস হাজিরা ও বেতন' : 'Staff attendance & salary',
                icon: Briefcase,
                color: 'text-purple-600'
              },
              {
                id: 'reports',
                title: isBangla ? 'ব্যালেন্স শিট ও আর্থিক হিসাব' : 'Financial Statements',
                subtitle: isBangla ? 'অডিট ও পিডিএফ ডাউনলোড' : 'Ledgers, Balance Sheet',
                icon: Landmark,
                color: 'text-rose-600'
              }
            ].map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  onClick={() => handleNavigate(action.id)}
                  className="p-3.5 rounded-xl border border-border bg-card/70 hover:bg-muted/40 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2 group shadow-xs hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block leading-tight">
                      {action.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">
                      {action.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Development Programs & Notice Overview (1 Column) */}
        <Card>
          <CardHeader className="border-b pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-sky-600" />
                <span>{isBangla ? 'চলমান উন্নয়ন প্রকল্প' : 'Active Programs'}</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                {isBangla ? '৪টি প্রকল্প' : '4 Grants'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            {/* Project 1 */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="truncate">{isBangla ? 'গ্রামীণ নারী স্বাবলম্বীকরণ' : 'Women Micro-Enterprise'}</span>
                <span className="text-emerald-600 text-[10px] font-mono">৮৫% অর্জিত</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {isBangla ? 'দাতা তহবিল: PKSF অনুদান • সাভার ও ধামরাই' : 'PKSF Funded • 420 Families'}
              </p>
            </div>

            {/* Project 2 */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="truncate">{isBangla ? 'নিরাপদ পানি ও স্যানিটেশন' : 'Safe Water & Sanitation'}</span>
                <span className="text-sky-600 text-[10px] font-mono">৯২% সম্পন্ন</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {isBangla ? 'দাতা সংস্থা: গ্লোবাল এইড • সিংগাইর' : 'Global Aid Grant • Water Plants'}
              </p>
            </div>

            {/* Project 3 */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="truncate">{isBangla ? 'বিনামূল্যে চক্ষু ও চিকিৎসা ক্যাম্প' : 'Free Health Camp'}</span>
                <span className="text-amber-600 text-[10px] font-mono">চলমান</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {isBangla ? 'এনজিও নিজস্ব সমাজকল্যাণ তহবিল' : 'NGO Welfare Fund • 1,200 Patients'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('projects')}
              className="w-full text-xs font-semibold h-8"
            >
              {isBangla ? 'সকল প্রকল্প ও দাতা অনুদান দেখুন →' : 'View All Projects & Grants →'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
