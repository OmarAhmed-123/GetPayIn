import React, { createContext, useContext, useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
  };
}

export const themes: Theme[] = [
  {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
    gradients: {
      primary: ['#0ea5e9', '#06b6d4', '#8b5cf6'],
      secondary: ['#06b6d4', '#8b5cf6', '#ec4899'],
      background: ['#0f172a', '#1e293b', '#334155'],
    },
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      background: '#1c1917',
      surface: '#292524',
      text: '#fafaf9',
      textSecondary: '#d6d3d1',
      border: '#44403c',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
    },
    gradients: {
      primary: ['#f97316', '#ec4899', '#8b5cf6'],
      secondary: ['#ec4899', '#8b5cf6', '#06b6d4'],
      background: ['#1c1917', '#292524', '#44403c'],
    },
  },
  {
    name: 'Forest',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#84cc16',
      background: '#064e3b',
      surface: '#065f46',
      text: '#f0fdf4',
      textSecondary: '#bbf7d0',
      border: '#047857',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
    },
    gradients: {
      primary: ['#059669', '#10b981', '#84cc16'],
      secondary: ['#10b981', '#84cc16', '#eab308'],
      background: ['#064e3b', '#065f46', '#047857'],
    },
  },
  {
    name: 'Midnight',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: '#27272a',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
    gradients: {
      primary: ['#6366f1', '#8b5cf6', '#ec4899'],
      secondary: ['#8b5cf6', '#ec4899', '#f59e0b'],
      background: ['#0f0f23', '#1a1a2e', '#27272a'],
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // Load saved theme
    const savedThemeName = storage.getString('theme_name');
    if (savedThemeName) {
      const savedTheme = themes.find(theme => theme.name === savedThemeName);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    storage.set('theme_name', theme.name);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
