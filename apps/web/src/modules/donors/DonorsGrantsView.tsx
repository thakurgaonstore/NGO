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
import { HeartHandshake, Plus, Printer, DollarSign, Building, Check } from 'lucide-react';

export interface GrantAgreement {
  id: string;
  donorName: string;
  type: 'institutional' | 'individual' | 'corporate';
  projectName: string;
  totalGrantBDT: number;
  disbursedBDT: number;
  fundType: 'restricted' | 'unrestricted';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
}

const INITIAL_GRANTS: GrantAgreement[] = [
  {
    id: 'g-01',
    donorName: 'UNICEF Bangladesh',
    type: 'institutional',
    projectName: 'WASH Program',
    totalGrantBDT: 8500000,
    disbursedBDT: 6000000,
    fundType: 'restricted',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    id: 'g-02',
    donorName: 'Save the Children',
    type: 'institutional',
    projectName: 'Char Child Education',
    totalGrantBDT: 14500000,
    disbursedBDT: 10000000,
    fundType: 'restricted',
    startDate: '2025-07-01',
    endDate: '2027-06-30',
    status: 'active'
  },
  {
    id: 'g-03',
    donorName: 'General Public Zakat Fund',
    type: 'individual',
    projectName: 'Emergency Winter Relief',
    totalGrantBDT: 1200000,
    disbursedBDT: 1200000,
    fundType: 'unrestricted',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'active'
  }
];

export const DonorsGrantsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant, settings } = useTenant();
  const [grants, setGrants] = useState<GrantAgreement[]>(INITIAL_GRANTS);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [selectedDonor, setSelectedDonor] = useState<GrantAgreement | null>(null);

  const totalGrants = grants.reduce((sum, g) => sum + g.totalGrantBDT, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'দাতা সংস্থা ও অনুদান ব্যবস্থাপনা' : 'Donor & Fund Management'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'আন্তর্জাতিক ও স্থানীয় দাতা সংস্থা, নির্দিষ্ট অনুদান তহবিল ও ব্যবহার রিপোর্ট।'
              : 'Institutional donor agreements, restricted project funds, and money receipts.'}
          </p>
        </div>

        <Button onClick={() => setIsReceiptOpen(true)} className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700">
          <HeartHandshake className="w-4 h-4 mr-1.5" />
          {isBangla ? 'নতুন অনুদান গ্রহণ / রসিদ' : 'Record Grant Donation'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">{isBangla ? 'সর্বমোট অনুদান চুক্তি' : 'Total Grants Contracted'}</span>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              {formatCurrency(totalGrants, { useBanglaNumerals: isBangla })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">{isBangla ? 'নির্দিষ্ট তহবিল (Restricted)' : 'Restricted Project Funds'}</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {formatCurrency(23000000, { useBanglaNumerals: isBangla })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">{isBangla ? 'সাধারণ অনুদান (Unrestricted)' : 'Unrestricted Fund'}</span>
            <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
              {formatCurrency(1200000, { useBanglaNumerals: isBangla })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            {isBangla ? 'দাতা চুক্তি ও তহবিল বরাদ্দ তালিকা' : 'Active Grant Agreements'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'দাতা সংস্থা' : 'Donor Name'}</TableHead>
                <TableHead>{isBangla ? 'সংযুক্ত প্রকল্প' : 'Linked Project'}</TableHead>
                <TableHead>{isBangla ? 'তহবিলের ধরণ' : 'Fund Type'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'মোট অনুদান' : 'Total Grant'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'ছাড়কৃত অর্থ' : 'Disbursed'}</TableHead>
                <TableHead>{isBangla ? 'মেয়াদ' : 'Period'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grants.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <div className="font-semibold text-sm">{g.donorName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{g.type} Donor</div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{g.projectName}</TableCell>
                  <TableCell>
                    <Badge variant={g.fundType === 'restricted' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                      {g.fundType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">
                    {formatCurrency(g.totalGrantBDT, { useBanglaNumerals: isBangla })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600">
                    {formatCurrency(g.disbursedBDT, { useBanglaNumerals: isBangla })}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {formatDate(g.startDate)} - {formatDate(g.endDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
