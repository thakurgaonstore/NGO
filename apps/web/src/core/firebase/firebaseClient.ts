import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { TenantFirebaseConfig } from '@ngo-erp/shared';

// Default Central Platform Project Config (Mode A)
// In production, these come from Vite env vars: VITE_FIREBASE_API_KEY, etc.
export const DEFAULT_PLATFORM_FIREBASE_CONFIG: TenantFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB83V9Bb8pQEg6ZPImQiyFMlq3V30FhVms',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mahinerpngo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mahinerpngo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mahinerpngo.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '340000460729',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:340000460729:web:2f3ca4870dfd91e6027068'
};

// Map of initialized Firebase Apps (cache by tenant ID or '[DEFAULT]')
const initializedApps = new Map<string, FirebaseApp>();
const initializedFirestore = new Map<string, Firestore>();
const initializedAuth = new Map<string, Auth>();

export function getOrCreateFirebaseInstance(tenantId?: string, customConfig?: TenantFirebaseConfig): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const appKey = (customConfig && tenantId) ? `tenant_${tenantId}` : '[DEFAULT]';

  if (initializedApps.has(appKey)) {
    return {
      app: initializedApps.get(appKey)!,
      firestore: initializedFirestore.get(appKey)!,
      auth: initializedAuth.get(appKey)!
    };
  }

  let app: FirebaseApp;
  const configToUse = customConfig || DEFAULT_PLATFORM_FIREBASE_CONFIG;

  if (appKey === '[DEFAULT]') {
    app = getApps().length > 0 ? getApp() : initializeApp(configToUse);
  } else {
    // Mode B: Dedicated Tenant Firebase project initialized dynamically!
    app = initializeApp(configToUse, appKey);
  }

  // Initialize Firestore with IndexedDB Multi-Tab Offline Persistence
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (err) {
    db = getFirestore(app);
  }

  const auth = getAuth(app);

  initializedApps.set(appKey, app);
  initializedFirestore.set(appKey, db);
  initializedAuth.set(appKey, auth);

  return { app, firestore: db, auth };
}
