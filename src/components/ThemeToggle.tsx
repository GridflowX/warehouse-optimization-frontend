// Theme Toggle Component for Dark/Light Mode

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { NeomorphicIcon } from './NeomorphicIcon';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50"
    >
      <NeomorphicIcon size="sm">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </NeomorphicIcon>
    </Button>
  );
};