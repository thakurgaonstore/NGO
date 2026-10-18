import { RoleDefinition } from '../types/auth';

export const DEFAULT_TENANT_ROLES: RoleDefinition[] = [
  {
    id: 'owner',
    name: { en: 'Executive Director / Owner', bn: 'নির্বাহী পরিচালক / মালিক' },
    description: { en: 'Full access to all modules, billing, settings, user admin, and data export.', bn: 'সকল মডিউল, বিলিং, সেটিংস, ইউজার অ্যাডমিন এবং ডেটা এক্সপোর্টের পূর্ণ অ্যাক্সেস।' },
    permissions: ['*'], // Wildcard - bypasses granular checks
    isSystem: true
  },
  {
    id: 'manager',
    name: { en: 'Branch Manager / Coordinator', bn: 'শাখা ব্যবস্থাপক / সমন্বয়কারী' },
    description: { en: 'Branch operations supervisor: voucher & loan approval, daily cash reconciliation, audit logs.', bn: 'শাখা অপারেশনাল সুপারভাইজার: ঋণ ও ভাউচার অনুমোদন, মাঠকর্মীদের দৈনিক ক্যাশ মিলকরণ এবং অডিট তদারকি।' },
    permissions: [
      'dashboard:view',
      'dashboard:export',
      'organization:view',
      'members:view',
      'members:create',
      'members:edit',
      'members:export',
      'projects:view',
      'projects:create',
      'projects:edit',
      'projects:approve',
      'field_ops:view',
      'field_ops:approve',
      'microcredit:view',
      'microcredit:approve',
      'microcredit:reconcile',
      'microcredit:edit_override',
      'accounts:view',
      'accounts:approve',
      'hr_payroll:view',
      'hr_payroll:approve_leave',
      'inventory:view',
      'inventory:approve',
      'website:view',
      'reports:view',
      'reports:export',
      'audit:view'
    ],
    isSystem: true
  },
  {
    id: 'field_officer',
    name: { en: 'Field Officer (Loan & Savings)', bn: 'মাঠ কর্মকর্তা (কিস্তি ও সঞ্চয় আদায়)' },
    description: { en: 'Mobile & field collection: samity collections, passbook entries, member registration, daily cash handover.', bn: 'মাঠ পর্যায়ের কার্যক্রম: কেন্দ্র ও সমিতি থেকে কিস্তি/সঞ্চয় আদায়, পাসবই লিখন, সদস্য ভর্তি ও দিনশেষে ম্যানেজারের কাছে ক্যাশ হস্তান্তর।' },
    permissions: [
      'dashboard:view',
      'members:view',
      'members:create',
      'field_ops:view',
      'field_ops:submit',
      'microcredit:view',
      'microcredit:collect',
      'microcredit:handover',
      'hr_payroll:attendance'
    ],
    isSystem: true
  },
  {
    id: 'credit_officer',
    name: { en: 'Credit Officer (Loan Specialist)', bn: 'ঋণ কর্মকর্তা (লোন স্পেশালিস্ট)' },
    description: { en: 'Loan survey, borrower verification, loan disbursement proposal, and regular installment recovery.', bn: 'ঋণ আবেদন যাচাই, প্রস্তাবনা প্রস্তুতকরণ, কিস্তি আদায় ও ঋণ খেলাপি তদারকি।' },
    permissions: [
      'dashboard:view',
      'members:view',
      'members:create',
      'field_ops:view',
      'field_ops:submit',
      'microcredit:view',
      'microcredit:collect',
      'microcredit:propose_loan'
    ],
    isSystem: false
  },
  {
    id: 'savings_mobilizer',
    name: { en: 'Savings Mobilizer & DPS Specialist', bn: 'সঞ্চয় সংগঠক ও ডিপিএস সমন্বয়ক' },
    description: { en: 'DPS & FDR opening, savings deposit mobilization, and maturity tracking.', bn: 'নতুন ডিপিএস ও এফডিআর গ্রাহক তৈরি, সঞ্চয় বৃদ্ধি ও মেয়াদপূর্তির হিসেব তদারকি।' },
    permissions: [
      'dashboard:view',
      'members:view',
      'members:create',
      'microcredit:view',
      'microcredit:collect'
    ],
    isSystem: false
  },
  {
    id: 'cashier',
    name: { en: 'Cashier & Counter Teller', bn: 'কাউন্টার ক্যাশিয়ার ও ভল্ট অফিসার' },
    description: { en: 'Receives field officer daily collections, counter deposits, cash voucher posting, and vault management.', bn: 'মাঠকর্মীদের দৈনিক আদায় ক্যাশ গ্রহণ ও গণনা, কাউন্টার লেনদেন, ভাউচার পোস্টিং ও ভল্ট সংরক্ষণ।' },
    permissions: [
      'dashboard:view',
      'microcredit:view',
      'microcredit:reconcile',
      'accounts:view',
      'accounts:create'
    ],
    isSystem: false
  },
  {
    id: 'auditor',
    name: { en: 'Internal Auditor / Inspector', bn: 'অভ্যন্তরীণ নিরীক্ষক ও পরিদর্শক' },
    description: { en: 'Unannounced field audits, passbook cross-checking, edit history review, and anti-fraud monitoring.', bn: 'আকস্মিক কেন্দ্র পরিদর্শন, গ্রাহক পাসবই ক্রস-চেকিং, এডিট ইতিহাস যাচাই ও দুর্নীতি প্রতিরোধ পর্যবেক্ষণ।' },
    permissions: [
      'dashboard:view',
      'organization:view',
      'members:view',
      'microcredit:view',
      'accounts:view',
      'reports:view',
      'reports:export',
      'audit:view'
    ],
    isSystem: false
  },
  {
    id: 'staff',
    name: { en: 'Accounts & Office Staff', bn: 'হিসাব ও অফিস কর্মী' },
    description: { en: 'Day-to-day office entry: voucher preparation (Maker), attendance, stock receipt.', bn: 'দৈনন্দিন অফিস এন্ট্রি: ভাউচার তৈরি (মেকার), হাজিরা ও মালামাল রসিদ।' },
    permissions: [
      'dashboard:view',
      'members:view',
      'accounts:view',
      'accounts:create',
      'hr_payroll:view',
      'hr_payroll:attendance',
      'inventory:view',
      'inventory:requisition'
    ],
    isSystem: true
  }
];

