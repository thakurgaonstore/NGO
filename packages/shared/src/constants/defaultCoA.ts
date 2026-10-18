export interface DefaultAccountHead {
  code: string;
  nameEn: string;
  nameBn: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentCode?: string;
  isGroup: boolean;
}

export const DEFAULT_NGO_CHART_OF_ACCOUNTS: DefaultAccountHead[] = [
  // 1000 - Assets
  { code: '1000', nameEn: 'Assets', nameBn: 'সম্পদ', type: 'asset', isGroup: true },
  { code: '1100', nameEn: 'Current Assets', nameBn: 'চলতি সম্পদ', type: 'asset', parentCode: '1000', isGroup: true },
  { code: '1110', nameEn: 'Cash in Hand (Head Office)', nameBn: 'হাতে নগদ (প্রধান কার্যালয়)', type: 'asset', parentCode: '1100', isGroup: false },
  { code: '1120', nameEn: 'Cash in Hand (Branch Offices)', nameBn: 'হাতে নগদ (শাখা কার্যালয়সমূহ)', type: 'asset', parentCode: '1100', isGroup: false },
  { code: '1130', nameEn: 'Sonali Bank Ltd - Principal A/C', nameBn: 'সোনালী ব্যাংক লিঃ - প্রধান হিসাব', type: 'asset', parentCode: '1100', isGroup: false },
  { code: '1140', nameEn: 'Islami Bank Bangladesh Ltd A/C', nameBn: 'ইসলামী ব্যাংক বাংলাদেশ লিঃ হিসাব', type: 'asset', parentCode: '1100', isGroup: false },
  { code: '1150', nameEn: 'bKash Merchant Account', nameBn: 'বিকাশ মার্চেন্ট হিসাব', type: 'asset', parentCode: '1100', isGroup: false },
  { code: '1160', nameEn: 'Nagad Merchant Account', nameBn: 'নগদ মার্চেন্ট হিসাব', type: 'asset', parentCode: '1100', isGroup: false },
  { code: '1170', nameEn: 'Staff Advances & Prepayments', nameBn: 'কর্মকর্তা অগ্রিম ও প্রিপেমেন্ট', type: 'asset', parentCode: '1100', isGroup: false },

  { code: '1200', nameEn: 'Fixed Assets', nameBn: 'স্থায়ী সম্পদ', type: 'asset', parentCode: '1000', isGroup: true },
  { code: '1210', nameEn: 'Land & Building', nameBn: 'জমি ও ভবন', type: 'asset', parentCode: '1200', isGroup: false },
  { code: '1220', nameEn: 'Office Furniture & Fixtures', nameBn: 'অফিস আসবাবপত্র ও ফিক্সচার', type: 'asset', parentCode: '1200', isGroup: false },
  { code: '1230', nameEn: 'Computers & IT Equipment', nameBn: 'কম্পিউটার ও তথ্যপ্রযুক্তি সরঞ্জাম', type: 'asset', parentCode: '1200', isGroup: false },
  { code: '1240', nameEn: 'Motorcycles & Vehicles', nameBn: 'মোটরসাইকেল ও যানবাহন', type: 'asset', parentCode: '1200', isGroup: false },
  { code: '1250', nameEn: 'Accumulated Depreciation', nameBn: 'পুঞ্জীভূত অবচয়', type: 'asset', parentCode: '1200', isGroup: false },

  // 2000 - Liabilities
  { code: '2000', nameEn: 'Liabilities', nameBn: 'দায়', type: 'liability', isGroup: true },
  { code: '2100', nameEn: 'Current Liabilities', nameBn: 'চলতি দায়', type: 'liability', parentCode: '2000', isGroup: true },
  { code: '2110', nameEn: 'Accounts Payable / Vendors', nameBn: 'প্রদেয় হিসাব / ভেন্ডর', type: 'liability', parentCode: '2100', isGroup: false },
  { code: '2120', nameEn: 'Accrued Salaries & Allowances', nameBn: 'বকেয়া বেতন ও ভাতা', type: 'liability', parentCode: '2100', isGroup: false },
  { code: '2130', nameEn: 'Tax & VAT Deductions Payable', nameBn: 'উৎসে আয়কর ও ভ্যাট প্রদেয়', type: 'liability', parentCode: '2100', isGroup: false },
  { code: '2140', nameEn: 'Audit Fee Payable', nameBn: 'প্রদেয় নিরীক্ষা ফি', type: 'liability', parentCode: '2100', isGroup: false },
  { code: '2150', nameEn: 'Beneficiary Security Deposits', nameBn: 'সুফলভোগী জামানত তহবিল', type: 'liability', parentCode: '2100', isGroup: false },

  // 3000 - Capital / Fund Balance
  { code: '3000', nameEn: 'Fund Balance & Equity', nameBn: 'তহবিল ব্যালেন্স ও মূলধন', type: 'equity', isGroup: true },
  { code: '3100', nameEn: 'General / Reserve Fund', nameBn: 'সাধারণ / সংরক্ষিত তহবিল', type: 'equity', parentCode: '3000', isGroup: false },
  { code: '3200', nameEn: 'Restricted Donor Project Funds', nameBn: 'নির্দিষ্ট দাতা প্রকল্প তহবিল', type: 'equity', parentCode: '3000', isGroup: false },
  { code: '3300', nameEn: 'Cumulative Surplus / Deficit', nameBn: 'পুঞ্জীভূত উদ্বৃত্ত / ঘাটতি', type: 'equity', parentCode: '3000', isGroup: false },

  // 4000 - Income / Receipts
  { code: '4000', nameEn: 'Income & Grants', nameBn: 'আয় ও অনুদান', type: 'income', isGroup: true },
  { code: '4100', nameEn: 'Foreign Grants & Donations', nameBn: 'বৈদেশিক অনুদান ও সাহায্য', type: 'income', parentCode: '4000', isGroup: false },
  { code: '4200', nameEn: 'Local Donations & Zakat Fund', nameBn: 'স্থানীয় অনুদান ও যাকাত তহবিল', type: 'income', parentCode: '4000', isGroup: false },
  { code: '4300', nameEn: 'Government Subsidies & Grants', nameBn: 'সরকারি অনুদান ও সহায়তা', type: 'income', parentCode: '4000', isGroup: false },
  { code: '4400', nameEn: 'Microcredit Service Charges', nameBn: 'ক্ষুদ্রঋণ সার্ভিস চার্জ আয়', type: 'income', parentCode: '4000', isGroup: false },
  { code: '4500', nameEn: 'Membership Fees & Subscriptions', nameBn: 'সদস্য ফি ও চাঁদা', type: 'income', parentCode: '4000', isGroup: false },
  { code: '4600', nameEn: 'Bank Interest & Profit Income', nameBn: 'ব্যাংক সুদ ও মুনাফা আয়', type: 'income', parentCode: '4000', isGroup: false },

  // 5000 - Expenses / Payments
  { code: '5000', nameEn: 'Expenses', nameBn: 'ব্যয় ও খরচ', type: 'expense', isGroup: true },
  { code: '5100', nameEn: 'Program & Project Direct Costs', nameBn: 'কর্মসূচি ও প্রকল্প প্রত্যক্ষ ব্যয়', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5200', nameEn: 'Relief & Beneficiary Aid Distribution', nameBn: 'ত্রাণ ও সুবিধাভোগী সাহায্য বিতরণ', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5300', nameEn: 'Staff Salaries, Wages & Allowances', nameBn: 'কর্মকর্তা-কর্মচারীদের বেতন ও ভাতা', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5400', nameEn: 'Office Rent & Utility Bills', nameBn: 'অফিস ভাড়া, বিদ্যুৎ ও ইউটিলিটি বিল', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5500', nameEn: 'Travel, Fuel & Field Conveyance', nameBn: 'ভ্রমণ, জ্বালানি ও মাঠ যাতায়াত', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5600', nameEn: 'Training, Workshop & Seminar Expenses', nameBn: 'প্রশিক্ষণ ও কর্মশালা ব্যয়', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5700', nameEn: 'Printing, Stationery & Postage', nameBn: 'মুদ্রণ, স্টেশনারি ও ডাক খরচ', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5800', nameEn: 'Audit, Legal & Professional Fees', nameBn: 'নিরীক্ষা, আইনি ও পেশাগত ফি', type: 'expense', parentCode: '5000', isGroup: false },
  { code: '5900', nameEn: 'Bank Charges & Commissions', nameBn: 'ব্যাংক চার্জ ও ফি', type: 'expense', parentCode: '5000', isGroup: false }
];
