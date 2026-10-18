import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { toBanglaDigits, formatCurrency } from '@ngo-erp/shared';
import { triggerPrint } from '../../core/print/printHelper';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Calendar,
  Lock,
  Unlock,
  MessageSquare,
  BookOpen,
  Receipt,
  Edit,
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  Send,
  Eye,
  Check,
  X,
  History,
  AlertCircle
} from 'lucide-react';

export interface AuditRecord {
  id: string;
  editedAt: string;
  editedBy: string;
  editedByRole: string;
  oldAmount: number;
  newAmount: number;
  reason: string;
  customerAlertSmsSent: boolean;
}

export interface FieldCollectionItem {
  id: string;
  slipNo: string;
  date: string;
  time: string;
  fieldOfficerId: string;
  fieldOfficerName: string;
  branchId: string;
  branchName: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  memberMobile: string;
  samityName: string;
  loanRepaidBDT: number;
  dpsDepositBDT: number;
  genSavingsBDT: number;
  lateFeeBDT: number;
  totalBDT: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad';
  status: 'collected' | 'submitted_to_manager' | 'verified_and_vaulted';
  isLocked: boolean;
  smsSent: boolean;
  smsContent: string;
  smsDeliveredAt: string;
  isModified?: boolean;
  auditTrail?: AuditRecord[];
}

export interface HandoverBatch {
  id: string;
  date: string;
  branchId: string;
  branchName: string;
  fieldOfficerName: string;
  totalMembers: number;
  totalLoanBDT: number;
  totalSavingsBDT: number;
  totalDpsBDT: number;
  grandTotalBDT: number;
  cashHandedOverBDT: number;
  managerReceivedBDT: number;
  varianceBDT: number;
  status: 'pending_submission' | 'submitted' | 'approved_and_vaulted';
  managerName?: string;
  voucherNo?: string;
  approvedAt?: string;
}

const INITIAL_COLLECTIONS: FieldCollectionItem[] = [
  {
    id: 'col-101',
    slipNo: 'SLIP-2026-1041',
    date: '2026-10-17',
    time: '10:15 AM',
    fieldOfficerId: 'u-03',
    fieldOfficerName: 'মো: তারিকুল ইসলাম',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    memberId: 'mem-01',
    memberName: 'রহিমা বেগম',
    memberCode: 'MEM-2026-0001',
    memberMobile: '01712-889901',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    loanRepaidBDT: 750,
    dpsDepositBDT: 500,
    genSavingsBDT: 100,
    lateFeeBDT: 0,
    totalBDT: 1350,
    paymentMethod: 'cash',
    status: 'submitted_to_manager',
    isLocked: true,
    smsSent: true,
    smsContent: 'গ্রাহক রহিমা বেগম, আপনার কিস্তি বাবদ ৳৭৫০ ও সঞ্চয় ৳৬০০ মোট ৳১,৩৫০ আদায় হয়েছে। রসিদ: SLIP-2026-1041। ধন্যবাদ, ডেমো এনজিও।',
    smsDeliveredAt: '10:16 AM'
  },
  {
    id: 'col-102',
    slipNo: 'SLIP-2026-1042',
    date: '2026-10-17',
    time: '10:35 AM',
    fieldOfficerId: 'u-03',
    fieldOfficerName: 'মো: তারিকুল ইসলাম',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    memberId: 'mem-02',
    memberName: 'মোছাম্মৎ আয়েশা খাতুন',
    memberCode: 'MEM-2026-0002',
    memberMobile: '01812-445566',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    loanRepaidBDT: 1250,
    dpsDepositBDT: 1000,
    genSavingsBDT: 200,
    lateFeeBDT: 0,
    totalBDT: 2450,
    paymentMethod: 'cash',
    status: 'submitted_to_manager',
    isLocked: true,
    smsSent: true,
    smsContent: 'গ্রাহক মোছাম্মৎ আয়েশা খাতুন, আপনার কিস্তি ও ডিপিএস বাবদ মোট ৳২,৪৫০ জমা হয়েছে। রসিদ: SLIP-2026-1042। ডেমো এনজিও।',
    smsDeliveredAt: '10:36 AM'
  },
  {
    id: 'col-103',
    slipNo: 'SLIP-2026-1043',
    date: '2026-10-17',
    time: '11:10 AM',
    fieldOfficerId: 'u-03',
    fieldOfficerName: 'মো: তারিকুল ইসলাম',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    memberId: 'mem-03',
    memberName: 'ফাতেমা বেগম',
    memberCode: 'MEM-2026-0003',
    memberMobile: '01915-778899',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    loanRepaidBDT: 1000,
    dpsDepositBDT: 0,
    genSavingsBDT: 150,
    lateFeeBDT: 0,
    totalBDT: 1150,
    paymentMethod: 'cash',
    status: 'submitted_to_manager',
    isLocked: true,
    smsSent: true,
    smsContent: 'গ্রাহক ফাতেমা বেগম, আপনার সাপ্তাহিক কিস্তি বাবদ ৳১,০০০ ও সঞ্চয় ৳১৫০ মোট ৳১,১৫০ আদায় হয়েছে। রসিদ: SLIP-2026-1043।',
    smsDeliveredAt: '11:11 AM'
  },
  {
    id: 'col-104',
    slipNo: 'SLIP-2026-1044',
    date: '2026-10-17',
    time: '11:45 AM',
    fieldOfficerId: 'u-03',
    fieldOfficerName: 'মো: তারিকুল ইসলাম',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    memberId: 'mem-04',
    memberName: 'বিলকিস আক্তার',
    memberCode: 'MEM-2026-0004',
    memberMobile: '01718-223344',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    loanRepaidBDT: 1500,
    dpsDepositBDT: 1350,
    genSavingsBDT: 100,
    lateFeeBDT: 0,
    totalBDT: 2950,
    paymentMethod: 'cash',
    status: 'submitted_to_manager',
    isLocked: true,
    smsSent: true,
    smsContent: 'গ্রাহক বিলকিস আক্তার, কিস্তি বাবদ ৳১,৫০০ ও ডিপিএস ৳১,৩৫০ মোট ৳২,৯৫০ জমা হয়েছে। রসিদ: SLIP-2026-1044।',
    smsDeliveredAt: '11:46 AM'
  },
  {
    id: 'col-105',
    slipNo: 'SLIP-2026-1045',
    date: '2026-10-17',
    time: '12:20 PM',
    fieldOfficerId: 'u-03',
    fieldOfficerName: 'মো: তারিকুল ইসলাম',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    memberId: 'mem-08',
    memberName: 'পারভীন সুলতানা',
    memberCode: 'MEM-2026-0018',
    memberMobile: '01715-667788',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    loanRepaidBDT: 625,
    dpsDepositBDT: 2000,
    genSavingsBDT: 100,
    lateFeeBDT: 0,
    totalBDT: 2725,
    paymentMethod: 'cash',
    status: 'submitted_to_manager',
    isLocked: true,
    smsSent: true,
    smsContent: 'গ্রাহক পারভীন সুলতানা, কিস্তি বাবদ ৳৬২৫ ও বিশেষ সঞ্চয় ৳২,০০০ মোট ৳২,৭২৫ জমা হয়েছে। রসিদ: SLIP-2026-1045।',
    smsDeliveredAt: '12:21 PM'
  }
];

export const CashReconciliationDesk: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  // Storage key
  const storageKey = `ngo_field_collections_${tenant?.id}`;

  const [collections, setCollections] = useState<FieldCollectionItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });

  // Active role perspective simulation: Field Officer vs Branch Manager
  const [deskPerspective, setDeskPerspective] = useState<'manager' | 'field_officer'>('manager');

  // Filter states
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-17');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Manager Cash Physical Verification State
  const [countedCashInput, setCountedCashInput] = useState<string>('10625');
  const [managerClosingNotes, setManagerClosingNotes] = useState<string>('সকল কেন্দ্র শিট ও সদস্য রসিদ ক্যাশের সাথে হুবহু মিলেছে।');
  const [isApprovalSuccess, setIsApprovalSuccess] = useState<boolean>(false);
  const [generatedVoucherNo, setGeneratedVoucherNo] = useState<string>('');
  const [closingSlipModalOpen, setClosingSlipModalOpen] = useState<boolean>(false);

  // Anti-Fraud Manager Override Modal (Branch Manager Edit with Mandatory Reason)
  const [editingCollection, setEditingCollection] = useState<FieldCollectionItem | null>(null);
  const [editLoanBDT, setEditLoanBDT] = useState<number>(0);
  const [editDpsBDT, setEditDpsBDT] = useState<number>(0);
  const [editGenSavingsBDT, setEditGenSavingsBDT] = useState<number>(0);
  const [editReasonMandatory, setEditReasonMandatory] = useState<string>('');
  const [selectedAuditTrail, setSelectedAuditTrail] = useState<FieldCollectionItem | null>(null);

  // SMS Preview Modal
  const [viewingSmsItem, setViewingSmsItem] = useState<FieldCollectionItem | null>(null);

  // Passbook Preview Modal
  const [viewingPassbookMember, setViewingPassbookMember] = useState<FieldCollectionItem | null>(null);

  // Filtered collections based on date & officer
  const filteredList = collections.filter((c) => {
    if (selectedDate && c.date !== selectedDate) return false;
    if (selectedOfficer !== 'all' && c.fieldOfficerName !== selectedOfficer) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  // Financial aggregates
  const totalLoanCollected = filteredList.reduce((sum, c) => sum + c.loanRepaidBDT, 0);
  const totalDpsCollected = filteredList.reduce((sum, c) => sum + c.dpsDepositBDT, 0);
  const totalSavingsCollected = filteredList.reduce((sum, c) => sum + c.genSavingsBDT, 0);
  const grandTotalSystemBDT = totalLoanCollected + totalDpsCollected + totalSavingsCollected;

  const countedCash = Number(countedCashInput) || 0;
  const variance = countedCash - grandTotalSystemBDT;

  // Handover submission by Field Officer
  const handleOfficerSubmitHandover = () => {
    if (filteredList.length === 0) {
      alert('হস্তান্তর করার মতো কোনো আদায় পাওয়া যায়নি।');
      return;
    }

    const updated = collections.map((c) => {
      if (filteredList.some((f) => f.id === c.id)) {
        return {
          ...c,
          status: 'submitted_to_manager' as const,
          isLocked: true
        };
      }
      return c;
    });

    setCollections(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    alert('সাফল্য! আজকের সমস্ত আদায় ব্যবস্থাপকের অনুমোদনের জন্য লক ও হস্তান্তর করা হয়েছে। মাঠকর্মী আর এটি পরিবর্তন করতে পারবে না।');
  };

  // Manager Approve & Close Cash
  const handleManagerApproveAndVault = () => {
    if (variance !== 0) {
      if (!window.confirm(`সতর্কতা! শারীরিক ক্যাশ ও সিস্টেমে ৳ ${Math.abs(variance)} টাকার পার্থক্য রয়েছে। আপনি কি তবুও ভাউচার তৈরি করে হিসাব ক্লোজ করতে চান?`)) {
        return;
      }
    }

    const vNo = `CR-SAVAR-${Date.now().toString().slice(-6)}`;
    const updated = collections.map((c) => {
      if (filteredList.some((f) => f.id === c.id)) {
        return {
          ...c,
          status: 'verified_and_vaulted' as const,
          isLocked: true
        };
      }
      return c;
    });

    setCollections(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setGeneratedVoucherNo(vNo);
    setIsApprovalSuccess(true);
  };

  // Anti-Fraud Manager Modification (Requires Mandatory Institutional Reason!)
  const handleSaveManagerOverride = () => {
    if (!editingCollection) return;

    if (!editReasonMandatory.trim() || editReasonMandatory.trim().length < 8) {
      alert('নিরাপত্তা নীতি: টাকা পরিবর্তনের সুনির্দিষ্ট প্রাতিষ্ঠানিক কারণ অবশ্যই লিখতে হবে (ন্যূনতম ৮ অক্ষর)। কারণ ছাড়া পরিবর্তন সম্পূর্ণ নিষিদ্ধ!');
      return;
    }

    const newTotal = editLoanBDT + editDpsBDT + editGenSavingsBDT;
    const oldTotal = editingCollection.totalBDT;

    const newAuditRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      editedAt: new Date().toLocaleString('bn-BD'),
      editedBy: 'ফারহানা ইয়াসমিন',
      editedByRole: 'শাখা ব্যবস্থাপক (Branch Manager)',
      oldAmount: oldTotal,
      newAmount: newTotal,
      reason: editReasonMandatory.trim(),
      customerAlertSmsSent: true
    };

    const newSmsText = `সতর্কতা: আপনার একাউন্টে জমার পরিমাণ সংশোধন করা হয়েছে। পূর্বের পরিমাণ: ৳${oldTotal.toLocaleString()}, বর্তমান: ৳${newTotal.toLocaleString()}। কারণ: ${editReasonMandatory.trim()}। শাখা ব্যবস্থাপকের যোগাযোগ: 01819-234567।`;

    const updated = collections.map((c) => {
      if (c.id === editingCollection.id) {
        return {
          ...c,
          loanRepaidBDT: editLoanBDT,
          dpsDepositBDT: editDpsBDT,
          genSavingsBDT: editGenSavingsBDT,
          totalBDT: newTotal,
          isModified: true,
          smsContent: newSmsText,
          auditTrail: [...(c.auditTrail || []), newAuditRecord]
        };
      }
      return c;
    });

    setCollections(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setEditingCollection(null);
    setEditReasonMandatory('');

    alert(`সংশোধন সম্পন্ন হয়েছে এবং অপরিবর্তনীয় অডিট ট্রেইলে সংরক্ষিত হয়েছে। গ্রাহক ${editingCollection.memberName}-এর মোবাইলে সতর্কবার্তা এসএমএস পাঠানো হয়েছে।`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Role Perspective Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-foreground">
              {isBangla ? 'দৈনিক ক্যাশ মিলকরণ, হস্তান্তর ও অডিট খতিয়ান' : 'Daily Field Cash Reconciliation & Handover Desk'}
            </h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-[10px] font-bold">
              জিরো ফ্রড সিকিউরিটি
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isBangla
              ? 'মাঠকর্মীদের দৈনিক আদায়কৃত ক্যাশ ম্যানেজারের নিকট হস্তান্তর, সদস্যের এসএমএস যাচাই, পাসবই ক্রস-চেক ও অপরিবর্তনীয় অডিট ট্রেইল।'
              : 'End-of-day FO physical cash handover to Branch Manager, verified against customer SMS, passbooks & locked audit trail.'}
          </p>
        </div>

        {/* View Perspective Switcher */}
        <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border border-border/80">
          <span className="text-[11px] font-semibold text-muted-foreground px-2">
            {isBangla ? 'বর্তমান ভিউ মোড:' : 'View Mode:'}
          </span>
          <button
            onClick={() => setDeskPerspective('manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deskPerspective === 'manager'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBangla ? 'শাখা ব্যবস্থাপক (Manager Desk)' : 'Branch Manager'}</span>
          </button>
          <button
            onClick={() => setDeskPerspective('field_officer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deskPerspective === 'field_officer'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isBangla ? 'মাঠ কর্মকর্তা (FO Handover)' : 'Field Officer'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI & Reconciliation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              {isBangla ? 'মাঠকর্মীর সর্বমোট আদায় (সিস্টেম)' : 'Total Field Collections'}
            </span>
            <div className="text-xl font-bold font-mono text-foreground mt-1">
              ৳ {grandTotalSystemBDT.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span>{toBanglaDigits(filteredList.length)} জন সদস্যের রসিদ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              {isBangla ? 'ঋণ কিস্তি বনাম সঞ্চয় জমা' : 'Loan vs Savings Split'}
            </span>
            <div className="text-xs font-bold font-mono mt-1 space-y-0.5">
              <div className="text-primary flex justify-between">
                <span>ঋণ কিস্তি:</span>
                <span>৳ {totalLoanCollected.toLocaleString()}</span>
              </div>
              <div className="text-emerald-600 flex justify-between">
                <span>সঞ্চয় ও ডিপিএস:</span>
                <span>৳ {(totalDpsCollected + totalSavingsCollected).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              {isBangla ? 'ম্যানেজারের গোনা নগদ ক্যাশ' : 'Physical Cash Counted'}
            </span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
              ৳ {countedCash.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">কাউন্টারে গ্রহণ ও গোনা হয়েছে</div>
          </CardContent>
        </Card>

        <Card className={`border ${variance === 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
          <CardContent className="pt-4 pb-4">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              {isBangla ? 'ক্যাশ অমিল / পার্থক্য (Variance)' : 'Cash Discrepancy'}
            </span>
            <div className={`text-xl font-bold font-mono mt-1 ${variance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {variance === 0 ? '৳ ০ (হুবহু মিলেছে)' : `৳ ${variance.toLocaleString()}`}
            </div>
            <div className="text-[10px] mt-1 font-bold">
              {variance === 0 ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ১০০% নির্ভুল মিল
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> ক্যাশ ও সিস্টেমে গরমিল!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <Card className="border-border">
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'তারিখ নির্বাচন:' : 'Collection Date:'}
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'মাঠ কর্মকর্তা (Field Officer):' : 'Field Officer:'}
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
              >
                <option value="all">{isBangla ? 'সকল মাঠ কর্মকর্তা' : 'All Officers'}</option>
                <option value="মো: তারিকুল ইসলাম">মো: তারিকুল ইসলাম (সাভার ফিল্ড)</option>
                <option value="ফারহানা ইয়াসমিন">ফারহানা ইয়াসমিন (চট্টগ্রাম ফিল্ড)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'হস্তান্তর অবস্থা (Status):' : 'Handover Status:'}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
              >
                <option value="all">{isBangla ? 'সকল অবস্থা' : 'All Status'}</option>
                <option value="collected">{isBangla ? 'আদায়কৃত (লক হয়নি)' : 'Collected'}</option>
                <option value="submitted_to_manager">{isBangla ? 'ম্যানেজারের অনুমোদনের অপেক্ষায় (লকড)' : 'Submitted & Locked'}</option>
                <option value="verified_and_vaulted">{isBangla ? 'যাচাইকৃত ও ভল্টে জমা' : 'Verified & Vaulted'}</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClosingSlipModalOpen(true)}
                className="w-full h-9 text-xs font-bold border-primary/30 text-primary hover:bg-primary/5"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                {isBangla ? 'ক্লোজিং স্লিপ প্রিন্ট' : 'Print Slip'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table: Customer by Customer Collection Trail */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'গ্রাহকভিত্তিক আদায় ও অডিট লগ খতিয়ান' : 'Customer-wise Collection Trail'}</span>
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              প্রতিটি জমার বিপরীতে এসএমএস ডেলিভারি, ডিজিটাল পাসবই এন্ট্রি ও অডিট ট্রেইল চেক করুন।
            </span>
          </div>

          <div className="flex items-center gap-2">
            {deskPerspective === 'field_officer' && (
              <Button
                size="sm"
                onClick={handleOfficerSubmitHandover}
                className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                {isBangla ? 'ম্যানেজারকে ক্যাশ বুঝিয়ে দিন ও লক করুন' : 'Submit Handover to Manager'}
              </Button>
            )}

            {deskPerspective === 'manager' && (
              <Badge className="bg-emerald-600 text-white text-[11px] font-mono">
                ম্যানেজার অডিট প্যানেল সক্রিয়
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'রসিদ ও সময়' : 'Receipt & Time'}</TableHead>
                <TableHead>{isBangla ? 'সদস্যের তথ্য ও কেন্দ্র' : 'Member & Center'}</TableHead>
                <TableHead>{isBangla ? 'মাঠ কর্মকর্তা' : 'Field Officer'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'ঋণ কিস্তি' : 'Loan'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'সঞ্চয় / ডিপিএস' : 'Savings'}</TableHead>
                <TableHead className="text-right font-bold">{isBangla ? 'সর্বমোট' : 'Total'}</TableHead>
                <TableHead className="text-center">{isBangla ? 'গ্রাহক এসএমএস' : 'Customer SMS'}</TableHead>
                <TableHead className="text-center">{isBangla ? 'পাসবই' : 'Passbook'}</TableHead>
                <TableHead className="text-center">{isBangla ? 'অবস্থা ও লক' : 'Status'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'অ্যাকশন / অডিট' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-xs text-muted-foreground">
                    নির্বাচিত তারিখ ও ফিল্টারে কোনো আদায় রেকর্ড পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-mono font-bold text-xs text-primary">{item.slipNo}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.time}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-xs text-foreground">{item.memberName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{item.memberCode} | {item.memberMobile}</div>
                      <div className="text-[10px] text-sky-600 font-semibold">{item.samityName}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">{item.fieldOfficerName}</div>
                      <div className="text-[10px] text-muted-foreground">{item.branchName}</div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs">
                      {item.loanRepaidBDT > 0 ? `৳ ${item.loanRepaidBDT.toLocaleString()}` : '-'}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-emerald-600">
                      ৳ {(item.dpsDepositBDT + item.genSavingsBDT).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                      ৳ {item.totalBDT.toLocaleString()}
                    </TableCell>

                    {/* Customer SMS Status */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingSmsItem(item)}
                        className="h-6 text-[10px] px-2 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md font-bold"
                        title="গ্রাহকের কাছে পাঠানো এসএমএস দেখুন"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Sent ✓
                      </Button>
                    </TableCell>

                    {/* Passbook Link */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingPassbookMember(item)}
                        className="h-6 text-[10px] px-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-md font-bold"
                        title="সদস্যের ডিজিটাল পাসবই রেকর্ড"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        পাসবই
                      </Button>
                    </TableCell>

                    {/* Status & Lock */}
                    <TableCell className="text-center">
                      {item.status === 'verified_and_vaulted' ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-300">
                          ভল্টে জমা ✓
                        </Badge>
                      ) : item.isLocked ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-300 flex items-center justify-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          লকড (জমা)
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          আদায় চলছে
                        </Badge>
                      )}

                      {item.isModified && (
                        <span className="block text-[9px] text-rose-600 font-bold mt-0.5">
                          সংশোধিত
                        </span>
                      )}
                    </TableCell>

                    {/* Anti-Fraud Action: Only Manager can Edit with Mandatory Reason */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.auditTrail && item.auditTrail.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAuditTrail(item)}
                            className="h-7 px-2 text-[10px] text-amber-600 hover:bg-amber-500/10 font-bold"
                            title="অডিট ইতিহাস দেখুন"
                          >
                            <History className="w-3 h-3 mr-1" />
                            অডিট
                          </Button>
                        )}

                        {deskPerspective === 'manager' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCollection(item);
                              setEditLoanBDT(item.loanRepaidBDT);
                              setEditDpsBDT(item.dpsDepositBDT);
                              setEditGenSavingsBDT(item.genSavingsBDT);
                              setEditReasonMandatory('');
                            }}
                            className="h-7 text-xs px-2 text-sky-600 hover:bg-sky-500/10 font-semibold"
                            title="শাখা ব্যবস্থাপক কর্তৃক সংশোধন (কারণ সহ)"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            {isBangla ? 'সংশোধন' : 'Edit'}
                          </Button>
                        )}

                        {deskPerspective === 'field_officer' && (
                          <span className="text-[10px] text-muted-foreground font-mono px-1">
                            সুরক্ষিত
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manager Daily Closing & Cash Handover Acceptance Panel */}
      {deskPerspective === 'manager' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="py-3 px-4 border-b border-primary/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span>{isBangla ? 'শাখা ব্যবস্থাপকের দৈনিক ক্যাশ ভেরিফিকেশন ও কাউন্টার ক্লোজিং' : 'Manager Cash Reconciliation & Approval'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'মাঠকর্মীর আদায় রেকর্ড (সিস্টেম):' : 'System Total:'}
                </label>
                <div className="h-10 px-3 bg-muted rounded-lg flex items-center font-mono font-bold text-sm text-foreground">
                  ৳ {grandTotalSystemBDT.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'কাউন্টারে গুনে পাওয়া নগদ টাকা (BDT) *:' : 'Actual Physical Cash Received:'}
                </label>
                <Input
                  type="number"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="font-mono font-bold text-sm h-10 border-emerald-500 focus:ring-emerald-500"
                  placeholder="নগদ টাকার অংক লিখুন"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'ক্যাশ অমিল / পার্থক্য:' : 'Variance / Shortage:'}
                </label>
                <div className={`h-10 px-3 rounded-lg flex items-center font-mono font-bold text-sm ${variance === 0 ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'}`}>
                  {variance === 0 ? '৳ ০ (হুবহু মিলেছে)' : `৳ ${variance.toLocaleString()}`}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'ব্যবস্থাপকের ক্লোজিং মন্তব্য ও ভল্ট এন্ট্রি নোট:' : 'Manager Reconciliation Note:'}
              </label>
              <Input
                value={managerClosingNotes}
                onChange={(e) => setManagerClosingNotes(e.target.value)}
                placeholder="যেমন: সুর্যমুখী সমিতির ক্যাশ গুনে বুঝে নিয়ে ভল্টে জমা করা হলো..."
                className="h-10 text-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-primary/20">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>অনুমোদন সম্পন্ন হলে এই তারিখের কোনো এন্ট্রি সাধারণ কেউ পরিবর্তন করতে পারবে না।</span>
              </div>

              <Button
                onClick={handleManagerApproveAndVault}
                className="w-full sm:w-auto text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isBangla ? 'ক্যাশ টাকা গুনে নিয়ে বুঝে পেলাম ও অনুমোদন করলাম' : 'Verify & Vault Cash Handover'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MANDATORY REASON MANAGER OVERRIDE (ANTI-FRAUD SYSTEM)            */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        title={isBangla ? 'আদায়কৃত টাকা সংশোধন (শাখা ব্যবস্থাপক ও অডিট ওভাররাইড)' : 'Manager Override with Mandatory Audit Reason'}
        maxWidth="md"
      >
        {editingCollection && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>জিরো-ফ্রড অডিট সতর্কবার্তা:</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                কোনো অবস্থাতেই কারণ ছাড়া টাকা কমানো বা বাড়ানো যাবে না। পরিবর্তন করার সাথে সাথে গ্রাহকের মোবাইলে সতর্কবার্তা এসএমএস চলে যাবে এবং অডিট লগ স্থায়ীভাবে তৈরি হবে।
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
              <div>গ্রাহক: <span className="font-bold">{editingCollection.memberName}</span> ({editingCollection.memberCode})</div>
              <div>রসিদ নং: <span className="font-mono font-bold text-primary">{editingCollection.slipNo}</span></div>
              <div>পূর্বে আদায়কৃত মোট টাকা: <span className="font-mono font-bold text-rose-600">৳ {editingCollection.totalBDT.toLocaleString()}</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">ঋণ কিস্তি (BDT)</label>
                <Input
                  type="number"
                  value={editLoanBDT}
                  onChange={(e) => setEditLoanBDT(Number(e.target.value))}
                  className="font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">ডিপিএস জমা (BDT)</label>
                <Input
                  type="number"
                  value={editDpsBDT}
                  onChange={(e) => setEditDpsBDT(Number(e.target.value))}
                  className="font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">সঞ্চয় জমা (BDT)</label>
                <Input
                  type="number"
                  value={editGenSavingsBDT}
                  onChange={(e) => setEditGenSavingsBDT(Number(e.target.value))}
                  className="font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs font-semibold">সংশোধিত নতুন মোট টাকা:</span>
              <span className="text-base font-bold font-mono text-emerald-700">
                ৳ {(editLoanBDT + editDpsBDT + editGenSavingsBDT).toLocaleString()}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                {isBangla ? 'সংশোধনের সুনির্দিষ্ট কারণ (বাধ্যতামূলক) *' : 'Mandatory Institutional Reason *'}
              </label>
              <textarea
                value={editReasonMandatory}
                onChange={(e) => setEditReasonMandatory(e.target.value)}
                placeholder="যেমন: সদস্য ভুলবশত রশিদ নেওয়ার পর ৫০০ টাকা ফেরত নিয়েছিলেন, ভাউচার নং-XYZ অনুযায়ী সংশোধিত..."
                className="w-full h-20 p-2.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                * সুনির্দিষ্ট কারণ ছাড়া এই সংশোধন গ্রাহ্য হবে না এবং সিস্টেম সেভ করতে দেবে না।
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setEditingCollection(null)} className="text-xs">
                বাতিল
              </Button>
              <Button
                size="sm"
                onClick={handleSaveManagerOverride}
                disabled={!editReasonMandatory.trim() || editReasonMandatory.trim().length < 8}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                সংশোধন নিশ্চিত করুন ও গ্রাহককে এসএমএস পাঠান
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: CUSTOMER SMS PREVIEW MODAL                                       */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={!!viewingSmsItem}
        onClose={() => setViewingSmsItem(null)}
        title={isBangla ? 'গ্রাহকের মোবাইলে পাঠানো অটো এসএমএস ডেলিভারি রেকর্ড' : 'Customer Automated SMS Receipt'}
        maxWidth="md"
      >
        {viewingSmsItem && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span>প্রাপক: <strong className="text-foreground">{viewingSmsItem.memberName}</strong></span>
                <span className="font-mono text-primary font-bold">{viewingSmsItem.memberMobile}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি সময়: <strong>{viewingSmsItem.date} {viewingSmsItem.time}</strong></span>
                <span className="text-emerald-600 font-bold">স্ট্যাটাস: Delivered ✓</span>
              </div>
              <div className="flex justify-between">
                <span>গেটওয়ে রেফারেন্স:</span>
                <span className="font-mono text-muted-foreground">BD-SMS-{(Math.random() * 1000000).toFixed(0)}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>এসএমএস বার্তা প্রিভিউ:</span>
              </div>
              <p className="text-xs text-foreground font-medium leading-relaxed bg-background p-3 rounded-xl border border-emerald-500/20 shadow-inner">
                {viewingSmsItem.smsContent}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewingSmsItem(null)} className="text-xs">
                বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: AUDIT TRAIL LOG MODAL                                            */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={!!selectedAuditTrail}
        onClose={() => setSelectedAuditTrail(null)}
        title={isBangla ? `অপরিবর্তনীয় অডিট ইতিহাস: ${selectedAuditTrail?.slipNo}` : 'Immutable Audit History'}
        maxWidth="md"
      >
        {selectedAuditTrail && (
          <div className="space-y-4 pt-2">
            <div className="text-xs text-muted-foreground">
              সদস্য: <strong className="text-foreground">{selectedAuditTrail.memberName}</strong> | কেন্দ্র: <strong className="text-foreground">{selectedAuditTrail.samityName}</strong>
            </div>

            <div className="space-y-3">
              {selectedAuditTrail.auditTrail?.map((trail, idx) => (
                <div key={trail.id} className="p-3 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <History className="w-3.5 h-3.5" />
                      সংশোধন #{toBanglaDigits(idx + 1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{trail.editedAt}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>সংশোধনকারী: <strong>{trail.editedBy}</strong> ({trail.editedByRole})</div>
                    <div>গ্রাহক অ্যালার্ট এসএমএস: <strong className="text-emerald-600">পাঠানো হয়েছে ✓</strong></div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg border text-xs">
                    <span className="text-rose-600 line-through font-mono">৳ {trail.oldAmount.toLocaleString()}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-emerald-600 font-bold font-mono">৳ {trail.newAmount.toLocaleString()}</span>
                  </div>

                  <div className="text-[11px] bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">অফিসিয়াল কারণ:</span> {trail.reason}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setSelectedAuditTrail(null)} className="text-xs">
                বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: PASSBOOK QUICK VIEW                                              */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={!!viewingPassbookMember}
        onClose={() => setViewingPassbookMember(null)}
        title={isBangla ? `ডিজিটাল পাসবই স্টেটমেন্ট: ${viewingPassbookMember?.memberName}` : 'Member Passbook Statement'}
        maxWidth="md"
      >
        {viewingPassbookMember && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>সদস্য কোড: <strong className="font-mono text-primary">{viewingPassbookMember.memberCode}</strong></span>
                <span>কেন্দ্র: <strong>{viewingPassbookMember.samityName}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>মোবাইল: <strong>{viewingPassbookMember.memberMobile}</strong></span>
                <span>শাখা: <strong>{viewingPassbookMember.branchName}</strong></span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">তারিখ</TableHead>
                  <TableHead className="text-xs">বিবরণ</TableHead>
                  <TableHead className="text-xs text-right">আদায় (BDT)</TableHead>
                  <TableHead className="text-xs text-right">অবশিষ্ট স্থিতি</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs font-mono">{viewingPassbookMember.date}</TableCell>
                  <TableCell className="text-xs">চলতি কিস্তি ও সঞ্চয় জমা ({viewingPassbookMember.slipNo})</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-600 font-bold">
                    ৳ {viewingPassbookMember.totalBDT.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">
                    সঞ্চয়: ৳ ৫,৭৮৫ | ঋণ: ৳ ১৮,৭৫০
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setViewingPassbookMember(null)} className="text-xs">
                বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* APPROVAL SUCCESS VOUCHER PRINT POPUP                                      */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isApprovalSuccess}
        onClose={() => setIsApprovalSuccess(false)}
        title={isBangla ? 'ক্যাশ মিলকরণ ও ভল্ট পোস্টিং সফল হয়েছে!' : 'Cash Reconciliation Completed!'}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground">
              {isBangla ? 'শাখা ভাউচার তৈরি সম্পন্ন হয়েছে' : 'Voucher Generated'}
            </h4>
            <div className="font-mono text-base font-bold text-primary mt-1">
              {generatedVoucherNo}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              মোট ৳ {countedCash.toLocaleString()} টাকা শাখা প্রধান ভল্ট একাউন্টে ক্রেডিট করা হয়েছে এবং এই তারিখের মাঠকর্মীর আদায় স্থায়ীভাবে লক করা হয়েছে।
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setClosingSlipModalOpen(true);
              }}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              ভাউচার প্রিন্ট
            </Button>
            <Button
              size="sm"
              onClick={() => setIsApprovalSuccess(false)}
              className="text-xs bg-primary text-primary-foreground font-bold"
            >
              ঠিক আছে
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* DEDICATED DAILY CASH CLOSING SLIP PRINT MODAL                             */}
      {/* ========================================================================= */}
      {closingSlipModalOpen && (
        <Dialog
          isOpen={closingSlipModalOpen}
          onClose={() => setClosingSlipModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary" />
              <span>{isBangla ? 'দৈনিক ক্যাশ মিলকরণ ও ক্লোজিং স্লিপ ভাউচার' : 'Daily Cash Closing Voucher'}</span>
            </div>
          }
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            {/* CLEAN A4 PRINTABLE CLOSING VOUCHER */}
            <div
              id="daily-closing-voucher"
              className="p-8 bg-white text-black border rounded-xl space-y-4 font-sans text-xs shadow-inner"
            >
              {/* Header */}
              <div className="text-center border-b pb-2 space-y-0.5">
                <h3 className="font-bold text-sm text-gray-900 uppercase">
                  {tenant?.name.bn || 'জাগরণী উন্নয়ন ফাউন্ডেশন'}
                </h3>
                <p className="text-[11px] text-gray-700 font-semibold">
                  প্রধান কার্যালয় ও সাভার মূল শাখা কার্যালয়
                </p>
                <div className="inline-block px-3 py-0.5 bg-gray-100 rounded text-[10px] font-bold mt-0.5 border">
                  দৈনিক মাঠ আদায়, ক্যাশ মিলকরণ ও ভল্ট জমা ভাউচার
                </div>
              </div>

              {/* Voucher Meta */}
              <div className="flex justify-between items-center text-[10px] border-b pb-1 font-mono text-gray-600">
                <span>স্মারক / ভাউচার নং: <strong className="text-black font-bold">VR-SAVAR-20261018-09</strong></span>
                <span>তারিখ: ১৮ অক্টোবর ২০২৬ (বিকাল ০৫:১৫)</span>
              </div>

              {/* Handover Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b pb-2">
                <div>
                  <span className="text-gray-600 block text-[10px]">মাঠ কর্মকর্তা (আদায়কারী):</span>
                  <span className="font-bold text-gray-900">মোঃ তরিকুল ইসলাম</span>
                  <div className="text-[10px] text-gray-500 font-mono">আইডি: EMP-003 (সিনিয়র এফও)</div>
                </div>
                <div>
                  <span className="text-gray-600 block text-[10px]">শাখা ব্যবস্থাপক (ক্যাশ গ্রহণকারী):</span>
                  <span className="font-bold text-gray-900">ফারহানা ইয়াসমিন</span>
                  <div className="text-[10px] text-gray-500 font-mono">সাভার মূল শাখা (কোড: HO-01)</div>
                </div>
              </div>

              {/* Collection Summary Table */}
              <div className="space-y-1 text-[11px]">
                <div className="font-bold text-gray-800 border-b pb-1 flex justify-between">
                  <span>আদায়ের খাতসমূহ</span>
                  <span>টাকা (৳)</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>১. ঋণের আসল ও মুনাফা কিস্তি আদায়:</span>
                  <span className="font-mono font-bold">৳ ৫,১২৫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>২. ডিপিএস ও সাধারণ সঞ্চয় জমা:</span>
                  <span className="font-mono font-bold">৳ ৫,৫০০</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold text-sm bg-gray-50 px-2 py-1 rounded">
                  <span>সর্বমোট শারীরিক ক্যাশ হস্তান্তরিত:</span>
                  <span className="font-mono text-emerald-800">৳ ১০,৬২৫</span>
                </div>
              </div>

              {/* Variance & Note breakdown */}
              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>ক্যাশ ভেরিফিকেশন ও অডিট স্থিতি:</span>
                  <span>পার্থক্য: ৳ ০ (হুবহু মিলেছে - ১০০% নির্ভুল ✅)</span>
                </div>
                <div className="text-gray-600">
                  নোটের বিবরণ: ১০০০×১০ = ১০,০০০ | ৫০০×১ = ৫০০ | ১০০×১ = ১০০ | ২০×১ = ২০ | ৫×১ = ৫ | সর্বমোট = ১০,৬২৫/-
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[10px] text-gray-700">
                <div className="border-t border-gray-400 pt-1">মাঠ কর্মকর্তা (হস্তান্তরকারী)</div>
                <div className="border-t border-gray-400 pt-1">ক্যাশিয়ার / হিসাবরক্ষক</div>
                <div className="border-t border-gray-400 pt-1 font-bold">শাখা ব্যবস্থাপক (ভল্ট জমা)</div>
              </div>

              <div className="text-center pt-2 text-[9px] text-gray-400 border-t">
                সফটওয়্যার জেনারেটেড ডিজিটাল ক্লোজিং ভাউচার — এনজিও মাইক্রোক্রেডিট কোর ইআরপি
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setClosingSlipModalOpen(false)} className="text-xs">
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button
                size="sm"
                onClick={() => triggerPrint('daily-closing-voucher', 'Daily_Cash_Closing_Voucher')}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                {isBangla ? 'A4 পেপারে ক্লোজিং স্লিপ প্রিন্ট করুন' : 'Print A4 Closing Slip'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
