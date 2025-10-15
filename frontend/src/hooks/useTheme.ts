import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

/**
 * A custom hook to manage the application's theme.
 * It synchronizes the theme with localStorage and the `data-theme` attribute on the <html> element.
 */
export function useTheme() {
  const getInitialTheme = (): Theme => {
    const themeFromDOM = document.documentElement.getAttribute('data-theme');
    if (themeFromDOM === 'light' || themeFromDOM === 'dark') {
      return themeFromDOM;
    }
    return 'dark';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
