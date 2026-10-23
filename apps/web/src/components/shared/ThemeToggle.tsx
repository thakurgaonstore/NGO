import React, { useEffect } from 'react';

/**
 * Dark mode has been permanently removed per user request.
 * All views operate in crisp, clean Light Mode.
 */
export const ThemeToggle: React.FC<{ className?: string }> = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('theme');
    } catch {}
  }, []);

  return null;
};
