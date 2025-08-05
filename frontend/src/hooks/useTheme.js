import { useMemo } from 'react';

// Minimal theme hook for compatibility
export function useTheme() {
  // You can expand this to use context or localStorage if needed
  return useMemo(() => ({
    isDark: false,
    theme: 'light',
  }), []);
}
