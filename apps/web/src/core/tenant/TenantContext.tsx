import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, TenantSettings } from '@ngo-erp/shared';
import { TenantResolver, TenantResolutionResult } from './TenantResolver';
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

// Default fallback settings for new / demo tenants
const DEFAULT_FALLBACK_SETTINGS: TenantSettings = {
  orgName: {
    en: 'Jagorani Development Foundation',
    bn: 'জাগরণী উন্নয়ন ফাউন্ডেশন'
  },
  regNumber: 'NGO-DH-2024-892',
  email: 'info@jagorani.org',
  phone: '01711-223344',
  address: {
    en: 'House 14, Road 5, Dhanmondi, Dhaka-1205',
    bn: 'বাড়ি ১৪, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫'
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
    try {
      // Connect to platform firestore to load tenant definition
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
      } else {
        // Fallback demo tenant for local preview or unprovisioned tenant
        const mockTenant: Tenant = {
          id: tenantId,
          clientId: tenantId.toUpperCase(),
          subdomain: tenantId,
          name: { en: 'Jagorani Foundation', bn: 'জাগরণী ফাউন্ডেশন' },
          planId: 'growth',
          status: 'active',
          deploymentMode: 'MODE_A',
          enabledModules: [
            'dashboard',
            'organization',
            'members',
            'projects',
            'accounts',
            'field_ops',
            'hr_payroll',
            'inventory',
            'website',
            'reports',
            'settings'
          ],
          quotas: {
            usersCount: 3,
            branchesCount: 2,
            estimatedDailyReads: 250,
            estimatedDailyWrites: 45,
            smsCreditsRemaining: 800
          },
          ownerEmail: 'director@jagorani.org',
          createdAt: Date.now() - 30 * 86400000,
          updatedAt: Date.now(),
          expiresAt: Date.now() + 335 * 86400000
        };
        setTenant(mockTenant);
        setSettings(DEFAULT_FALLBACK_SETTINGS);
      }
    } catch (err: any) {
      console.warn('Tenant data lookup failed, using local tenant state:', err);
      // Create local fallback
      const mockTenant: Tenant = {
        id: tenantId,
        clientId: tenantId.toUpperCase(),
        subdomain: tenantId,
        name: { en: 'Demo NGO', bn: 'ডেমো এনজিও' },
        planId: 'growth',
        status: 'active',
        deploymentMode: 'MODE_A',
        enabledModules: ['dashboard', 'organization', 'members', 'accounts', 'website', 'settings'],
        quotas: {
          usersCount: 2,
          branchesCount: 1,
          estimatedDailyReads: 120,
          estimatedDailyWrites: 15,
          smsCreditsRemaining: 500
        },
        ownerEmail: 'admin@demo-ngo.org',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + 365 * 86400000
      };
      setTenant(mockTenant);
      setSettings(DEFAULT_FALLBACK_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resolution.isSuperAdminPortal) {
      setIsLoading(false);
      return;
    }

    const impersonatedId = sessionStorage.getItem('ngo_impersonating_tenant_id');
    const targetTenantId = impersonatedId || resolution.tenantId || 'demo-jagorani';
    loadTenantData(targetTenantId);
  }, [resolution]);

  // Apply Tenant's Primary Color Dynamically
  useEffect(() => {
    if (settings?.primaryColor) {
      // In a real browser, we can convert hex to HSL or set CSS variables directly
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
    const originalTenantId = resolution.tenantId || 'demo-jagorani';
    loadTenantData(originalTenantId);
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
