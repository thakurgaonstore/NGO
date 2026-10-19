import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { getOrCreateFirebaseInstance } from '../firebase/firebaseClient';
import { Tenant } from '@ngo-erp/shared';

export interface DeleteTenantProgress {
  step: string;
  count: number;
}

/**
 * Permanently and cascades delete all data belonging to an NGO Tenant across:
 * 1. LocalStorage scoped keys (members, loans, vouchers, inventory, users, roles, config, etc.)
 * 2. Directory cache and registered tenants index
 * 3. Central & Dedicated Firebase Firestore documents and subcollections
 */
export async function cascadeDeleteTenant(
  tenant: Tenant,
  onProgress?: (progress: DeleteTenantProgress) => void
): Promise<{ success: boolean; deletedCount: number; message: string }> {
  const tenantId = tenant.id;
  const clientId = tenant.clientId;
  const subdomain = tenant.subdomain;
  let deletedCount = 0;

  onProgress?.({ step: 'ইন-মেমোরি ও লোকাল ক্যাশ স্ক্যান করা হচ্ছে...', count: deletedCount });

  // 1. Purge all LocalStorage keys matching tenantId, clientId or subdomain
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const matchesTenant =
          key.includes(tenantId) ||
          (clientId && key.includes(clientId)) ||
          (subdomain && key.includes(subdomain));

        if (matchesTenant) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((k) => {
      localStorage.removeItem(k);
      deletedCount++;
    });
  } catch (err) {
    console.warn('LocalStorage cascade cleanup warning:', err);
  }

  // 2. Clean tenant from registered list and directory cache
  onProgress?.({ step: 'রেজিস্ট্রেশন ও ডোমেইন ডিরেক্টরি থেকে মুছে ফেলা হচ্ছে...', count: deletedCount });
  try {
    const rawSaved = localStorage.getItem('ngo_registered_tenants');
    if (rawSaved) {
      const saved = JSON.parse(rawSaved);
      const filtered = saved.filter(
        (t: any) => t.id !== tenantId && t.clientId !== clientId
      );
      localStorage.setItem('ngo_registered_tenants', JSON.stringify(filtered));
    }

    const dir = JSON.parse(localStorage.getItem('ngo_tenant_directory_cache') || '{}');
    let dirChanged = false;
    for (const domain of Object.keys(dir)) {
      if (dir[domain] === tenantId || dir[domain] === clientId) {
        delete dir[domain];
        dirChanged = true;
      }
    }
    if (dirChanged) {
      localStorage.setItem('ngo_tenant_directory_cache', JSON.stringify(dir));
    }

    // Clear impersonation if active for this tenant
    if (sessionStorage.getItem('ngo_impersonating_tenant_id') === tenantId) {
      sessionStorage.removeItem('ngo_impersonating_tenant_id');
    }
  } catch (err) {
    console.warn('Directory cache cleanup warning:', err);
  }

  // 3. Connect to Firestore (Central or Dedicated) and Cascade Delete Subcollections
  onProgress?.({ step: 'ফায়ারবেস ক্লাউড ডাটাবেস রেকর্ড পরিষ্কার করা হচ্ছে...', count: deletedCount });
  try {
    const customConfig = tenant.deploymentMode === 'MODE_B' ? tenant.firebaseConfig : undefined;
    const { firestore } = getOrCreateFirebaseInstance(tenantId, customConfig);

    const subcollections = [
      'members',
      'branches',
      'centers',
      'loans',
      'savings',
      'transactions',
      'vouchers',
      'inventory_items',
      'inventory_transactions',
      'inventory_distributions',
      'inventory',
      'projects',
      'social_enterprises',
      'employees',
      'users',
      'forms',
      'cash_recon',
      'audit_logs',
      'web_cms',
      'website',
      'notices',
      'events',
      'config'
    ];

    for (const subcol of subcollections) {
      try {
        const colRef = collection(firestore, 'tenants', tenantId, subcol);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const batch = writeBatch(firestore);
          snap.docs.forEach((d) => {
            batch.delete(d.ref);
            deletedCount++;
          });
          await batch.commit();
        }
      } catch (subErr) {
        // Individual subcollection may not exist or be empty
      }
    }

    // Delete settings doc
    try {
      const settingsDocRef = doc(firestore, 'tenants', tenantId, 'config', 'settings');
      await deleteDoc(settingsDocRef);
      deletedCount++;
    } catch (e) {}

    // Delete tenant root document in 'tenants'
    try {
      const tenantDocRef = doc(firestore, 'tenants', tenantId);
      await deleteDoc(tenantDocRef);
      deletedCount++;
    } catch (e) {}

    // Delete from 'superadmin/tenants/{tenantId}' in central platform
    try {
      const centralInstance = getOrCreateFirebaseInstance();
      const superTenantDoc = doc(centralInstance.firestore, 'superadmin', 'tenants', tenantId);
      await deleteDoc(superTenantDoc);
      deletedCount++;
    } catch (e) {}
  } catch (fireErr) {
    console.warn('Firestore cascade delete partially completed or offline:', fireErr);
  }

  onProgress?.({ step: 'সম্পন্ন হয়েছে!', count: deletedCount });

  return {
    success: true,
    deletedCount,
    message: `${tenant.name.bn || tenant.name.en} এবং এর সমস্ত ডাটা (${deletedCount} টি আইটেম) সফলভাবে মুছে ফেলা হয়েছে।`
  };
}
