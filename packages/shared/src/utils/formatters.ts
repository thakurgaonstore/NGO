const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts English number/digits string to Bangla digits.
 */
export function toBanglaDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (match) => BANGLA_DIGITS[parseInt(match, 10)]);
}

/**
 * Converts Bangla digits string to English digits.
 */
export function toEnglishDigits(input: string): string {
  if (!input) return '';
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(BANGLA_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
  }
  return result;
}

/**
 * Formats a number according to Bangladeshi / South Asian numbering system (lakhs & crores)
 * Example: 150000 -> 1,50,000
 */
export function formatBangladeshiNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const result = decimalPart === '00' ? formatted : `${formatted}.${decimalPart}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Formats currency as BDT (৳) with optional Bangla numerals
 */
export function formatCurrency(
  amount: number,
  options?: {
    useBanglaNumerals?: boolean;
    symbol?: string;
    showSymbol?: boolean;
  }
): string {
  const { useBanglaNumerals = false, symbol = '৳', showSymbol = true } = options || {};
  let formatted = formatBangladeshiNumber(amount);
  if (useBanglaNumerals) {
    formatted = toBanglaDigits(formatted);
  }
  return showSymbol ? `${symbol} ${formatted}` : formatted;
}

/**
 * Formats timestamps to DD/MM/YYYY
 */
export function formatDate(
  timestamp: number | Date | string,
  options?: { useBanglaNumerals?: boolean }
): string {
  if (!timestamp) return '';
  const date = typeof timestamp === 'number' || typeof timestamp === 'string'
    ? new Date(timestamp)
    : timestamp;

  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const formatted = `${day}/${month}/${year}`;
  return options?.useBanglaNumerals ? toBanglaDigits(formatted) : formatted;
}
