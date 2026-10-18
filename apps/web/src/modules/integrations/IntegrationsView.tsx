import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { MessageSquare, CreditCard, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const [tab, setTab] = useState<'sms' | 'payments'>('sms');

  // SMS Form
  const [smsPhone, setSmsPhone] = useState<string>('01712-345678');
  const [smsMessage, setSmsMessage] = useState<string>(
    'সম্মানিত সদস্য, জাগরণী ফাউন্ডেশনে আপনার অক্টোবর মাসের কিস্তি ৳ ৭৫০ পরিশোধ হয়েছে। ধন্যবাদ।'
  );
  const [smsSentNotice, setSmsSentNotice] = useState<boolean>(false);

  // Payment Test Simulator
  const [payAmount, setPayAmount] = useState<number>(1500);
  const [payMethod, setPayMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [paySuccessNotice, setPaySuccessNotice] = useState<string | null>(null);

  const handleSendTestSms = () => {
    setSmsSentNotice(true);
    setTimeout(() => setSmsSentNotice(false), 2500);
  };

  const handleSimulatePayment = () => {
    const txnId = `TRX${Date.now().toString().slice(-8)}`;
    setPaySuccessNotice(
      isBangla
        ? `সফল: ${payMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পেমেন্ট সফল হয়েছে! ট্রানজেকশন আইডি: ${txnId} (স্বয়ংক্রিয় মানি রসিদ ও ভাউচার তৈরি হয়েছে)`
        : `Success: ${payMethod.toUpperCase()} payment verified! TxnID: ${txnId} (Voucher auto-booked)`
    );
    setTimeout(() => setPaySuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'ইন্টিগ্রেশনস: বাল্ক এসএমএস ও পেমেন্ট গেটওয়ে' : 'Integrations: Bulk SMS & Payment Gateways'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'বাংলাদেশি গেটওয়ের মাধ্যমে এসএমএস নোটিফিকেশন প্রেরণ এবং বিকাশ/নগদ পেমেন্ট অটমেশন।'
              : 'Bulk SMS dispatch via Bangladeshi gateways and bKash / Nagad automated reconciliation.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 text-xs font-semibold">
        <button
          onClick={() => setTab('sms')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tab === 'sms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'বাল্ক এসএমএস প্রেরণ ও লগ' : 'Bulk SMS Dispatch'}
        </button>
        <button
          onClick={() => setTab('payments')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tab === 'payments' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isBangla ? 'বিকাশ ও নগদ পেমেন্ট সিমুলেটর' : 'MFS Payment Gateways'}
        </button>
      </div>

      {/* TAB 1: Bulk SMS */}
      {tab === 'sms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{isBangla ? 'এসএমএস প্রেরণ ফর্ম' : 'Send SMS Message'}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  BulkSMSBD.net API
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {smsSentNotice && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBangla ? 'এসএমএস সফলভাবে প্রেরণ করা হয়েছে!' : 'SMS dispatched via Gateway proxy!'}</span>
                </div>
              )}

              <div>
                <label className="text-muted-foreground font-semibold">{isBangla ? 'প্রাপকের মোবাইল নম্বর *' : 'Recipient Mobile Number *'}</label>
                <Input value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} placeholder="01712-000000" />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold">{isBangla ? 'এসএমএস বার্তা (বাংলা বা ইংরেজি) *' : 'Message Content *'}</label>
                <textarea
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Characters: {smsMessage.length} (Unicode Bangla: 1 SMS)</span>
                  <span className="text-primary font-semibold">Cost: 1 Credit</span>
                </div>
              </div>

              <Button onClick={handleSendTestSms} className="text-xs">
                <Send className="w-4 h-4 mr-1.5" />
                {isBangla ? 'এসএমএস পাঠান' : 'Dispatch SMS'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold">{isBangla ? 'এসএমএস ক্রেডিট স্থিতি' : 'SMS Account Balance'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="text-center p-4 bg-muted/40 rounded-xl">
                <span className="text-xs text-muted-foreground">{isBangla ? 'অবশিষ্ট ক্রেডিট' : 'Remaining Credits'}</span>
                <div className="text-3xl font-bold font-mono text-emerald-600 mt-1">
                  {isBangla ? toBanglaDigits(tenant?.quotas?.smsCreditsRemaining || 680) : tenant?.quotas?.smsCreditsRemaining || 680}
                </div>
                <Badge variant="outline" className="mt-2 text-[10px]">
                  {isBangla ? 'প্ল্যানের সাথে অটো-রিনিউ' : 'Monthly Auto-Renew'}
                </Badge>
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1 pt-2">
                <div>• Auto-triggers: Installment receipts</div>
                <div>• Member passbook updates</div>
                <div>• Emergency cyclone warnings</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Mobile Payments */}
      {tab === 'payments' && (
        <Card className="max-w-2xl">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-600" />
                <span>{isBangla ? 'বিকাশ ও নগদ পেমেন্ট সিমুলেটর (Sandbox)' : 'bKash & Nagad Payment Sandbox'}</span>
              </span>
              <Badge variant="outline" className="text-xs">
                Webhook Gateway Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            {paySuccessNotice && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{paySuccessNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground font-semibold">{isBangla ? 'পেমেন্ট মেথড *' : 'Payment Method *'}</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="bkash">bKash Merchant Payment</option>
                  <option value="nagad">Nagad Merchant Payment</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">{isBangla ? 'অনুদানের পরিমাণ (BDT ৳) *' : 'Donation / Fee Amount *'}</label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} />
              </div>
            </div>

            <Button
              onClick={handleSimulatePayment}
              className={`text-xs ${payMethod === 'bkash' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              {isBangla ? `সিমুলেট করুন (${payMethod === 'bkash' ? 'বিকাশ' : 'নগদ'})` : `Simulate Webhook (${payMethod.toUpperCase()})`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
