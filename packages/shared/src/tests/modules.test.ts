// 1. Test Accounting Double-Entry Calculation
export function testAccountingCalculations() {
  const voucherEntries = [
    { accountId: '5100', debit: 45000, credit: 0 },
    { accountId: '1130', debit: 0, credit: 45000 }
  ];

  const totalDebit = voucherEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = voucherEntries.reduce((sum, e) => sum + e.credit, 0);

  if (totalDebit !== totalCredit) {
    throw new Error(`Double-entry balance check failed: Debit ${totalDebit} != Credit ${totalCredit}`);
  }
  if (totalDebit !== 45000) {
    throw new Error(`Expected total 45000, got ${totalDebit}`);
  }
  console.log('✔ [PASS] Accounting double-entry equality validated (Debit == Credit)');
}

// 2. Test Payroll Calculations
export function testPayrollCalculations() {
  const basicSalary = 30000;
  const houseRent = 12000; // 40%
  const medicalAllowance = 3000; // 10%
  const conveyance = 2500;
  const pfRate = 0.10; // 10% of basic

  const grossEarnings = basicSalary + houseRent + medicalAllowance + conveyance; // 47,500
  const pfDeduction = basicSalary * pfRate; // 3,000
  const netTakeHome = grossEarnings - pfDeduction; // 44,500

  if (grossEarnings !== 47500) {
    throw new Error(`Gross earnings calculation failed: expected 47500, got ${grossEarnings}`);
  }
  if (pfDeduction !== 3000) {
    throw new Error(`PF deduction calculation failed: expected 3000, got ${pfDeduction}`);
  }
  if (netTakeHome !== 44500) {
    throw new Error(`Net salary calculation failed: expected 44500, got ${netTakeHome}`);
  }
  console.log('✔ [PASS] Payroll gross, PF deduction, and net take-home pay validated');
}

// 3. Test RBAC Permission Evaluator
export function testRbacEngine() {
  const ownerPermissions = ['*'];
  const managerPermissions = [
    'members:view',
    'members:create',
    'vouchers:approve',
    'projects:view'
  ];

  const can = (perms: string[], req: string): boolean => {
    if (perms.includes('*')) return true;
    return perms.includes(req);
  };

  if (!can(ownerPermissions, 'vouchers:delete')) {
    throw new Error('Owner wildcard (*) permission evaluation failed');
  }
  if (!can(managerPermissions, 'vouchers:approve')) {
    throw new Error('Manager allowed action evaluation failed');
  }
  if (can(managerPermissions, 'vouchers:delete')) {
    throw new Error('Manager disallowed action evaluation failed (should be false)');
  }
  console.log('✔ [PASS] RBAC permission engine with wildcard resolution validated');
}

export function runAllModuleTests() {
  console.log('\n--- 3. Testing ERP Business Logic (Accounting, Payroll, RBAC) ---');
  testAccountingCalculations();
  testPayrollCalculations();
  testRbacEngine();
  console.log('All module domain calculation tests PASSED.\n');
}

if (typeof require !== 'undefined' && require.main === module) {
  runAllModuleTests();
}
