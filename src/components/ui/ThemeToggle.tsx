import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../app/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const iconSizes = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  const buttonPadding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-lg transition-colors border cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-[#152238] border-[#29384D] text-amber-400 hover:text-amber-300 hover:bg-[#1E2E4A]'
          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      } ${buttonPadding} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={iconSizes} aria-hidden="true" />
      ) : (
        <Moon className={iconSizes} aria-hidden="true" />
      )}
    </button>
  );
}
