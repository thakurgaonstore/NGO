import { runFormatterTests } from './formatters.test';
import { runSecurityRulesValidationTests } from './rules-validator.test';
import { runAllModuleTests } from './modules.test';

console.log('====================================================');
console.log('Running NGO ERP Master Verification & Security Tests');
console.log('====================================================\n');

try {
  console.log('--- 1. Testing Formatters & Localization ---');
  runFormatterTests();

  console.log('\n--- 2. Testing Firestore Security Rules v1 ---');
  runSecurityRulesValidationTests();

  runAllModuleTests();

  console.log('====================================================');
  console.log(' ALL SUITE TESTS PASSED SUCCESSFULLY! (100% GREEN)');
  console.log('====================================================');
  process.exit(0);
} catch (err: any) {
  console.error('\n Test Execution Failed:', err.message);
  process.exit(1);
}
