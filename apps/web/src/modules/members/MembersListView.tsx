import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { BD_DIVISIONS, BD_DISTRICTS, formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { triggerPrint } from '../../core/print/printHelper';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Users,
  UserPlus,
  Search,
  QrCode,
  Download,
  FileSpreadsheet,
  Printer,
  MapPin,
  Check,
  AlertCircle,
  Building2,
  Trash2,
  Edit,
  X,
  Phone,
  Hash
} from 'lucide-react';

export interface MemberRecord {
  id: string;
  memberCode: string;
  type: 'beneficiary' | 'donor' | 'volunteer' | 'general_member';
  nameEn: string;
  nameBn: string;
  fatherOrSpouse: string;
  nidOrBirthCert: string;
  mobile: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  dateOfBirth: string;
  division: string;
  district: string;
  upazila: string;
  village: string;
  branchId?: string;
  branchName?: string;
  samityId?: string;
  samityName?: string;
  povertyCategory: 'ultra_poor' | 'poor' | 'middle';
  photoUrl?: string;
  status: 'active' | 'inactive' | 'graduated';
  joinedAt: number;
}

const DEFAULT_BRANCHES = [
  { id: 'b-01', name: 'প্রধান কার্যালয় ও সাভার মূল শাখা', division: 'dhaka', district: 'dhaka' },
  { id: 'b-02', name: 'চট্টগ্রাম আঞ্চলিক শাখা', division: 'chattogram', district: 'chattogram' },
  { id: 'b-03', name: 'রাজশাহী মাঠ শাখা', division: 'rajshahi', district: 'rajshahi' },
  { id: 'b-04', name: 'খুলনা আঞ্চলিক শাখা', division: 'khulna', district: 'khulna' }
];

const DEFAULT_CENTERS = [
  { id: 'sam-01', branchId: 'b-01', name: 'সুর্যমুখী মহিলা সমিতি (সাভার)', code: 'SMT-001' },
  { id: 'sam-02', branchId: 'b-02', name: 'পদ্মা কৃষি সমবায় (হাটহাজারী)', code: 'SMT-002' },
  { id: 'sam-03', branchId: 'b-03', name: 'শাপলা গ্রামীণ উন্নয়ন কেন্দ্র (শিবগঞ্জ)', code: 'SMT-003' },
  { id: 'sam-04', branchId: 'b-01', name: 'গোলাপ সঞ্চয় ও ক্ষুদ্রঋণ কেন্দ্র', code: 'SMT-004' }
];

const INITIAL_MEMBERS: MemberRecord[] = [
  {
    id: 'm-01',
    memberCode: 'MEM-2026-0001',
    type: 'beneficiary',
    nameEn: 'Rahima Begum',
    nameBn: 'রহিমা বেগম',
    fatherOrSpouse: 'মো: জয়নাল আবেদীন (স্বামী)',
    nidOrBirthCert: '19872691234567890',
    mobile: '01712-349876',
    gender: 'female',
    bloodGroup: 'B+',
    dateOfBirth: '1987-04-12',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'সাভার',
    village: 'চাপাইন',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    samityId: 'sam-01',
    samityName: 'সুর্যমুখী মহিলা সমিতি (সাভার)',
    povertyCategory: 'ultra_poor',
    status: 'active',
    joinedAt: Date.now() - 120 * 86400000
  },
  {
    id: 'm-02',
    memberCode: 'MEM-2026-0002',
    type: 'beneficiary',
    nameEn: 'Md. Abdul Karim',
    nameBn: 'মো: আব্দুল করিম',
    fatherOrSpouse: 'মৃত রহিম উল্লাহ (পিতা)',
    nidOrBirthCert: '19751912345678123',
    mobile: '01819-876543',
    gender: 'male',
    bloodGroup: 'O+',
    dateOfBirth: '1975-08-20',
    division: 'chattogram',
    district: 'chattogram',
    upazila: 'হাটহাজারী',
    village: 'ফতেহপুর',
    branchId: 'b-02',
    branchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    samityId: 'sam-02',
    samityName: 'পদ্মা কৃষি সমবায় (হাটহাজারী)',
    povertyCategory: 'poor',
    status: 'active',
    joinedAt: Date.now() - 90 * 86400000
  },
  {
    id: 'm-03',
    memberCode: 'MEM-2026-0003',
    type: 'volunteer',
    nameEn: 'Tanvir Ahmed',
    nameBn: 'তানভীর আহমেদ',
    fatherOrSpouse: 'নজরুল ইসলাম (পিতা)',
    nidOrBirthCert: '19982619876543210',
    mobile: '01911-223344',
    gender: 'male',
    bloodGroup: 'A+',
    dateOfBirth: '1998-01-15',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'ধানমন্ডি',
    village: 'শংকর',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    povertyCategory: 'middle',
    status: 'active',
    joinedAt: Date.now() - 45 * 86400000
  }
];

export const MembersListView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant, settings } = useTenant();

  const [members, setMembers] = useState<MemberRecord[]>(() => {
    const saved = localStorage.getItem(`ngo_members_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // Loaded branches & centers from organization module
  const [branches] = useState<any[]>(() => {
    const saved = localStorage.getItem(`ngo_branches_${tenant?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((b: any) => ({
          id: b.id,
          name: b.name?.bn || b.name?.en || b.name,
          division: b.division,
          district: b.district
        }));
      } catch {}
    }
    return DEFAULT_BRANCHES;
  });

  const [centers] = useState<any[]>(() => {
    const saved = localStorage.getItem(`ngo_centers_${tenant?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          id: c.id,
          branchId: c.branchId,
          name: c.name?.bn || c.name?.en || c.name,
          code: c.code
        }));
      } catch {}
    }
    return DEFAULT_CENTERS;
  });

  const [query, setQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [selectedForIdCard, setSelectedForIdCard] = useState<MemberRecord | null>(null);

  // Cascading Form State
  const [regType, setRegType] = useState<MemberRecord['type']>('beneficiary');
  const [regGender, setRegGender] = useState<MemberRecord['gender']>('female');
  const [regBlood, setRegBlood] = useState<string>('B+');
  const [regNameEn, setRegNameEn] = useState<string>('');
  const [regNameBn, setRegNameBn] = useState<string>('');
  const [regFather, setRegFather] = useState<string>('');
  const [regNid, setRegNid] = useState<string>('');
  const [regMobile, setRegMobile] = useState<string>('');
  const [regPoverty, setRegPoverty] = useState<MemberRecord['povertyCategory']>('poor');
  const [regVillage, setRegVillage] = useState<string>('');

  // CASCADING GEOLOCATION & BRANCH/CENTER SELECTORS
  const [regDivision, setRegDivision] = useState<string>('dhaka');
  const [regDistrict, setRegDistrict] = useState<string>('dhaka');
  const [regUpazila, setRegUpazila] = useState<string>('সাভার');
  const [regBranchId, setRegBranchId] = useState<string>('b-01');
  const [regSamityId, setRegSamityId] = useState<string>('sam-01');

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Cascading filtering for form
  const availableDistricts = BD_DISTRICTS.filter((d) => d.divisionId === regDivision);
  const availableCenters = centers.filter((c) => c.branchId === regBranchId);

  const checkDuplicateNid = (nid: string) => {
    setRegNid(nid);
    if (!nid) {
      setDuplicateWarning(null);
      return;
    }
    const exists = members.find((m) => m.nidOrBirthCert === nid);
    if (exists) {
      setDuplicateWarning(
        isBangla
          ? `সতর্কতা: এই এনআইডি ইতিমধ্যে ${exists.nameBn} (${exists.memberCode}) এর নামে নিবন্ধিত রয়েছে!`
          : `Warning: NID already registered under ${exists.nameEn} (${exists.memberCode})!`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleRegisterMember = () => {
    if (!regNameEn && !regNameBn) return;
    if (!regMobile) return;

    const count = members.length + 1;
    const newCode = `MEM-2026-${String(count).padStart(4, '0')}`;

    const selectedBranch = branches.find((b) => b.id === regBranchId);
    const selectedCenter = centers.find((c) => c.id === regSamityId);

    const newMember: MemberRecord = {
      id: `m-${Date.now()}`,
      memberCode: newCode,
      type: regType,
      nameEn: regNameEn || regNameBn,
      nameBn: regNameBn || regNameEn,
      fatherOrSpouse: regFather,
      nidOrBirthCert: regNid || '19900000000000000',
      mobile: regMobile,
      gender: regGender,
      bloodGroup: regBlood,
      dateOfBirth: '1990-01-01',
      division: regDivision,
      district: regDistrict,
      upazila: regUpazila,
      village: regVillage || 'গ্রাম/মহল্লা',
      branchId: regBranchId,
      branchName: selectedBranch ? selectedBranch.name : 'প্রধান শাখা',
      samityId: regSamityId,
      samityName: selectedCenter ? selectedCenter.name : 'সুর্যমুখী মহিলা সমিতি',
      povertyCategory: regPoverty,
      status: 'active',
      joinedAt: Date.now()
    };

    const updated = [newMember, ...members];
    setMembers(updated);
    localStorage.setItem(`ngo_members_${tenant?.id}`, JSON.stringify(updated));
    setIsRegisterOpen(false);

    // Reset Form
    setRegNameEn('');
    setRegNameBn('');
    setRegNid('');
    setRegMobile('');
    setRegFather('');
    setRegVillage('');
    setDuplicateWarning(null);
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      m.nameBn.toLowerCase().includes(query.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(query.toLowerCase()) ||
      m.nidOrBirthCert.includes(query) ||
      m.mobile.includes(query);

    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesBranch = branchFilter === 'all' || m.branchId === branchFilter;

    return matchesSearch && matchesType && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'সদস্য, সুফলভোগী ও সিআরএম' : 'Members, Beneficiaries & CRM'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'বিভাগ/জেলা, শাখা এবং কেন্দ্র/সমিতি ভিত্তিক সদস্য নিবন্ধন, এনআইডি ও আইডি কার্ড প্রিন্ট।'
              : 'Register members with cascading Division/District, Branch, and Center/Samity selection.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsRegisterOpen(true)} className="text-xs h-9 bg-primary text-primary-foreground font-semibold">
            <UserPlus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন সদস্য নিবন্ধন করুন' : 'Register Member'}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isBangla ? 'নাম, কোড, ফোন বা এনআইডি...' : 'Search name, code, phone, NID...'}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background font-medium focus:outline-none"
          >
            <option value="all">{isBangla ? 'সকল শাখা (All Branches)' : 'All Branches'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:outline-none"
          >
            <option value="all">{isBangla ? 'সকল সদস্য ধরণ' : 'All Types'}</option>
            <option value="beneficiary">{isBangla ? 'সুফলভোগী' : 'Beneficiary'}</option>
            <option value="donor">{isBangla ? 'দাতা' : 'Donor'}</option>
            <option value="volunteer">{isBangla ? 'স্বেচ্ছাসেবক' : 'Volunteer'}</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          {isBangla ? `মোট ${toBanglaDigits(filtered.length)} জন প্রদর্শিত` : `Showing ${filtered.length} records`}
        </div>
      </div>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'সদস্য কোড' : 'Member Code'}</TableHead>
                <TableHead>{isBangla ? 'নাম ও পরিচয়' : 'Name & ID'}</TableHead>
                <TableHead>{isBangla ? 'শাখা ও কেন্দ্র/সমিতি' : 'Branch & Center'}</TableHead>
                <TableHead>{isBangla ? 'বিভাগ ও জেলা' : 'Geo Location'}</TableHead>
                <TableHead>{isBangla ? 'যোগাযোগ' : 'Contact'}</TableHead>
                <TableHead>{isBangla ? 'দারিদ্র্য সূচক' : 'Category'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'আইডি কার্ড' : 'ID Card'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const divObj = BD_DIVISIONS.find((d) => d.id === m.division);
                const distObj = BD_DISTRICTS.find((d) => d.id === m.district);

                return (
                  <TableRow key={m.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-xs text-primary">{m.memberCode}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{isBangla ? m.nameBn : m.nameEn}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        NID: {m.nidOrBirthCert}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{m.fatherOrSpouse}</div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span>{m.branchName || 'সাভার মূল শাখা'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        {m.samityName ? `কেন্দ্র: ${m.samityName}` : 'সাধারণ সদস্য'}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div>{isBangla ? divObj?.nameBn || m.division : divObj?.nameEn || m.division}</div>
                      <div className="text-muted-foreground text-[11px]">{isBangla ? distObj?.nameBn || m.district : distObj?.nameEn || m.district}, {m.upazila}</div>
                    </TableCell>

                    <TableCell className="text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-primary" />
                        <span>{m.mobile}</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">{m.village}</div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={m.povertyCategory === 'ultra_poor' ? 'destructive' : m.povertyCategory === 'poor' ? 'warning' : 'secondary'}
                        className="text-[10px]"
                      >
                        {m.povertyCategory === 'ultra_poor' ? (isBangla ? 'হতদরিদ্র' : 'Ultra Poor') : (isBangla ? 'দরিদ্র' : 'Poor')}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedForIdCard(m)}
                        className="h-7 text-xs px-2.5"
                      >
                        <QrCode className="w-3.5 h-3.5 mr-1 text-primary" />
                        {isBangla ? 'আইডি কার্ড' : 'Print ID'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CASCADING REGISTRATION MODAL (বিভাগ/জেলা, শাখা, কেন্দ্র/সমিতি) */}
      <Dialog
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title={isBangla ? 'নতুন সদস্য / সুফলভোগী নিবন্ধন' : 'Register Beneficiary / Member'}
        description={
          isBangla
            ? 'সদস্যের ব্যক্তিগত তথ্যের পাশাপাশি বিভাগ, জেলা, শাখা এবং কেন্দ্র/সমিতি নির্বাচন করুন।'
            : 'Select Division, District, Branch, and Center/Samity with personal info.'
        }
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2">
          {duplicateWarning && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* 1. Branch & Center Selection Header */}
          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'শাখা ও কেন্দ্র/সমিতি নির্ধারণ *' : 'Branch & Center/Samity Assignment *'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'শাখা নির্বাচন করুন (Branch) *' : 'Select Branch *'}
                </label>
                <select
                  value={regBranchId}
                  onChange={(e) => {
                    setRegBranchId(e.target.value);
                    const matchingCenters = centers.filter((c) => c.branchId === e.target.value);
                    if (matchingCenters.length > 0) {
                      setRegSamityId(matchingCenters[0].id);
                    }
                  }}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'শাখার আন্ডারে কেন্দ্র/সমিতি (Center) *' : 'Select Center/Samity *'}
                </label>
                <select
                  value={regSamityId}
                  onChange={(e) => setRegSamityId(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
                >
                  {availableCenters.length === 0 ? (
                    <option value="">এই শাখায় কেন্দ্র নেই (শাখা সেটিংস থেকে যোগ করুন)</option>
                  ) : (
                    availableCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Cascading Geo Location: Division, District, Upazila */}
          <div className="p-3.5 bg-muted/30 rounded-xl border space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'ভৌগোলিক ঠিকানা (বিভাগ, জেলা ও উপজেলা) *' : 'Geographical Location *'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'বিভাগ (Division) *' : 'Division *'}
                </label>
                <select
                  value={regDivision}
                  onChange={(e) => {
                    setRegDivision(e.target.value);
                    const firstDist = BD_DISTRICTS.find((d) => d.divisionId === e.target.value);
                    if (firstDist) setRegDistrict(firstDist.id);
                  }}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-medium"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isBangla ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'জেলা (District) *' : 'District *'}
                </label>
                <select
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-medium"
                >
                  {availableDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isBangla ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {isBangla ? 'উপজেলা / থানা *' : 'Upazila *'}
                </label>
                <Input
                  value={regUpazila}
                  onChange={(e) => setRegUpazila(e.target.value)}
                  placeholder="যেমন: সাভার"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'গ্রাম, পাড়া বা এলাকা *' : 'Village / Ward / Street *'}
              </label>
              <Input
                value={regVillage}
                onChange={(e) => setRegVillage(e.target.value)}
                placeholder="যেমন: চাপাইন, আনন্দপুর, ৩ নং ওয়ার্ড"
              />
            </div>
          </div>

          {/* 3. Personal Information */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'নাম (ইংরেজি) *' : 'Name (English) *'}</label>
              <Input value={regNameEn} onChange={(e) => setRegNameEn(e.target.value)} placeholder="Rahima Begum" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
              <Input value={regNameBn} onChange={(e) => setRegNameBn(e.target.value)} placeholder="রহিমা বেগম" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন *' : 'NID / Birth Certificate *'}</label>
              <Input value={regNid} onChange={(e) => checkDuplicateNid(e.target.value)} placeholder="10 or 17 digit NID" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মোবাইল ফোন নম্বর *' : 'Mobile Phone *'}</label>
              <Input value={regMobile} onChange={(e) => setRegMobile(e.target.value)} placeholder="01712-000000" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'পিতা বা স্বামীর নাম' : 'Father / Spouse Name'}</label>
              <Input value={regFather} onChange={(e) => setRegFather(e.target.value)} placeholder="মো: জয়নাল আবেদীন" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'লিঙ্গ *' : 'Gender *'}</label>
              <select
                value={regGender}
                onChange={(e) => setRegGender(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="female">মহিলা (Female)</option>
                <option value="male">পুরুষ (Male)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'রক্তের গ্রুপ' : 'Blood Group'}</label>
              <select
                value={regBlood}
                onChange={(e) => setRegBlood(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'সদস্যের ধরণ *' : 'Member Type *'}</label>
              <select
                value={regType}
                onChange={(e) => setRegType(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="beneficiary">সুফলভোগী (Beneficiary)</option>
                <option value="general_member">সাধারণ সদস্য (General Member)</option>
                <option value="donor">দাতা (Donor)</option>
                <option value="volunteer">স্বেচ্ছাসেবক (Volunteer)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'দারিদ্র্য সূচক' : 'Poverty Tier'}</label>
              <select
                value={regPoverty}
                onChange={(e) => setRegPoverty(e.target.value as any)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="ultra_poor">হতদরিদ্র (Ultra Poor - ভূমিহীন)</option>
                <option value="poor">দরিদ্র (Poor - প্রান্তিক কৃষক/ব্যবসায়ী)</option>
                <option value="middle">মধ্যবিত্ত (Middle Class)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsRegisterOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleRegisterMember} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'নিবন্ধন সম্পন্ন করুন' : 'Confirm Registration'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ID Card Print Preview Modal */}
      {selectedForIdCard && (
        <Dialog
          isOpen={!!selectedForIdCard}
          onClose={() => setSelectedForIdCard(null)}
          title={isBangla ? 'সদস্য ডিজিটাল কিউআর আইডি কার্ড' : 'Member QR Identity Card'}
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <div
              id="printable-member-id"
              className="w-72 mx-auto bg-white text-black border-2 border-emerald-600 rounded-2xl p-4 shadow-xl text-center space-y-3 font-sans"
            >
              <div className="border-b pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                  {tenant?.name.bn || 'জাগরণী উন্নয়ন ফাউন্ডেশন'}
                </span>
                <span className="text-xs font-bold text-gray-900">সদস্য পরিচয়পত্র (Member ID Card)</span>
              </div>

              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-600 mx-auto flex items-center justify-center font-bold text-xl text-emerald-700">
                {selectedForIdCard.nameBn.slice(0, 1)}
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-950">{selectedForIdCard.nameBn}</h4>
                <p className="text-[11px] font-mono text-gray-600">{selectedForIdCard.memberCode}</p>
              </div>

              <div className="text-left text-[11px] space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-mono text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500">শাখা:</span>
                  <span className="font-bold">{selectedForIdCard.branchName || 'সাভার শাখা'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">কেন্দ্র:</span>
                  <span className="font-bold text-emerald-700">{selectedForIdCard.samityName || 'সূর্যমুখী সমিতি'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">মোবাইল:</span>
                  <span>{selectedForIdCard.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">রক্তের গ্রুপ:</span>
                  <span className="font-bold text-rose-600">{selectedForIdCard.bloodGroup || 'B+'}</span>
                </div>
              </div>

              <div className="pt-1 flex justify-center">
                <div className="p-2 bg-white rounded-lg border shadow-sm">
                  <QrCode className="w-16 h-16 text-black" />
                </div>
              </div>

              <div className="text-[9px] text-gray-400 border-t pt-1">
                বৈধ সদস্য পরিচয়পত্র — কার্ড প্রদর্শনপূর্বক কিস্তি লেনদেন করুন
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerPrint('printable-member-id', `Member_Card_${selectedForIdCard.memberCode}`)}
                className="text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                {isBangla ? 'প্রিন্ট করুন' : 'Print Card'}
              </Button>
              <Button size="sm" onClick={() => setSelectedForIdCard(null)} className="text-xs">
                সম্পন্ন
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
