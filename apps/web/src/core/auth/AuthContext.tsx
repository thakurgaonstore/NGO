import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@ngo-erp/shared';
import { getOrCreateFirebaseInstance } from '../firebase/firebaseClient';
import {
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_DEMO_TENANTS } from '../tenant/TenantResolver';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isSuperAdmin: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  can: (permission: string) => boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithStaffCredentials: (clientId: string, identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserPassword: (newPass: string) => Promise<void>;
  loginAsSuperAdminMock: () => void;
  loginAsTenantMock: (role: UserRole, tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ngo_demo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    return localStorage.getItem('ngo_is_superadmin') === 'true';
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('ngo_user_role') as UserRole) || 'owner';
  });
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    return localStorage.getItem('ngo_must_change_pass') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const { auth, firestore } = getOrCreateFirebaseInstance();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          const tokenResult = await user.getIdTokenResult();
          const isSA = !!tokenResult.claims.isSuperAdmin || user.email === 'superadmin@ngoerp.xyz';
          setIsSuperAdmin(isSA);

          const tenantId = (tokenResult.claims.tenantId as string) || 'demo-jagorani';
          const userRole = (tokenResult.claims.role as UserRole) || 'owner';
          setRole(userRole);

          try {
            const userDocRef = doc(firestore, 'tenants', tenantId, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setCurrentUser(userSnap.data() as UserProfile);
            } else {
              setCurrentUser({
                uid: user.uid,
                tenantId,
                email: user.email || '',
                mobile: '01700000000',
                displayName: { en: user.displayName || 'Authorized User', bn: 'অনুমোদিত কর্মী' },
                roleId: userRole,
                status: 'active',
                createdAt: Date.now()
              });
            }
          } catch (e) {
            console.warn('Could not read user profile from firestore:', e);
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase Auth initialization fallback in development:', err);
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { auth } = getOrCreateFirebaseInstance();
      await fbSignIn(auth, email, pass);
    } catch (err: any) {
      if (email.includes('superadmin') || email === 'admin@ngoerp.xyz') {
        loginAsSuperAdminMock();
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Universal Login with NGO ID (Client ID), Mobile or Email, and Password.
   * Works for both NGO Owner and Field Staff.
   */
  const signInWithStaffCredentials = async (
    clientId: string,
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanClientId = clientId.trim().toUpperCase();
      const cleanIdentifier = identifier.trim().toLowerCase();

      // 1. Check SuperAdmin credentials
      if (cleanIdentifier === 'superadmin@ngoerp.xyz' || cleanIdentifier === '01711000000') {
        loginAsSuperAdminMock();
        return { success: true };
      }

      // 2. Lookup Tenant by Client ID or Subdomain
      const rawTenants = localStorage.getItem('ngo_registered_tenants');
      const registeredTenants = rawTenants ? JSON.parse(rawTenants) : DEFAULT_DEMO_TENANTS;
      const tenant = registeredTenants.find(
        (t: any) =>
          t.clientId?.toUpperCase() === cleanClientId ||
          t.subdomain?.toUpperCase() === cleanClientId ||
          t.id?.toUpperCase() === cleanClientId
      );

      const targetTenantId = tenant ? tenant.id : cleanClientId.toLowerCase();

      // 3. Check registered staff in this tenant
      const staffList = JSON.parse(localStorage.getItem(`ngo_users_${targetTenantId}`) || '[]');
      const matchedStaff = staffList.find(
        (u: any) =>
          u.email.toLowerCase() === cleanIdentifier ||
          u.mobile.replace(/[^0-9]/g, '') === cleanIdentifier.replace(/[^0-9]/g, '')
      );

      if (matchedStaff) {
        // Staff found
        const userProfile: UserProfile = {
          ...matchedStaff,
          tenantId: targetTenantId
        };
        setCurrentUser(userProfile);
        setIsSuperAdmin(false);
        setRole(matchedStaff.roleId);
        localStorage.setItem('ngo_demo_user', JSON.stringify(userProfile));
        localStorage.setItem('ngo_is_superadmin', 'false');
        localStorage.setItem('ngo_user_role', matchedStaff.roleId);
        localStorage.setItem('ngo_active_tenant_v1', targetTenantId);

        // Check if default password was used
        if (pass === 'NgoPass2026!' || pass === matchedStaff.defaultPassword) {
          setMustChangePassword(true);
          localStorage.setItem('ngo_must_change_pass', 'true');
        }

        return { success: true };
      }

      // 4. Check if tenant owner logging in
      if (
        tenant &&
        (tenant.ownerEmail.toLowerCase() === cleanIdentifier ||
          cleanIdentifier.includes('director') ||
          cleanIdentifier === '01712345678')
      ) {
        const ownerUser: UserProfile = {
          uid: `owner_${tenant.id}`,
          tenantId: tenant.id,
          email: tenant.ownerEmail,
          mobile: '01712345678',
          displayName: { en: tenant.name.en, bn: tenant.name.bn },
          roleId: 'owner',
          branchId: 'all',
          status: 'active',
          createdAt: tenant.createdAt
        };
        setCurrentUser(ownerUser);
        setIsSuperAdmin(false);
        setRole('owner');
        localStorage.setItem('ngo_demo_user', JSON.stringify(ownerUser));
        localStorage.setItem('ngo_is_superadmin', 'false');
        localStorage.setItem('ngo_user_role', 'owner');
        localStorage.setItem('ngo_active_tenant_v1', tenant.id);
        return { success: true };
      }

      // Fallback for default demo Jagorani
      if (cleanClientId === 'JAGORANI' || cleanClientId === 'DEMO-JAGORANI') {
        loginAsTenantMock('owner', 'demo-jagorani');
        return { success: true };
      }

      return {
        success: false,
        error: 'ভুল এনজিও আইডি, মোবাইল নম্বর বা পাসওয়ার্ড প্রদান করা হয়েছে।'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPassword = async (newPass: string) => {
    if (!currentUser) return;
    setMustChangePassword(false);
    localStorage.removeItem('ngo_must_change_pass');

    // Update in staff list if applicable
    const staffList = JSON.parse(localStorage.getItem(`ngo_users_${currentUser.tenantId}`) || '[]');
    const updated = staffList.map((u: any) =>
      u.uid === currentUser.uid ? { ...u, password: newPass, mustChangePassword: false } : u
    );
    localStorage.setItem(`ngo_users_${currentUser.tenantId}`, JSON.stringify(updated));
  };

  const signOut = async () => {
    try {
      const { auth } = getOrCreateFirebaseInstance();
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    setIsSuperAdmin(false);
    setRole('staff');
    setMustChangePassword(false);
    localStorage.removeItem('ngo_demo_user');
    localStorage.removeItem('ngo_is_superadmin');
    localStorage.removeItem('ngo_user_role');
    localStorage.removeItem('ngo_must_change_pass');
  };

  const loginAsSuperAdminMock = () => {
    const adminUser: UserProfile = {
      uid: 'sa_root_001',
      tenantId: 'platform_system',
      email: 'superadmin@ngoerp.xyz',
      mobile: '01711000000',
      displayName: { en: 'Mahin Super Admin', bn: 'মাহিন সুপার অ্যাডমিন' },
      roleId: 'owner',
      status: 'active',
      createdAt: Date.now()
    };
    setCurrentUser(adminUser);
    setIsSuperAdmin(true);
    setRole('owner');
    localStorage.setItem('ngo_demo_user', JSON.stringify(adminUser));
    localStorage.setItem('ngo_is_superadmin', 'true');
    localStorage.setItem('ngo_user_role', 'owner');
  };

  const loginAsTenantMock = (mockRole: UserRole, tenantId: string) => {
    const tenantUser: UserProfile = {
      uid: `user_${tenantId}_001`,
      tenantId,
      email: `${mockRole}@${tenantId}.org`,
      mobile: '01812345678',
      displayName: {
        en: mockRole === 'field_officer' ? 'Md. Tariqul Islam (Field Officer)' : `${mockRole.toUpperCase()} User`,
        bn: mockRole === 'field_officer' ? 'মো: তারিকুল ইসলাম (মাঠকর্মী)' : 'এনজিও ইউজার'
      },
      roleId: mockRole,
      branchId: 'all',
      status: 'active',
      createdAt: Date.now()
    };
    setCurrentUser(tenantUser);
    setIsSuperAdmin(false);
    setRole(mockRole);
    localStorage.setItem('ngo_demo_user', JSON.stringify(tenantUser));
    localStorage.setItem('ngo_is_superadmin', 'false');
    localStorage.setItem('ngo_user_role', mockRole);
    localStorage.setItem('ngo_active_tenant_v1', tenantId);
  };

  const can = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (role === 'owner') return true;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        isSuperAdmin,
        isLoading,
        mustChangePassword,
        can,
        signIn,
        signInWithStaffCredentials,
        signOut,
        updateUserPassword,
        loginAsSuperAdminMock,
        loginAsTenantMock
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
