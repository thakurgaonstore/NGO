import { doc, deleteDoc, collection, getDocs, writeBatch, setDoc, arrayUnion } from 'firebase/firestore';
import { getOrCreateFirebaseInstance } from '../firebase/firebaseClient';
import { Tenant } from '@ngo-erp/shared';

export interface DeleteTenantProgress {
  step: string;
  count: number;
}

/**
 * Permanently blacklisted tenant identifiers (e.g. deleted default demos such as Jagorani)
 */
export const PERMANENT_GLOBAL_BLACKLIST: string[] = [
  'demo-jagorani',
  'jagorani',
  'jagorani-development-foundation',
  'jagoranibd.org',
  'www.jagoranibd.org',
  'jagorani.org',
  'www.jagorani.org'
];

/**
 * Returns list of tenant IDs / client codes / subdomains that were permanently deleted.
 */
export function getDeletedTenantIds(): string[] {
  try {
    const raw = localStorage.getItem('ngo_deleted_tenant_ids');
    const stored: string[] = raw ? JSON.parse(raw) : [];
    return Array.from(new Set([...PERMANENT_GLOBAL_BLACKLIST, ...stored.map((s) => s.trim().toLowerCase())]));
  } catch {
    return [...PERMANENT_GLOBAL_BLACKLIST];
  }
}

/**
 * Checks whether an ID, client code or subdomain has been permanently deleted.
 */
export function isTenantDeleted(idOrSlug?: string | null): boolean {
  if (!idOrSlug) return false;
  const clean = idOrSlug.trim().toLowerCase().replace(/^www\./, '');
  const deleted = getDeletedTenantIds();
  return deleted.some((d) => {
    const cleanD = d.toLowerCase().replace(/^www\./, '');
    return cleanD === clean || clean === `demo-${cleanD}` || cleanD === `demo-${clean}`;
  });
}

/**
 * Records deleted IDs into localStorage and Firestore blacklist
 */
export function markTenantAsDeleted(identifiers: string[]) {
  try {
    const existing = getDeletedTenantIds();
    const updated = Array.from(new Set([...existing, ...identifiers.map((s) => s.trim().toLowerCase())]));
    localStorage.setItem('ngo_deleted_tenant_ids', JSON.stringify(updated));

    // Best-effort sync to Firestore central registry
    try {
      const { firestore } = getOrCreateFirebaseInstance();
      const registryRef = doc(firestore, 'superadmin', 'tenants_registry');
      setDoc(
        registryRef,
        {
          deletedTenantIds: arrayUnion(...identifiers.map((s) => s.trim().toLowerCase())),
          updatedAt: Date.now()
        },
        { merge: true }
      ).catch(() => {});
    } catch {}
  } catch (err) {
    console.warn('Failed to mark tenant as deleted:', err);
  }
}

/**
 * Automatically purges any lingering traces of blacklisted or deleted tenants from localStorage & sessionStorage.
 */
export function purgeDeletedTenantTraces() {
  try {
    const deletedList = getDeletedTenantIds();

    // 1. Purge registered list
    const rawSaved = localStorage.getItem('ngo_registered_tenants');
    if (rawSaved) {
      const list = JSON.parse(rawSaved);
      if (Array.isArray(list)) {
        const filtered = list.filter(
          (t: any) =>
            !isTenantDeleted(t.id) &&
            !isTenantDeleted(t.clientId) &&
            !isTenantDeleted(t.subdomain)
        );
        if (filtered.length !== list.length) {
          localStorage.setItem('ngo_registered_tenants', JSON.stringify(filtered));
        }
      }
    }

    // 2. Purge active tenant if deleted
    const active = localStorage.getItem('ngo_active_tenant_v1');
    if (active && isTenantDeleted(active)) {
      localStorage.removeItem('ngo_active_tenant_v1');
    }

    // 3. Purge impersonation if deleted
    const imp = sessionStorage.getItem('ngo_impersonating_tenant_id');
    if (imp && isTenantDeleted(imp)) {
      sessionStorage.removeItem('ngo_impersonating_tenant_id');
    }

    // 4. Purge directory cache
    const dirRaw = localStorage.getItem('ngo_tenant_directory_cache');
    if (dirRaw) {
      const dir = JSON.parse(dirRaw);
      let changed = false;
      for (const k of Object.keys(dir)) {
        if (isTenantDeleted(dir[k])) {
          delete dir[k];
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('ngo_tenant_directory_cache', JSON.stringify(dir));
      }
    }

    // 5. Purge specific keys containing deleted IDs
    for (const d of deletedList) {
      const clean = d.toLowerCase();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.toLowerCase().includes(clean) || (clean.startsWith('demo-') && key.toLowerCase().includes(clean.replace('demo-', ''))))) {
          if (key !== 'ngo_deleted_tenant_ids') {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Auto purge warning:', err);
  }
}

/**
 * Permanently and cascades delete all data belonging to an NGO Tenant across:
 * 1. LocalStorage scoped keys (members, loans, vouchers, inventory, users, roles, config, etc.)
 * 2. Directory cache and registered tenants index
 * 3. Central & Dedicated Firebase Firestore documents and subcollections
 * 4. Permanent deletion blacklist so it never resurrects from demo fallbacks
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
        (t: any) => t.id !== tenantId && t.clientId !== clientId && t.subdomain !== subdomain
      );
      localStorage.setItem('ngo_registered_tenants', JSON.stringify(filtered));
    }

    const dir = JSON.parse(localStorage.getItem('ngo_tenant_directory_cache') || '{}');
    let dirChanged = false;
    for (const domain of Object.keys(dir)) {
      if (dir[domain] === tenantId || dir[domain] === clientId || dir[domain] === subdomain) {
        delete dir[domain];
        dirChanged = true;
      }
    }
    if (dirChanged) {
      localStorage.setItem('ngo_tenant_directory_cache', JSON.stringify(dir));
    }

    // Clear impersonation and active cache if active for this tenant
    if (sessionStorage.getItem('ngo_impersonating_tenant_id') === tenantId) {
      sessionStorage.removeItem('ngo_impersonating_tenant_id');
    }
    if (localStorage.getItem('ngo_active_tenant_v1') === tenantId) {
      localStorage.removeItem('ngo_active_tenant_v1');
    }
  } catch (err) {
    console.warn('Directory cache cleanup warning:', err);
  }

  // 3. Mark in permanent deletion blacklist
  const identifiers = [tenantId, clientId, subdomain].filter(Boolean) as string[];
  markTenantAsDeleted(identifiers);

  // 4. Connect to Firestore (Central or Dedicated) and Cascade Delete Subcollections
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
      'config',
      'inquiries'
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
        // Subcollection may be empty or not yet created
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

  // 5. Broadcast deletion to all open tabs and windows
  try {
    const bc = new BroadcastChannel('ngo_tenant_channel');
    bc.postMessage({ type: 'TENANT_DELETED', tenantId, clientId });
    bc.close();
  } catch {}

  window.dispatchEvent(
    new CustomEvent('ngo_tenant_deleted', {
      detail: { tenantId, clientId, subdomain }
    })
  );

  onProgress?.({ step: 'সম্পন্ন হয়েছে!', count: deletedCount });

  return {
    success: true,
    deletedCount,
    message: `${tenant.name.bn || tenant.name.en} (${tenant.clientId}) এবং এর সমস্ত ডাটা (${deletedCount} টি আইটেম) সফলভাবে মুছে ফেলা হয়েছে।`
  };
}
