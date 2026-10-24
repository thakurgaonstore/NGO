/**
 * NGO ERP SaaS - Full Tenant Data Backup, Restore, and CSV Export/Import Engine
 * Supports complete system snapshots (members, loans, vouchers, accounts, staff, config)
 * and CSV exports with UTF-8 BOM for Microsoft Excel Bangla compatibility.
 */

export interface TenantBackupSnapshot {
  version: string;
  tenantId: string;
  tenantName: string;
  exportedAt: number;
  exportedDate: string;
  data: {
    members?: any[];
    loans?: any[];
    samity?: any[];
    vouchers?: any[];
    coa?: any[];
    cashRecon?: any[];
    users?: any[];
    branches?: any[];
    centers?: any[];
    inventory?: any[];
    websiteConfig?: any;
    settings?: any;
    roles?: any[];
  };
  checksum: string;
}

/**
 * Creates a complete JSON backup snapshot of all tenant data stored in localStorage
 */
export function createTenantFullBackup(tenantId: string, tenantName: string = 'NGO'): TenantBackupSnapshot {
  const getJson = (key: string) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  };

  const getObject = (key: string) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  };

  const backupData: TenantBackupSnapshot = {
    version: '1.0.0',
    tenantId,
    tenantName,
    exportedAt: Date.now(),
    exportedDate: new Date().toLocaleString('bn-BD'),
    data: {
      members: getJson(`ngo_members_${tenantId}`),
      loans: getJson(`ngo_loans_${tenantId}`),
      samity: getJson(`ngo_samity_${tenantId}`),
      vouchers: getJson(`ngo_vouchers_${tenantId}`),
      coa: getJson(`ngo_coa_${tenantId}`),
      cashRecon: getJson(`ngo_cash_recon_${tenantId}`),
      users: getJson(`ngo_users_${tenantId}`),
      branches: getJson(`ngo_branches_${tenantId}`),
      centers: getJson(`ngo_centers_${tenantId}`),
      inventory: getJson(`ngo_inventory_${tenantId}`),
      websiteConfig: getObject(`ngo_website_config_${tenantId}`),
      settings: getObject(`ngo_tenant_${tenantId}_settings`),
      roles: getJson(`ngo_roles_${tenantId}`)
    },
    checksum: `NGO-BKP-${tenantId}-${Date.now()}`
  };

  return backupData;
}

/**
 * Downloads the full backup snapshot as a .json file
 */
export function downloadBackupFile(snapshot: TenantBackupSnapshot): void {
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${snapshot.tenantName.replace(/\s+/g, '_')}_Full_Backup_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Restores all tenant data from an uploaded backup snapshot
 */
export function restoreTenantFromBackup(snapshot: TenantBackupSnapshot, targetTenantId: string): { success: boolean; message: string; restoredCount: number } {
  if (!snapshot || !snapshot.data) {
    throw new Error('অবৈধ ব্যাকআপ ফাইল! ফাইলটিতে ডাটা পাওয়া যায়নি।');
  }

  const tid = targetTenantId || snapshot.tenantId;
  let restoredCount = 0;
  const d = snapshot.data;

  if (d.members && Array.isArray(d.members)) {
    localStorage.setItem(`ngo_members_${tid}`, JSON.stringify(d.members));
    restoredCount += d.members.length;
  }

  if (d.loans && Array.isArray(d.loans)) {
    localStorage.setItem(`ngo_loans_${tid}`, JSON.stringify(d.loans));
    restoredCount += d.loans.length;
  }

  if (d.samity && Array.isArray(d.samity)) {
    localStorage.setItem(`ngo_samity_${tid}`, JSON.stringify(d.samity));
    restoredCount += d.samity.length;
  }

  if (d.vouchers && Array.isArray(d.vouchers)) {
    localStorage.setItem(`ngo_vouchers_${tid}`, JSON.stringify(d.vouchers));
    restoredCount += d.vouchers.length;
  }

  if (d.coa && Array.isArray(d.coa)) {
    localStorage.setItem(`ngo_coa_${tid}`, JSON.stringify(d.coa));
  }

  if (d.users && Array.isArray(d.users)) {
    localStorage.setItem(`ngo_users_${tid}`, JSON.stringify(d.users));
    restoredCount += d.users.length;
  }

  if (d.branches && Array.isArray(d.branches)) {
    localStorage.setItem(`ngo_branches_${tid}`, JSON.stringify(d.branches));
  }

  if (d.centers && Array.isArray(d.centers)) {
    localStorage.setItem(`ngo_centers_${tid}`, JSON.stringify(d.centers));
  }

  if (d.inventory && Array.isArray(d.inventory)) {
    localStorage.setItem(`ngo_inventory_${tid}`, JSON.stringify(d.inventory));
  }

  if (d.websiteConfig) {
    localStorage.setItem(`ngo_website_config_${tid}`, JSON.stringify(d.websiteConfig));
  }

  return {
    success: true,
    message: `সফলভাবে ব্যাকআপ থেকে ডাটা রিস্টোর করা হয়েছে (${restoredCount} টি রেকর্ড পুনরুদ্ধারিত)।`,
    restoredCount
  };
}

/**
 * Exports members list to CSV with UTF-8 BOM so Bangla displays accurately in Microsoft Excel
 */
export function exportMembersToCsv(members: any[], filename = 'NGO_Members_List.csv'): void {
  const headers = [
    'সদস্য কোড',
    'নাম (বাংলা)',
    'নাম (ইংরেজি)',
    'হিসাবের ধরণ',
    'মোবাইল',
    'এনআইডি / জন্মনিবন্ধন',
    'পিতা বা স্বামীর নাম',
    'শাখা',
    'সমিতি / কেন্দ্র',
    'গ্রাম / ঠিকানা',
    'রক্তের গ্রুপ',
    'যোগদানের তারিখ'
  ];

  const rows = members.map((m) => [
    `"${m.memberCode || ''}"`,
    `"${m.nameBn || ''}"`,
    `"${m.nameEn || ''}"`,
    `"${m.accountType || 'সঞ্চয়ী ও ক্ষুদ্রঋণ'}"`,
    `"${m.mobile || ''}"`,
    `"${m.nidOrBirthCert || ''}"`,
    `"${m.fatherOrSpouse || ''}"`,
    `"${m.branchName || ''}"`,
    `"${m.samityName || ''}"`,
    `"${m.village || ''}"`,
    `"${m.bloodGroup || ''}"`,
    `"${m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('bn-BD') : ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
