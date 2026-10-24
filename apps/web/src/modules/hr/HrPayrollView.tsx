import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useAuth } from '../../core/auth/AuthContext';
import { formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { triggerPrint, numberToWordsBn, numberToWordsEn } from '../../core/print/printHelper';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Briefcase,
  Users,
  CalendarCheck,
  Calculator,
  Printer,
  Plus,
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ArrowRightLeft,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Navigation,
  Check,
  X,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

export interface EmployeeRecord {
  id: string;
  empId: string;
  name: string;
  designation: string;
  department: string;
  branchId: string;
  branchName: string;
  phone: string;
  joiningDate: string;
  bankAccount: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  conveyance: number;
  pfDeduction: number;
  netSalary: number;
  status: 'active' | 'on_leave' | 'transferred';
}

export interface PayslipCustomInput {
  month: string;
  year: number;
  employeeId: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  conveyance: number;
  festivalBonus: number;
  incentiveBonus: number;
  arrears: number;
  mobileAllowance: number;
  otherAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  loanDeduction: number;
  advanceDeduction: number;
  latePenaltyDeduction: number;
  otherDeduction: number;
  paymentMode: 'bank' | 'bkash' | 'cash';
  paymentNote: string;
}

export interface TransferOrder {
  id: string;
  memoNo: string;
  date: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  currentBranchId: string;
  currentBranchName: string;
  targetBranchId: string;
  targetBranchName: string;
  effectiveDate: string;
  reportingDeadline: string;
  reasonBn: string;
  reasonEn: string;
  relocationAllowance: number;
  approvedBy: string;
}

const BRANCHES_DIRECTORY = [
  { id: 'b-01', name: 'প্রধান কার্যালয় ও সাভার মূল শাখা', lat: 23.8485, lng: 90.2647, radius: 500 },
  { id: 'b-02', name: 'চট্টগ্রাম আঞ্চলিক শাখা', lat: 22.3569, lng: 91.7832, radius: 600 },
  { id: 'b-03', name: 'রাজশাহী বরেন্দ্র শাখা', lat: 24.3636, lng: 88.6241, radius: 500 }
];

const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp-01',
    empId: 'EMP-001',
    name: 'Dr. Aminul Islam',
    designation: 'Executive Director',
    department: 'Management',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    phone: '01711-223344',
    joiningDate: '01/01/2020',
    bankAccount: 'DBBL: 115.120.45892',
    basicSalary: 60000,
    houseRent: 24000,
    medicalAllowance: 5000,
    conveyance: 6000,
    pfDeduction: 6000,
    netSalary: 89000,
    status: 'active'
  },
  {
    id: 'emp-02',
    empId: 'EMP-002',
    name: 'Farhana Yasmin',
    designation: 'Branch Manager',
    department: 'Branch Operations',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    phone: '01811-334455',
    joiningDate: '15/03/2021',
    bankAccount: 'City Bank: 2101-5899-01',
    basicSalary: 35000,
    houseRent: 14000,
    medicalAllowance: 3500,
    conveyance: 4000,
    pfDeduction: 3500,
    netSalary: 53000,
    status: 'active'
  },
  {
    id: 'emp-03',
    empId: 'EMP-003',
    name: 'Md. Tariqul Islam',
    designation: 'Senior Field Officer',
    department: 'Field Operations',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    phone: '01911-889900',
    joiningDate: '10/06/2022',
    bankAccount: 'bKash: 01911-889900',
    basicSalary: 22000,
    houseRent: 8800,
    medicalAllowance: 2500,
    conveyance: 3500,
    pfDeduction: 2200,
    netSalary: 34600,
    status: 'active'
  },
  {
    id: 'emp-04',
    empId: 'EMP-004',
    name: 'Sadia Sultana',
    designation: 'Accounts Officer',
    department: 'Finance & Accounts',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    phone: '01722-667788',
    joiningDate: '01/08/2022',
    bankAccount: 'Islami Bank: 2050-1456-789',
    basicSalary: 25000,
    houseRent: 10000,
    medicalAllowance: 2500,
    conveyance: 3000,
    pfDeduction: 2500,
    netSalary: 38000,
    status: 'active'
  },
  {
    id: 'emp-05',
    empId: 'EMP-005',
    name: 'Kamrul Hasan',
    designation: 'Field Officer (Chittagong)',
    department: 'Field Operations',
    branchId: 'b-02',
    branchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    phone: '01833-445566',
    joiningDate: '12/01/2023',
    bankAccount: 'Nagad: 01833-445566',
    basicSalary: 20000,
    houseRent: 8000,
    medicalAllowance: 2000,
    conveyance: 3000,
    pfDeduction: 2000,
    netSalary: 31000,
    status: 'active'
  }
];

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const HrPayrollView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant, settings } = useTenant();
  const { role, currentUser } = useAuth();

  // Tab State
  const [tab, setTab] = useState<'employees' | 'payslip_builder' | 'attendance' | 'transfer' | 'payroll'>('employees');

  // Branch Scoping State
  // Owner/ED can choose any branch or 'all'; Manager is locked to their branch
  const isBranchManager = role === 'manager';
  const isFieldOfficer = role === 'field_officer';
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(() => {
    if (isBranchManager || isFieldOfficer) {
      return 'b-01'; // Default to manager's branch
    }
    return 'all';
  });

  // Employees State
  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => {
    const saved = localStorage.getItem(`ngo_employees_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  // Filtered employees based on role & branch
  const visibleEmployees = employees.filter((emp) => {
    if (selectedBranchFilter === 'all') return true;
    return emp.branchId === selectedBranchFilter;
  });

  // ---------------------------------------------------------------------------
  // 1. PAYSLIP BUILDER & CUSTOM INPUT STATE
  // ---------------------------------------------------------------------------
  const [payslipModalOpen, setPayslipModalOpen] = useState<boolean>(false);
  const [payslipData, setPayslipData] = useState<PayslipCustomInput>({
    month: 'অক্টোবর ২০২৬',
    year: 2026,
    employeeId: 'emp-01',
    basicSalary: 60000,
    houseRent: 24000,
    medicalAllowance: 5000,
    conveyance: 6000,
    festivalBonus: 0,
    incentiveBonus: 5000,
    arrears: 0,
    mobileAllowance: 1000,
    otherAllowance: 0,
    pfDeduction: 6000,
    taxDeduction: 2500,
    loanDeduction: 0,
    advanceDeduction: 0,
    latePenaltyDeduction: 0,
    otherDeduction: 500,
    paymentMode: 'bank',
    paymentNote: 'Monthly regular disbursement'
  });

  // Selected employee for payslip
  const selectedEmpForPayslip = employees.find((e) => e.id === payslipData.employeeId) || employees[0];

  // Open Payslip Builder for a specific employee
  const handleOpenPayslipBuilder = (emp: EmployeeRecord) => {
    setPayslipData({
      month: isBangla ? 'অক্টোবর ২০২৬' : 'October 2026',
      year: 2026,
      employeeId: emp.id,
      basicSalary: emp.basicSalary,
      houseRent: emp.houseRent,
      medicalAllowance: emp.medicalAllowance,
      conveyance: emp.conveyance,
      festivalBonus: 0,
      incentiveBonus: 2000,
      arrears: 0,
      mobileAllowance: 800,
      otherAllowance: 0,
      pfDeduction: emp.pfDeduction,
      taxDeduction: emp.basicSalary > 30000 ? 1500 : 0,
      loanDeduction: 0,
      advanceDeduction: 0,
      latePenaltyDeduction: 0,
      otherDeduction: 0,
      paymentMode: emp.bankAccount.toLowerCase().includes('bkash') ? 'bkash' : 'bank',
      paymentNote: 'অক্টোবর মাসের নিয়মিত বেতন'
    });
    setPayslipModalOpen(true);
  };

  // Live Calculations
  const grossEarnings =
    Number(payslipData.basicSalary || 0) +
    Number(payslipData.houseRent || 0) +
    Number(payslipData.medicalAllowance || 0) +
    Number(payslipData.conveyance || 0) +
    Number(payslipData.festivalBonus || 0) +
    Number(payslipData.incentiveBonus || 0) +
    Number(payslipData.arrears || 0) +
    Number(payslipData.mobileAllowance || 0) +
    Number(payslipData.otherAllowance || 0);

  const totalDeductions =
    Number(payslipData.pfDeduction || 0) +
    Number(payslipData.taxDeduction || 0) +
    Number(payslipData.loanDeduction || 0) +
    Number(payslipData.advanceDeduction || 0) +
    Number(payslipData.latePenaltyDeduction || 0) +
    Number(payslipData.otherDeduction || 0);

  const netPayable = grossEarnings - totalDeductions;

  // ---------------------------------------------------------------------------
  // 2. GPS ATTENDANCE SYSTEM STATE
  // ---------------------------------------------------------------------------
  const [gpsModalOpen, setGpsModalOpen] = useState<boolean>(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 23.8488,
    lng: 90.2642
  });
  const [selectedBranchForGps, setSelectedBranchForGps] = useState<string>('b-01');
  const [attendanceType, setAttendanceType] = useState<'branch' | 'field_center'>('branch');
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([
    {
      id: 'att-1',
      empId: 'EMP-001',
      name: 'Dr. Aminul Islam',
      role: 'Executive Director',
      branch: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
      inTime: '09:02 AM',
      outTime: '05:30 PM',
      distanceMeters: 45,
      status: 'approved',
      lat: 23.8487,
      lng: 90.2645
    },
    {
      id: 'att-2',
      empId: 'EMP-002',
      name: 'Farhana Yasmin',
      role: 'Branch Manager',
      branch: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
      inTime: '09:15 AM',
      outTime: '05:45 PM',
      distanceMeters: 62,
      status: 'approved',
      lat: 23.8486,
      lng: 90.2649
    },
    {
      id: 'att-3',
      empId: 'EMP-003',
      name: 'Md. Tariqul Islam',
      role: 'Senior Field Officer',
      branch: 'সাভার মূল শাখা (সূর্যমুখী সমিতি কেন্দ্র)',
      inTime: '09:20 AM',
      outTime: '--',
      distanceMeters: 80,
      status: 'field_center_verified',
      lat: 23.8491,
      lng: 90.2652
    }
  ]);
  const [hasClockedIn, setHasClockedIn] = useState<boolean>(false);

  const activeBranchTarget = BRANCHES_DIRECTORY.find((b) => b.id === selectedBranchForGps) || BRANCHES_DIRECTORY[0];
  const distanceFromBranch = calculateDistanceMeters(
    currentCoords.lat,
    currentCoords.lng,
    activeBranchTarget.lat,
    activeBranchTarget.lng
  );
  const isWithinGeofence = distanceFromBranch <= activeBranchTarget.radius;

  const handleFetchRealGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
        },
        () => {
          // Fallback simulation
          setCurrentCoords({ lat: 23.8486, lng: 90.2648 });
        }
      );
    }
  };

  const handleConfirmClockIn = () => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `att-${Date.now()}`,
      empId: currentUser?.uid?.slice(0, 6).toUpperCase() || 'EMP-003',
      name: currentUser?.displayName?.bn || 'মাঠ কর্মকর্তা (লগইনকৃত)',
      role: isBranchManager ? 'Branch Manager' : 'Field Officer',
      branch: attendanceType === 'branch' ? activeBranchTarget.name : 'সমিতি কেন্দ্র (ফিল্ড ভিজিট)',
      inTime: timeStr,
      outTime: '--',
      distanceMeters: distanceFromBranch,
      status: isWithinGeofence ? 'approved' : 'flagged_distance',
      lat: currentCoords.lat,
      lng: currentCoords.lng
    };
    setAttendanceLogs([newLog, ...attendanceLogs]);
    setHasClockedIn(true);
    setGpsModalOpen(false);
  };

  // ---------------------------------------------------------------------------
  // 3. INTER-BRANCH STAFF TRANSFER STATE
  // ---------------------------------------------------------------------------
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [transferLetterModalOpen, setTransferLetterModalOpen] = useState<boolean>(false);
  const [transferLang, setTransferLang] = useState<'bn' | 'en'>('bn');
  const [activeTransferOrder, setActiveTransferOrder] = useState<TransferOrder>({
    id: 'tr-01',
    memoNo: 'JDF/HR/TR-2026/048',
    date: '১৮ অক্টোবর ২০২৬',
    employeeId: 'emp-03',
    employeeName: 'Md. Tariqul Islam',
    designation: 'Senior Field Officer',
    currentBranchId: 'b-01',
    currentBranchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    targetBranchId: 'b-02',
    targetBranchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    effectiveDate: '০১ নভেম্বর ২০২৬',
    reportingDeadline: '০৫ নভেম্বর ২০২৬',
    reasonBn: 'প্রাতিষ্ঠানিক কাজের গতিশীলতা বৃদ্ধি ও প্রশাসনিক প্রয়োজনে',
    reasonEn: 'In pursuance of administrative requirements and field expansion',
    relocationAllowance: 5000,
    approvedBy: 'Dr. Aminul Islam, Executive Director'
  });

  const handleOpenTransferModal = (emp?: EmployeeRecord) => {
    const targetEmp = emp || employees[2];
    setActiveTransferOrder({
      id: `tr-${Date.now()}`,
      memoNo: `JDF/HR/TR-2026/0${Math.floor(Math.random() * 90 + 10)}`,
      date: isBangla ? '১৮ অক্টোবর ২০২৬' : '18 October 2026',
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      designation: targetEmp.designation,
      currentBranchId: targetEmp.branchId,
      currentBranchName: targetEmp.branchName,
      targetBranchId: targetEmp.branchId === 'b-01' ? 'b-02' : 'b-01',
      targetBranchName: targetEmp.branchId === 'b-01' ? 'চট্টগ্রাম আঞ্চলিক শাখা' : 'প্রধান কার্যালয় ও সাভার মূল শাখা',
      effectiveDate: isBangla ? '০১ নভেম্বর ২০২৬' : '01 November 2026',
      reportingDeadline: isBangla ? '০৫ নভেম্বর ২০২৬' : '05 November 2026',
      reasonBn: 'প্রাতিষ্ঠানিক স্বার্থ ও মাঠপর্যায়ে কার্যক্রম জোরদারকরণে',
      reasonEn: 'To strengthen regional microfinance recovery & operational coverage',
      relocationAllowance: 5000,
      approvedBy: 'Dr. Aminul Islam, Executive Director'
    });
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = () => {
    // Update employee branch
    const updated = employees.map((emp) => {
      if (emp.id === activeTransferOrder.employeeId) {
        return {
          ...emp,
          branchId: activeTransferOrder.targetBranchId,
          branchName: activeTransferOrder.targetBranchName
        };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem(`ngo_employees_${tenant?.id}`, JSON.stringify(updated));
    setTransferModalOpen(false);
    setTransferLetterModalOpen(true);
  };

  const totalMonthlyPayroll = visibleEmployees.reduce((sum, e) => sum + e.netSalary, 0);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BRANCH MULTI-TENANCY FILTER                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-card rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {isBangla ? 'এইচআর, বেতন ও শাখা বদলি ব্যবস্থাপনা' : 'HR, Payroll & Branch Operations'}
            </h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-[10px]">
              A4 Print Ready
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'কাস্টম পে-স্লিপ তৈরি (উপার্জন ও কর্তন ইনপুট), জিপিএস হাজিরা জিওফেন্সিং, এবং দ্বিভাষিক বদলি আদেশ পত্র।'
              : 'Dynamic payslip inputs, GPS attendance geofencing, and inter-branch transfer order generator.'}
          </p>
        </div>

        {/* Branch Hierarchy Scoping Selector */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl border text-xs">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-muted-foreground">{isBangla ? 'শাখা:' : 'Branch:'}</span>
            {isBranchManager || isFieldOfficer ? (
              <div className="flex items-center gap-1 font-bold text-primary">
                <Lock className="w-3 h-3" />
                <span>সাভার মূল শাখা (লকড)</span>
              </div>
            ) : (
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-background font-bold text-xs h-7 px-2 rounded-lg border border-input focus:outline-none"
              >
                <option value="all">{isBangla ? '🏢 সকল শাখা (সেন্ট্রাল ভিউ - ED/MD)' : 'All Branches (Central)'}</option>
                <option value="b-01">সাভার মূল শাখা</option>
                <option value="b-02">চট্টগ্রাম আঞ্চলিক শাখা</option>
                <option value="b-03">রাজশাহী বরেন্দ্র শাখা</option>
              </select>
            )}
          </div>

          {/* GPS Attendance Action Button */}
          <Button
            onClick={() => {
              handleFetchRealGps();
              setGpsModalOpen(true);
            }}
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <MapPin className="w-4 h-4 mr-1.5" />
            {hasClockedIn
              ? isBangla
                ? 'হাজিরা সম্পন্ন ✅'
                : 'Clocked In'
              : isBangla
              ? 'জিপিএস হাজিরা (Clock In)'
              : 'GPS Clock In'}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS                                                        */}
      {/* ========================================================================= */}
      <div className="flex gap-2 border-b pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setTab('employees')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            tab === 'employees' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isBangla ? 'কর্মকর্তাদের তালিকা ও বেতন' : 'Employee Directory'}</span>
        </button>
        <button
          onClick={() => {
            handleOpenPayslipBuilder(employees[0]);
          }}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            tab === 'payslip_builder' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{isBangla ? 'পে-স্লিপ প্রস্তুত ও কাস্টমাইজ' : 'Custom Payslip Builder'}</span>
        </button>
        <button
          onClick={() => setTab('attendance')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            tab === 'attendance' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>{isBangla ? 'শাখাভিত্তিক জিপিএস হাজিরা' : 'GPS Attendance Log'}</span>
        </button>
        <button
          onClick={() => setTab('transfer')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            tab === 'transfer' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{isBangla ? 'কর্মকর্তা শাখা বদলি ও আদেশ পত্র' : 'Inter-Branch Transfer'}</span>
        </button>
        <button
          onClick={() => setTab('payroll')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            tab === 'payroll' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{isBangla ? 'মাসিক পে-রোল ব্যাচ ও অনুমোদন' : 'Payroll Runs'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEES DIRECTORY                                               */}
      {/* ========================================================================= */}
      {tab === 'employees' && (
        <Card className="border-border">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">
                {isBangla ? 'সকল সক্রিয় কর্মকর্তা ও বেতন কাঠামো' : 'Employee Directory & Salary Structure'}
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                {isBangla ? `প্রদর্শিত হচ্ছে ${visibleEmployees.length} জন কর্মকর্তা` : `Showing ${visibleEmployees.length} employees`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">{isBangla ? 'মাসিক বেতন বাজেট:' : 'Monthly Payroll:'}</span>
              <span className="font-bold text-primary font-mono text-sm">
                {formatCurrency(totalMonthlyPayroll, { useBanglaNumerals: isBangla })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{isBangla ? 'আইডি' : 'ID'}</TableHead>
                  <TableHead>{isBangla ? 'কর্মকর্তার নাম ও পদবি' : 'Name & Designation'}</TableHead>
                  <TableHead>{isBangla ? 'শাখা ও বিভাগ' : 'Branch & Dept'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মূল বেতন' : 'Basic'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'বাড়িভাড়া ও ভাতা' : 'Allowances'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'পিএফ কর্তন' : 'PF'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'নিট বেতন (Net)' : 'Net Pay'}</TableHead>
                  <TableHead className="text-center">{isBangla ? 'অ্যাকশন' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEmployees.map((emp) => {
                  const allowances = emp.houseRent + emp.medicalAllowance + emp.conveyance;
                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-mono font-bold text-xs text-primary">{emp.empId}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.designation}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{emp.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] bg-slate-500/10">
                          {emp.branchName}
                        </Badge>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{emp.department}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatCurrency(emp.basicSalary, { useBanglaNumerals: isBangla })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {formatCurrency(allowances, { useBanglaNumerals: isBangla })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-rose-600">
                        -{formatCurrency(emp.pfDeduction, { useBanglaNumerals: isBangla })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-emerald-600">
                        {formatCurrency(emp.netSalary, { useBanglaNumerals: isBangla })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Create/Customize Payslip Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPayslipBuilder(emp)}
                            className="h-7 text-xs px-2.5 font-semibold border-primary/30 text-primary hover:bg-primary/5"
                            title="পে-স্লিপ তৈরি ও কাস্টমাইজ করুন"
                          >
                            <Calculator className="w-3.5 h-3.5 mr-1" />
                            {isBangla ? 'পে-স্লিপ তৈরি' : 'Payslip'}
                          </Button>

                          {/* Inter-Branch Transfer Button */}
                          {(!isBranchManager && !isFieldOfficer) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenTransferModal(emp)}
                              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                              title="অন্য শাখায় বদলি করুন"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-sky-600" />
                              {isBangla ? 'বদলি' : 'Transfer'}
                            </Button>
                          )}
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

      {/* ========================================================================= */}
      {/* TAB 2: GPS ATTENDANCE SYSTEM & GEOFENCING                                  */}
      {/* ========================================================================= */}
      {tab === 'attendance' && (
        <div className="space-y-4">
          {/* Educational Geofence Explanation Box */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Compass className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">
                    {isBangla ? 'GPS Geofencing হাজিরা কীভাবে কাজ করে?' : 'How does GPS Geofenced Attendance work?'}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {isBangla
                      ? 'প্রতিটি শাখার ভৌগোলিক অক্ষাংশ ও দ্রাঘিমাংশ (Latitude/Longitude) এবং অনুমোদিত ব্যাসার্ধ (যেমন: ৫০০ মিটার) সিস্টেমে সংরক্ষিত থাকে। যখন একজন কর্মী মোবাইল বা ডিভাইসে "Clock In" চাপেন, ব্রাউজার তাৎক্ষণিক জিপিএস কো-অর্ডিনেট পাঠায়। কর্মী অনুমোদিত সীমার ভেতরে থাকলে স্বয়ংক্রিয়ভাবে Approved হয়, দূর থেকে ভুয়া হাজিরা দেওয়ার চেষ্টা করলে সিস্টেম তা লাল চিহ্নে ফ্ল্যাগ করে দেয়।'
                      : 'Each branch has configured GPS coordinates and an authorized radius (e.g. 500m). When staff clicks Clock-In, browser GPS computes exact distance. If within zone, it is approved; if outside, it flags unauthorized distance.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Log Table */}
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>{isBangla ? 'আজকের দৈনিক উপস্থিতি ও অডিট লগ (অক্টোবর ১৮, ২০২৬)' : 'Today\'s Attendance Log (Oct 18, 2026)'}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs">
                  {attendanceLogs.length} {isBangla ? 'জন হাজিরা দিয়েছেন' : 'Checked In'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBangla ? 'কর্মকর্তা' : 'Staff'}</TableHead>
                    <TableHead>{isBangla ? 'শাখা / কেন্দ্র' : 'Branch / Center'}</TableHead>
                    <TableHead>{isBangla ? 'ইন-টাইম' : 'Clock In'}</TableHead>
                    <TableHead>{isBangla ? 'আউট-টাইম' : 'Clock Out'}</TableHead>
                    <TableHead>{isBangla ? 'শাখা থেকে দূরত্ব' : 'Distance from Office'}</TableHead>
                    <TableHead>{isBangla ? 'অবস্থা ও ভেরিফিকেশন' : 'Status'}</TableHead>
                    <TableHead className="text-right">{isBangla ? 'ম্যাপ' : 'Map'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-semibold text-xs">{log.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{log.empId} ({log.role})</div>
                      </TableCell>
                      <TableCell className="text-xs">{log.branch}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-emerald-600">{log.inTime}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.outTime}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="font-bold">{log.distanceMeters} মিটার</span>
                      </TableCell>
                      <TableCell>
                        {log.status === 'approved' && (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {isBangla ? 'অনুমোদিত (সীমার মধ্যে)' : 'Within Zone'}
                          </Badge>
                        )}
                        {log.status === 'field_center_verified' && (
                          <Badge variant="outline" className="text-[10px] border-sky-400 text-sky-700 bg-sky-50 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {isBangla ? 'সমিতি কেন্দ্র ভেরিফায়েড' : 'Center Verified'}
                          </Badge>
                        )}
                        {log.status === 'flagged_distance' && (
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {isBangla ? 'সীমার বাইরে (সতর্কবার্তা)' : 'Out of Geofence'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{isBangla ? 'ম্যাপ' : 'Map'}</span>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STAFF TRANSFER & LETTER GENERATOR                                   */}
      {/* ========================================================================= */}
      {tab === 'transfer' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-primary" />
                  <span>{isBangla ? 'আন্তঃশাখা কর্মকর্তা বদলি ও পদায়ন রেজিস্টার' : 'Inter-Branch Transfer Register'}</span>
                </CardTitle>
                <span className="text-[11px] text-muted-foreground">
                  {isBangla
                    ? 'এক শাখা থেকে অন্য শাখায় কর্মী স্থানান্তর এবং স্বয়ংক্রিয় দ্বিভাষিক অফিস আদেশ পত্র তৈরি।'
                    : 'Transfer staff across branches and generate official bilingual office order letters.'}
                </span>
              </div>
              <Button onClick={() => handleOpenTransferModal()} className="text-xs h-8">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {isBangla ? 'নতুন বদলি আদেশ তৈরি' : 'New Transfer Order'}
              </Button>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3">
              <div className="p-4 border rounded-xl bg-card space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30">
                      {activeTransferOrder.memoNo}
                    </Badge>
                    <span className="font-bold text-foreground">{activeTransferOrder.employeeName}</span>
                    <span className="text-muted-foreground">({activeTransferOrder.designation})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTransferLetterModalOpen(true)}
                      className="h-7 text-xs font-semibold text-primary"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      {isBangla ? 'আদেশ পত্র প্রিন্ট করুন' : 'View Transfer Letter'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">বর্তমান শাখা:</span>
                    <span className="font-semibold">{activeTransferOrder.currentBranchName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">বদলিকৃত নতুন শাখা:</span>
                    <span className="font-bold text-emerald-600">{activeTransferOrder.targetBranchName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">কার্যকরের তারিখ:</span>
                    <span className="font-mono">{activeTransferOrder.effectiveDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">যোগদানের শেষ সময়সীমা:</span>
                    <span className="font-mono font-bold text-rose-600">{activeTransferOrder.reportingDeadline}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MONTHLY PAYROLL RUNS                                               */}
      {/* ========================================================================= */}
      {tab === 'payroll' && (
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">
              {isBangla ? 'অক্টোবর ২০২৬ মাসের প্রক্রিয়াকৃত বেতন ও অনুমোদন' : 'October 2026 Processed Payroll'}
            </CardTitle>
            <Badge variant="success" className="text-xs">
              {isBangla ? 'অনুমোদিত ও প্রস্তুত' : 'Approved'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-xl">
              <div>
                <span className="text-muted-foreground">{isBangla ? 'মোট কর্মকর্তা:' : 'Total Staff:'}</span>
                <div className="text-lg font-bold font-mono mt-0.5">{visibleEmployees.length} Persons</div>
              </div>
              <div>
                <span className="text-muted-foreground">{isBangla ? 'প্রভিডেন্ট ফান্ড মোট জমা:' : 'Total PF Deducted:'}</span>
                <div className="text-lg font-bold font-mono text-primary mt-0.5">৳ 16,200</div>
              </div>
              <div>
                <span className="text-muted-foreground">{isBangla ? 'সর্বমোট প্রদেয় অর্থ:' : 'Net Disbursement:'}</span>
                <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">
                  {formatCurrency(totalMonthlyPayroll, { useBanglaNumerals: isBangla })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DYNAMIC PAYSLIP BUILDER & CUSTOM INPUT DIALOG                    */}
      {/* ========================================================================= */}
      {payslipModalOpen && (
        <Dialog
          isOpen={payslipModalOpen}
          onClose={() => setPayslipModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span>{isBangla ? 'মাসিক পে-স্লিপ প্রস্তুত ও এডিটর' : 'Customize & Generate Monthly Payslip'}</span>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            {/* Top Selection Row: Month, Staff, Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border text-xs">
              <div>
                <label className="font-semibold block mb-1">{isBangla ? 'কর্মকর্তা নির্বাচন:' : 'Select Employee:'}</label>
                <select
                  value={payslipData.employeeId}
                  onChange={(e) => {
                    const emp = employees.find((emp) => emp.id === e.target.value);
                    if (emp) handleOpenPayslipBuilder(emp);
                  }}
                  className="w-full h-8 px-2 rounded-lg border border-input bg-background font-semibold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.empId} - {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">{isBangla ? 'বেতনের মাস ও বছর:' : 'Month & Year:'}</label>
                <Input
                  value={payslipData.month}
                  onChange={(e) => setPayslipData({ ...payslipData, month: e.target.value })}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isBangla ? 'পরিশোধ মাধ্যম (Payment Mode):' : 'Payment Mode:'}</label>
                <select
                  value={payslipData.paymentMode}
                  onChange={(e) => setPayslipData({ ...payslipData, paymentMode: e.target.value as any })}
                  className="w-full h-8 px-2 rounded-lg border border-input bg-background font-semibold"
                >
                  <option value="bank">ব্যাংক ট্রান্সফার (BEFTN/NPSB)</option>
                  <option value="bkash">বিকাশ / নগদ পে-রোল (bKash/Nagad)</option>
                  <option value="cash">নগদ ক্যাশ ভাউচার (Cash)</option>
                </select>
              </div>
            </div>

            {/* Inputs: 2-Columns (Earnings vs Deductions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Earnings Column */}
              <div className="p-3 border rounded-xl bg-card space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5 font-bold text-xs text-emerald-700">
                  <span>উপার্জনসমূহ (Gross Earnings)</span>
                  <span className="font-mono">৳ {grossEarnings.toLocaleString()}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">মূল বেতন (Basic):</span>
                    <Input
                      type="number"
                      value={payslipData.basicSalary}
                      onChange={(e) => setPayslipData({ ...payslipData, basicSalary: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">বাড়িভাড়া ভাতা (House Rent):</span>
                    <Input
                      type="number"
                      value={payslipData.houseRent}
                      onChange={(e) => setPayslipData({ ...payslipData, houseRent: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">চিকিৎসা ভাতা (Medical):</span>
                    <Input
                      type="number"
                      value={payslipData.medicalAllowance}
                      onChange={(e) => setPayslipData({ ...payslipData, medicalAllowance: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">যাতায়াত ভাতা (Conveyance):</span>
                    <Input
                      type="number"
                      value={payslipData.conveyance}
                      onChange={(e) => setPayslipData({ ...payslipData, conveyance: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-primary font-semibold">উৎসব বোনাস (Festival Bonus):</span>
                    <Input
                      type="number"
                      value={payslipData.festivalBonus}
                      onChange={(e) => setPayslipData({ ...payslipData, festivalBonus: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs text-primary font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">ইনসেন্টিভ / পারফরম্যান্স বোনাস:</span>
                    <Input
                      type="number"
                      value={payslipData.incentiveBonus}
                      onChange={(e) => setPayslipData({ ...payslipData, incentiveBonus: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">মোবাইল ও অন্যান্য ভাতা:</span>
                    <Input
                      type="number"
                      value={payslipData.mobileAllowance}
                      onChange={(e) => setPayslipData({ ...payslipData, mobileAllowance: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="p-3 border rounded-xl bg-card space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5 font-bold text-xs text-rose-600">
                  <span>কর্তনসমূহ (Deductions)</span>
                  <span className="font-mono">-৳ {totalDeductions.toLocaleString()}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">প্রভিডেন্ট ফান্ড (PF 10%):</span>
                    <Input
                      type="number"
                      value={payslipData.pfDeduction}
                      onChange={(e) => setPayslipData({ ...payslipData, pfDeduction: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs text-rose-600 font-semibold"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">আয়কর কর্তন (Income Tax / TDS):</span>
                    <Input
                      type="number"
                      value={payslipData.taxDeduction}
                      onChange={(e) => setPayslipData({ ...payslipData, taxDeduction: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">স্টাফ ঋণ কিস্তি কর্তন:</span>
                    <Input
                      type="number"
                      value={payslipData.loanDeduction}
                      onChange={(e) => setPayslipData({ ...payslipData, loanDeduction: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">অগ্রিম বেতন কর্তন (Salary Advance):</span>
                    <Input
                      type="number"
                      value={payslipData.advanceDeduction}
                      onChange={(e) => setPayslipData({ ...payslipData, advanceDeduction: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">বিলম্ব / অনুপস্থিতি জরিমানা:</span>
                    <Input
                      type="number"
                      value={payslipData.latePenaltyDeduction}
                      onChange={(e) => setPayslipData({ ...payslipData, latePenaltyDeduction: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">অন্যান্য কর্তন (Other):</span>
                    <Input
                      type="number"
                      value={payslipData.otherDeduction}
                      onChange={(e) => setPayslipData({ ...payslipData, otherDeduction: Number(e.target.value) })}
                      className="h-7 w-28 text-right font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Net Summary Box */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">প্রদেয় নিট বেতন (Net Take-Home Salary):</span>
                <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  কথায়: {isBangla ? numberToWordsBn(netPayable) : numberToWordsEn(netPayable)}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  ৳ {netPayable.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* OFFICIAL A4 PRINTABLE PAYSLIP SHEET                           */}
            {/* ============================================================= */}
            <div
              id="payslip-print-sheet"
              className="p-8 bg-white text-black border rounded-xl space-y-4 font-sans text-xs shadow-inner"
            >
              {/* Official Header */}
              <div className="text-center border-b pb-3 space-y-1">
                <h2 className="text-base font-bold tracking-tight text-gray-900 uppercase">
                  {settings?.orgName.en || tenant?.name?.en || 'NGO ERP ORGANIZATION'}
                </h2>
                <p className="text-xs text-gray-700 font-semibold">{settings?.orgName.bn || tenant?.name?.bn || 'এনজিও ইআরপি সংস্থা'}</p>
                <p className="text-[10px] text-gray-500">
                  রেজিস্টার্ড প্রধান কার্যালয়: {settings?.address.bn || 'ঢাকা, বাংলাদেশ'} | MRA রেজিঃ {settings?.regNumber || 'NGO-REG-2026'}
                </p>
                <div className="inline-block mt-1 px-4 py-1 bg-gray-100 rounded-md font-bold text-xs border border-gray-300">
                  {isBangla ? `মাসিক বেতন ও ভাতা পরিশোধ স্লিপ — ${payslipData.month}` : `MONTHLY SALARY PAYSLIP - ${payslipData.month}`}
                </div>
              </div>

              {/* Employee Summary Details */}
              <div className="grid grid-cols-2 gap-3 py-2 border-b text-[11px]">
                <div className="space-y-1">
                  <div><span className="font-bold text-gray-700">কর্মকর্তার নাম:</span> {selectedEmpForPayslip.name}</div>
                  <div><span className="font-bold text-gray-700">এমপ্লয়ী আইডি:</span> <span className="font-mono font-bold">{selectedEmpForPayslip.empId}</span></div>
                  <div><span className="font-bold text-gray-700">পদবি:</span> {selectedEmpForPayslip.designation}</div>
                  <div><span className="font-bold text-gray-700">শাখা:</span> {selectedEmpForPayslip.branchName}</div>
                </div>
                <div className="space-y-1 text-right sm:text-left">
                  <div><span className="font-bold text-gray-700">বিভাগ:</span> {selectedEmpForPayslip.department}</div>
                  <div><span className="font-bold text-gray-700">যোগদানের তারিখ:</span> {selectedEmpForPayslip.joiningDate}</div>
                  <div><span className="font-bold text-gray-700">পরিশোধের মাধ্যম:</span> {payslipData.paymentMode.toUpperCase()} ({selectedEmpForPayslip.bankAccount})</div>
                  <div><span className="font-bold text-gray-700">ভাউচার প্রিন্ট তারিখ:</span> {formatDate(Date.now())}</div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="grid grid-cols-2 gap-6 text-[11px]">
                {/* Earnings */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 border-b pb-1 flex justify-between">
                    <span>উপার্জনসমূহ (Earnings)</span>
                    <span>টাকা (৳)</span>
                  </div>
                  <div className="flex justify-between text-gray-700"><span>মূল বেতন (Basic Salary):</span><span className="font-mono">৳ {Number(payslipData.basicSalary).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-700"><span>বাড়িভাড়া ভাতা (House Rent):</span><span className="font-mono">৳ {Number(payslipData.houseRent).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-700"><span>চিকিৎসা ভাতা (Medical):</span><span className="font-mono">৳ {Number(payslipData.medicalAllowance).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-700"><span>যাতায়াত ভাতা (Conveyance):</span><span className="font-mono">৳ {Number(payslipData.conveyance).toLocaleString()}</span></div>
                  {payslipData.festivalBonus > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold"><span>উৎসব বোনাস (Festival Bonus):</span><span className="font-mono">৳ {Number(payslipData.festivalBonus).toLocaleString()}</span></div>
                  )}
                  {payslipData.incentiveBonus > 0 && (
                    <div className="flex justify-between text-gray-700"><span>ইনসেন্টিভ / পারফরম্যান্স:</span><span className="font-mono">৳ {Number(payslipData.incentiveBonus).toLocaleString()}</span></div>
                  )}
                  {payslipData.mobileAllowance > 0 && (
                    <div className="flex justify-between text-gray-700"><span>মোবাইল ও অন্যান্য ভাতা:</span><span className="font-mono">৳ {Number(payslipData.mobileAllowance).toLocaleString()}</span></div>
                  )}
                  <div className="border-t pt-1 flex justify-between font-bold text-gray-900">
                    <span>মোট উপার্জন (Gross Pay):</span>
                    <span className="font-mono">৳ {grossEarnings.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 border-b pb-1 flex justify-between">
                    <span>কর্তনসমূহ (Deductions)</span>
                    <span>টাকা (৳)</span>
                  </div>
                  <div className="flex justify-between text-rose-700"><span>প্রভিডেন্ট ফান্ড (PF Deduction):</span><span className="font-mono">-৳ {Number(payslipData.pfDeduction).toLocaleString()}</span></div>
                  {payslipData.taxDeduction > 0 && (
                    <div className="flex justify-between text-gray-700"><span>উৎস কর কর্তন (Income Tax TDS):</span><span className="font-mono">-৳ {Number(payslipData.taxDeduction).toLocaleString()}</span></div>
                  )}
                  {payslipData.loanDeduction > 0 && (
                    <div className="flex justify-between text-gray-700"><span>স্টাফ ঋণ কর্তন (Loan):</span><span className="font-mono">-৳ {Number(payslipData.loanDeduction).toLocaleString()}</span></div>
                  )}
                  {payslipData.advanceDeduction > 0 && (
                    <div className="flex justify-between text-gray-700"><span>অগ্রিম কর্তন (Advance):</span><span className="font-mono">-৳ {Number(payslipData.advanceDeduction).toLocaleString()}</span></div>
                  )}
                  {payslipData.latePenaltyDeduction > 0 && (
                    <div className="flex justify-between text-gray-700"><span>বিলম্ব / অনুপস্থিতি কর্তন:</span><span className="font-mono">-৳ {Number(payslipData.latePenaltyDeduction).toLocaleString()}</span></div>
                  )}
                  {payslipData.otherDeduction > 0 && (
                    <div className="flex justify-between text-gray-700"><span>অন্যান্য কর্তন (Other):</span><span className="font-mono">-৳ {Number(payslipData.otherDeduction).toLocaleString()}</span></div>
                  )}
                  <div className="border-t pt-1 flex justify-between font-bold text-rose-700">
                    <span>মোট কর্তন (Total Deductions):</span>
                    <span className="font-mono">-৳ {totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Highlight Box */}
              <div className="p-3 bg-gray-50 border-2 border-gray-300 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900 block text-xs">সর্বমোট প্রদেয় নিট বেতন (Net Payable):</span>
                  <span className="text-[11px] text-gray-600">
                    কথায়: {isBangla ? numberToWordsBn(netPayable) : numberToWordsEn(netPayable)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base text-emerald-800">৳ {netPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Signatures Row */}
              <div className="grid grid-cols-4 gap-4 pt-10 text-center text-[10px] text-gray-600">
                <div className="border-t border-gray-400 pt-1 font-semibold">কর্মচারীর স্বাক্ষর</div>
                <div className="border-t border-gray-400 pt-1 font-semibold">প্রস্তুতকারী (HR)</div>
                <div className="border-t border-gray-400 pt-1 font-semibold">হিসাব কর্মকর্তা</div>
                <div className="border-t border-gray-400 pt-1 font-semibold">শাখা ব্যবস্থাপক / ED</div>
              </div>

              <div className="text-center pt-2 text-[9px] text-gray-400 border-t">
                This is a computer generated monthly salary voucher. System ID: NGO-ERP-PAY-2026-X1
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setPayslipModalOpen(false)} className="text-xs">
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button
                onClick={() => triggerPrint('payslip-print-sheet', `Payslip_${selectedEmpForPayslip.empId}_${payslipData.month}`)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                {isBangla ? 'A4 পেপারে পে-স্লিপ প্রিন্ট করুন' : 'Print A4 Payslip'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INTERACTIVE GPS CLOCK-IN & GEOFENCING MODAL                      */}
      {/* ========================================================================= */}
      {gpsModalOpen && (
        <Dialog
          isOpen={gpsModalOpen}
          onClose={() => setGpsModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" />
              <span>{isBangla ? 'জিপিএস হাজিরা ও জিওফেন্স চেক-ইন' : 'GPS Geofenced Clock-In'}</span>
            </div>
          }
          maxWidth="md"
        >
          <div className="space-y-4 pt-2 text-xs">
            {/* Geofence Status Card */}
            <div className={`p-4 rounded-xl border-2 ${isWithinGeofence ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200' : 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {isBangla ? 'জিওফেন্স অবস্থান যাচাই:' : 'Geofence Verification:'}
                </span>
                <Badge variant={isWithinGeofence ? 'success' : 'destructive'} className="text-[10px]">
                  {isWithinGeofence ? 'অনুমোদিত সীমার মধ্যে ✅' : 'অনুমোদিত সীমার বাইরে ❌'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-muted-foreground block text-[10px]">আপনার বর্তমান দূরত্ব:</span>
                  <span className="font-mono font-bold text-sm">{distanceFromBranch} মিটার</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">শাখার সর্বোচ্চ অনুমোদিত সীমা:</span>
                  <span className="font-mono font-bold text-sm">{activeBranchTarget.radius} মিটার</span>
                </div>
              </div>
            </div>

            {/* Attendance Options */}
            <div className="space-y-2">
              <label className="font-semibold block">{isBangla ? 'হাজিরার ধরন নির্বাচন করুন:' : 'Attendance Mode:'}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceType('branch')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${attendanceType === 'branch' ? 'border-primary bg-primary/10 font-bold' : 'border-border'}`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-primary" />
                  <div>শাখা কার্যালয় উপস্থিতি</div>
                  <div className="text-[10px] text-muted-foreground">শাখা ক্যাম্পাসে নিয়মিত ইন-টাইম</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceType('field_center')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${attendanceType === 'field_center' ? 'border-primary bg-primary/10 font-bold' : 'border-border'}`}
                >
                  <MapPin className="w-4 h-4 mb-1 text-emerald-600" />
                  <div>সমিতি কেন্দ্র মাঠ উপস্থিতি</div>
                  <div className="text-[10px] text-muted-foreground">মাঠে কিস্তি আদায়ে কেন্দ্রে উপস্থিতি</div>
                </button>
              </div>
            </div>

            {/* Branch Target & Coordinates */}
            <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">টার্গেট শাখা:</span>
                <span className="font-semibold">{activeBranchTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">আপনার GPS কো-অর্ডিনেট:</span>
                <span className="font-mono font-bold">{currentCoords.lat}, {currentCoords.lng}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={handleFetchRealGps} className="text-xs">
                <Navigation className="w-3.5 h-3.5 mr-1" />
                GPS রিফ্রেশ করুন
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setGpsModalOpen(false)} className="text-xs">
                  বাতিল
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmClockIn}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  হাজিরা নিশ্চিত করুন (Clock In)
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INTER-BRANCH TRANSFER FORM                                       */}
      {/* ========================================================================= */}
      {transferModalOpen && (
        <Dialog
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              <span>{isBangla ? 'কর্মকর্তা আন্তঃশাখা বদলি আদেশ ফরম' : 'Inter-Branch Transfer Order Form'}</span>
            </div>
          }
          maxWidth="md"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">কর্মকর্তা:</label>
                <Input value={activeTransferOrder.employeeName} disabled className="h-8 text-xs bg-muted" />
              </div>
              <div>
                <label className="font-semibold block mb-1">স্মারক নম্বর (Memo No):</label>
                <Input
                  value={activeTransferOrder.memoNo}
                  onChange={(e) => setActiveTransferOrder({ ...activeTransferOrder, memoNo: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">বর্তমান শাখা:</label>
                <Input value={activeTransferOrder.currentBranchName} disabled className="h-8 text-xs bg-muted" />
              </div>
              <div>
                <label className="font-semibold block mb-1">বদলিকৃত নতুন শাখা:</label>
                <select
                  value={activeTransferOrder.targetBranchId}
                  onChange={(e) => {
                    const b = BRANCHES_DIRECTORY.find((br) => br.id === e.target.value);
                    if (b) {
                      setActiveTransferOrder({
                        ...activeTransferOrder,
                        targetBranchId: b.id,
                        targetBranchName: b.name
                      });
                    }
                  }}
                  className="w-full h-8 px-2 rounded-lg border border-input bg-background font-semibold"
                >
                  {BRANCHES_DIRECTORY.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">বদলির কার্যকরী তারিখ:</label>
                <Input
                  value={activeTransferOrder.effectiveDate}
                  onChange={(e) => setActiveTransferOrder({ ...activeTransferOrder, effectiveDate: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">যোগদানের শেষ সময়সীমা:</label>
                <Input
                  value={activeTransferOrder.reportingDeadline}
                  onChange={(e) => setActiveTransferOrder({ ...activeTransferOrder, reportingDeadline: e.target.value })}
                  className="h-8 text-xs font-bold text-rose-600"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">স্থানান্তর ভাতা (যদি প্রযোজ্য হয়):</label>
              <Input
                type="number"
                value={activeTransferOrder.relocationAllowance}
                onChange={(e) => setActiveTransferOrder({ ...activeTransferOrder, relocationAllowance: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">বদলির কারণ / দাপ্তরিক উদ্দেশ্য (বাংলা):</label>
              <Input
                value={activeTransferOrder.reasonBn}
                onChange={(e) => setActiveTransferOrder({ ...activeTransferOrder, reasonBn: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setTransferModalOpen(false)} className="text-xs">
                বাতিল
              </Button>
              <Button size="sm" onClick={handleExecuteTransfer} className="text-xs bg-primary font-bold">
                বদলি নিশ্চিত করুন ও চিঠি তৈরি করুন →
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: OFFICIAL BILINGUAL TRANSFER LETTER & A4 PRINT                    */}
      {/* ========================================================================= */}
      {transferLetterModalOpen && (
        <Dialog
          isOpen={transferLetterModalOpen}
          onClose={() => setTransferLetterModalOpen(false)}
          title={
            <div className="flex items-center justify-between w-full pr-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>{isBangla ? 'অফিসিয়াল বদলি আদেশ পত্র (A4 Letterhead)' : 'Official Transfer Order'}</span>
              </div>
              {/* Language Switcher for Transfer Letter */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setTransferLang('bn')}
                  className={`px-2 py-0.5 rounded font-semibold ${transferLang === 'bn' ? 'bg-background shadow text-primary' : 'text-muted-foreground'}`}
                >
                  বাংলা আদেশ
                </button>
                <button
                  type="button"
                  onClick={() => setTransferLang('en')}
                  className={`px-2 py-0.5 rounded font-semibold ${transferLang === 'en' ? 'bg-background shadow text-primary' : 'text-muted-foreground'}`}
                >
                  English Order
                </button>
              </div>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            {/* A4 PRINTABLE TRANSFER LETTER */}
            <div
              id="transfer-letter-sheet"
              className="p-10 bg-white text-black border rounded-xl space-y-6 font-serif text-xs shadow-inner leading-relaxed"
            >
              {/* Institutional Letterhead */}
              <div className="text-center border-b-2 border-gray-900 pb-4 space-y-1">
                <h1 className="text-lg font-bold tracking-wider text-gray-950 uppercase">
                  {settings?.orgName.en || tenant?.name?.en || 'NGO ERP ORGANIZATION'}
                </h1>
                <p className="text-xs font-semibold text-gray-800">{settings?.orgName.bn || tenant?.name?.bn || 'এনজিও ইআরপি সংস্থা'}</p>
                <p className="text-[10px] text-gray-600">
                  প্রধান কার্যালয়: {settings?.address.bn || 'ঢাকা, বাংলাদেশ'} | ফোন: {settings?.phone || '০১৭০০-০০০০০০'} | রেজিঃ নং: {settings?.regNumber || 'NGO-REG-2026'}
                </p>
              </div>

              {/* Memo & Date */}
              <div className="flex justify-between items-center text-[11px] font-sans font-semibold text-gray-800">
                <div>স্মারক নং / Ref: <span className="font-mono">{activeTransferOrder.memoNo}</span></div>
                <div>তারিখ / Date: <span className="font-mono">{activeTransferOrder.date}</span></div>
              </div>

              {/* Recipient */}
              <div className="text-[11px] space-y-0.5 font-sans">
                <div className="font-bold text-gray-900">প্রাপক:</div>
                <div className="font-bold">{activeTransferOrder.employeeName}</div>
                <div>পদবি: {activeTransferOrder.designation}</div>
                <div>বর্তমান কর্মস্থল: {activeTransferOrder.currentBranchName}</div>
              </div>

              {/* Subject */}
              <div className="border-t border-b py-2 text-center font-bold text-xs uppercase font-sans text-gray-900">
                {transferLang === 'bn'
                  ? 'বিষয়: আন্তঃশাখা বদলি ও পদায়ন সংক্রান্ত দাপ্তরিক আদেশ'
                  : 'SUBJECT: OFFICIAL ORDER REGARDING INTER-BRANCH TRANSFER AND REASSIGNMENT'}
              </div>

              {/* Letter Body Text */}
              {transferLang === 'bn' ? (
                <div className="space-y-3 text-justify text-xs text-gray-800 leading-relaxed font-sans">
                  <p>
                    উপযুক্ত বিষয়ের প্রেক্ষিতে সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাচ্ছে যে, কর্তৃপক্ষের সিদ্ধান্ত মোতাবেক প্রাতিষ্ঠানিক কাজের গতিশীলতা বৃদ্ধি ও প্রশাসনিক প্রয়োজনে আপনাকে <strong>{activeTransferOrder.currentBranchName}</strong> হতে <strong>{activeTransferOrder.targetBranchName}</strong>-তে বদলি ও পদায়ন করা হলো।
                  </p>
                  <p>
                    আপনাকে আগামী <strong>{activeTransferOrder.reportingDeadline}</strong> তারিখের মধ্যে আপনার বর্তমান কর্মস্থলের সকল দায়িত্ব, সমিতির কিস্তি আদায় নথিপত্র ও হিসাব শাখা ব্যবস্থাপকের নিকট যথাযথভাবে বুঝিয়ে দিয়ে ছাড়পত্র গ্রহণপূর্বক নতুন শাখায় যোগদান করার জন্য নির্দেশ প্রদান করা হলো।
                  </p>
                  {activeTransferOrder.relocationAllowance > 0 && (
                    <p>
                      স্থানান্তরকালীন যাতায়াত ও লজিস্টিক সহায়তা বাবদ এককালীন <strong>৳ {activeTransferOrder.relocationAllowance.toLocaleString()} (পাঁচ হাজার টাকা মাত্র)</strong> অনুমোদন করা হলো, যা আপনার বেতন একাউন্টে সমন্বয় করা হবে।
                    </p>
                  )}
                  <p>
                    কর্তৃপক্ষের অনুমোদনক্রমে এ আদেশ অবিলম্বে কার্যকর হবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-justify text-xs text-gray-800 leading-relaxed font-sans">
                  <p>
                    In pursuance of operational efficiency and organizational requirements, you are hereby transferred from <strong>{activeTransferOrder.currentBranchName}</strong> to <strong>{activeTransferOrder.targetBranchName}</strong> with immediate effect.
                  </p>
                  <p>
                    You are directed to formally hand over all active files, microcredit recovery registers, and operational assets to the Branch Manager of your current branch and report for duty to the Branch Manager of <strong>{activeTransferOrder.targetBranchName}</strong> no later than <strong>{activeTransferOrder.reportingDeadline}</strong>.
                  </p>
                  {activeTransferOrder.relocationAllowance > 0 && (
                    <p>
                      A relocation and travel allowance of <strong>BDT {activeTransferOrder.relocationAllowance.toLocaleString()}</strong> has been sanctioned in your favor as per institutional HR policy.
                    </p>
                  )}
                  <p>
                    This office order is issued with the approval of the competent authority and shall take effect immediately.
                  </p>
                </div>
              )}

              {/* Signatures */}
              <div className="flex justify-between pt-12 text-xs font-sans">
                <div className="text-center space-y-1">
                  <div className="w-40 border-t border-gray-800 pt-1 font-bold">প্রাপ্তি স্বীকার (কর্মচারী)</div>
                  <div className="text-[10px] text-gray-500">তারিখ ও মোবাইল নম্বর</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-48 border-t border-gray-800 pt-1 font-bold">
                    {activeTransferOrder.approvedBy.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-gray-700 font-semibold">নির্বাহী পরিচালক / অনুমোদিত কর্তৃপক্ষ</div>
                  <div className="text-[9px] text-gray-500">{settings?.orgName.bn}</div>
                </div>
              </div>

              {/* CC (Distribution) */}
              <div className="border-t pt-3 text-[10px] text-gray-600 font-sans space-y-1">
                <div className="font-bold text-gray-800">অনুলিপি অবগতি ও প্রয়োজনীয় কার্যার্থে প্রেরিত হলো:</div>
                <div>১. নির্বাহী পরিচালক মহোদয়ের একান্ত সচিব (অবগতির জন্য)</div>
                <div>২. বিভাগীয় প্রধান, অর্থ ও হিসাব বিভাগ (পিএফ ও বেতন ফাইল স্থানান্তরের জন্য)</div>
                <div>৩. শাখা ব্যবস্থাপক, {activeTransferOrder.currentBranchName} (ছাড়পত্র প্রদানের অনুরোধ সহ)</div>
                <div>৪. শাখা ব্যবস্থাপক, {activeTransferOrder.targetBranchName} (যোগদানপত্র গ্রহণের অনুরোধ সহ)</div>
                <div>৫. ব্যক্তিগত নথি / অফিস গার্ড ফাইল।</div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setTransferLetterModalOpen(false)} className="text-xs">
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button
                onClick={() => triggerPrint('transfer-letter-sheet', `Transfer_Order_${activeTransferOrder.memoNo.replace(/\//g, '_')}`)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                {isBangla ? 'A4 পেপারে বদলি আদেশ প্রিন্ট করুন' : 'Print A4 Transfer Letter'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
