// Simple Theme Toggle Component

import React from 'react';
import { useTheme } from 'next-themes';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 px-3 py-1 text-sm bg-transparent border border-border rounded-md hover:bg-muted/50 transition-colors"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
};