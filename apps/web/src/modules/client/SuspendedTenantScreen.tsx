import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { Button } from '../../components/ui/button';
import { ShieldAlert, PhoneCall, Mail } from 'lucide-react';

export const SuspendedTenantScreen: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-destructive/20 bg-card shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {isBangla ? 'অ্যাকাউন্ট স্থগিত করা হয়েছে' : 'Organization Workspace Suspended'}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isBangla
              ? `${tenant?.name.bn || 'এই এনজিও'} এর সাবস্ক্রিপশন অথবা সার্ভিস সাময়িকভাবে স্থগিত রয়েছে। সেবা পুনরায় চালু করতে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।`
              : `The ERP subscription for ${tenant?.name.en || 'this organization'} is currently suspended or expired. Please contact platform administration to reactivate.`}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border text-xs text-left space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Mail className="w-4 h-4 text-primary" />
            <span>billing@ngoerp.xyz</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <PhoneCall className="w-4 h-4 text-primary" />
            <span>+880 1711-000000 (Hotline)</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            window.location.href = '/superadmin';
          }}
          className="w-full text-xs"
        >
          {isBangla ? 'সুপার অ্যাডমিন পোর্টালে যান' : 'Go to Super Admin Portal'}
        </Button>
      </div>
    </div>
  );
};
