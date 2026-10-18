import { TenantPlan } from '../types/tenant';

export const DEFAULT_SUBSCRIPTION_PLANS: TenantPlan[] = [
  {
    id: 'starter',
    name: 'Starter NGO',
    description: 'Perfect for small local NGOs, clubs, and voluntary foundations.',
    priceBDT: 3000,
    billingCycle: 'monthly',
    allowedModules: [
      'dashboard',
      'organization',
      'members',
      'projects',
      'accounts',
      'website',
      'reports',
      'settings'
    ],
    limits: {
      users: 5,
      branches: 2,
      storageMB: 500,
      smsCredits: 200
    }
  },
  {
    id: 'growth',
    name: 'Standard NGO',
    description: 'Designed for established regional NGOs with field operations & payroll.',
    priceBDT: 7500,
    billingCycle: 'monthly',
    isPopular: true,
    allowedModules: [
      'dashboard',
      'organization',
      'members',
      'projects',
      'field_ops',
      'accounts',
      'hr_payroll',
      'inventory',
      'website',
      'reports',
      'settings'
    ],
    limits: {
      users: 25,
      branches: 10,
      storageMB: 2000,
      smsCredits: 1000
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Microfinance',
    description: 'Full-featured suite including Microcredit, dynamic surveys, multi-branch & donor grants.',
    priceBDT: 15000,
    billingCycle: 'monthly',
    allowedModules: [
      'dashboard',
      'organization',
      'members',
      'projects',
      'field_ops',
      'microcredit',
      'donors_grants',
      'accounts',
      'hr_payroll',
      'inventory',
      'website',
      'reports',
      'settings'
    ],
    limits: {
      users: 100,
      branches: 50,
      storageMB: 10000,
      smsCredits: 5000
    }
  }
];
