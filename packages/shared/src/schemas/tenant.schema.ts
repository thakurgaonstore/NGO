import { z } from 'zod';

export const FirebaseConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  authDomain: z.string().min(1, 'Auth domain is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().min(1, 'App ID is required'),
  measurementId: z.string().optional()
});

export const TenantCreateSchema = z.object({
  nameEn: z.string().min(2, 'English name must be at least 2 characters'),
  nameBn: z.string().min(2, 'Bangla name must be at least 2 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain cannot exceed 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  domain: z.string().optional().refine(
    (val) => !val || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(val),
    { message: 'Invalid custom domain format (e.g., ngo.org or www.ngo.org)' }
  ),
  clientId: z.string().min(2, 'Client ID required').regex(/^[A-Z0-9_-]+$/, 'Uppercase alphanumeric code'),
  planId: z.string().min(1, 'Plan selection is required'),
  deploymentMode: z.enum(['MODE_A', 'MODE_B']),
  firebaseConfig: FirebaseConfigSchema.optional(),
  ownerEmail: z.string().email('Valid owner email is required'),
  ownerPassword: z.string().min(6, 'Owner password must be at least 6 characters'),
  ownerMobile: z.string().min(11, 'Mobile must be at least 11 digits (e.g. 01712345678)'),
  ownerNameEn: z.string().min(2, 'Owner English name is required'),
  ownerNameBn: z.string().min(2, 'Owner Bangla name is required'),
  enabledModules: z.array(z.string()).min(1, 'At least one module must be enabled'),
  primaryColor: z.string().default('#0d9488'), // Default Teal
  seedSampleData: z.boolean().default(false)
}).refine(
  (data) => {
    if (data.deploymentMode === 'MODE_B') {
      return !!data.firebaseConfig;
    }
    return true;
  },
  {
    message: 'Firebase configuration is required when choosing Mode B (Dedicated Tenant Project)',
    path: ['firebaseConfig']
  }
);

export type TenantCreateInput = z.infer<typeof TenantCreateSchema>;
