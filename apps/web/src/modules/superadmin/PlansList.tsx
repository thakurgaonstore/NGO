import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { DEFAULT_SUBSCRIPTION_PLANS, formatCurrency, toBanglaDigits } from '@ngo-erp/shared';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Check, Sparkles } from 'lucide-react';

export const PlansList: React.FC = () => {
  const { isBangla } = useI18n();

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold">
          {isBangla ? 'এনজিও ইআরপি সাবস্ক্রিপশন প্ল্যানসমূহ' : 'NGO ERP Subscription Plans'}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isBangla
            ? 'প্রতিটি এনজিওর আকার ও চাহিদা অনুযায়ী নির্ধারিত মাসিক বা বাৎসরিক প্যাকেজ।'
            : 'Tailored pricing tiers for grassroots voluntary clubs up to multi-branch microfinance NGOs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {DEFAULT_SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${
              plan.isPopular ? 'border-primary ring-2 ring-primary/20 shadow-md' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="text-xs px-3 py-1 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  {isBangla ? 'সর্বাধিক জনপ্রিয়' : 'Most Popular'}
                </Badge>
              </div>
            )}

            <CardHeader className="pt-6">
              <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-primary mt-2">
                {formatCurrency(plan.priceBDT, { useBanglaNumerals: isBangla })}
                <span className="text-xs font-normal text-muted-foreground"> / {isBangla ? 'মাস' : 'month'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 min-h-[36px]">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 font-medium">
                <div>• {plan.limits.users} {isBangla ? 'জন অনুমোদিত ইউজার' : 'Authorized User accounts'}</div>
                <div>• {plan.limits.branches} {isBangla ? 'টি শাখা অফিস' : 'Branch Offices'}</div>
                <div>• {plan.limits.smsCredits} {isBangla ? 'টি ফ্রি বাল্ক এসএমএস/মাস' : 'Free Bulk SMS credits/month'}</div>
                <div>• {plan.limits.storageMB} MB {isBangla ? 'ক্লাউড মিডিয়া স্টোরেজ' : 'Cloud Storage'}</div>
              </div>

              <div>
                <span className="font-semibold text-muted-foreground block mb-2">
                  {isBangla ? 'অন্তর্ভুক্ত মডিউলসমূহ:' : 'Included Modules:'}
                </span>
                <div className="space-y-1.5">
                  {plan.allowedModules.map((mod) => (
                    <div key={mod} className="flex items-center gap-2 text-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="capitalize">{mod.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t">
              <Button variant={plan.isPopular ? 'default' : 'outline'} className="w-full text-xs">
                {isBangla ? 'প্ল্যান কনফিগার করুন' : 'Configure Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
