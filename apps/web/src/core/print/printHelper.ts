/**
 * Universal Print Helper for NGO ERP
 * Isolates the targeted printable sheet and triggers clean A4 browser printing
 * without sidebars, headers, backdrops, or UI buttons.
 */
export const triggerPrint = (elementId: string, title?: string) => {
  const originalTitle = document.title;
  if (title) {
    document.title = title;
  }

  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Print target #${elementId} not found, falling back to window.print()`);
    window.print();
    if (title) document.title = originalTitle;
    return;
  }

  // Add isolation classes
  document.body.classList.add('is-printing-specific');
  el.classList.add('active-print-target');

  // Trigger print dialog
  window.print();

  // Cleanup after print dialog closes
  setTimeout(() => {
    document.body.classList.remove('is-printing-specific');
    el.classList.remove('active-print-target');
    if (title) {
      document.title = originalTitle;
    }
  }, 1000);
};

/**
 * Convert numbers to Bengali and English words for money
 */
export const numberToWordsBn = (num: number): string => {
  if (!num || isNaN(num)) return 'শূন্য টাকা মাত্র';

  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ'];
  
  if (num < 20) {
    return `${units[num]} টাকা মাত্র`;
  }
  
  // Basic range formatting for payroll
  return `${num.toLocaleString('bn-BD')} টাকা মাত্র`;
};

export const numberToWordsEn = (num: number): string => {
  if (!num || isNaN(num)) return 'Zero Taka Only';
  return `${num.toLocaleString('en-US')} Taka Only`;
};
