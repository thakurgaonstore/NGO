import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, TenantSettings } from '@ngo-erp/shared';
import { TenantResolver, TenantResolutionResult } from './TenantResolver';
import { isTenantDeleted } from './tenantCleanupService';
import { getOrCreateFirebaseInstance } from '../firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

interface TenantContextType {
  tenant: Tenant | null;
  settings: TenantSettings | null;
  resolution: TenantResolutionResult;
  isLoading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  isSuspended: boolean;
  isExpired: boolean;
  isImpersonating: boolean;
  clearImpersonation: () => void;
}

const TenantContext = createContext<TenantContextType | null>(null);

// Default fallback settings for new / valid registered tenants
const DEFAULT_FALLBACK_SETTINGS: TenantSettings = {
  orgName: {
    en: 'NGO ERP Tenant',
    bn: 'এনজিও ইআরপি টেন্যান্ট'
  },
  regNumber: 'NGO-REG-2026',
  email: 'info@ngoerp.xyz',
  phone: '01700-000000',
  address: {
    en: 'Dhaka, Bangladesh',
    bn: 'ঢাকা, বাংলাদেশ'
  },
  primaryColor: '#0d9488', // Teal 600
  fiscalYearStartMonth: 7, // July
  currency: 'BDT',
  currencySymbol: '৳',
  timeZone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
  useBanglaNumerals: true
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resolution] = useState<TenantResolutionResult>(() => TenantResolver.resolveFromLocation());
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(DEFAULT_FALLBACK_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return !!sessionStorage.getItem('ngo_impersonating_tenant_id');
  });

  const loadTenantData = async (tenantId: string) => {
    setIsLoading(true);
    setError(null);

    // If tenant is marked as deleted, immediately abort and set null
    if (isTenantDeleted(tenantId)) {
      setTenant(null);
      setError('TENANT_DELETED');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Check registered list in localStorage first
      let localMatch: Tenant | null = null;
      try {
        const saved = localStorage.getItem('ngo_registered_tenants');
        if (saved) {
          const list: Tenant[] = JSON.parse(saved);
          localMatch = list.find(
            (t) =>
              !isTenantDeleted(t.id) &&
              (t.id === tenantId || t.clientId?.toUpperCase() === tenantId.toUpperCase())
          ) || null;
        }
      } catch {}

      // 2. Connect to platform firestore to load tenant definition
      const { firestore } = getOrCreateFirebaseInstance();
      const tenantRef = doc(firestore, 'superadmin', 'tenants', tenantId);
      const snap = await getDoc(tenantRef);

      if (snap.exists()) {
        const data = snap.data() as Tenant;
        setTenant(data);

        // Load tenant settings
        const settingsRef = doc(firestore, 'tenants', tenantId, 'config', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as TenantSettings);
        } else {
          setSettings(DEFAULT_FALLBACK_SETTINGS);
        }
      } else if (localMatch) {
        setTenant(localMatch);
        setSettings(DEFAULT_FALLBACK_SETTINGS);
      } else {
        // Neither in cloud nor in registered list -> truly not found or deleted
        setTenant(null);
        setError('TENANT_NOT_FOUND');
      }
    } catch (err: any) {
      console.warn('Tenant data lookup failed, checking local state:', err);
      try {
        const saved = localStorage.getItem('ngo_registered_tenants');
        if (saved) {
          const list: Tenant[] = JSON.parse(saved);
          const found = list.find((t) => t.id === tenantId && !isTenantDeleted(t.id));
          if (found) {
            setTenant(found);
            setSettings(DEFAULT_FALLBACK_SETTINGS);
            setIsLoading(false);
            return;
          }
        }
      } catch {}
      setTenant(null);
      setError('TENANT_NOT_FOUND');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resolution.isSuperAdminPortal || resolution.isPlatformHome) {
      setIsLoading(false);
      return;
    }

    const impersonatedId = sessionStorage.getItem('ngo_impersonating_tenant_id');
    const targetTenantId = impersonatedId || resolution.tenantId;
    if (targetTenantId) {
      loadTenantData(targetTenantId);
    } else {
      setIsLoading(false);
    }
  }, [resolution]);

  // Listen to cross-tab tenant deletion events
  useEffect(() => {
    const handleTenantDeleted = (e: any) => {
      const deletedId = e.detail?.tenantId;
      if (tenant?.id === deletedId || resolution.tenantId === deletedId) {
        setTenant(null);
        setError('TENANT_DELETED');
      }
    };
    window.addEventListener('ngo_tenant_deleted', handleTenantDeleted);
    return () => window.removeEventListener('ngo_tenant_deleted', handleTenantDeleted);
  }, [tenant, resolution]);

  // Apply Tenant's Primary Color Dynamically
  useEffect(() => {
    if (settings?.primaryColor) {
      document.documentElement.style.setProperty('--primary-override', settings.primaryColor);
    }
  }, [settings]);

  const switchTenant = async (tenantId: string) => {
    sessionStorage.setItem('ngo_impersonating_tenant_id', tenantId);
    setIsImpersonating(true);
    TenantResolver.cacheTenantId(tenantId);
    await loadTenantData(tenantId);
  };

  const clearImpersonation = () => {
    sessionStorage.removeItem('ngo_impersonating_tenant_id');
    setIsImpersonating(false);
    if (resolution.tenantId) {
      loadTenantData(resolution.tenantId);
    } else {
      setTenant(null);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        settings,
        resolution,
        isLoading,
        error,
        switchTenant,
        isSuspended: tenant?.status === 'suspended',
        isExpired: tenant?.status === 'expired',
        isImpersonating,
        clearImpersonation
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
