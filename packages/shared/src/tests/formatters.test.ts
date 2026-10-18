import {
  toBanglaDigits,
  toEnglishDigits,
  formatBangladeshiNumber,
  formatCurrency,
  formatDate
} from '../utils/formatters';

// Simple lightweight test runner to run without external heavy test runner harness
export function runFormatterTests() {
  const tests: Array<{ name: string; run: () => void }> = [
    {
      name: 'toBanglaDigits converts 0-9 correctly',
      run: () => {
        const result = toBanglaDigits('0123456789');
        if (result !== '০১২৩৪৫৬৭৮৯') {
          throw new Error(`Expected '০১২৩৪৫৬৭৮৯', got '${result}'`);
        }
      }
    },
    {
      name: 'toEnglishDigits converts ০-৯ correctly',
      run: () => {
        const result = toEnglishDigits('০১২৩৪৫৬৭৮৯');
        if (result !== '0123456789') {
          throw new Error(`Expected '0123456789', got '${result}'`);
        }
      }
    },
    {
      name: 'formatBangladeshiNumber formats lakhs and crores correctly',
      run: () => {
        const result = formatBangladeshiNumber(1500000); // 15 Lakh
        if (result !== '15,00,000') {
          throw new Error(`Expected '15,00,000', got '${result}'`);
        }
      }
    },
    {
      name: 'formatCurrency formats BDT with Bangla digits when requested',
      run: () => {
        const result = formatCurrency(250000, { useBanglaNumerals: true });
        if (result !== '৳ ২,৫০,০০০') {
          throw new Error(`Expected '৳ ২,৫০,০০০', got '${result}'`);
        }
      }
    },
    {
      name: 'formatDate formats DD/MM/YYYY',
      run: () => {
        const d = new Date(2026, 9, 17); // 17 October 2026
        const result = formatDate(d);
        if (result !== '17/10/2026') {
          throw new Error(`Expected '17/10/2026', got '${result}'`);
        }
      }
    }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      t.run();
      passed++;
      console.log(`✔ [PASS] ${t.name}`);
    } catch (e: any) {
      console.error(`✘ [FAIL] ${t.name}:`, e.message);
      throw e;
    }
  }

  console.log(`\nAll ${passed}/${tests.length} Formatter and Localization tests PASSED.`);
  return true;
}

// Auto-run if executed directly via tsx/node
if (typeof require !== 'undefined' && require.main === module) {
  runFormatterTests();
}
