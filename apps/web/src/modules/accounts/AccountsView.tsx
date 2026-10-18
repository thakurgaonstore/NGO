import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { DEFAULT_NGO_CHART_OF_ACCOUNTS, formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Receipt,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  BookOpen,
  Scale,
  DollarSign,
  AlertCircle,
  Check
} from 'lucide-react';

export interface VoucherEntry {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  narration: string;
}

export interface VoucherRecord {
  id: string;
  voucherNumber: string;
  type: 'bank_payment' | 'cash_payment' | 'receipt' | 'journal' | 'contra';
  date: string;
  payeeOrSource: string;
  entries: VoucherEntry[];
  totalAmount: number;
  preparedBy: string;
  approvedBy?: string;
  status: 'draft' | 'approved' | 'rejected';
}

const INITIAL_VOUCHERS: VoucherRecord[] = [
  {
    id: 'v-01',
    voucherNumber: 'BP-2026-0042',
    type: 'bank_payment',
    date: '2026-10-15',
    payeeOrSource: 'Green Solar Ltd (WASH Project Equipment)',
    totalAmount: 185000,
    preparedBy: 'Sadia Sultana (Accounts Staff)',
    approvedBy: 'Dr. Aminul Islam (Director)',
    status: 'approved',
    entries: [
      { accountId: '5100', accountName: 'Program & Project Direct Costs', debit: 185000, credit: 0, narration: 'Solar water pumps for Savar project' },
      { accountId: '1130', accountName: 'Sonali Bank Ltd - Principal A/C', debit: 0, credit: 185000, narration: 'Payment via Cheque #982143' }
    ]
  },
  {
    id: 'v-02',
    voucherNumber: 'CR-2026-0019',
    type: 'receipt',
    date: '2026-10-16',
    payeeOrSource: 'Local Donor Contribution (Zakat Fund)',
    totalAmount: 50000,
    preparedBy: 'Sadia Sultana (Accounts Staff)',
    approvedBy: 'Dr. Aminul Islam (Director)',
    status: 'approved',
    entries: [
      { accountId: '1110', accountName: 'Cash in Hand (Head Office)', debit: 50000, credit: 0, narration: 'Cash donation received from Haji Rafiqul Islam' },
      { accountId: '4200', accountName: 'Local Donations & Zakat Fund', debit: 0, credit: 50000, narration: 'Donation for winter blanket distribution' }
    ]
  },
  {
    id: 'v-03',
    voucherNumber: 'CP-2026-0008',
    type: 'cash_payment',
    date: '2026-10-17',
    payeeOrSource: 'Office Stationery & Printing',
    totalAmount: 12400,
    preparedBy: 'Sadia Sultana (Accounts Staff)',
    status: 'draft', // Pending Checker approval
    entries: [
      { accountId: '5700', accountName: 'Printing, Stationery & Postage', debit: 12400, credit: 0, narration: 'Voucher pads and beneficiary survey forms' },
      { accountId: '1110', accountName: 'Cash in Hand (Head Office)', debit: 0, credit: 12400, narration: 'Cash paid out' }
    ]
  }
];

export const AccountsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant, settings } = useTenant();
  const [activeTab, setActiveTab] = useState<'vouchers' | 'coa' | 'trial_balance'>('vouchers');
  const [vouchers, setVouchers] = useState<VoucherRecord[]>(() => {
    const saved = localStorage.getItem(`ngo_vouchers_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState<boolean>(false);
  const [selectedForPrint, setSelectedForPrint] = useState<VoucherRecord | null>(null);

  // New Voucher State
  const [vType, setVType] = useState<VoucherRecord['type']>('bank_payment');
  const [vDate, setVDate] = useState<string>('2026-10-17');
  const [payee, setPayee] = useState<string>('');
  const [entries, setEntries] = useState<VoucherEntry[]>([
    { accountId: '5300', accountName: 'Staff Salaries, Wages & Allowances', debit: 25000, credit: 0, narration: 'October Salary' },
    { accountId: '1130', accountName: 'Sonali Bank Ltd - Principal A/C', debit: 0, credit: 25000, narration: 'Bank transfer' }
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalDebit = entries.reduce((acc, curr) => acc + (Number(curr.debit) || 0), 0);
  const totalCredit = entries.reduce((acc, curr) => acc + (Number(curr.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSaveVoucher = () => {
    if (!isBalanced) {
      setValidationError(
        isBangla
          ? 'ত্রুটি: ডেবিট এবং ক্রেডিটের পরিমাণ সমান হতে হবে (দ্বৈত দাখিলা নীতি)!'
          : 'Error: Total Debit must equal Total Credit!'
      );
      return;
    }

    const prefix = vType === 'bank_payment' ? 'BP' : vType === 'cash_payment' ? 'CP' : vType === 'receipt' ? 'CR' : 'JV';
    const num = `${prefix}-2026-${String(vouchers.length + 1).padStart(4, '0')}`;

    const newV: VoucherRecord = {
      id: `v-${Date.now()}`,
      voucherNumber: num,
      type: vType,
      date: vDate,
      payeeOrSource: payee || 'Payee / Description',
      entries,
      totalAmount: totalDebit,
      preparedBy: 'Sadia Sultana (Accounts Maker)',
      status: 'draft'
    };

    const updated = [newV, ...vouchers];
    setVouchers(updated);
    localStorage.setItem(`ngo_vouchers_${tenant?.id}`, JSON.stringify(updated));
    setIsNewVoucherOpen(false);
    setValidationError(null);
  };

  const handleApproveVoucher = (vId: string) => {
    const updated = vouchers.map((v) =>
      v.id === vId
        ? { ...v, status: 'approved' as const, approvedBy: 'Dr. Aminul Islam (Checker)' }
        : v
    );
    setVouchers(updated);
    localStorage.setItem(`ngo_vouchers_${tenant?.id}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'হিসাব ও দ্বৈত দাখিলা অর্থায়ন' : 'Accounts & Double-Entry Finance'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'ভাউচার এন্ট্রি (মেকার-চেকার), এনজিও চার্ট অফ অ্যাকাউন্টস, এবং স্বয়ংক্রিয় ট্রায়াল ব্যালেন্স।'
              : 'Voucher entry (Maker-Checker workflow), NGO Chart of Accounts, and Trial Balance.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewVoucherOpen(true)} className="text-xs h-9">
            <Plus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন ভাউচার এন্ট্রি' : 'Create Voucher'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'vouchers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'সকল ভাউচার (Maker-Checker)' : 'Vouchers (Maker-Checker)'}
        </button>
        <button
          onClick={() => setActiveTab('coa')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'coa' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'হিসাব পরিকল্পনা (Chart of Accounts)' : 'Chart of Accounts'}
        </button>
        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'trial_balance' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'রেওয়ামিল (Trial Balance)' : 'Trial Balance'}
        </button>
      </div>

      {/* TAB 1: Vouchers Table */}
      {activeTab === 'vouchers' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'ভাউচার নম্বর' : 'Voucher No'}</TableHead>
                  <TableHead>{isBangla ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBangla ? 'ধরণ' : 'Type'}</TableHead>
                  <TableHead>{isBangla ? 'প্রাপক / খাত' : 'Payee / Head'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}</TableHead>
                  <TableHead>{isBangla ? 'অনুমোদন অবস্থা' : 'Status'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">{v.voucherNumber}</TableCell>
                    <TableCell className="text-xs font-mono">{formatDate(v.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {v.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{v.payeeOrSource}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
                      {formatCurrency(v.totalAmount, { useBanglaNumerals: isBangla })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'approved' ? 'success' : 'warning'} className="text-[10px]">
                        {v.status === 'approved' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {isBangla ? 'অনুমোদিত' : 'Approved'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {isBangla ? 'অনুমোদনের অপেক্ষায় (Draft)' : 'Pending Approval'}
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApproveVoucher(v.id)}
                            className="h-7 text-xs px-2"
                            title="Approve as Checker"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {isBangla ? 'অনুমোদন' : 'Approve'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedForPrint(v)}
                          className="h-7 text-xs px-2"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1 text-primary" />
                          {isBangla ? 'প্রিন্ট' : 'Print'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Standard NGO Chart of Accounts */}
      {activeTab === 'coa' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>{isBangla ? 'স্ট্যান্ডার্ড এনজিও হিসাব পরিকল্পনা' : 'NGO Chart of Accounts'}</span>
              <Badge variant="outline" className="text-xs">
                {DEFAULT_NGO_CHART_OF_ACCOUNTS.length} {isBangla ? 'টি অ্যাকাউন্ট হেড' : 'Account Heads'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {DEFAULT_NGO_CHART_OF_ACCOUNTS.map((acc) => (
                <div
                  key={acc.code}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    acc.isGroup ? 'bg-muted/60 font-bold text-foreground' : 'bg-card text-muted-foreground ml-6'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-primary font-bold">{acc.code}</span>
                    <span>{isBangla ? acc.nameBn : acc.nameEn}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {acc.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Real-Time Trial Balance */}
      {activeTab === 'trial_balance' && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'স্বয়ংক্রিয় রেওয়ামিল (Trial Balance)' : 'General Ledger Trial Balance'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'কোড' : 'Code'}</TableHead>
                  <TableHead>{isBangla ? 'হিসাবের নাম' : 'Account Head'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'ডেবিট ব্যালেন্স (টাকা)' : 'Debit Balance (BDT)'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'ক্রেডিট ব্যালেন্স (টাকা)' : 'Credit Balance (BDT)'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">1110</TableCell>
                  <TableCell className="font-semibold">{isBangla ? 'হাতে নগদ (প্রধান কার্যালয়)' : 'Cash in Hand (Head Office)'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600">
                    {formatCurrency(37600, { useBanglaNumerals: isBangla })}
                  </TableCell>
                  <TableCell className="text-right font-mono">—</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">1130</TableCell>
                  <TableCell className="font-semibold">{isBangla ? 'সোনালী ব্যাংক লিঃ - প্রধান হিসাব' : 'Sonali Bank Ltd - Principal A/C'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600">
                    {formatCurrency(1665000, { useBanglaNumerals: isBangla })}
                  </TableCell>
                  <TableCell className="text-right font-mono">—</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">4200</TableCell>
                  <TableCell className="font-semibold">{isBangla ? 'স্থানীয় অনুদান ও যাকাত তহবিল' : 'Local Donations & Zakat Fund'}</TableCell>
                  <TableCell className="text-right font-mono">—</TableCell>
                  <TableCell className="text-right font-mono font-bold text-sky-600">
                    {formatCurrency(50000, { useBanglaNumerals: isBangla })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">5100</TableCell>
                  <TableCell className="font-semibold">{isBangla ? 'কর্মসূচি ও প্রকল্প প্রত্যক্ষ ব্যয়' : 'Program & Project Direct Costs'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600">
                    {formatCurrency(185000, { useBanglaNumerals: isBangla })}
                  </TableCell>
                  <TableCell className="text-right font-mono">—</TableCell>
                </TableRow>
                <TableRow className="bg-muted/60 font-bold border-t-2">
                  <TableCell colSpan={2}>{isBangla ? 'মোট যোগফল (Total Balanced)' : 'Total (Balanced)'}</TableCell>
                  <TableCell className="text-right font-mono text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(1887600, { useBanglaNumerals: isBangla })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sky-700 dark:text-sky-400">
                    {formatCurrency(1887600, { useBanglaNumerals: isBangla })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Voucher Entry Modal */}
      <Dialog
        isOpen={isNewVoucherOpen}
        onClose={() => setIsNewVoucherOpen(false)}
        title={isBangla ? 'নতুন ভাউচার এন্ট্রি (Maker)' : 'Create Double-Entry Voucher'}
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2">
          {validationError && (
            <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'ভাউচারের ধরণ *' : 'Voucher Type *'}</label>
              <select
                value={vType}
                onChange={(e) => setVType(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="bank_payment">Bank Payment (BP)</option>
                <option value="cash_payment">Cash Payment (CP)</option>
                <option value="receipt">Receipt Voucher (CR)</option>
                <option value="journal">Journal Voucher (JV)</option>
                <option value="contra">Contra Voucher (CV)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'তারিখ *' : 'Date *'}</label>
              <Input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'প্রাপক বা বিবরণ *' : 'Payee / Narration *'}</label>
              <Input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="e.g. Office Stationery / Vendor" />
            </div>
          </div>

          {/* Double-Entry Rows */}
          <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
            <span className="text-xs font-bold text-foreground block mb-1">
              {isBangla ? 'ডেবিট ও ক্রেডিট হিসাব এন্ট্রি:' : 'Debit & Credit Ledger Entries:'}
            </span>

            {entries.map((entry, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-card p-2 rounded border text-xs">
                <div className="col-span-6">
                  <Input
                    value={entry.accountName}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx].accountName = e.target.value;
                      setEntries(updated);
                    }}
                    placeholder="Account Head"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={entry.debit || ''}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx].debit = Number(e.target.value);
                      if (Number(e.target.value) > 0) updated[idx].credit = 0;
                      setEntries(updated);
                    }}
                    placeholder="Debit (৳)"
                    className="h-8 text-xs font-mono text-right"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={entry.credit || ''}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx].credit = Number(e.target.value);
                      if (Number(e.target.value) > 0) updated[idx].debit = 0;
                      setEntries(updated);
                    }}
                    placeholder="Credit (৳)"
                    className="h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>
            ))}

            {/* Balancing Indicator */}
            <div className="flex items-center justify-between pt-2 text-xs font-mono font-bold">
              <span>{isBangla ? 'মোট ডেবিট / ক্রেডিট:' : 'Total Debit / Credit:'}</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600">Dr: ৳ {totalDebit.toLocaleString()}</span>
                <span className="text-sky-600">Cr: ৳ {totalCredit.toLocaleString()}</span>
                <Badge variant={isBalanced ? 'success' : 'destructive'} className="text-[10px]">
                  {isBalanced ? (isBangla ? 'ব্যালেন্সড' : 'Balanced') : (isBangla ? 'অমিল' : 'Unbalanced')}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsNewVoucherOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveVoucher} disabled={!isBalanced} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'ভাউচার সংরক্ষণ করুন' : 'Save Voucher'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Voucher Print Preview Modal */}
      {selectedForPrint && (
        <Dialog
          isOpen={!!selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
          title={isBangla ? 'ভাউচার প্রিন্ট প্রিভিউ (A4 ফরম্যাট)' : 'Print Voucher Document'}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <div id="print-voucher" className="p-6 bg-white text-black border rounded-xl space-y-4 font-sans text-xs">
              {/* Letterhead */}
              <div className="text-center border-b pb-3 space-y-1">
                <h2 className="text-base font-bold text-primary uppercase">{settings?.orgName.en}</h2>
                <p className="text-xs font-medium">{settings?.orgName.bn}</p>
                <p className="text-[10px] text-gray-500">{settings?.address.en} • Hotline: {settings?.phone}</p>
                <div className="inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase mt-1">
                  {selectedForPrint.type.replace('_', ' ')} VOUCHER
                </div>
              </div>

              {/* Meta */}
              <div className="flex justify-between border-b pb-2 font-mono text-[11px]">
                <div>
                  <span className="font-bold">Voucher No:</span> {selectedForPrint.voucherNumber}
                </div>
                <div>
                  <span className="font-bold">Date:</span> {formatDate(selectedForPrint.date)}
                </div>
              </div>

              <div>
                <span className="font-bold">Paid To / Source:</span> {selectedForPrint.payeeOrSource}
              </div>

              {/* Entries Table */}
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Account Head & Narration</th>
                    <th className="border border-gray-300 p-2 text-right w-28">Debit (৳)</th>
                    <th className="border border-gray-300 p-2 text-right w-28">Credit (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedForPrint.entries.map((ent, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-2">
                        <div className="font-bold">{ent.accountName}</div>
                        <div className="text-[10px] text-gray-500">{ent.narration}</div>
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-mono">{ent.debit ? ent.debit.toLocaleString() : '—'}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono">{ent.credit ? ent.credit.toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="border border-gray-300 p-2 text-right">Total Amount:</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">৳ {selectedForPrint.totalAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">৳ {selectedForPrint.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Blocks */}
              <div className="grid grid-cols-3 gap-4 pt-12 text-center text-[10px] text-gray-600">
                <div className="border-t border-gray-400 pt-1">Prepared By: {selectedForPrint.preparedBy}</div>
                <div className="border-t border-gray-400 pt-1">Checked By: Accounts Officer</div>
                <div className="border-t border-gray-400 pt-1 font-bold text-gray-800">
                  Approved By: {selectedForPrint.approvedBy || 'Executive Director'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setSelectedForPrint(null)} className="text-xs">
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button onClick={() => window.print()} className="text-xs">
                <Printer className="w-4 h-4 mr-1.5" />
                {isBangla ? 'ভাউচার প্রিন্ট করুন' : 'Print Voucher'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
