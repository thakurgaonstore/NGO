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
  Briefcase
} from 'lucide-react';

export const ClientDashboardShell: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const { role } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-border">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            {isBangla
              ? `${tenant?.name.bn || 'এনজিও ইআরপি'} ড্যাশবোর্ডে স্বাগতম`
              : `Welcome to ${tenant?.name.en || 'NGO ERP'}`}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isBangla
              ? 'সদস্য ব্যবস্থাপনা, দ্বৈত দাখিলা হিসাব, মাঠ পর্যায়ের তথ্য সংগ্রহ এবং প্রকল্পের রিয়েল-টাইম রিপোর্ট।'
              : 'Beneficiary CRM, double-entry financial accounting, offline surveys, and project monitoring.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
            {isBangla ? `ভূমিকা: ${role.toUpperCase()}` : `Role: ${role.toUpperCase()}`}
          </Badge>
          <Badge variant="success" className="px-3 py-1 text-xs">
            {isBangla ? 'অনলাইন সিঙ্ক কার্যকর' : 'Live Sync Active'}
          </Badge>
        </div>
      </div>

      {/* KPI Cards (From pre-aggregated Spark document) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'মোট সদস্য / সুফলভোগী' : 'Total Beneficiaries'}
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {isBangla ? toBanglaDigits('1,420') : '1,420'}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% {isBangla ? 'চলতি মাসে বৃদ্ধি' : 'increase this month'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'চলমান প্রকল্পসমূহ' : 'Active Programs & Grants'}
            </CardTitle>
            <FolderKanban className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {isBangla ? toBanglaDigits('6') : '6'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isBangla ? '৩ টি দাতা সংস্থার অর্থায়নে' : 'funded by 3 global donors'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'হাতে নগদ ও ব্যাংক ব্যালেন্স' : 'Total Cash & Bank Balance'}
            </CardTitle>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {formatCurrency(2340500, { useBanglaNumerals: isBangla })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isBangla ? 'হিসাব পরিকল্পনা অনুসারে ব্যালেন্স' : 'Reconciled as per General Ledger'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'অপেক্ষমাণ অনুমোদন' : 'Pending Approvals'}
            </CardTitle>
            <Clock className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">
              {isBangla ? toBanglaDigits('4') : '4'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isBangla ? '২টি ভাউচার, ১টি ছুটির আবেদন' : '2 vouchers, 1 leave, 1 purchase'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launchpad & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>{isBangla ? 'দ্রুত কাজের শর্টকাট' : 'Quick Actions'}</span>
              <Badge variant="outline" className="text-[10px]">PWA Ready</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { title: isBangla ? 'নতুন সদস্য নিবন্ধন' : 'Register Beneficiary', icon: Users, color: 'text-primary' },
              { title: isBangla ? 'ভাউচার এন্ট্রি (মেকার)' : 'Create Voucher', icon: Receipt, color: 'text-emerald-600' },
              { title: isBangla ? 'মাঠ জরিপ ফর্ম' : 'Field Survey Form', icon: FolderKanban, color: 'text-sky-600' },
              { title: isBangla ? 'ত্রাণ বিতরণ রেকর্ড' : 'Relief Distribution', icon: Boxes, color: 'text-amber-600' },
              { title: isBangla ? 'দৈনিক হাজিরা চেক-ইন' : 'GPS Attendance', icon: Briefcase, color: 'text-purple-600' },
              { title: isBangla ? 'আর্থিক বিবরণী রিপোর্ট' : 'Financial Statement', icon: PiggyBank, color: 'text-rose-600' }
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2 group"
                >
                  <Icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {action.title}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold">
              {isBangla ? 'প্রতিষ্ঠানের তথ্য' : 'Tenant Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">{isBangla ? 'ক্লায়েন্ট আইডি:' : 'Client ID:'}</span>
              <span className="font-mono font-bold">{tenant?.clientId}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">{isBangla ? 'হোস্টিং মোড:' : 'Cloud Mode:'}</span>
              <span className="font-semibold text-primary">
                {tenant?.deploymentMode === 'MODE_B' ? 'Dedicated (Mode B)' : 'Shared (Mode A)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">{isBangla ? 'সাবস্ক্রিপশন:' : 'Plan:'}</span>
              <span className="font-semibold uppercase">{tenant?.planId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{isBangla ? 'এসএমএস ব্যালেন্স:' : 'SMS Balance:'}</span>
              <span className="font-mono font-bold text-emerald-600">
                {isBangla
                  ? `${toBanglaDigits(tenant?.quotas?.smsCreditsRemaining || 500)} টি`
                  : `${tenant?.quotas?.smsCreditsRemaining || 500} credits`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
