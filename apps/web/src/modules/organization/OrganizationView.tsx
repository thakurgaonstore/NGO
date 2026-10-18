import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { BD_DIVISIONS, BD_DISTRICTS, toBanglaDigits } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Users,
  Shield,
  Check,
  Edit,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export interface Branch {
  id: string;
  code: string;
  name: { en: string; bn: string };
  type: 'head_office' | 'division_office' | 'branch_office';
  division: string;
  district: string;
  upazila: string;
  address: string;
  managerName: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface CenterSamity {
  id: string;
  branchId: string;
  branchName: string;
  code: string;
  name: { en: string; bn: string };
  meetingDay: string;
  fieldOfficer: string;
  village: string;
  targetMembers: number;
  totalSavingsBDT?: number;
  totalLoansOutstandingBDT?: number;
  status: 'active' | 'inactive';
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-01',
    code: 'HO-01',
    name: { en: 'Head Office & Savar Main Branch', bn: 'প্রধান কার্যালয় ও সাভার মূল শাখা' },
    type: 'head_office',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'savar',
    address: 'House 14, Road 5, Dhanmondi, Dhaka',
    managerName: 'Dr. Aminul Islam',
    phone: '01711-223344',
    status: 'active'
  },
  {
    id: 'b-02',
    code: 'BR-02',
    name: { en: 'Chattogram Regional Branch', bn: 'চট্টগ্রাম আঞ্চলিক শাখা' },
    type: 'branch_office',
    division: 'chattogram',
    district: 'chattogram',
    upazila: 'kotwali_ctg',
    address: 'Agrabad C/A, Chattogram',
    managerName: 'Farhana Yasmin',
    phone: '01819-556677',
    status: 'active'
  },
  {
    id: 'b-03',
    code: 'BR-03',
    name: { en: 'Rajshahi Field Branch', bn: 'রাজশাহী মাঠ শাখা' },
    type: 'branch_office',
    division: 'rajshahi',
    district: 'rajshahi',
    upazila: 'boalia',
    address: 'Shaheb Bazar, Rajshahi',
    managerName: 'Md. Tariqul Islam',
    phone: '01912-334455',
    status: 'active'
  },
  {
    id: 'b-04',
    code: 'BR-04',
    name: { en: 'Khulna Regional Branch', bn: 'খুলনা আঞ্চলিক শাখা' },
    type: 'branch_office',
    division: 'khulna',
    district: 'khulna',
    upazila: 'kotwali_khulna',
    address: 'Station Road, Khulna',
    managerName: 'Kamrul Hasan',
    phone: '01715-001122',
    status: 'active'
  }
];

const INITIAL_CENTERS: CenterSamity[] = [
  {
    id: 'sam-01',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    code: 'SMT-001',
    name: { en: 'Surjo Mukhi Mohila Samity (Savar)', bn: 'সুর্যমুখী মহিলা সমিতি (সাভার)' },
    meetingDay: 'প্রতি সোমবার (সকাল ১০:০০ টা)',
    fieldOfficer: 'মো: তারিকুল ইসলাম',
    village: 'চাপাইন, সাভার',
    targetMembers: 30,
    totalSavingsBDT: 345000,
    totalLoansOutstandingBDT: 620000,
    status: 'active'
  },
  {
    id: 'sam-02',
    branchId: 'b-02',
    branchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    code: 'SMT-002',
    name: { en: 'Padma Krishi Somobay (Hathazari)', bn: 'পদ্মা কৃষি সমবায় (হাটহাজারী)' },
    meetingDay: 'প্রতি বুধবার (বিকাল ০৩:০০ টা)',
    fieldOfficer: 'মো: তারিকুল ইসলাম',
    village: 'ফতেহপুর, হাটহাজারী',
    targetMembers: 35,
    totalSavingsBDT: 480000,
    totalLoansOutstandingBDT: 850000,
    status: 'active'
  },
  {
    id: 'sam-03',
    branchId: 'b-03',
    branchName: 'রাজশাহী মাঠ শাখা',
    code: 'SMT-003',
    name: { en: 'Shapla Gramin Kendra (Shivganj)', bn: 'শাপলা গ্রামীণ উন্নয়ন কেন্দ্র (শিবগঞ্জ)' },
    meetingDay: 'প্রতি বৃহস্পতিবার (সকাল ১১:০০ টা)',
    fieldOfficer: 'ফারহানা ইয়াসমিন',
    village: 'মহাস্থান, শিবগঞ্জ',
    targetMembers: 25,
    totalSavingsBDT: 290000,
    totalLoansOutstandingBDT: 510000,
    status: 'active'
  }
];

export const OrganizationView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  // Tab State: Branches vs Centers
  const [activeTab, setActiveTab] = useState<'branches' | 'centers'>('branches');

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(`ngo_branches_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [centers, setCenters] = useState<CenterSamity[]>(() => {
    const saved = localStorage.getItem(`ngo_centers_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_CENTERS;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Branch Modal State (Add/Edit)
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const [branchCode, setBranchCode] = useState<string>('BR-05');
  const [branchNameEn, setBranchNameEn] = useState<string>('');
  const [branchNameBn, setBranchNameBn] = useState<string>('');
  const [branchType, setBranchType] = useState<Branch['type']>('branch_office');
  const [branchDivision, setBranchDivision] = useState<string>('dhaka');
  const [branchDistrict, setBranchDistrict] = useState<string>('dhaka');
  const [branchUpazila, setBranchUpazila] = useState<string>('savar');
  const [branchAddress, setBranchAddress] = useState<string>('');
  const [branchManager, setBranchManager] = useState<string>('');
  const [branchPhone, setBranchPhone] = useState<string>('');

  // Center Modal State (Add/Edit)
  const [isCenterModalOpen, setIsCenterModalOpen] = useState<boolean>(false);
  const [editingCenter, setEditingCenter] = useState<CenterSamity | null>(null);
  const [deletingCenter, setDeletingCenter] = useState<CenterSamity | null>(null);

  const [selectedBranchForCenter, setSelectedBranchForCenter] = useState<string>(branches[0]?.id || 'b-01');
  const [centerCode, setCenterCode] = useState<string>('SMT-004');
  const [centerNameEn, setCenterNameEn] = useState<string>('');
  const [centerNameBn, setCenterNameBn] = useState<string>('');
  const [centerMeetingDay, setCenterMeetingDay] = useState<string>('প্রতি মঙ্গলবার (সকাল ১০:০০ টা)');
  const [centerOfficer, setCenterOfficer] = useState<string>('মো: তারিকুল ইসলাম');
  const [centerVillage, setCenterVillage] = useState<string>('চাপাইন, সাভার');
  const [centerTarget, setCenterTarget] = useState<number>(30);

  const filteredDistricts = BD_DISTRICTS.filter((d) => d.divisionId === branchDivision);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Branch CRUD
  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    setBranchCode(`BR-${String(branches.length + 1).padStart(2, '0')}`);
    setBranchNameEn('');
    setBranchNameBn('');
    setBranchType('branch_office');
    setBranchDivision('dhaka');
    setBranchDistrict('dhaka');
    setBranchUpazila('savar');
    setBranchAddress('');
    setBranchManager('');
    setBranchPhone('');
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchCode(b.code);
    setBranchNameEn(b.name.en);
    setBranchNameBn(b.name.bn);
    setBranchType(b.type);
    setBranchDivision(b.division);
    setBranchDistrict(b.district);
    setBranchUpazila(b.upazila);
    setBranchAddress(b.address);
    setBranchManager(b.managerName);
    setBranchPhone(b.phone);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = () => {
    if (!branchNameEn && !branchNameBn) return;

    if (editingBranch) {
      const updated = branches.map((b) => {
        if (b.id === editingBranch.id) {
          return {
            ...b,
            code: branchCode,
            name: { en: branchNameEn || branchNameBn, bn: branchNameBn || branchNameEn },
            type: branchType,
            division: branchDivision,
            district: branchDistrict,
            upazila: branchUpazila,
            address: branchAddress,
            managerName: branchManager,
            phone: branchPhone
          };
        }
        return b;
      });
      setBranches(updated);
      localStorage.setItem(`ngo_branches_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`শাখা "${branchNameBn || branchNameEn}" সফলভাবে আপডেট করা হয়েছে।`);
    } else {
      const newBranch: Branch = {
        id: `b-${Date.now()}`,
        code: branchCode,
        name: { en: branchNameEn || branchNameBn, bn: branchNameBn || branchNameEn },
        type: branchType,
        division: branchDivision,
        district: branchDistrict,
        upazila: branchUpazila,
        address: branchAddress,
        managerName: branchManager,
        phone: branchPhone,
        status: 'active'
      };
      const updated = [...branches, newBranch];
      setBranches(updated);
      localStorage.setItem(`ngo_branches_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`নতুন শাখা "${branchNameBn || branchNameEn}" তৈরি হয়েছে।`);
    }

    setIsBranchModalOpen(false);
  };

  const handleDeleteBranch = () => {
    if (!deletingBranch) return;
    const updated = branches.filter((b) => b.id !== deletingBranch.id);
    setBranches(updated);
    localStorage.setItem(`ngo_branches_${tenant?.id}`, JSON.stringify(updated));
    showNotify(`শাখা "${deletingBranch.name.bn}" মুছে ফেলা হয়েছে।`);
    setDeletingBranch(null);
  };

  // Center CRUD (Under Branch)
  const handleOpenCreateCenter = (branchId?: string) => {
    setEditingCenter(null);
    if (branchId) setSelectedBranchForCenter(branchId);
    setCenterCode(`SMT-${String(centers.length + 1).padStart(3, '0')}`);
    setCenterNameEn('');
    setCenterNameBn('');
    setCenterMeetingDay('প্রতি সোমবার (সকাল ১০:০০ টা)');
    setCenterOfficer('মো: তারিকুল ইসলাম');
    setCenterVillage('সাভার');
    setCenterTarget(30);
    setIsCenterModalOpen(true);
  };

  const handleOpenEditCenter = (c: CenterSamity) => {
    setEditingCenter(c);
    setSelectedBranchForCenter(c.branchId);
    setCenterCode(c.code);
    setCenterNameEn(c.name.en);
    setCenterNameBn(c.name.bn);
    setCenterMeetingDay(c.meetingDay);
    setCenterOfficer(c.fieldOfficer);
    setCenterVillage(c.village);
    setCenterTarget(c.targetMembers);
    setIsCenterModalOpen(true);
  };

  const handleSaveCenter = () => {
    if (!centerNameEn && !centerNameBn) return;
    const targetBranch = branches.find((b) => b.id === selectedBranchForCenter);
    const branchName = targetBranch ? targetBranch.name.bn : 'প্রধান শাখা';

    if (editingCenter) {
      const updated = centers.map((c) => {
        if (c.id === editingCenter.id) {
          return {
            ...c,
            branchId: selectedBranchForCenter,
            branchName,
            code: centerCode,
            name: { en: centerNameEn || centerNameBn, bn: centerNameBn || centerNameEn },
            meetingDay: centerMeetingDay,
            fieldOfficer: centerOfficer,
            village: centerVillage,
            targetMembers: centerTarget
          };
        }
        return c;
      });
      setCenters(updated);
      localStorage.setItem(`ngo_centers_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`কেন্দ্র/সমিতি "${centerNameBn || centerNameEn}" সফলভাবে আপডেট করা হয়েছে।`);
    } else {
      const newCenter: CenterSamity = {
        id: `sam-${Date.now()}`,
        branchId: selectedBranchForCenter,
        branchName,
        code: centerCode,
        name: { en: centerNameEn || centerNameBn, bn: centerNameBn || centerNameEn },
        meetingDay: centerMeetingDay,
        fieldOfficer: centerOfficer,
        village: centerVillage,
        targetMembers: centerTarget,
        totalSavingsBDT: 0,
        totalLoansOutstandingBDT: 0,
        status: 'active'
      };
      const updated = [...centers, newCenter];
      setCenters(updated);
      localStorage.setItem(`ngo_centers_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`নতুন কেন্দ্র/সমিতি "${centerNameBn || centerNameEn}" যুক্ত হয়েছে।`);
    }

    setIsCenterModalOpen(false);
  };

  const handleDeleteCenter = () => {
    if (!deletingCenter) return;
    const updated = centers.filter((c) => c.id !== deletingCenter.id);
    setCenters(updated);
    localStorage.setItem(`ngo_centers_${tenant?.id}`, JSON.stringify(updated));
    showNotify(`কেন্দ্র "${deletingCenter.name.bn}" মুছে ফেলা হয়েছে।`);
    setDeletingCenter(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'প্রতিষ্ঠান সেটআপ ও শাখা কাঠামো' : 'Organization Setup & Branch Network'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'শাখা নেটওয়ার্ক এবং প্রতিটি শাখার অধীনে কেন্দ্র/সমিতি পরিচালনা (Add/Edit/Delete)।'
              : 'Manage Branch Network and Centers/Samities under each branch with Add, Edit, and Delete.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenCreateCenter()} variant="outline" className="text-xs h-9">
            <Users className="w-4 h-4 mr-1.5 text-emerald-600" />
            {isBangla ? 'নতুন কেন্দ্র/সমিতি যোগ' : 'Add Center/Samity'}
          </Button>

          <Button onClick={handleOpenCreateBranch} className="text-xs h-9 bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন শাখা যুক্ত করুন' : 'Add New Branch'}
          </Button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{isBangla ? 'মোট সক্রিয় শাখা' : 'Total Active Branches'}</p>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {isBangla ? toBanglaDigits(branches.length) : branches.length}
              </div>
            </div>
            <Building2 className="w-8 h-8 text-primary/30" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{isBangla ? 'মোট কেন্দ্র ও সমিতি' : 'Total Centers / Samities'}</p>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {isBangla ? toBanglaDigits(centers.length) : centers.length}
              </div>
            </div>
            <Users className="w-8 h-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{isBangla ? 'কর্মরত প্রশাসনিক বিভাগ' : 'Operational Divisions'}</p>
              <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
                {isBangla ? toBanglaDigits(new Set(branches.map((b) => b.division)).size) : new Set(branches.map((b) => b.division)).size}
              </div>
            </div>
            <MapPin className="w-8 h-8 text-sky-600/30" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs Switcher: Branches vs Centers */}
      <div className="flex gap-2 border-b pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'branches' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {isBangla ? 'শাখা অফিস নেটওয়ার্ক (Branches)' : 'Branches Network'}
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'centers' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {isBangla ? 'শাখার আন্ডারে কেন্দ্র/সমিতিসমূহ (Centers under Branch)' : 'Centers under Branches'}
        </button>
      </div>

      {/* TAB 1: BRANCHES TABLE WITH EDIT & DELETE */}
      {activeTab === 'branches' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'শাখা অফিসসমূহের তালিকা' : 'Registered Branches'}</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {isBangla ? `${toBanglaDigits(branches.length)} টি শাখা` : `${branches.length} Branches`}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'শাখা কোড' : 'Code'}</TableHead>
                  <TableHead>{isBangla ? 'শাখার নাম ও ঠিকানা' : 'Branch Name & Address'}</TableHead>
                  <TableHead>{isBangla ? 'ধরণ' : 'Type'}</TableHead>
                  <TableHead>{isBangla ? 'বিভাগ ও জেলা' : 'Location'}</TableHead>
                  <TableHead>{isBangla ? 'শাখা প্রধান ও ফোন' : 'Manager & Contact'}</TableHead>
                  <TableHead className="text-center">{isBangla ? 'অন্তর্ভুক্ত কেন্দ্র' : 'Centers'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((b) => {
                  const divObj = BD_DIVISIONS.find((d) => d.id === b.division);
                  const distObj = BD_DISTRICTS.find((d) => d.id === b.district);
                  const branchCenters = centers.filter((c) => c.branchId === b.id);

                  return (
                    <TableRow key={b.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-xs text-primary">{b.code}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{isBangla ? b.name.bn : b.name.en}</div>
                        <div className="text-xs text-muted-foreground">{b.address}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.type === 'head_office' ? 'default' : 'secondary'} className="text-[10px]">
                          {b.type === 'head_office' ? (isBangla ? 'প্রধান কার্যালয়' : 'Head Office') : (isBangla ? 'মাঠ শাখা' : 'Field Branch')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{isBangla ? divObj?.nameBn || b.division : divObj?.nameEn || b.division}</div>
                        <div className="text-muted-foreground">{isBangla ? distObj?.nameBn || b.district : distObj?.nameEn || b.district}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{b.managerName}</div>
                        <div className="text-muted-foreground font-mono text-[11px]">{b.phone}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs text-emerald-600 bg-emerald-500/10">
                          {toBanglaDigits(branchCenters.length)} টি কেন্দ্র
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenCreateCenter(b.id)}
                            className="h-7 text-[11px] px-2 text-emerald-600 hover:bg-emerald-500/10"
                            title="শাখার আন্ডারে কেন্দ্র যোগ করুন"
                          >
                            <Plus className="w-3.5 h-3.5 mr-0.5" />
                            কেন্দ্র যোগ
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditBranch(b)}
                            className="h-7 w-7 p-0 text-sky-600 hover:bg-sky-500/10"
                            title="শাখা সম্পাদনা"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingBranch(b)}
                            className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/10"
                            title="শাখা মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: CENTERS UNDER BRANCH TABLE WITH ADD / EDIT / DELETE */}
      {activeTab === 'centers' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{isBangla ? 'শাখার আন্ডারে কেন্দ্র ও সমিতিসমূহের তালিকা' : 'Centers / Samities under Branches'}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                প্রতিটি শাখার অধীনে মাঠ কর্মকর্তা ও মিটিং ডে অনুযায়ী কেন্দ্র পরিচালনা করুন।
              </p>
            </div>
            <Button onClick={() => handleOpenCreateCenter()} className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-3.5 h-3.5 mr-1" />
              {isBangla ? 'নতুন কেন্দ্র যোগ' : 'Add Center'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBangla ? 'কেন্দ্র কোড' : 'Code'}</TableHead>
                  <TableHead>{isBangla ? 'কেন্দ্র / সমিতির নাম' : 'Center Name'}</TableHead>
                  <TableHead>{isBangla ? 'সংশ্লিষ্ট শাখা' : 'Branch'}</TableHead>
                  <TableHead>{isBangla ? 'মাঠ কর্মকর্তা' : 'Field Officer'}</TableHead>
                  <TableHead>{isBangla ? 'মিটিংয়ের দিন ও সময়' : 'Meeting Day & Time'}</TableHead>
                  <TableHead>{isBangla ? 'অবস্থান / গ্রাম' : 'Village'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-xs text-primary">{c.code}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{isBangla ? c.name.bn : c.name.en}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">টার্গেট সদস্য: {c.targetMembers} জন</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {c.branchName}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-semibold text-emerald-600">{c.fieldOfficer}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground flex items-center gap-1 py-3">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{c.meetingDay}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.village}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditCenter(c)}
                          className="h-7 w-7 p-0 text-sky-600 hover:bg-sky-500/10"
                          title="কেন্দ্র সম্পাদনা"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingCenter(c)}
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/10"
                          title="কেন্দ্র মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Branch Modal */}
      <Dialog
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title={editingBranch ? (isBangla ? `শাখা সম্পাদনা: ${editingBranch.name.bn}` : 'Edit Branch') : (isBangla ? 'নতুন শাখা বা অফিস যুক্ত করুন' : 'Add New Branch Office')}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'শাখা কোড *' : 'Branch Code *'}</label>
              <Input value={branchCode} onChange={(e) => setBranchCode(e.target.value.toUpperCase())} placeholder="e.g. BR-04" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'অফিসের ধরণ' : 'Office Type'}</label>
              <select
                value={branchType}
                onChange={(e) => setBranchType(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="branch_office">{isBangla ? 'মাঠ শাখা (Branch Office)' : 'Branch Office'}</option>
                <option value="division_office">{isBangla ? 'বিভাগীয় অফিস (Division Office)' : 'Division Office'}</option>
                <option value="head_office">{isBangla ? 'প্রধান কার্যালয় (Head Office)' : 'Head Office'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'শাখার নাম (ইংরেজি) *' : 'Name (English) *'}</label>
              <Input value={branchNameEn} onChange={(e) => setBranchNameEn(e.target.value)} placeholder="Khulna Branch" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'শাখার নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
              <Input value={branchNameBn} onChange={(e) => setBranchNameBn(e.target.value)} placeholder="খুলনা শাখা" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'বিভাগ (Division) *' : 'Division *'}</label>
              <select
                value={branchDivision}
                onChange={(e) => {
                  setBranchDivision(e.target.value);
                  const firstDist = BD_DISTRICTS.find((d) => d.divisionId === e.target.value);
                  if (firstDist) setBranchDistrict(firstDist.id);
                }}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                {BD_DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isBangla ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'জেলা (District) *' : 'District *'}</label>
              <select
                value={branchDistrict}
                onChange={(e) => setBranchDistrict(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                {filteredDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {isBangla ? dist.nameBn : dist.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'উপজেলা / থানা *' : 'Upazila *'}</label>
              <Input value={branchUpazila} onChange={(e) => setBranchUpazila(e.target.value)} placeholder="যেমন: সাভার" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'শাখা প্রধানের নাম *' : 'Manager Name *'}</label>
              <Input value={branchManager} onChange={(e) => setBranchManager(e.target.value)} placeholder="Kamrul Hasan" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'যোগাযোগ ফোন নম্বর *' : 'Phone *'}</label>
              <Input value={branchPhone} onChange={(e) => setBranchPhone(e.target.value)} placeholder="01715-000000" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'অফিসের পূর্ণ ঠিকানা *' : 'Full Address *'}</label>
            <Input value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} placeholder="বাসা/হোল্ডিং, রোড, এলাকা..." />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsBranchModalOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveBranch} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {editingBranch ? (isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes') : (isBangla ? 'শাখা সংরক্ষণ করুন' : 'Save Branch')}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add / Edit Center Modal (Under Branch) */}
      <Dialog
        isOpen={isCenterModalOpen}
        onClose={() => setIsCenterModalOpen(false)}
        title={editingCenter ? (isBangla ? `কেন্দ্র/সমিতি সম্পাদনা: ${editingCenter.name.bn}` : 'Edit Center') : (isBangla ? 'শাখার আন্ডারে নতুন কেন্দ্র/সমিতি যোগ করুন' : 'Add Center under Branch')}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'দায়িত্বপ্রাপ্ত শাখা নির্বাচন করুন *' : 'Select Branch *'}</label>
            <select
              value={selectedBranchForCenter}
              onChange={(e) => setSelectedBranchForCenter(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name.bn} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">কেন্দ্র কোড *</label>
              <Input value={centerCode} onChange={(e) => setCenterCode(e.target.value)} placeholder="SMT-004" className="font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">টার্গেট সদস্য সংখ্যা</label>
              <Input type="number" value={centerTarget} onChange={(e) => setCenterTarget(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">কেন্দ্রের নাম (ইংরেজি) *</label>
              <Input value={centerNameEn} onChange={(e) => setCenterNameEn(e.target.value)} placeholder="Surjo Mukhi Samity" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">কেন্দ্রের নাম (বাংলা) *</label>
              <Input value={centerNameBn} onChange={(e) => setCenterNameBn(e.target.value)} placeholder="সুর্যমুখী সমিতি" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">দায়িত্বপ্রাপ্ত মাঠ কর্মকর্তা *</label>
              <Input value={centerOfficer} onChange={(e) => setCenterOfficer(e.target.value)} placeholder="মো: তারিকুল ইসলাম" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">গ্রাম / এলাকা / ওয়ার্ড *</label>
              <Input value={centerVillage} onChange={(e) => setCenterVillage(e.target.value)} placeholder="চাপাইন, সাভার" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">সাপ্তাহিক মিটিংয়ের দিন ও সময় *</label>
            <Input value={centerMeetingDay} onChange={(e) => setCenterMeetingDay(e.target.value)} placeholder="প্রতি সোমবার (সকাল ১০:০০ টা)" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsCenterModalOpen(false)} className="text-xs">
              বাতিল
            </Button>
            <Button onClick={handleSaveCenter} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Check className="w-4 h-4 mr-1.5" />
              {editingCenter ? 'আপডেট সংরক্ষণ করুন' : 'কেন্দ্র সংরক্ষণ করুন'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Branch Dialog */}
      {deletingBranch && (
        <Dialog
          isOpen={!!deletingBranch}
          onClose={() => setDeletingBranch(null)}
          title="শাখা মুছে ফেলার নিশ্চিতকরণ"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-foreground">
              আপনি কি নিশ্চিত যে <strong>"{deletingBranch.name.bn}"</strong> শাখাটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDeletingBranch(null)} className="text-xs">বাতিল</Button>
              <Button onClick={handleDeleteBranch} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
                হ্যাঁ, মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Center Dialog */}
      {deletingCenter && (
        <Dialog
          isOpen={!!deletingCenter}
          onClose={() => setDeletingCenter(null)}
          title="কেন্দ্র/সমিতি মুছে ফেলার নিশ্চিতকরণ"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-foreground">
              আপনি কি নিশ্চিত যে <strong>"{deletingCenter.name.bn}"</strong> কেন্দ্রটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDeletingCenter(null)} className="text-xs">বাতিল</Button>
              <Button onClick={handleDeleteCenter} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
                হ্যাঁ, মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
