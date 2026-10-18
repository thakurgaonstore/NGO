import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { toBanglaDigits, formatCurrency, DEFAULT_TENANT_ROLES, RoleDefinition } from '@ngo-erp/shared';
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
  Shield,
  MapPin,
  Mail,
  Phone,
  Check,
  KeyRound,
  Copy,
  Smartphone,
  ExternalLink,
  Info,
  CheckCircle2,
  Lock,
  Share2,
  QrCode,
  Printer,
  DollarSign,
  Briefcase,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  CreditCard,
  Building2,
  Calendar,
  HeartHandshake,
  Plus
} from 'lucide-react';

export interface StaffSalaryStructure {
  basicBDT: number;
  houseRentBDT: number;
  medicalBDT: number;
  conveyanceBDT: number;
  festivalBonusBDT: number;
  incentiveBDT: number;
  otherAllowanceBDT: number;
  // Deductions
  providentFundBDT: number;
  incomeTaxBDT: number;
  loanDeductionBDT: number;
  advanceDeductionBDT: number;
  otherDeductionBDT: number;
}

export interface FullStaffProfile {
  uid: string;
  code: string;
  tenantId: string;
  email: string;
  mobile: string;
  nid: string;
  displayName: { en: string; bn: string };
  roleId: string;
  branchId: string;
  branchName: string;
  assignedSamities: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  education: string;
  joiningDate: string;
  address: string;
  emergencyPhone: string;
  photoUrl: string;
  status: 'active' | 'suspended';
  defaultPassword?: string;
  salary: StaffSalaryStructure;
  createdAt: number;
}

const INITIAL_STAFF: FullStaffProfile[] = [
  {
    uid: 'u-01',
    code: 'EMP-2026-001',
    tenantId: 'demo-jagorani',
    email: 'director@jagorani.org',
    mobile: '01712-345678',
    nid: '19752691234567890',
    displayName: { en: 'Dr. Aminul Islam', bn: 'ড. আমিনুল ইসলাম' },
    roleId: 'owner',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    assignedSamities: 'সকল কেন্দ্র ও সমিতি',
    gender: 'male',
    bloodGroup: 'B+',
    education: 'পিএইচডি / স্নাতকোত্তর',
    joiningDate: '2020-01-01',
    address: 'ধানমন্ডি, ঢাকা',
    emergencyPhone: '01711-000001',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active',
    salary: {
      basicBDT: 45000,
      houseRentBDT: 18000,
      medicalBDT: 4000,
      conveyanceBDT: 5000,
      festivalBonusBDT: 4500,
      incentiveBDT: 5000,
      otherAllowanceBDT: 2500,
      providentFundBDT: 4500,
      incomeTaxBDT: 3500,
      loanDeductionBDT: 0,
      advanceDeductionBDT: 0,
      otherDeductionBDT: 0
    },
    createdAt: Date.now() - 60 * 86400000
  },
  {
    uid: 'u-02',
    code: 'EMP-2026-002',
    tenantId: 'demo-jagorani',
    email: 'manager@jagorani.org',
    mobile: '01819-234567',
    nid: '19822693456781234',
    displayName: { en: 'Farhana Yasmin', bn: 'ফারহানা ইয়াসমিন' },
    roleId: 'manager',
    branchId: 'b-02',
    branchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    assignedSamities: 'পদ্মা কৃষি সমবায়, কর্ণফুলী কেন্দ্র',
    gender: 'female',
    bloodGroup: 'O+',
    education: 'এমবিএ (ব্যবস্থাপনা)',
    joiningDate: '2022-03-15',
    address: 'আগ্রাবাদ, চট্টগ্রাম',
    emergencyPhone: '01819-000002',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'active',
    salary: {
      basicBDT: 32000,
      houseRentBDT: 12000,
      medicalBDT: 2500,
      conveyanceBDT: 3500,
      festivalBonusBDT: 3200,
      incentiveBDT: 4000,
      otherAllowanceBDT: 1500,
      providentFundBDT: 3200,
      incomeTaxBDT: 1500,
      loanDeductionBDT: 0,
      advanceDeductionBDT: 0,
      otherDeductionBDT: 0
    },
    createdAt: Date.now() - 45 * 86400000
  },
  {
    uid: 'u-03',
    code: 'EMP-2026-003',
    tenantId: 'demo-jagorani',
    email: 'officer@jagorani.org',
    mobile: '01911-889900',
    nid: '19902697890123456',
    displayName: { en: 'Md. Tariqul Islam', bn: 'মো: তারিকুল ইসলাম' },
    roleId: 'field_officer',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    assignedSamities: 'সুর্যমুখী মহিলা সমিতি, গোলাপ কেন্দ্র',
    gender: 'male',
    bloodGroup: 'A+',
    education: 'স্নাতক (বিএ)',
    joiningDate: '2023-06-01',
    address: 'চাপাইন, সাভার',
    emergencyPhone: '01911-000003',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    salary: {
      basicBDT: 20000,
      houseRentBDT: 8000,
      medicalBDT: 2000,
      conveyanceBDT: 2500,
      festivalBonusBDT: 2000,
      incentiveBDT: 3500,
      otherAllowanceBDT: 1000,
      providentFundBDT: 2000,
      incomeTaxBDT: 500,
      loanDeductionBDT: 1000,
      advanceDeductionBDT: 0,
      otherDeductionBDT: 0
    },
    createdAt: Date.now() - 30 * 86400000
  },
  {
    uid: 'u-04',
    code: 'EMP-2026-004',
    tenantId: 'demo-jagorani',
    email: 'accounts@jagorani.org',
    mobile: '01611-334455',
    nid: '19922699876543210',
    displayName: { en: 'Sadia Sultana', bn: 'সাদিয়া সুলতানা' },
    roleId: 'staff',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    assignedSamities: 'হেড অফিস ক্যাশ কাউন্টার',
    gender: 'female',
    bloodGroup: 'AB+',
    education: 'বিবিএস (অ্যাকাউন্টিং)',
    joiningDate: '2024-01-10',
    address: 'মিরপুর, ঢাকা',
    emergencyPhone: '01611-000004',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: 'active',
    salary: {
      basicBDT: 24000,
      houseRentBDT: 9500,
      medicalBDT: 2000,
      conveyanceBDT: 2500,
      festivalBonusBDT: 2400,
      incentiveBDT: 1500,
      otherAllowanceBDT: 1000,
      providentFundBDT: 2400,
      incomeTaxBDT: 800,
      loanDeductionBDT: 0,
      advanceDeductionBDT: 0,
      otherDeductionBDT: 0
    },
    createdAt: Date.now() - 15 * 86400000
  }
];

export const UsersListView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  const [staffList, setStaffList] = useState<FullStaffProfile[]>(() => {
    const saved = localStorage.getItem(`ngo_staff_full_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<FullStaffProfile | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<FullStaffProfile | null>(null);
  const [selectedForIdCard, setSelectedForIdCard] = useState<FullStaffProfile | null>(null);
  const [selectedForSalarySlip, setSelectedForSalarySlip] = useState<FullStaffProfile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Dynamic Roles & Designations State
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem(`ngo_roles_${tenant?.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_TENANT_ROLES;
  });

  // Dynamic Custom Role Creation Modal State
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState<boolean>(false);
  const [newRoleNameEn, setNewRoleNameEn] = useState<string>('');
  const [newRoleNameBn, setNewRoleNameBn] = useState<string>('');
  const [newRoleCategory, setNewRoleCategory] = useState<'field' | 'branch' | 'audit' | 'management'>('field');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');

  // Form States - Personal Info
  const [code, setCode] = useState<string>('EMP-2026-005');
  const [nameEn, setNameEn] = useState<string>('');
  const [nameBn, setNameBn] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [nid, setNid] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState<string>('B+');
  const [education, setEducation] = useState<string>('স্নাতক (ডিগ্রী)');
  const [joiningDate, setJoiningDate] = useState<string>('2026-01-01');
  const [address, setAddress] = useState<string>('সাভার, ঢাকা');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('01711-000000');
  const [roleId, setRoleId] = useState<string>('field_officer');
  const [branchId, setBranchId] = useState<string>('b-01');
  const [branchName, setBranchName] = useState<string>('প্রধান কার্যালয় ও সাভার মূল শাখা');
  const [assignedSamities, setAssignedSamities] = useState<string>('সুর্যমুখী মহিলা সমিতি, পদ্মা সমবায়');
  const [defaultPassword, setDefaultPassword] = useState<string>('NgoPass2026!');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

  // Form States - Detailed Salary Structure (ভাতা ও কর্তন)
  const [basicBDT, setBasicBDT] = useState<number>(20000);
  const [houseRentBDT, setHouseRentBDT] = useState<number>(8000);
  const [medicalBDT, setMedicalBDT] = useState<number>(2000);
  const [conveyanceBDT, setConveyanceBDT] = useState<number>(2500);
  const [festivalBonusBDT, setFestivalBonusBDT] = useState<number>(2000);
  const [incentiveBDT, setIncentiveBDT] = useState<number>(3500);
  const [otherAllowanceBDT, setOtherAllowanceBDT] = useState<number>(1000);

  // Deductions
  const [providentFundBDT, setProvidentFundBDT] = useState<number>(2000);
  const [incomeTaxBDT, setIncomeTaxBDT] = useState<number>(500);
  const [loanDeductionBDT, setLoanDeductionBDT] = useState<number>(0);
  const [advanceDeductionBDT, setAdvanceDeductionBDT] = useState<number>(0);
  const [otherDeductionBDT, setOtherDeductionBDT] = useState<number>(0);

  // Auto-calculated Salary Metrics
  const grossSalary = basicBDT + houseRentBDT + medicalBDT + conveyanceBDT + festivalBonusBDT + incentiveBDT + otherAllowanceBDT;
  const totalDeductions = providentFundBDT + incomeTaxBDT + loanDeductionBDT + advanceDeductionBDT + otherDeductionBDT;
  const netSalary = grossSalary - totalDeductions;

  const showNotify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenCreateStaff = () => {
    setEditingStaff(null);
    setCode(`EMP-2026-${String(staffList.length + 1).padStart(3, '0')}`);
    setNameEn('');
    setNameBn('');
    setMobile('');
    setEmail('');
    setNid('');
    setGender('male');
    setBloodGroup('B+');
    setEducation('স্নাতক (ডিগ্রী)');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setAddress('সাভার, ঢাকা');
    setEmergencyPhone('01711-000000');
    setRoleId('field_officer');
    setBranchId('b-01');
    setBranchName('প্রধান কার্যালয় ও সাভার মূল শাখা');
    setAssignedSamities('সুর্যমুখী মহিলা সমিতি, পদ্মা সমবায়');
    setDefaultPassword('NgoPass2026!');
    setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

    // Default Salary Structure
    setBasicBDT(20000);
    setHouseRentBDT(8000);
    setMedicalBDT(2000);
    setConveyanceBDT(2500);
    setFestivalBonusBDT(2000);
    setIncentiveBDT(3500);
    setOtherAllowanceBDT(1000);

    setProvidentFundBDT(2000);
    setIncomeTaxBDT(500);
    setLoanDeductionBDT(0);
    setAdvanceDeductionBDT(0);
    setOtherDeductionBDT(0);

    setIsFormOpen(true);
  };

  const handleOpenEditStaff = (staff: FullStaffProfile) => {
    setEditingStaff(staff);
    setCode(staff.code);
    setNameEn(staff.displayName.en);
    setNameBn(staff.displayName.bn);
    setMobile(staff.mobile);
    setEmail(staff.email);
    setNid(staff.nid);
    setGender(staff.gender);
    setBloodGroup(staff.bloodGroup);
    setEducation(staff.education);
    setJoiningDate(staff.joiningDate);
    setAddress(staff.address);
    setEmergencyPhone(staff.emergencyPhone);
    setRoleId(staff.roleId);
    setBranchId(staff.branchId);
    setBranchName(staff.branchName);
    setAssignedSamities(staff.assignedSamities);
    setDefaultPassword(staff.defaultPassword || 'NgoPass2026!');
    setPhotoUrl(staff.photoUrl);

    // Salary Structure
    setBasicBDT(staff.salary.basicBDT);
    setHouseRentBDT(staff.salary.houseRentBDT);
    setMedicalBDT(staff.salary.medicalBDT);
    setConveyanceBDT(staff.salary.conveyanceBDT);
    setFestivalBonusBDT(staff.salary.festivalBonusBDT);
    setIncentiveBDT(staff.salary.incentiveBDT);
    setOtherAllowanceBDT(staff.salary.otherAllowanceBDT);

    setProvidentFundBDT(staff.salary.providentFundBDT);
    setIncomeTaxBDT(staff.salary.incomeTaxBDT);
    setLoanDeductionBDT(staff.salary.loanDeductionBDT);
    setAdvanceDeductionBDT(staff.salary.advanceDeductionBDT);
    setOtherDeductionBDT(staff.salary.otherDeductionBDT);

    setIsFormOpen(true);
  };

  const handleSaveStaff = () => {
    if (!nameEn && !nameBn) return;
    if (!mobile) return;

    const salaryObj: StaffSalaryStructure = {
      basicBDT,
      houseRentBDT,
      medicalBDT,
      conveyanceBDT,
      festivalBonusBDT,
      incentiveBDT,
      otherAllowanceBDT,
      providentFundBDT,
      incomeTaxBDT,
      loanDeductionBDT,
      advanceDeductionBDT,
      otherDeductionBDT
    };

    if (editingStaff) {
      const updated = staffList.map((s) => {
        if (s.uid === editingStaff.uid) {
          return {
            ...s,
            code,
            displayName: { en: nameEn || nameBn, bn: nameBn || nameEn },
            mobile,
            email: email || `${mobile.replace(/[^0-9]/g, '')}@staff.ngo`,
            nid,
            gender,
            bloodGroup,
            education,
            joiningDate,
            address,
            emergencyPhone,
            roleId,
            branchId,
            branchName,
            assignedSamities,
            photoUrl,
            salary: salaryObj,
            defaultPassword
          };
        }
        return s;
      });
      setStaffList(updated);
      localStorage.setItem(`ngo_staff_full_${tenant?.id}`, JSON.stringify(updated));
      showNotify(`কর্মী "${nameBn || nameEn}"-এর তথ্য ও বেতন কাঠামো আপডেট করা হয়েছে।`);
    } else {
      const newStaff: FullStaffProfile = {
        uid: `u-${Date.now()}`,
        code,
        tenantId: tenant?.id || 'demo-jagorani',
        displayName: { en: nameEn || nameBn, bn: nameBn || nameEn },
        mobile,
        email: email || `${mobile.replace(/[^0-9]/g, '')}@staff.ngo`,
        nid,
        gender,
        bloodGroup,
        education,
        joiningDate,
        address,
        emergencyPhone,
        roleId,
        branchId,
        branchName,
        assignedSamities,
        photoUrl,
        status: 'active',
        defaultPassword,
        salary: salaryObj,
        createdAt: Date.now()
      };
      const updated = [...staffList, newStaff];
      setStaffList(updated);
      localStorage.setItem(`ngo_staff_full_${tenant?.id}`, JSON.stringify(updated));

      // Also register staff in auth creds
      const staffCreds = JSON.parse(localStorage.getItem(`ngo_staff_creds_${tenant?.clientId || 'JAGORANI'}`) || '{}');
      staffCreds[mobile] = {
        password: defaultPassword,
        role: roleId,
        mustChangePassword: true,
        name: nameBn || nameEn
      };
      localStorage.setItem(`ngo_staff_creds_${tenant?.clientId || 'JAGORANI'}`, JSON.stringify(staffCreds));

      showNotify(`নতুন কর্মী "${nameBn || nameEn}" সফলভাবে যুক্ত হয়েছে! ডিফল্ট পাসওয়ার্ড: ${defaultPassword}`);
    }

    setIsFormOpen(false);
  };

  const handleDeleteStaff = () => {
    if (!deletingStaff) return;
    const updated = staffList.filter((s) => s.uid !== deletingStaff.uid);
    setStaffList(updated);
    localStorage.setItem(`ngo_staff_full_${tenant?.id}`, JSON.stringify(updated));
    showNotify(`কর্মী "${deletingStaff.displayName.bn}"-কে তালিকা থেকে মুছে ফেলা হয়েছে।`);
    setDeletingStaff(null);
  };

  const handleSaveCustomRole = () => {
    if (!newRoleNameEn.trim() && !newRoleNameBn.trim()) {
      alert('অনুগ্রহ করে পদের নাম প্রদান করুন।');
      return;
    }
    const id = `role_${Date.now()}`;
    const enName = newRoleNameEn.trim() || newRoleNameBn.trim();
    const bnName = newRoleNameBn.trim() || newRoleNameEn.trim();

    let perms = ['dashboard:view', 'members:view'];
    if (newRoleCategory === 'field') {
      perms = ['dashboard:view', 'members:view', 'members:create', 'field_ops:view', 'field_ops:submit', 'microcredit:view', 'microcredit:collect', 'microcredit:handover'];
    } else if (newRoleCategory === 'branch') {
      perms = ['dashboard:view', 'organization:view', 'members:view', 'members:create', 'members:edit', 'microcredit:view', 'microcredit:approve', 'microcredit:reconcile', 'accounts:view'];
    } else if (newRoleCategory === 'audit') {
      perms = ['dashboard:view', 'members:view', 'microcredit:view', 'reports:view', 'audit:view', 'microcredit:reconcile'];
    } else {
      perms = ['*'];
    }

    const newRoleObj: RoleDefinition = {
      id,
      name: { en: enName, bn: bnName },
      description: { en: newRoleDesc || enName, bn: newRoleDesc || bnName },
      permissions: perms,
      isSystem: false
    };

    const updatedRoles = [...roles, newRoleObj];
    setRoles(updatedRoles);
    localStorage.setItem(`ngo_roles_${tenant?.id}`, JSON.stringify(updatedRoles));

    setRoleId(id);
    setIsAddRoleModalOpen(false);
    setNewRoleNameEn('');
    setNewRoleNameBn('');
    setNewRoleDesc('');
    showNotify(`নতুন পদবী "${bnName}" সফলভাবে তৈরি ও নির্বাচন করা হয়েছে।`);
  };

  const getRoleInfo = (rId: string) => {
    const found = roles.find((r) => r.id === rId);
    if (found) {
      let color = 'bg-primary/20 text-primary border border-primary/30';
      if (rId === 'owner') color = 'bg-emerald-600 text-white';
      else if (rId === 'manager') color = 'bg-sky-600 text-white';
      else if (rId === 'field_officer' || rId === 'credit_officer') color = 'bg-amber-600 text-white';
      else if (rId === 'savings_mobilizer') color = 'bg-teal-600 text-white';
      else if (rId === 'cashier') color = 'bg-indigo-600 text-white';
      else if (rId === 'auditor') color = 'bg-rose-600 text-white';
      else if (rId === 'staff') color = 'bg-slate-700 text-white';

      return {
        labelBn: found.name.bn,
        labelEn: found.name.en,
        color
      };
    }
    return { labelBn: rId, labelEn: rId, color: 'bg-muted text-foreground' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'কর্মকর্তা ও কর্মী ব্যবস্থাপনা (Staff & HR Core)' : 'Staff, HR & Salary Management'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'কর্মীর পদবী, পূর্ণাঙ্গ ব্যক্তিগত তথ্য, বিস্তারিত বেতন কাঠামো, পাসওয়ার্ড এবং অফিসিয়াল ফটো আইডি কার্ড প্রিন্ট।'
              : 'Complete staff profile with Role, Detailed Salary Structure, Password, and Official Photo ID Card.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddRoleModalOpen(true)}
            className="text-xs h-9 border-dashed border-primary/50 text-primary hover:bg-primary/5 font-semibold"
          >
            <Shield className="w-4 h-4 mr-1.5" />
            {isBangla ? '+ নতুন পদবী / রোল তৈরি' : '+ Create Role'}
          </Button>

          <Button onClick={handleOpenCreateStaff} className="text-xs h-9 bg-primary text-primary-foreground font-semibold">
            <UserPlus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Staff'}
          </Button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-black/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Staff Master Table */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'সকল নিবন্ধিত কর্মকর্তা ও মাঠকর্মী' : 'Registered Officers & Field Staff'}</span>
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            মোট কর্মী: {toBanglaDigits(staffList.length)} জন
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'ছবি ও কর্মী কোড' : 'Photo & Code'}</TableHead>
                <TableHead>{isBangla ? 'নাম ও পদবী' : 'Name & Role'}</TableHead>
                <TableHead>{isBangla ? 'লগইন মোবাইল ও এনআইডি' : 'Login Mobile & NID'}</TableHead>
                <TableHead>{isBangla ? 'শাখা ও কেন্দ্র স্কোপ' : 'Branch Scope'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'বেতন কাঠামো' : 'Monthly Salary'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => {
                const roleMeta = getRoleInfo(staff.roleId);
                const net =
                  (staff.salary.basicBDT +
                    staff.salary.houseRentBDT +
                    staff.salary.medicalBDT +
                    staff.salary.conveyanceBDT +
                    staff.salary.festivalBonusBDT +
                    staff.salary.incentiveBDT +
                    staff.salary.otherAllowanceBDT) -
                  (staff.salary.providentFundBDT +
                    staff.salary.incomeTaxBDT +
                    staff.salary.loanDeductionBDT +
                    staff.salary.advanceDeductionBDT +
                    staff.salary.otherDeductionBDT);

                return (
                  <TableRow key={staff.uid} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={staff.photoUrl}
                          alt={staff.displayName.bn}
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 shrink-0"
                        />
                        <span className="font-mono text-xs font-bold text-primary">{staff.code}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-sm text-foreground">{staff.displayName.bn}</div>
                      <div className="text-[11px] text-muted-foreground">{staff.displayName.en}</div>
                      <Badge className={`text-[9px] mt-1 ${roleMeta.color}`}>
                        {roleMeta.labelBn}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs font-mono">
                      <div className="flex items-center gap-1 font-semibold text-primary">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{staff.mobile}</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">
                        NID: {staff.nid}
                      </div>
                      <div className="text-[10px] text-muted-foreground">রক্ত: <strong className="text-rose-600">{staff.bloodGroup}</strong></div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span>{staff.branchName}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        {staff.assignedSamities}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="font-mono font-bold text-sm text-emerald-600">
                        ৳ {net.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        মূল: ৳ {staff.salary.basicBDT.toLocaleString()}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Print Official ID Card Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedForIdCard(staff)}
                          className="h-7 text-xs px-2 text-primary border-primary/30 hover:bg-primary/10"
                          title="অফিসিয়াল আইডি কার্ড প্রিন্ট"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1" />
                          {isBangla ? 'আইডি কার্ড' : 'ID Card'}
                        </Button>

                        {/* Edit Staff */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditStaff(staff)}
                          className="h-7 w-7 p-0 text-sky-600 hover:bg-sky-500/10"
                          title="সম্পাদনা"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete Staff */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingStaff(staff)}
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/10"
                          title="মুছুন"
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

      {/* ========================================================================= */}
      {/* ADD / EDIT STAFF MODAL (ALL INFO + DETAILED SALARY STRUCTURE + PASSWORD)   */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStaff ? (isBangla ? `কর্মী তথ্য ও বেতন সম্পাদনা: ${editingStaff.displayName.bn}` : 'Edit Staff') : (isBangla ? 'নতুন কর্মকর্তা / কর্মী ও বেতন কাঠামো নির্ধারণ' : 'Add New Staff & Salary Structure')}
        description={
          isBangla
            ? 'কর্মীর পদবী, ব্যক্তিগত তথ্য, মূল বেতন, বাড়িভাড়া, চিকিৎসা, প্রভিডেন্ট ফান্ড ও ইনকাম ট্যাক্স সহ সকল ভাতা নির্ধারণ করুন।'
            : 'Configure full profile, role, allowance earnings, tax/loan deductions, and credentials.'
        }
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          {/* SECTION 1: Personal & Role Information */}
          <div className="p-3.5 bg-muted/30 rounded-xl border space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span>১. কর্মীর পদবী ও ব্যক্তিগত তথ্য (Personal & Role Profile)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">কর্মী কোড (Employee ID) *</label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono font-bold" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-muted-foreground">কর্মীর পদবী ও ভূমিকা (Role) *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddRoleModalOpen(true)}
                    className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {isBangla ? '+ নতুন পদ তৈরি' : '+ Add Role'}
                  </button>
                </div>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {isBangla ? r.name.bn : r.name.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">রক্তের গ্রুপ (Blood Group)</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-mono"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">কর্মীর নাম (ইংরেজি) *</label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Md. Tariqul Islam" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">কর্মীর নাম (বাংলা) *</label>
                <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="যেমন: মো: তারিকুল ইসলাম" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">লগইন মোবাইল নম্বর (আইডি) *</label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="01911-000000" className="font-mono font-bold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">জাতীয় পরিচয়পত্র (NID) *</label>
                <Input value={nid} onChange={(e) => setNid(e.target.value)} placeholder="10 or 17 digit NID" className="font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">অফিসিয়াল ইমেইল</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@ngo.org" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">যোগদানের তারিখ</label>
                <Input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">শিক্ষাগত যোগ্যতা</label>
                <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="যেমন: স্নাতক / এমবিএ" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">জরুরি যোগাযোগ ফোন</label>
                <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="01711-000000" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">কর্মীর ছবির লিঙ্ক (Photo URL) *</label>
                <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">স্থায়ী / বর্তমান ঠিকানা</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="গ্রাম, থানা, জেলা..." />
              </div>
            </div>
          </div>

          {/* SECTION 2: Branch & Samity Assignment + Login Password */}
          <div className="p-3.5 bg-sky-500/10 rounded-xl border border-sky-500/30 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>২. শাখা স্কোপ ও লগইন পাসওয়ার্ড (Branch Scope & Login Credentials)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">দায়িত্বপ্রাপ্ত শাখা *</label>
                <select
                  value={branchId}
                  onChange={(e) => {
                    setBranchId(e.target.value);
                    if (e.target.value === 'b-01') setBranchName('প্রধান কার্যালয় ও সাভার মূল শাখা');
                    else if (e.target.value === 'b-02') setBranchName('চট্টগ্রাম আঞ্চলিক শাখা');
                    else if (e.target.value === 'b-03') setBranchName('রাজশাহী মাঠ শাখা');
                  }}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
                >
                  <option value="b-01">প্রধান কার্যালয় ও সাভার মূল শাখা</option>
                  <option value="b-02">চট্টগ্রাম আঞ্চলিক শাখা</option>
                  <option value="b-03">রাজশাহী মাঠ শাখা</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">দায়িত্বপ্রাপ্ত কেন্দ্র ও সমিতিসমূহ</label>
                <Input
                  value={assignedSamities}
                  onChange={(e) => setAssignedSamities(e.target.value)}
                  placeholder="সুর্যমুখী সমিতি, পদ্মা সমবায়..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-primary" />
                  <span>প্রাথমিক পাসওয়ার্ড *</span>
                </label>
                <Input
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  className="font-mono bg-background font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Detailed Salary Structure (মূল বেতন, বাড়িভাড়া, প্রভিডেন্ট ফান্ড, ট্যাক্স ইত্যাদি) */}
          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>৩. মাসিক বেতন কাঠামো ও কর্তন (Detailed Monthly Salary & Allowances)</span>
              </h4>
              <Badge variant="success" className="font-mono text-xs font-bold">
                নিট প্রদেয় বেতন: ৳ {netSalary.toLocaleString()}
              </Badge>
            </div>

            {/* Earnings Allowances */}
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1.5">
                (+) প্রদেয় ভাতাসমূহ (Earnings & Allowances)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">মূল বেতন (Basic) *</label>
                  <Input type="number" value={basicBDT} onChange={(e) => setBasicBDT(Number(e.target.value))} className="font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">বাড়িভাড়া (House Rent)</label>
                  <Input type="number" value={houseRentBDT} onChange={(e) => setHouseRentBDT(Number(e.target.value))} className="font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">মেডিক্যাল ভাতা (Medical)</label>
                  <Input type="number" value={medicalBDT} onChange={(e) => setMedicalBDT(Number(e.target.value))} className="font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">যাতায়াত ভাতা (Conveyance)</label>
                  <Input type="number" value={conveyanceBDT} onChange={(e) => setConveyanceBDT(Number(e.target.value))} className="font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">উৎসব বোনাস (Bonus)</label>
                  <Input type="number" value={festivalBonusBDT} onChange={(e) => setFestivalBonusBDT(Number(e.target.value))} className="font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">ইনসেন্টিভ / মাঠ ভাতা</label>
                  <Input type="number" value={incentiveBDT} onChange={(e) => setIncentiveBDT(Number(e.target.value))} className="font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">অন্যান্য ভাতা (Others)</label>
                  <Input type="number" value={otherAllowanceBDT} onChange={(e) => setOtherAllowanceBDT(Number(e.target.value))} className="font-mono" />
                </div>
                <div className="bg-emerald-600/10 p-2 rounded-lg border border-emerald-600/20 text-center flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground block">মোট গ্রস বেতন</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">৳ {grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="pt-2 border-t border-emerald-500/20">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1.5">
                (-) মাসিক কর্তনসমূহ (Deductions from Salary)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">প্রভিডেন্ট ফান্ড (PF)</label>
                  <Input type="number" value={providentFundBDT} onChange={(e) => setProvidentFundBDT(Number(e.target.value))} className="font-mono text-rose-600 font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">ইনকাম ট্যাক্স কর্তন (TDS)</label>
                  <Input type="number" value={incomeTaxBDT} onChange={(e) => setIncomeTaxBDT(Number(e.target.value))} className="font-mono text-rose-600" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">স্টাফ ঋণ কর্তন (Loan)</label>
                  <Input type="number" value={loanDeductionBDT} onChange={(e) => setLoanDeductionBDT(Number(e.target.value))} className="font-mono text-rose-600" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">বেতন অগ্রিম কর্তন (Advance)</label>
                  <Input type="number" value={advanceDeductionBDT} onChange={(e) => setAdvanceDeductionBDT(Number(e.target.value))} className="font-mono text-rose-600" />
                </div>
              </div>
            </div>

            {/* Final Calculation Summary */}
            <div className="p-3 bg-card rounded-xl border flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-muted-foreground">গ্রস বেতন: ৳ {grossSalary.toLocaleString()}</span>
                <span className="mx-2 text-muted-foreground">|</span>
                <span className="text-rose-600">মোট কর্তন: ৳ {totalDeductions.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground mr-2 font-sans font-semibold">মাসিক প্রদেয় নিট বেতন:</span>
                <span className="text-lg font-bold text-emerald-600">৳ {netSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveStaff} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Check className="w-4 h-4 mr-1.5" />
              {editingStaff ? (isBangla ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes') : (isBangla ? 'কর্মী সংরক্ষণ করুন' : 'Save Staff')}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* OFFICIAL STAFF IDENTITY CARD PRINT PREVIEW (সামনে-পেছনে প্রফেশনাল আইডি)     */}
      {/* ========================================================================= */}
      {selectedForIdCard && (
        <Dialog
          isOpen={!!selectedForIdCard}
          onClose={() => setSelectedForIdCard(null)}
          title={isBangla ? 'অফিসিয়াল কর্মকর্তা পরিচয়পত্র (Staff Identity Card)' : 'Official Staff ID Card'}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div id="printable-staff-id" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD FRONT SIDE */}
              <div className="bg-gradient-to-b from-card to-muted border-2 border-emerald-600/40 rounded-2xl p-4 shadow-xl text-center space-y-3 relative overflow-hidden">
                <div className="bg-emerald-600 text-white -mx-4 -mt-4 py-2 px-4 text-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider">{tenant?.name.bn || 'জাগরণী চক্র ফাউন্ডেশন'}</h3>
                  <span className="text-[9px] uppercase tracking-widest text-emerald-100 font-mono">STAFF IDENTITY CARD</span>
                </div>

                <div className="pt-2">
                  <img
                    src={selectedForIdCard.photoUrl}
                    alt={selectedForIdCard.displayName.bn}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-emerald-600 shadow-md"
                  />
                  <h4 className="font-bold text-sm text-foreground mt-2">{selectedForIdCard.displayName.bn}</h4>
                  <p className="text-[11px] text-muted-foreground font-semibold">{selectedForIdCard.displayName.en}</p>
                  <Badge className="bg-emerald-600 text-white text-[10px] mt-1">
                    {getRoleInfo(selectedForIdCard.roleId).labelBn}
                  </Badge>
                </div>

                <div className="text-left text-[11px] bg-background p-2.5 rounded-xl border font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID No:</span>
                    <span className="font-bold text-primary">{selectedForIdCard.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-bold">{selectedForIdCard.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blood:</span>
                    <span className="font-bold text-rose-600">{selectedForIdCard.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch:</span>
                    <span className="font-semibold truncate">{selectedForIdCard.branchName}</span>
                  </div>
                </div>

                <div className="text-[9px] text-muted-foreground font-semibold">
                  কার্ডধারীর পরিচয়পত্রে কোনো ভুল পরিলক্ষিত হলে প্রশাসন বিভাগে যোগাযোগ করুন।
                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div className="bg-gradient-to-b from-card to-muted border-2 border-emerald-600/40 rounded-2xl p-4 shadow-xl text-center space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="bg-slate-800 text-white -mx-4 -mt-4 py-2 px-4 text-center">
                  <span className="text-[10px] font-bold tracking-wider">নির্দেশাবলী ও জরুরি যোগাযোগ</span>
                </div>

                <div className="text-left text-[11px] space-y-1.5 font-mono bg-background p-2.5 rounded-xl border">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">জাতীয় পরিচয়পত্র:</span>
                    <span className="font-bold">{selectedForIdCard.nid}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">জরুরি যোগাযোগ ফোন:</span>
                    <span className="font-bold text-primary">{selectedForIdCard.emergencyPhone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">যোগদানের তারিখ:</span>
                    <span>{selectedForIdCard.joiningDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">দায়িত্বপ্রাপ্ত কেন্দ্র:</span>
                    <span className="text-emerald-600 font-semibold">{selectedForIdCard.assignedSamities}</span>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border shadow-sm mx-auto w-fit">
                  <QrCode className="w-16 h-16 text-black" />
                </div>

                <div className="border-t pt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>ইস্যুকারী কর্তৃপক্ষ</span>
                  <div className="border-b border-black w-20 text-center font-bold">অনুমোদিত</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-[11px] text-muted-foreground font-mono">Standard PVC Card (CR80) Size</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerPrint('printable-staff-id', `Staff_Card_${selectedForIdCard.code}`)}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  {isBangla ? 'আইডি কার্ড প্রিন্ট করুন' : 'Print Card'}
                </Button>
                <Button size="sm" onClick={() => setSelectedForIdCard(null)} className="text-xs">
                  সম্পন্ন
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Staff Confirmation Dialog */}
      {deletingStaff && (
        <Dialog
          isOpen={!!deletingStaff}
          onClose={() => setDeletingStaff(null)}
          title="কর্মী মুছে ফেলার নিশ্চিতকরণ"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-foreground leading-relaxed">
              আপনি কি নিশ্চিত যে <strong>"{deletingStaff.displayName.bn}"</strong> ({deletingStaff.code})-কে কর্মী তালিকা থেকে অপসারণ করতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDeletingStaff(null)} className="text-xs">
                বাতিল
              </Button>
              <Button onClick={handleDeleteStaff} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
                হ্যাঁ, মুছে ফেলুন
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW ROLE / DESIGNATION MODAL                                          */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        title={isBangla ? 'নতুন পদবী ও ভূমিকা (Role) তৈরি করুন' : 'Create New Designation / Role'}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'পদের নাম (ইংরেজি) *' : 'Role Title (English) *'}
              </label>
              <Input
                value={newRoleNameEn}
                onChange={(e) => setNewRoleNameEn(e.target.value)}
                placeholder="e.g. Area Manager"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {isBangla ? 'পদের নাম (বাংলা) *' : 'Role Title (Bangla) *'}
              </label>
              <Input
                value={newRoleNameBn}
                onChange={(e) => setNewRoleNameBn(e.target.value)}
                placeholder="যেমন: এরিয়া ম্যানেজার"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {isBangla ? 'অ্যাক্সেস ও দায়িত্ব ক্যাটাগরি (Access Level):' : 'Access Level:'}
            </label>
            <select
              value={newRoleCategory}
              onChange={(e) => setNewRoleCategory(e.target.value as any)}
              className="w-full h-10 px-3 text-xs rounded-lg border border-input bg-background font-semibold"
            >
              <option value="field">মাঠ পর্যায় (Field Level - কিস্তি আদায়, সদস্য নিবন্ধন ও ক্যাশ জমা)</option>
              <option value="branch">শাখা ব্যবস্থাপক পর্যায় (Branch Level - ক্যাশ মিলকরণ, ঋণ অনুমোদন ও তদারকি)</option>
              <option value="audit">নিরীক্ষা ও পরিদর্শন (Audit Level - পাসবই ক্রস-চেক ও অডিট রিপোর্ট)</option>
              <option value="management">প্রধান কার্যালয় / নির্বাহী (Full Root - সকল মডিউলে পূর্ণ নিয়ন্ত্রণ)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {isBangla ? 'কাজের সংক্ষিপ্ত বিবরণ:' : 'Job Description:'}
            </label>
            <Input
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="যেমন: নির্ধারিত ৫টি শাখার মাঠ কার্যক্রম ও কিস্তি আদায় তদারকি করা"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsAddRoleModalOpen(false)} className="text-xs">
              বাতিল
            </Button>
            <Button onClick={handleSaveCustomRole} size="sm" className="text-xs bg-primary text-primary-foreground font-bold">
              <Check className="w-3.5 h-3.5 mr-1.5" />
              {isBangla ? 'পদবী সংরক্ষণ করুন' : 'Save Role'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
