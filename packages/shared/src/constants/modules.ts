export interface ErpModuleMeta {
  id: string;
  name: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  icon: string;
  category: 'core' | 'operations' | 'finance' | 'admin';
  required?: boolean; // Core modules cannot be toggled off
  permissions: {
    action: string;
    name: {
      en: string;
      bn: string;
    };
  }[];
}

export const ERP_MODULES: ErpModuleMeta[] = [
  {
    id: 'dashboard',
    name: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    description: { en: 'Role-based KPIs, real-time counters, and operational alerts', bn: 'ভূমিকা-ভিত্তিক কেপিআই, রিয়েল-টাইম কাউন্টার এবং সতর্কবার্তা' },
    icon: 'LayoutDashboard',
    category: 'core',
    required: true,
    permissions: [
      { action: 'view', name: { en: 'View Dashboard', bn: 'ড্যাশবোর্ড দেখা' } },
      { action: 'export', name: { en: 'Export KPI Reports', bn: 'কেপিআই রিপোর্ট রপ্তানি' } }
    ]
  },
  {
    id: 'organization',
    name: { en: 'Organization & Branches', bn: 'প্রতিষ্ঠান ও শাখা কাঠামো' },
    description: { en: 'Branches, divisions, districts, upazilas, and fiscal periods', bn: 'শাখা, বিভাগ, জেলা, উপজেলা এবং অর্থবছর ব্যবস্থাপনা' },
    icon: 'Building2',
    category: 'admin',
    required: true,
    permissions: [
      { action: 'view', name: { en: 'View Structure', bn: 'কাঠামো দেখা' } },
      { action: 'edit', name: { en: 'Modify Branches & Areas', bn: 'শাখা ও এলাকা পরিবর্তন' } }
    ]
  },
  {
    id: 'users',
    name: { en: 'Users & Staff', bn: 'ব্যবহারকারী ও কর্মী' },
    description: { en: 'Staff profiles, branch assignment, and access scoping', bn: 'কর্মকর্তা প্রোফাইল, শাখা অ্যাসাইন এবং অ্যাক্সেস স্কোপ' },
    icon: 'UserCheck',
    category: 'admin',
    required: true,
    permissions: [
      { action: 'view', name: { en: 'View Users', bn: 'ব্যবহারকারী দেখা' } },
      { action: 'edit', name: { en: 'Manage Users', bn: 'ব্যবহারকারী পরিচালনা' } }
    ]
  },
  {
    id: 'roles',
    name: { en: 'Roles & RBAC', bn: 'ভূমিকা ও পারমিশন (RBAC)' },
    description: { en: 'Custom roles and permission matrix', bn: 'কাস্টম ভূমিকা ও পারমিশন ম্যাট্রিক্স' },
    icon: 'Shield',
    category: 'admin',
    required: true,
    permissions: [
      { action: 'view', name: { en: 'View Roles', bn: 'রোল দেখা' } },
      { action: 'edit', name: { en: 'Edit Roles', bn: 'রোল সম্পাদনা' } }
    ]
  },
  {
    id: 'members',
    name: { en: 'Members & CRM', bn: 'সদস্য ও সুফলভোগী' },
    description: { en: 'Beneficiaries, donors, volunteers, NID verification, ID cards with QR', bn: 'সুফলভোগী, দাতা, স্বেচ্ছাসেবক, এনআইডি এবং কিউআর আইডি কার্ড' },
    icon: 'Users',
    category: 'operations',
    permissions: [
      { action: 'view', name: { en: 'View Members', bn: 'সদস্য তালিকা দেখা' } },
      { action: 'create', name: { en: 'Register Member', bn: 'নতুন সদস্য নিবন্ধন' } },
      { action: 'edit', name: { en: 'Update Member', bn: 'সদস্য তথ্য সম্পাদনা' } },
      { action: 'delete', name: { en: 'Archive Member', bn: 'সদস্য সংরক্ষণ/মুছে ফেলা' } },
      { action: 'export', name: { en: 'Bulk Export / ID Print', bn: 'আইডি প্রিন্ট ও এক্সপোর্ট' } }
    ]
  },
  {
    id: 'projects',
    name: { en: 'Programs & Projects', bn: 'প্রকল্প ও কর্মসূচি' },
    description: { en: 'Grant projects, donors, logframes, milestone trackers, budget vs actual', bn: 'প্রকল্প, দাতা, লক্ষ্যমাত্রা, মাইলফলক এবং বাজেট ট্র্যাকিং' },
    icon: 'FolderKanban',
    category: 'operations',
    permissions: [
      { action: 'view', name: { en: 'View Projects', bn: 'প্রকল্প দেখা' } },
      { action: 'create', name: { en: 'Create Project', bn: 'নতুন প্রকল্প তৈরি' } },
      { action: 'edit', name: { en: 'Edit Project & Budget', bn: 'প্রকল্প ও বাজেট সম্পাদনা' } },
      { action: 'approve', name: { en: 'Approve Milestones', bn: 'মাইলফলক অনুমোদন' } }
    ]
  },
  {
    id: 'field_ops',
    name: { en: 'Field Operations & Forms', bn: 'মাঠের তথ্য ও ফর্ম বিল্ডার' },
    description: { en: 'Dynamic drag-drop Form Builder, offline survey submissions, GPS check-in', bn: 'ডাইনামিক ফর্ম বিল্ডার, অফলাইন সমীক্ষা সংগ্রহ ও জিপিএস হাজিরা' },
    icon: 'ClipboardList',
    category: 'operations',
    permissions: [
      { action: 'view', name: { en: 'View Submissions', bn: 'জমা ফর্ম দেখা' } },
      { action: 'submit', name: { en: 'Submit Field Forms', bn: 'মাঠের তথ্য জমা দেওয়া' } },
      { action: 'create_form', name: { en: 'Design Forms', bn: 'নতুন ফর্ম তৈরি' } },
      { action: 'approve', name: { en: 'Review & Approve Submissions', bn: 'ফর্ম পর্যালোচনা ও অনুমোদন' } }
    ]
  },
  {
    id: 'accounts',
    name: { en: 'Accounts & Finance', bn: 'হিসাব ও অর্থায়ন' },
    description: { en: 'NGO Chart of Accounts, double-entry vouchers, Cash Book, Balance Sheet', bn: 'হিসাব পরিকল্পনা, দ্বৈত দাখিলা ভাউচার, ক্যাশ বুক, আয়-ব্যয় বিবরণী' },
    icon: 'Receipt',
    category: 'finance',
    permissions: [
      { action: 'view', name: { en: 'View Accounts & Ledgers', bn: 'খতিয়ান ও হিসাব দেখা' } },
      { action: 'create', name: { en: 'Create Vouchers (Maker)', bn: 'ভাউচার তৈরি' } },
      { action: 'approve', name: { en: 'Approve Vouchers (Checker)', bn: 'ভাউচার অনুমোদন' } },
      { action: 'export', name: { en: 'Financial Statements Export', bn: 'আর্থিক বিবরণী প্রিন্ট/রপ্তানি' } }
    ]
  },
  {
    id: 'microcredit',
    name: { en: 'Savings & Microcredit', bn: 'সঞ্চয় ও ক্ষুদ্রঋণ' },
    description: { en: 'Samity groups, savings products, loan disbursement, collection sheets', bn: 'সমিতি, সঞ্চয় পণ্য, ঋণ বিতরণ ও দৈনিক কিস্তি আদায় শিট' },
    icon: 'PiggyBank',
    category: 'finance',
    permissions: [
      { action: 'view', name: { en: 'View Samity & Loans', bn: 'সমিতি ও ঋণ তথ্য দেখা' } },
      { action: 'disburse', name: { en: 'Disburse Loan', bn: 'ঋণ বিতরণ' } },
      { action: 'collect', name: { en: 'Collection Sheet Entry', bn: 'কিস্তি আদায় এন্ট্রি' } },
      { action: 'approve', name: { en: 'Approve Loans', bn: 'ঋণ অনুমোদন' } }
    ]
  },
  {
    id: 'social_business',
    name: { en: 'Social Business & Projects', bn: 'সামাজিক ব্যবসা ও প্রকল্প' },
    description: { en: 'Revenue-generating social enterprises, dairy, handicrafts, agro, profit-sharing', bn: 'আয়বর্ধক সামাজিক ব্যবসা প্রতিষ্ঠান, ডেইরি, হস্তশিল্প, কৃষি ও লভ্যাংশ বণ্টন' },
    icon: 'Store',
    category: 'operations',
    permissions: [
      { action: 'view', name: { en: 'View Social Enterprises', bn: 'সামাজিক ব্যবসা দেখা' } },
      { action: 'create', name: { en: 'Create Enterprise Project', bn: 'নতুন ব্যবসা প্রকল্প শুরু' } },
      { action: 'sales', name: { en: 'Record Sales & Production', bn: 'উৎপাদন ও বিক্রয় এন্ট্রি' } },
      { action: 'profit_share', name: { en: 'Distribute Profits / Welfare', bn: 'লভ্যাংশ ও কল্যাণ তহবিল বণ্টন' } }
    ]
  },
  {
    id: 'donors_grants',
    name: { en: 'Donor Grants & Funds', bn: 'দাতা অনুদান ও তহবিল' },
    description: { en: 'Donor profiles, grant contracts, restricted funds, utilization reports', bn: 'দাতা প্রোফাইল, অনুদান চুক্তি, নির্দিষ্ট তহবিল ও ব্যয়ের হিসাব' },
    icon: 'HeartHandshake',
    category: 'finance',
    permissions: [
      { action: 'view', name: { en: 'View Grants', bn: 'তহবিল ও অনুদান দেখা' } },
      { action: 'create', name: { en: 'Record Donation', bn: 'অনুদান রেকর্ড করা' } },
      { action: 'export', name: { en: 'Generate Donor Receipt', bn: 'মানি রসিদ ও রিপোর্ট তৈরি' } }
    ]
  },
  {
    id: 'hr_payroll',
    name: { en: 'HR & Payroll', bn: 'এইচআর ও বেতন' },
    description: { en: 'Employee records, attendance with GPS, leave approvals, monthly payslips', bn: 'কর্মকর্তা প্রোফাইল, জিপিএস হাজিরা, ছুটি ও মাসিক পে-স্লিপ' },
    icon: 'Briefcase',
    category: 'admin',
    permissions: [
      { action: 'view', name: { en: 'View Employee Directory', bn: 'কর্মীদের তালিকা দেখা' } },
      { action: 'attendance', name: { en: 'Manage Attendance', bn: 'হাজিরা ব্যবস্থাপনা' } },
      { action: 'payroll', name: { en: 'Process Monthly Payroll', bn: 'মাসিক বেতন প্রক্রিয়া' } },
      { action: 'approve_leave', name: { en: 'Approve Leave Requests', bn: 'ছুটি অনুমোদন' } }
    ]
  },
  {
    id: 'inventory',
    name: { en: 'Inventory & Relief', bn: 'মজুদ পণ্য ও ত্রাণ বিতরণ' },
    description: { en: 'Item catalog, multiple stores, requisition -> PO -> GRN, relief distribution', bn: 'পণ্য তালিকা, ওয়্যারহাউস, ক্রয়াদেশ এবং সুফলভোগীদের মাঝে ত্রাণ বিতরণ' },
    icon: 'Boxes',
    category: 'operations',
    permissions: [
      { action: 'view', name: { en: 'View Stock', bn: 'মজুদ পণ্য দেখা' } },
      { action: 'distribute', name: { en: 'Distribute Relief', bn: 'ত্রাণ/মালামাল বিতরণ' } },
      { action: 'requisition', name: { en: 'Create Requisition', bn: 'ক্রয় চাহিদা তৈরি' } },
      { action: 'approve', name: { en: 'Approve Purchase Orders', bn: 'ক্রয়াদেশ অনুমোদন' } }
    ]
  },
  {
    id: 'website',
    name: { en: 'NGO Website CMS', bn: 'ওয়েবসাইট ও সিএমএস' },
    description: { en: 'Public website themes, drag-and-drop section builder, SEO, edge caching', bn: 'পাবলিক ওয়েবসাইট থিম, ড্র্যাগ-ড্রপ সেকশন বিল্ডার ও এসইও' },
    icon: 'Globe',
    category: 'admin',
    permissions: [
      { action: 'view', name: { en: 'Preview Website', bn: 'ওয়েবসাইট প্রিভিউ' } },
      { action: 'edit', name: { en: 'Edit Content & Sections', bn: 'কন্টেন্ট ও সেকশন পরিবর্তন' } },
      { action: 'publish', name: { en: 'Publish Live Site', bn: 'লাইভ প্রকাশনা' } }
    ]
  },
  {
    id: 'reports',
    name: { en: 'Reports & Analytics', bn: 'প্রতিবেদন ও অ্যানালিটিক্স' },
    description: { en: 'Pre-aggregated financial, progress, and donor-ready PDF/Excel reports', bn: 'প্রাক-গণনাকৃত আর্থিক, অগ্রগতি ও দাতা-উপযোগী প্রতিবেদন' },
    icon: 'BarChart3',
    category: 'core',
    permissions: [
      { action: 'view', name: { en: 'View Reports', bn: 'রিপোর্ট দেখা' } },
      { action: 'export', name: { en: 'Download Excel / PDF', bn: 'এক্সেল ও পিডিএফ ডাউনলোড' } }
    ]
  },
  {
    id: 'documents',
    name: { en: 'Document Archive', bn: 'ডকুমেন্ট আর্কাইভ' },
    description: { en: 'Legal licenses, donor MOUs, and audit compliance documents', bn: 'আইনি সনদ, এনজিওএবি লাইসেন্স ও অডিট রিপোর্ট' },
    icon: 'Folder',
    category: 'admin',
    permissions: [
      { action: 'view', name: { en: 'View Documents', bn: 'ডকুমেন্ট দেখা' } },
      { action: 'upload', name: { en: 'Upload Documents', bn: 'ডকুমেন্ট আপলোড' } }
    ]
  },
  {
    id: 'notices',
    name: { en: 'Notice Board', bn: 'নোটিশ বোর্ড' },
    description: { en: 'Internal staff notices and office orders', bn: 'অভ্যন্তরীণ নোটিশ ও অফিস আদেশ' },
    icon: 'Bell',
    category: 'admin',
    permissions: [
      { action: 'view', name: { en: 'View Notices', bn: 'নোটিশ দেখা' } }
    ]
  },
  {
    id: 'integrations',
    name: { en: 'Integrations (SMS/MFS)', bn: 'এসএমএস ও পেমেন্ট গেটওয়ে' },
    description: { en: 'Bulk SMS dispatch and bKash / Nagad mobile financial services', bn: 'বাল্ক এসএমএস প্রেরণ ও বিকাশ/নগদ পেমেন্ট গেটওয়ে' },
    icon: 'MessageSquare',
    category: 'admin',
    permissions: [
      { action: 'view', name: { en: 'View Integrations', bn: 'ইন্টিগ্রেশন দেখা' } },
      { action: 'send_sms', name: { en: 'Send Bulk SMS', bn: 'এসএমএস প্রেরণ' } }
    ]
  },
  {
    id: 'audit',
    name: { en: 'System Audit Logs', bn: 'সিস্টেম অডিট লগ' },
    description: { en: 'Immutable audit trail for financial actions and logins', bn: 'অপরিবর্তনীয় সিকিউরিটি ও আর্থিক অডিট ট্রেইল' },
    icon: 'History',
    category: 'admin',
    permissions: [
      { action: 'view', name: { en: 'View Audit Logs', bn: 'অডিট লগ দেখা' } }
    ]
  },
  {
    id: 'settings',
    name: { en: 'System Settings', bn: 'সিস্টেম সেটিংস' },
    description: { en: 'Organization profile, SMS gateways, payment settings, Cloudinary', bn: 'প্রতিষ্ঠানের তথ্য, এসএমএস গেটওয়ে, পেমেন্ট ও ক্লাউডিনারি' },
    icon: 'Settings',
    category: 'admin',
    required: true,
    permissions: [
      { action: 'view', name: { en: 'View Settings', bn: 'সেটিংস দেখা' } },
      { action: 'edit', name: { en: 'Modify Configuration', bn: 'কনফিগারেশন পরিবর্তন' } }
    ]
  }
];
