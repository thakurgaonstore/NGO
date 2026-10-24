import React, { useState, useRef } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { BD_DIVISIONS, BD_DISTRICTS, formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { triggerPrint } from '../../core/print/printHelper';
import { exportMembersToCsv } from '../../core/backup/dataBackupService';
import { DataBackupModal } from '../backup/DataBackupModal';
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
  Hash,
  Camera,
  PenTool,
  Lock,
  Unlock,
  ShieldAlert,
  Scissors,
  Database,
  FileText,
  ShieldCheck,
  Eye
} from 'lucide-react';

export interface MemberRecord {
  id: string;
  memberCode: string;
  type: 'beneficiary' | 'donor' | 'volunteer' | 'general_member';
  accountType?: 'loan' | 'savings' | 'dps'; // ঋণ হিসাব | সঞ্চয়ী হিসাব | ডিপিএস হিসাব
  nameEn: string;
  nameBn: string;
  fatherOrSpouse: string;
  motherName?: string;
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
  signatureUrl?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeNid?: string;
  nomineeMobile?: string;
  nomineePhotoUrl?: string;
  initialDeposit?: number;
  loanAmount?: number;
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
    accountType: 'loan',
    nameEn: 'Rahima Begum',
    nameBn: 'রহিমা বেগম',
    fatherOrSpouse: 'মো: জয়নাল আবেদীন (স্বামী)',
    motherName: 'মোসাঃ সালেহা খাতুন',
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
    nomineeName: 'মো: জয়নাল আবেদীন',
    nomineeRelation: 'স্বামী',
    nomineeNid: '19842691234567800',
    nomineeMobile: '01712-349877',
    loanAmount: 50000,
    initialDeposit: 5000,
    status: 'active',
    joinedAt: Date.now() - 120 * 86400000
  },
  {
    id: 'm-02',
    memberCode: 'MEM-2026-0002',
    type: 'beneficiary',
    accountType: 'savings',
    nameEn: 'Md. Abdul Karim',
    nameBn: 'মো: আব্দুল করিম',
    fatherOrSpouse: 'মৃত রহিম উল্লাহ (পিতা)',
    motherName: 'মরিয়ম বিবি',
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
    nomineeName: 'নাছিমা আক্তার',
    nomineeRelation: 'স্ত্রী',
    nomineeNid: '19791912345678120',
    nomineeMobile: '01819-876544',
    initialDeposit: 12000,
    status: 'active',
    joinedAt: Date.now() - 90 * 86400000
  },
  {
    id: 'm-03',
    memberCode: 'MEM-2026-0003',
    type: 'general_member',
    accountType: 'dps',
    nameEn: 'Tanvir Ahmed',
    nameBn: 'তানভীর আহমেদ',
    fatherOrSpouse: 'নজরুল ইসলাম (পিতা)',
    motherName: 'রোকেয়া বেগম',
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
    nomineeName: 'নজরুল ইসলাম',
    nomineeRelation: 'পিতা',
    nomineeNid: '19652619876543200',
    nomineeMobile: '01911-223300',
    initialDeposit: 2000,
    status: 'active',
    joinedAt: Date.now() - 45 * 86400000
  }
];

export const MembersListView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

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
  const [selectedForAdmissionForm, setSelectedForAdmissionForm] = useState<MemberRecord | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);

  // Manager Approval Security Modal State
  const [isManagerAuthOpen, setIsManagerAuthOpen] = useState<boolean>(false);
  const [managerPasscode, setManagerPasscode] = useState<string>('');
  const [managerAuthError, setManagerAuthError] = useState<string | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<MemberRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Registration Form State
  const [regType, setRegType] = useState<MemberRecord['type']>('beneficiary');
  const [regAccountType, setRegAccountType] = useState<MemberRecord['accountType']>('loan');
  const [regGender, setRegGender] = useState<MemberRecord['gender']>('female');
  const [regBlood, setRegBlood] = useState<string>('B+');
  const [regNameEn, setRegNameEn] = useState<string>('');
  const [regNameBn, setRegNameBn] = useState<string>('');
  const [regFather, setRegFather] = useState<string>('');
  const [regMother, setRegMother] = useState<string>('');
  const [regNid, setRegNid] = useState<string>('');
  const [regMobile, setRegMobile] = useState<string>('');
  const [regPoverty, setRegPoverty] = useState<MemberRecord['povertyCategory']>('poor');
  const [regVillage, setRegVillage] = useState<string>('');
  const [regInitialAmount, setRegInitialAmount] = useState<string>('5000');

  // Image & Signature file states (Base64)
  const [regPhoto, setRegPhoto] = useState<string>('');
  const [regSignature, setRegSignature] = useState<string>('');
  const [regNomineeName, setRegNomineeName] = useState<string>('');
  const [regNomineeRelation, setRegNomineeRelation] = useState<string>('স্বামী');
  const [regNomineeNid, setRegNomineeNid] = useState<string>('');
  const [regNomineeMobile, setRegNomineeMobile] = useState<string>('');
  const [regNomineePhoto, setRegNomineePhoto] = useState<string>('');

  // Edit Form State (Populated when Manager approves)
  const [editForm, setEditForm] = useState<Partial<MemberRecord>>({});

  // CASCADING GEOLOCATION & BRANCH/CENTER SELECTORS
  const [regDivision, setRegDivision] = useState<string>('dhaka');
  const [regDistrict, setRegDistrict] = useState<string>('dhaka');
  const [regUpazila, setRegUpazila] = useState<string>('সাভার');
  const [regBranchId, setRegBranchId] = useState<string>('b-01');
  const [regSamityId, setRegSamityId] = useState<string>('sam-01');

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'signature' | 'nomineePhoto' | 'editPhoto' | 'editSig') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (field === 'photo') setRegPhoto(dataUrl);
      if (field === 'signature') setRegSignature(dataUrl);
      if (field === 'nomineePhoto') setRegNomineePhoto(dataUrl);
      if (field === 'editPhoto') setEditForm((prev) => ({ ...prev, photoUrl: dataUrl }));
      if (field === 'editSig') setEditForm((prev) => ({ ...prev, signatureUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

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
    const numAmount = parseFloat(regInitialAmount) || 0;

    const newMember: MemberRecord = {
      id: `m-${Date.now()}`,
      memberCode: newCode,
      type: regType,
      accountType: regAccountType || 'loan',
      nameEn: regNameEn || regNameBn,
      nameBn: regNameBn || regNameEn,
      fatherOrSpouse: regFather,
      motherName: regMother,
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
      branchName: selectedBranch ? selectedBranch.name : 'প্রধান কার্যালয় ও সাভার মূল শাখা',
      samityId: regSamityId,
      samityName: selectedCenter ? selectedCenter.name : 'সুর্যমুখী মহিলা সমিতি (সাভার)',
      povertyCategory: regPoverty,
      photoUrl: regPhoto,
      signatureUrl: regSignature,
      nomineeName: regNomineeName,
      nomineeRelation: regNomineeRelation,
      nomineeNid: regNomineeNid,
      nomineeMobile: regNomineeMobile,
      nomineePhotoUrl: regNomineePhoto,
      loanAmount: regAccountType === 'loan' ? (numAmount || 50000) : undefined,
      initialDeposit: regAccountType !== 'loan' ? (numAmount || 5000) : 1000,
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
    setRegMother('');
    setRegVillage('');
    setRegPhoto('');
    setRegSignature('');
    setRegNomineeName('');
    setRegNomineeNid('');
    setRegNomineeMobile('');
    setRegNomineePhoto('');
    setDuplicateWarning(null);

    // Prompt to print admission form immediately
    setSelectedForAdmissionForm(newMember);
  };

  // Trigger Manager Authorization Modal before Edit
  const handleInitiateEdit = (member: MemberRecord) => {
    setMemberToEdit(member);
    setManagerPasscode('');
    setManagerAuthError(null);
    setIsManagerAuthOpen(true);
  };

  // Verify Manager Passcode
  const handleVerifyManagerPasscode = () => {
    const validCodes = ['mgr123', 'manager', '1234', 'admin', 'pass123'];
    if (validCodes.includes(managerPasscode.trim().toLowerCase())) {
      setIsManagerAuthOpen(false);
      setEditForm(memberToEdit ? { ...memberToEdit } : {});
      setIsEditModalOpen(true);
    } else {
      setManagerAuthError(
        isBangla
          ? 'অনুমোদন ব্যর্থ: শাখা ব্যবস্থাপকের সঠিক পাসকোড প্রদান করুন! (ডিফল্ট: mgr123)'
          : 'Authorization Failed: Incorrect Branch Manager Passcode! (Default: mgr123)'
      );
    }
  };

  // Save Edited Member
  const handleSaveEdit = () => {
    if (!memberToEdit) return;

    const updatedList = members.map((m) => {
      if (m.id === memberToEdit.id) {
        return {
          ...m,
          ...editForm
        } as MemberRecord;
      }
      return m;
    });

    setMembers(updatedList);
    localStorage.setItem(`ngo_members_${tenant?.id}`, JSON.stringify(updatedList));
    setIsEditModalOpen(false);
    setMemberToEdit(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    exportMembersToCsv(members, `${tenant?.name?.bn || 'NGO'}_Members_List`);
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
    <div className="space-y-5 font-sans">
      {/* Top Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>{isBangla ? 'সদস্য, সুফলভোগী ও ভর্তি ফরম' : 'Members, Beneficiaries & Forms'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'ছবি ও সিগনেচার সহ সদস্য নিবন্ধন, দ্বৈত-কপি A4 ফরম প্রিন্ট ও শাখা ব্যবস্থাপক অনুমোদন ট্র্যাকিং।'
              : 'Register members with photo & signature, print dual-copy A4 admission forms, and manager authorization.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs h-9 font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            title="সকল সদস্যের তালিকা এক্সেল CSV তে ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>{isBangla ? 'এক্সেল এক্সপোর্ট' : 'Export CSV'}</span>
          </Button>

          {/* Full Backup Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBackupOpen(true)}
            className="text-xs h-9 font-semibold text-primary border-primary/30 hover:bg-primary/5"
            title="ফুল এনজিও ডাটা ব্যাকআপ ও রিস্টোর"
          >
            <Database className="w-4 h-4 mr-1.5" />
            <span>{isBangla ? 'ডাটা ব্যাকআপ' : 'Full Backup'}</span>
          </Button>

          {/* Register Member Trigger */}
          <Button
            onClick={() => setIsRegisterOpen(true)}
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>{isBangla ? 'নতুন সদস্য ভর্তি করুন' : 'Register Member'}</span>
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
            className="h-9 px-3 text-xs rounded-lg border border-input bg-background font-medium focus:outline-none"
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
            className="h-9 px-3 text-xs rounded-lg border border-input bg-background focus:outline-none font-medium"
          >
            <option value="all">{isBangla ? 'সকল সদস্য ধরণ' : 'All Types'}</option>
            <option value="beneficiary">{isBangla ? 'সুফলভোগী' : 'Beneficiary'}</option>
            <option value="general_member">{isBangla ? 'সাধারণ সদস্য' : 'General Member'}</option>
            <option value="donor">{isBangla ? 'দাতা' : 'Donor'}</option>
            <option value="volunteer">{isBangla ? 'স্বেচ্ছাসেবক' : 'Volunteer'}</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono font-medium">
          {isBangla ? `মোট ${toBanglaDigits(filtered.length)} জন প্রদর্শিত` : `Showing ${filtered.length} records`}
        </div>
      </div>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'ছবি' : 'Photo'}</TableHead>
                <TableHead>{isBangla ? 'সদস্য কোড ও ধরণ' : 'Code & Type'}</TableHead>
                <TableHead>{isBangla ? 'নাম ও পরিচয়' : 'Name & ID'}</TableHead>
                <TableHead>{isBangla ? 'শাখা ও কেন্দ্র' : 'Branch & Samity'}</TableHead>
                <TableHead>{isBangla ? 'যোগাযোগ ও এলাকা' : 'Contact'}</TableHead>
                <TableHead className="text-center">{isBangla ? 'ফরম (A4)' : 'A4 Form'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'অ্যাকশন' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const accountTitle =
                  m.accountType === 'loan'
                    ? 'ঋণ হিসাব'
                    : m.accountType === 'dps'
                    ? 'ডিপিএস হিসাব'
                    : 'সঞ্চয়ী হিসাব';

                return (
                  <TableRow key={m.id} className="hover:bg-muted/30">
                    {/* Member Photo thumbnail */}
                    <TableCell className="w-12">
                      {m.photoUrl ? (
                        <img
                          src={m.photoUrl}
                          alt={m.nameBn}
                          className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                          {m.nameBn.slice(0, 1)}
                        </div>
                      )}
                    </TableCell>

                    {/* Member Code & Account Title */}
                    <TableCell>
                      <div className="font-mono font-bold text-xs text-primary">{m.memberCode}</div>
                      <Badge
                        variant={m.accountType === 'loan' ? 'warning' : 'outline'}
                        className="text-[9.5px] mt-0.5 px-1.5 py-0"
                      >
                        {accountTitle}
                      </Badge>
                    </TableCell>

                    {/* Name & NID */}
                    <TableCell>
                      <div className="font-bold text-xs text-foreground">{m.nameBn}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">NID: {m.nidOrBirthCert}</div>
                      <div className="text-[10px] text-muted-foreground">{m.fatherOrSpouse}</div>
                    </TableCell>

                    {/* Branch & Center */}
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span className="truncate max-w-[150px]">{m.branchName || 'প্রধান শাখা'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        {m.samityName ? m.samityName : 'সাধারণ সদস্য'}
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-primary" />
                        <span>{m.mobile}</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">{m.village}, {m.upazila}</div>
                    </TableCell>

                    {/* A4 Printable Admission Form View Trigger */}
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedForAdmissionForm(m)}
                        className="h-7 text-xs px-2.5 font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        title="দ্বৈত কপি (অফিস ও গ্রাহক কপি) A4 ভর্তি ফরম দেখুন ও প্রিন্ট করুন"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        <span>{isBangla ? 'ভর্তি ফরম (A4)' : 'Print A4 Form'}</span>
                      </Button>
                    </TableCell>

                    {/* Actions: Edit (Requires Branch Manager Auth) & ID Card */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedForIdCard(m)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title={isBangla ? 'আইডি কার্ড প্রিন্ট' : 'ID Card'}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit Button with Branch Manager Protection */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInitiateEdit(m)}
                          className="h-7 text-xs px-2 text-amber-700 hover:bg-amber-50 font-semibold"
                          title="তথ্য পরিবর্তন (শাখা ম্যানেজারের অনুমোদন প্রয়োজন)"
                        >
                          <Lock className="w-3 h-3 mr-1 text-amber-600" />
                          <span>{isBangla ? 'সংশোধন' : 'Edit'}</span>
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

      {/* ========================================================================= */}
      {/* 1. NEW MEMBER REGISTRATION MODAL (With Photo, Signature & Account Type)   */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title={
          <div className="flex items-center gap-2 text-foreground font-bold">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <span>{isBangla ? 'নতুন সদস্য ভর্তি ও হিসাব ফরম নিবন্ধন' : 'Register New Member & Account'}</span>
          </div>
        }
        description={
          isBangla
            ? 'সদস্যের ছবি, সিগনেচার, নমিনী ও হিসাবের ধরণ নির্বাচন করুন। সফল নিবন্ধনের পর সরাসরি A4 ভর্তি ফরম প্রিন্ট হবে।'
            : 'Enter member details with photo & signature upload. Printable A4 form will be generated automatically.'
        }
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
          {duplicateWarning && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Account Title & Type Header Banner */}
          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'হিসাবের ধরণ ও শিরোনাম নির্ধারণ *' : 'Account Type & Title *'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  regAccountType === 'loan'
                    ? 'border-emerald-600 bg-emerald-600/10 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-border bg-background hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="accType"
                  checked={regAccountType === 'loan'}
                  onChange={() => setRegAccountType('loan')}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="leading-tight">ঋণ হিসাব</div>
                  <div className="text-[10px] text-muted-foreground font-normal">ক্ষুদ্রঋণ ও বিতরণ</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  regAccountType === 'savings'
                    ? 'border-emerald-600 bg-emerald-600/10 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-border bg-background hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="accType"
                  checked={regAccountType === 'savings'}
                  onChange={() => setRegAccountType('savings')}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="leading-tight">সঞ্চয়ী হিসাব</div>
                  <div className="text-[10px] text-muted-foreground font-normal">সাধারণ সঞ্চয় পাসবই</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  regAccountType === 'dps'
                    ? 'border-emerald-600 bg-emerald-600/10 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-border bg-background hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="accType"
                  checked={regAccountType === 'dps'}
                  onChange={() => setRegAccountType('dps')}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="leading-tight">ডিপিএস হিসাব</div>
                  <div className="text-[10px] text-muted-foreground font-normal">মাসিক সঞ্চয় স্কিম</div>
                </div>
              </label>
            </div>
          </div>

          {/* Photo & Signature Upload Section */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'সদস্যের ছবি ও স্বাক্ষর আপলোড' : 'Photo & Signature Upload'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Member Photo */}
              <div className="flex items-center gap-3 p-2 bg-background rounded-lg border">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border shrink-0">
                  {regPhoto ? (
                    <img src={regPhoto} alt="Member" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold block text-foreground">
                    {isBangla ? 'সদস্যের ছবি' : 'Member Photo'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    className="text-[11px] text-muted-foreground file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-emerald-600 file:text-white cursor-pointer"
                  />
                  {regPhoto && (
                    <button
                      type="button"
                      onClick={() => setRegPhoto('')}
                      className="text-[10px] text-rose-600 hover:underline block"
                    >
                      ছবি মুছুন
                    </button>
                  )}
                </div>
              </div>

              {/* Member Signature */}
              <div className="flex items-center gap-3 p-2 bg-background rounded-lg border">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border shrink-0">
                  {regSignature ? (
                    <img src={regSignature} alt="Signature" className="w-full h-full object-contain p-1" />
                  ) : (
                    <PenTool className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold block text-foreground">
                    {isBangla ? 'সদস্যের স্বাক্ষর / টিপসহি' : 'Member Signature'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'signature')}
                    className="text-[11px] text-muted-foreground file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary file:text-white cursor-pointer"
                  />
                  {regSignature && (
                    <button
                      type="button"
                      onClick={() => setRegSignature('')}
                      className="text-[10px] text-rose-600 hover:underline block"
                    >
                      স্বাক্ষর মুছুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Branch & Center / Samity Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'শাখা নির্বাচন করুন *' : 'Select Branch *'}
              </label>
              <select
                value={regBranchId}
                onChange={(e) => {
                  setRegBranchId(e.target.value);
                  const matching = centers.filter((c) => c.branchId === e.target.value);
                  if (matching.length > 0) setRegSamityId(matching[0].id);
                }}
                className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
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
                {isBangla ? 'কেন্দ্র / সমিতি *' : 'Center / Samity *'}
              </label>
              <select
                value={regSamityId}
                onChange={(e) => setRegSamityId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
              >
                {availableCenters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
              <Input value={regNameBn} onChange={(e) => setRegNameBn(e.target.value)} placeholder="রহিমা বেগম" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'নাম (ইংরেজি) *' : 'Name (English) *'}</label>
              <Input value={regNameEn} onChange={(e) => setRegNameEn(e.target.value)} placeholder="Rahima Begum" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'পিতা বা স্বামীর নাম *' : 'Father / Spouse *'}</label>
              <Input value={regFather} onChange={(e) => setRegFather(e.target.value)} placeholder="মো: জয়নাল আবেদীন" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মাতার নাম' : 'Mother Name'}</label>
              <Input value={regMother} onChange={(e) => setRegMother(e.target.value)} placeholder="মোসাঃ সালেহা খাতুন" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'এনআইডি / জন্ম সনদ *' : 'NID *'}</label>
              <Input value={regNid} onChange={(e) => checkDuplicateNid(e.target.value)} placeholder="10 or 17 digit NID" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মোবাইল নম্বর *' : 'Mobile *'}</label>
              <Input value={regMobile} onChange={(e) => setRegMobile(e.target.value)} placeholder="01712-000000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'রক্তের গ্রুপ' : 'Blood Group'}</label>
              <select
                value={regBlood}
                onChange={(e) => setRegBlood(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-mono"
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

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'উপজেলা' : 'Upazila'}</label>
              <Input value={regUpazila} onChange={(e) => setRegUpazila(e.target.value)} placeholder="সাভার" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'গ্রাম ও পাড়া' : 'Village / Address'}</label>
              <Input value={regVillage} onChange={(e) => setRegVillage(e.target.value)} placeholder="চাপাইন, আনন্দপুর" />
            </div>
          </div>

          {/* Nominee Details Section */}
          <div className="p-3 bg-muted/20 rounded-xl border border-border space-y-2.5">
            <h4 className="text-xs font-bold text-foreground">
              {isBangla ? 'নমিনীর বিবরণ (Nominee Information)' : 'Nominee Information'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{isBangla ? 'নমিনীর নাম' : 'Nominee Name'}</label>
                <Input value={regNomineeName} onChange={(e) => setRegNomineeName(e.target.value)} placeholder="নমিনীর নাম" className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{isBangla ? 'সম্পর্ক' : 'Relation'}</label>
                <Input value={regNomineeRelation} onChange={(e) => setRegNomineeRelation(e.target.value)} placeholder="যেমন: স্বামী / স্ত্রী / পুত্র" className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{isBangla ? 'নমিনীর মোবাইল' : 'Nominee Mobile'}</label>
                <Input value={regNomineeMobile} onChange={(e) => setRegNomineeMobile(e.target.value)} placeholder="01700-000000" className="h-8 text-xs" />
              </div>
            </div>
          </div>

          {/* Initial Amount / Loan Amount */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                {regAccountType === 'loan' ? 'অনুমোদিত ঋণ পরিমাণ (টাকা)' : 'প্রারম্ভিক জমা / কিস্তি পরিমাণ (টাকা)'}
              </span>
              <span className="text-[10px] text-emerald-700">ভর্তি ফরমের শিরোনামে লিপিবদ্ধ থাকবে</span>
            </div>
            <div className="w-36">
              <Input
                type="number"
                value={regInitialAmount}
                onChange={(e) => setRegInitialAmount(e.target.value)}
                className="h-8 text-xs font-bold font-mono text-right bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsRegisterOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleRegisterMember} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'ভর্তি সম্পন্ন ও A4 ফরম প্রিন্ট' : 'Save & Print A4 Form'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* 2. BRANCH MANAGER APPROVAL SECURITY MODAL (For modifying member data)    */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isManagerAuthOpen}
        onClose={() => setIsManagerAuthOpen(false)}
        title={
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Lock className="w-5 h-5 text-amber-600" />
            <span>{isBangla ? 'শাখা ব্যবস্থাপকের অনুমতি ও সিকিউরিটি পাসকোড' : 'Branch Manager Authorization Required'}</span>
          </div>
        }
        description={
          isBangla
            ? 'সদস্যের তথ্য, এনআইডি বা হিসাব পরিবর্তন করার জন্য শাখা ব্যবস্থাপকের অনুমতি প্রয়োজন।'
            : 'Branch manager approval and authorization passcode is required to modify member records.'
        }
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {managerAuthError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{managerAuthError}</span>
            </div>
          )}

          <div className="p-3 bg-muted/40 rounded-xl border space-y-1 text-xs">
            <div className="text-muted-foreground">সদস্যের নাম: <strong className="text-foreground">{memberToEdit?.nameBn}</strong></div>
            <div className="text-muted-foreground">সদস্য কোড: <span className="font-mono font-bold text-primary">{memberToEdit?.memberCode}</span></div>
            <div className="text-muted-foreground">শাখা: <strong className="text-foreground">{memberToEdit?.branchName}</strong></div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              {isBangla ? 'শাখা ব্যবস্থাপক পাসকোড প্রদান করুন *' : 'Enter Manager Passcode *'}
            </label>
            <Input
              type="password"
              value={managerPasscode}
              onChange={(e) => setManagerPasscode(e.target.value)}
              placeholder="পাসকোড লিখুন (যেমন: mgr123)"
              className="text-xs h-9 font-mono"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground">
              ডিফল্ট ম্যানেজার ডেমো পাসকোড: <code className="bg-muted px-1 py-0.5 rounded font-bold">mgr123</code>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsManagerAuthOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              onClick={handleVerifyManagerPasscode}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              {isBangla ? 'অনুমোদন দিন ও সম্পাদনা করুন' : 'Authorize & Edit'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. MEMBER EDIT MODAL (Opened AFTER Manager Approval)                     */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-foreground font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{isBangla ? 'সদস্যের তথ্য সংশোধন (ম্যানেজার অনুমোদিত)' : 'Edit Member Info (Manager Approved)'}</span>
          </div>
        }
        description={
          isBangla
            ? `সদস্য "${editForm.nameBn}" (${editForm.memberCode}) এর পরিবর্তিত তথ্য সংরক্ষণ করুন।`
            : 'Update member particulars and save modifications.'
        }
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'নাম (বাংলা)' : 'Name (Bangla)'}</label>
              <Input
                value={editForm.nameBn || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nameBn: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'নাম (ইংরেজি)' : 'Name (English)'}</label>
              <Input
                value={editForm.nameEn || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nameEn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মোবাইল নম্বর' : 'Mobile'}</label>
              <Input
                value={editForm.mobile || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'এনআইডি' : 'NID'}</label>
              <Input
                value={editForm.nidOrBirthCert || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nidOrBirthCert: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'পিতা বা স্বামী' : 'Father/Spouse'}</label>
              <Input
                value={editForm.fatherOrSpouse || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fatherOrSpouse: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'গ্রাম/ঠিকানা' : 'Address'}</label>
              <Input
                value={editForm.village || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, village: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl border">
            <div className="w-14 h-14 rounded-lg bg-background border flex items-center justify-center overflow-hidden shrink-0">
              {editForm.photoUrl ? (
                <img src={editForm.photoUrl} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold block">{isBangla ? 'ছবি পরিবর্তন' : 'Change Photo'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'editPhoto')}
                className="text-xs file:py-0.5 file:px-2 file:border-0 file:rounded file:bg-primary file:text-white file:text-[10px] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Check className="w-3.5 h-3.5 mr-1.5" />
              {isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. A4 DUAL-COPY ADMISSION & ACCOUNT OPENING FORM (Office Copy + Member Copy)*/}
      {/* ========================================================================= */}
      {selectedForAdmissionForm && (
        <Dialog
          isOpen={!!selectedForAdmissionForm}
          onClose={() => setSelectedForAdmissionForm(null)}
          title={
            <div className="flex items-center gap-2 text-foreground font-bold text-base">
              <Printer className="w-5 h-5 text-emerald-600" />
              <span>{isBangla ? 'A4 পেপার ভর্তি ও হিসাব আবেদন ফরম (দ্বৈত কপি)' : 'A4 Admission & Account Form (Dual Copy)'}</span>
            </div>
          }
          description={
            isBangla
              ? 'একটি A4 পেপারে অফিস কপি ও গ্রাহক কপি একসাথে প্রিন্ট হবে। মাঝখান থেকে কেটে একটি অফিসে সংরক্ষণ ও একটি গ্রাহককে প্রদান করুন।'
              : 'Printable dual-copy form on standard A4 paper: Office Copy & Customer Copy with separation line.'
          }
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-1">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border">
              <div className="text-xs text-muted-foreground">
                হিসাবের শিরোনাম: <strong className="text-foreground">
                  {selectedForAdmissionForm.accountType === 'loan'
                    ? 'সদস্য ভর্তি ও ক্ষুদ্রঋণ হিসাব আবেদন ফরম'
                    : selectedForAdmissionForm.accountType === 'dps'
                    ? 'সদস্য ভর্তি ও মাসিক ডিপিএস হিসাব ফরম'
                    : 'সদস্য ভর্তি ও সাধারণ সঞ্চয়ী হিসাব ফরম'}
                </strong>
              </div>
              <Button
                size="sm"
                onClick={() => triggerPrint('printable-admission-form', `Admission_Form_${selectedForAdmissionForm.memberCode}`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                <span>{isBangla ? 'A4 পেপারে প্রিন্ট করুন' : 'Print A4 Form'}</span>
              </Button>
            </div>

            {/* A4 PRINT CONTAINER (Visible on Screen & Isolated during Print) */}
            <div className="max-h-[68vh] overflow-y-auto p-1 bg-gray-100 rounded-xl border border-gray-300">
              <div
                id="printable-admission-form"
                className="bg-white text-black p-6 mx-auto shadow-md font-sans text-xs"
                style={{ width: '100%', maxWidth: '210mm' }}
              >
                {/* ------------------------------------------------------------- */}
                {/* 1. OFFICE COPY (উপরের অংশ: অফিস কপি)                            */}
                {/* ------------------------------------------------------------- */}
                <div className="border-2 border-gray-900 p-3.5 rounded-lg space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b-2 border-gray-900 pb-2">
                    <div className="space-y-0.5">
                      <h2 className="text-base font-extrabold text-gray-950 uppercase tracking-tight">
                        {tenant?.name.bn || 'জাগরণী উন্নয়ন ফাউন্ডেশন'}
                      </h2>
                      <p className="text-[10px] text-gray-700">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত | এমআরএ সনদ নং: MRA-00289
                      </p>
                      <p className="text-[10px] text-gray-600">
                        শাখা: {selectedForAdmissionForm.branchName || 'সাভার মূল শাখা'} | কেন্দ্র: {selectedForAdmissionForm.samityName || 'সূর্যমুখী সমিতি'}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded">
                        অফিস কপি (Office Copy)
                      </span>
                      <div className="text-[10px] font-mono text-gray-800">
                        ফরম নং: <strong className="text-gray-950">{selectedForAdmissionForm.memberCode}</strong>
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono">
                        তারিখ: {new Date(selectedForAdmissionForm.joinedAt).toLocaleDateString('bn-BD')}
                      </div>
                    </div>
                  </div>

                  {/* Form Title Banner with Account Type Checkboxes */}
                  <div className="bg-gray-100 p-1.5 text-center rounded border border-gray-400">
                    <h3 className="font-bold text-xs text-gray-900">
                      {selectedForAdmissionForm.accountType === 'loan'
                        ? 'সদস্য ভর্তি ও ক্ষুদ্রঋণ হিসাব আবেদন ফরম'
                        : selectedForAdmissionForm.accountType === 'dps'
                        ? 'সদস্য ভর্তি ও মাসিক ডিপিএস (DPS) হিসাব ফরম'
                        : 'সদস্য ভর্তি ও সাধারণ সঞ্চয়ী হিসাব আবেদন ফরম'}
                    </h3>
                    <div className="flex justify-center gap-4 text-[10px] text-gray-800 font-medium mt-0.5">
                      <span>[{selectedForAdmissionForm.accountType === 'loan' ? '✔' : ' '}] ঋণ হিসাব</span>
                      <span>[{selectedForAdmissionForm.accountType === 'savings' || !selectedForAdmissionForm.accountType ? '✔' : ' '}] সঞ্চয়ী হিসাব</span>
                      <span>[{selectedForAdmissionForm.accountType === 'dps' ? '✔' : ' '}] ডিপিএস হিসাব</span>
                    </div>
                  </div>

                  {/* Member Data Grid with Photo & Signature */}
                  <div className="grid grid-cols-12 gap-2 pt-1">
                    {/* Details Table (10 cols) */}
                    <div className="col-span-9">
                      <table className="w-full text-[10.5px] border-collapse border border-gray-400">
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="p-1 font-bold bg-gray-50 w-28 border-r border-gray-300">সদস্যের নাম:</td>
                            <td className="p-1 font-bold text-gray-950">{selectedForAdmissionForm.nameBn} ({selectedForAdmissionForm.nameEn})</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="p-1 font-bold bg-gray-50 border-r border-gray-300">পিতা/স্বামীর নাম:</td>
                            <td className="p-1">{selectedForAdmissionForm.fatherOrSpouse}</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="p-1 font-bold bg-gray-50 border-r border-gray-300">এনআইডি / জন্ম সনদ:</td>
                            <td className="p-1 font-mono font-semibold">{selectedForAdmissionForm.nidOrBirthCert}</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="p-1 font-bold bg-gray-50 border-r border-gray-300">মোবাইল নম্বর:</td>
                            <td className="p-1 font-mono">{selectedForAdmissionForm.mobile}</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="p-1 font-bold bg-gray-50 border-r border-gray-300">ঠিকানা:</td>
                            <td className="p-1">{selectedForAdmissionForm.village}, {selectedForAdmissionForm.upazila}, {selectedForAdmissionForm.district}</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="p-1 font-bold bg-gray-50 border-r border-gray-300">নমিনীর নাম ও সম্পর্ক:</td>
                            <td className="p-1">{selectedForAdmissionForm.nomineeName || 'উল্লেখিত নয়'} ({selectedForAdmissionForm.nomineeRelation || 'নমিনী'})</td>
                          </tr>
                          <tr>
                            <td className="p-1 font-bold bg-gray-50 border-r border-gray-300">হিসাবের পরিমাণ:</td>
                            <td className="p-1 font-mono font-bold text-emerald-800">
                              {selectedForAdmissionForm.accountType === 'loan'
                                ? `অনুমোদিত ঋণ: ৳ ${toBanglaDigits(selectedForAdmissionForm.loanAmount || 50000)}`
                                : `প্রারম্ভিক সঞ্চয়: ৳ ${toBanglaDigits(selectedForAdmissionForm.initialDeposit || 5000)}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Member Photo Box (3 cols) */}
                    <div className="col-span-3 flex flex-col items-center justify-between border border-gray-400 p-1 rounded bg-gray-50">
                      <div className="w-20 h-24 border border-dashed border-gray-500 rounded flex items-center justify-center overflow-hidden bg-white">
                        {selectedForAdmissionForm.photoUrl ? (
                          <img src={selectedForAdmissionForm.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-gray-500 text-center leading-tight">সদস্যের পাসপোর্ট ছবি</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-600 mt-1">পাসপোর্ট ছবি</span>
                    </div>
                  </div>

                  {/* Signatures Row */}
                  <div className="pt-4 flex items-end justify-between text-center text-[10px] text-gray-800">
                    <div className="w-36">
                      {selectedForAdmissionForm.signatureUrl ? (
                        <img src={selectedForAdmissionForm.signatureUrl} alt="Signature" className="h-7 mx-auto object-contain mb-0.5" />
                      ) : (
                        <div className="h-6" />
                      )}
                      <div className="border-t border-gray-800 pt-0.5 font-bold">সদস্যের স্বাক্ষর / টিপসহি</div>
                    </div>

                    <div className="w-36">
                      <div className="h-6" />
                      <div className="border-t border-gray-800 pt-0.5 font-bold">মাঠ কর্মকর্তার স্বাক্ষর</div>
                    </div>

                    <div className="w-40">
                      <div className="h-6" />
                      <div className="border-t border-gray-800 pt-0.5 font-bold">শাখা ব্যবস্থাপকের সীল ও স্বাক্ষর</div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* ✂ CUTTING SEPARATION LINE (কাঁচির দাগ)                           */}
                {/* ------------------------------------------------------------- */}
                <div className="py-2.5 my-2 border-t-2 border-dashed border-gray-500 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono">
                  <Scissors className="w-3.5 h-3.5 text-gray-600" />
                  <span>অফিস থেকে কেটে গ্রাহককে প্রদান করুন (Cut along line & hand over to member)</span>
                  <Scissors className="w-3.5 h-3.5 text-gray-600" />
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. MEMBER COPY (নিচের অংশ: গ্রাহক / সদস্য কপি)                   */}
                {/* ------------------------------------------------------------- */}
                <div className="border-2 border-emerald-800 p-3.5 rounded-lg space-y-2 bg-emerald-50/20">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-2">
                    <div className="space-y-0.5">
                      <h2 className="text-base font-extrabold text-emerald-950 uppercase tracking-tight">
                        {tenant?.name.bn || 'জাগরণী উন্নয়ন ফাউন্ডেশন'}
                      </h2>
                      <p className="text-[10px] text-gray-700">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত | এমআরএ সনদ নং: MRA-00289
                      </p>
                      <p className="text-[10px] text-gray-600">
                        শাখা: {selectedForAdmissionForm.branchName || 'সাভার মূল শাখা'} | কেন্দ্র: {selectedForAdmissionForm.samityName || 'সূর্যমুখী সমিতি'}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-emerald-800 text-white text-[10px] font-bold rounded">
                        গ্রাহক কপি (Member Copy)
                      </span>
                      <div className="text-[10px] font-mono text-gray-800">
                        হিসাব নং: <strong className="text-emerald-950">{selectedForAdmissionForm.memberCode}</strong>
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono">
                        তারিখ: {new Date(selectedForAdmissionForm.joinedAt).toLocaleDateString('bn-BD')}
                      </div>
                    </div>
                  </div>

                  {/* Form Title Banner with Account Title */}
                  <div className="bg-emerald-100/60 p-1.5 text-center rounded border border-emerald-400">
                    <h3 className="font-bold text-xs text-emerald-950">
                      {selectedForAdmissionForm.accountType === 'loan'
                        ? 'সদস্য ভর্তি ও ক্ষুদ্রঋণ হিসাব আবেদন ফরম (গ্রাহক রশিদ)'
                        : selectedForAdmissionForm.accountType === 'dps'
                        ? 'সদস্য ভর্তি ও মাসিক ডিপিএস (DPS) হিসাব ফরম (গ্রাহক রশিদ)'
                        : 'সদস্য ভর্তি ও সাধারণ সঞ্চয়ী হিসাব আবেদন ফরম (গ্রাহক রশিদ)'}
                    </h3>
                  </div>

                  {/* Compact Particulars */}
                  <div className="grid grid-cols-12 gap-2 pt-1">
                    <div className="col-span-9">
                      <table className="w-full text-[10.5px] border-collapse border border-emerald-300">
                        <tbody>
                          <tr className="border-b border-emerald-200">
                            <td className="p-1 font-bold bg-emerald-50 w-28 border-r border-emerald-200">গ্রাহকের নাম:</td>
                            <td className="p-1 font-bold text-gray-950">{selectedForAdmissionForm.nameBn}</td>
                          </tr>
                          <tr className="border-b border-emerald-200">
                            <td className="p-1 font-bold bg-emerald-50 border-r border-emerald-200">এনআইডি নম্বর:</td>
                            <td className="p-1 font-mono font-semibold">{selectedForAdmissionForm.nidOrBirthCert}</td>
                          </tr>
                          <tr className="border-b border-emerald-200">
                            <td className="p-1 font-bold bg-emerald-50 border-r border-emerald-200">মোবাইল নম্বর:</td>
                            <td className="p-1 font-mono">{selectedForAdmissionForm.mobile}</td>
                          </tr>
                          <tr className="border-b border-emerald-200">
                            <td className="p-1 font-bold bg-emerald-50 border-r border-emerald-200">হিসাবের বিবরণ:</td>
                            <td className="p-1 font-bold text-emerald-900">
                              {selectedForAdmissionForm.accountType === 'loan'
                                ? `মঞ্জুরীকৃত ঋণ: ৳ ${toBanglaDigits(selectedForAdmissionForm.loanAmount || 50000)} (সাপ্তাহিক কিস্তি)`
                                : `প্রারম্ভিক জমা: ৳ ${toBanglaDigits(selectedForAdmissionForm.initialDeposit || 5000)}`}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1 font-bold bg-emerald-50 border-r border-emerald-200">জরুরী হেল্পলাইন:</td>
                            <td className="p-1 font-mono text-gray-700">০১৭০০-০০০০০০ (অফিস চলাকালীন)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="col-span-3 flex flex-col items-center justify-center border border-emerald-300 p-1 rounded bg-white">
                      <div className="w-18 h-20 border border-dashed border-emerald-400 rounded flex items-center justify-center overflow-hidden">
                        {selectedForAdmissionForm.photoUrl ? (
                          <img src={selectedForAdmissionForm.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-emerald-700 text-center leading-tight">সদস্যের ছবি</span>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-800 mt-1">গ্রাহক কপি ছবি</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-3 flex items-end justify-between text-center text-[10px] text-gray-800">
                    <div className="w-36">
                      <div className="border-t border-emerald-900 pt-0.5 font-bold">গ্রাহকের স্বাক্ষর</div>
                    </div>
                    <div className="w-36">
                      <div className="border-t border-emerald-900 pt-0.5 font-bold">আদায়কারী কর্মকর্তার স্বাক্ষর</div>
                    </div>
                    <div className="w-40">
                      <div className="border-t border-emerald-900 pt-0.5 font-bold">শাখা ব্যবস্থাপকের সীল ও স্বাক্ষর</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedForAdmissionForm(null)} className="text-xs">
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button
                size="sm"
                onClick={() => triggerPrint('printable-admission-form', `Admission_Form_${selectedForAdmissionForm.memberCode}`)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                {isBangla ? 'প্রিন্ট দিন' : 'Print'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* 5. QR ID CARD MODAL                                                       */}
      {/* ========================================================================= */}
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

              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-600 mx-auto flex items-center justify-center font-bold text-xl text-emerald-700 overflow-hidden">
                {selectedForIdCard.photoUrl ? (
                  <img src={selectedForIdCard.photoUrl} alt="Member" className="w-full h-full object-cover" />
                ) : (
                  selectedForIdCard.nameBn.slice(0, 1)
                )}
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
                {isBangla ? 'সম্পন্ন' : 'Done'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* 6. FULL BACKUP MODAL TRIGGER                                              */}
      {/* ========================================================================= */}
      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={() => {
          const saved = localStorage.getItem(`ngo_members_${tenant?.id}`);
          if (saved) setMembers(JSON.parse(saved));
        }}
      />
    </div>
  );
};
