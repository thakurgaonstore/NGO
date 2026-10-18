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
import { FolderKanban, Plus, Calendar, DollarSign, Target, CheckCircle2, Check } from 'lucide-react';

export interface ProjectRecord {
  id: string;
  code: string;
  titleEn: string;
  titleBn: string;
  donorName: string;
  startDate: string;
  endDate: string;
  budgetBDT: number;
  spentBDT: number;
  targetBeneficiaries: number;
  reachedBeneficiaries: number;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
}

const INITIAL_PROJECTS: ProjectRecord[] = [
  {
    id: 'p-01',
    code: 'PRJ-WASH-2026',
    titleEn: 'Safe Drinking Water & Sanitation (WASH) Program',
    titleBn: 'নিরাপদ সুপেয় পানি ও স্বাস্থ্যসম্মত স্যানিটেশন প্রকল্প',
    donorName: 'UNICEF Bangladesh',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    budgetBDT: 8500000,
    spentBDT: 3450000,
    targetBeneficiaries: 12000,
    reachedBeneficiaries: 5400,
    status: 'active'
  },
  {
    id: 'p-02',
    code: 'PRJ-EDU-2026',
    titleEn: 'Char Area Child Education & School Feeding',
    titleBn: 'চরাঞ্চলের শিশুদের প্রাথমিক শিক্ষা ও পুষ্টিকর খাবার কর্মসূচি',
    donorName: 'Save the Children',
    startDate: '2025-07-01',
    endDate: '2027-06-30',
    budgetBDT: 14500000,
    spentBDT: 6800000,
    targetBeneficiaries: 4500,
    reachedBeneficiaries: 2900,
    status: 'active'
  },
  {
    id: 'p-03',
    code: 'PRJ-CLIM-2026',
    titleEn: 'Coastal Resilience & Mangrove Restoration',
    titleBn: 'উপকূলীয় দুর্যোগ ব্যবস্থাপনা ও ম্যানগ্রোভ বনায়ন প্রকল্প',
    donorName: 'UNDP Climate Fund',
    startDate: '2026-03-01',
    endDate: '2028-02-28',
    budgetBDT: 25000000,
    spentBDT: 4200000,
    targetBeneficiaries: 20000,
    reachedBeneficiaries: 3800,
    status: 'active'
  }
];

export const ProjectsListView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const [projects, setProjects] = useState<ProjectRecord[]>(() => {
    const saved = localStorage.getItem(`ngo_projects_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>('PRJ-2026-04');
  const [titleEn, setTitleEn] = useState<string>('');
  const [titleBn, setTitleBn] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [budgetBDT, setBudgetBDT] = useState<number>(5000000);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState<number>(3000);

  const handleCreateProject = () => {
    if (!titleEn || !donorName) return;
    const newPrj: ProjectRecord = {
      id: `p-${Date.now()}`,
      code,
      titleEn,
      titleBn: titleBn || titleEn,
      donorName,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      budgetBDT,
      spentBDT: 0,
      targetBeneficiaries,
      reachedBeneficiaries: 0,
      status: 'active'
    };
    const updated = [...projects, newPrj];
    setProjects(updated);
    localStorage.setItem(`ngo_projects_${tenant?.id}`, JSON.stringify(updated));
    setIsAddOpen(false);
    setTitleEn('');
    setTitleBn('');
    setDonorName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'উন্নয়ন কর্মসূচি ও প্রকল্পসমূহ' : 'Development Programs & Projects'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'দাতা সংস্থা, প্রকল্প বাজেট, সময়সীমা ও সুফলভোগী লক্ষ্যমাত্রা ট্র্যাকিং।'
              : 'Donor grants, logframes, milestone trackers, and budget utilization.'}
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="text-xs h-9">
          <Plus className="w-4 h-4 mr-1.5" />
          {isBangla ? 'নতুন প্রকল্প যুক্ত করুন' : 'Add New Project'}
        </Button>
      </div>

      {/* Projects Cards & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => {
          const burnRate = Math.min(100, Math.round((p.spentBDT / p.budgetBDT) * 100));
          const reachRate = Math.min(100, Math.round((p.reachedBeneficiaries / p.targetBeneficiaries) * 100));

          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {p.code}
                  </Badge>
                  <Badge variant="success" className="text-[10px]">
                    {isBangla ? 'চলমান' : 'Active'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold mt-2 line-clamp-1">
                  {isBangla ? p.titleBn : p.titleEn}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                  <span>{isBangla ? 'দাতা সংস্থা:' : 'Donor:'}</span>
                  <span className="text-primary">{p.donorName}</span>
                </p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Budget vs Actual */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBangla ? 'বাজেট ব্যয়:' : 'Budget Utilization:'}</span>
                    <span className="font-bold">
                      {formatCurrency(p.spentBDT, { useBanglaNumerals: isBangla })} / {formatCurrency(p.budgetBDT, { useBanglaNumerals: isBangla })}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${burnRate}%` }} />
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground font-mono">
                    {burnRate}% {isBangla ? 'ব্যয়িত' : 'spent'}
                  </div>
                </div>

                {/* Beneficiary Reach */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBangla ? 'সুফলভোগী কভারেজ:' : 'Beneficiaries Reached:'}</span>
                    <span className="font-bold">
                      {isBangla ? toBanglaDigits(p.reachedBeneficiaries) : p.reachedBeneficiaries.toLocaleString()} / {isBangla ? toBanglaDigits(p.targetBeneficiaries) : p.targetBeneficiaries.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${reachRate}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Project Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isBangla ? 'নতুন উন্নয়ন প্রকল্প তৈরি করুন' : 'Create Development Project'}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'প্রকল্প কোড *' : 'Project Code *'}</label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="PRJ-2026-04" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'দাতা সংস্থার নাম *' : 'Funding Donor *'}</label>
              <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="e.g. World Bank / USAID / Local Donor" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'প্রকল্পের শিরোনাম (ইংরেজি) *' : 'Title (English) *'}</label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g. Women Empowerment Program" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'প্রকল্পের শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
              <Input value={titleBn} onChange={(e) => setTitleBn(e.target.value)} placeholder="যেমন: নারী ক্ষমতায়ন ও দক্ষতা উন্নয়ন" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মোট অনুমোদিত বাজেট (BDT ৳) *' : 'Approved Budget (BDT) *'}</label>
              <Input type="number" value={budgetBDT} onChange={(e) => setBudgetBDT(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'লক্ষ্যমাত্রা (সুফলভোগী সংখ্যা)' : 'Target Beneficiary Count'}</label>
              <Input type="number" value={targetBeneficiaries} onChange={(e) => setTargetBeneficiaries(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateProject} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'প্রকল্প সংরক্ষণ করুন' : 'Save Project'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
