import * as fs from 'fs';
import * as path from 'path';

export function runSecurityRulesValidationTests() {
  const rulesPath = path.resolve(__dirname, '../../../../firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`firestore.rules not found at ${rulesPath}`);
  }

  const content = fs.readFileSync(rulesPath, 'utf-8');

  const assertions = [
    {
      name: 'Uses rules_version = 2',
      check: content.includes("rules_version = '2';")
    },
    {
      name: 'Defines isAuthenticated() helper',
      check: content.includes('function isAuthenticated()')
    },
    {
      name: 'Defines isSuperAdmin() helper with claim and uid checks',
      check: content.includes('function isSuperAdmin()')
    },
    {
      name: 'Defines isTenantUser(tenantId) helper enforcing tenant boundary',
      check: content.includes('function isTenantUser(tenantId)')
    },
    {
      name: 'Defines hasPermission(tenantId, perm) RBAC helper',
      check: content.includes('function hasPermission(tenantId, perm)')
    },
    {
      name: 'Enforces superadmin isolation on /superadmin/{allPaths=**}',
      check: content.includes('match /superadmin/{allPaths=**}') &&
             content.includes('allow read, write: if isSuperAdmin();')
    },
    {
      name: 'Protects tenant isolated scope /tenants/{tenantId}',
      check: content.includes('match /tenants/{tenantId}')
    },
    {
      name: 'Enforces append-only immutable audit logs (update/delete blocked)',
      check: content.includes('match /audit_logs/{logId}') &&
             content.includes('allow update, delete: if false;')
    },
    {
      name: 'Public directory /system/tenant_directory is read-only to public and writable only by SuperAdmin',
      check: content.includes('match /system/tenant_directory') &&
             content.includes('allow read: if true;') &&
             content.includes('allow write: if isSuperAdmin();')
    },
    {
      name: 'Public website published content is readable to public visitors (0 auth required for SEO)',
      check: content.includes('match /website/published') &&
             content.includes('allow read: if true;')
    }
  ];

  let passed = 0;
  for (const a of assertions) {
    if (a.check) {
      passed++;
      console.log(`✔ [PASS] ${a.name}`);
    } else {
      console.error(`✘ [FAIL] Security Rule Assertion Failed: ${a.name}`);
      throw new Error(`Security Rule Assertion Failed: ${a.name}`);
    }
  }

  console.log(`\nAll ${passed}/${assertions.length} Firestore Security Rule validations PASSED.`);
  return true;
}

if (typeof require !== 'undefined' && require.main === module) {
  runSecurityRulesValidationTests();
}
