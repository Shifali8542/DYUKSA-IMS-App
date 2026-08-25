import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type AppColors } from './colors';
import { spacing, borderRadius, iconSize } from './spacing';
import { fontSize, fontWeight, textStyles } from './fonts';
import { STORAGE_KEYS } from '../constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: AppColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  textStyles: typeof textStyles;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, m).catch(() => {});
  }, []);

  const isDark =
    mode === 'dark' ? true :
    mode === 'light' ? false :
    systemScheme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextValue = {
    colors,
    spacing,
    borderRadius,
    iconSize,
    fontSize,
    fontWeight,
    textStyles,
    isDark,
    mode,
    setMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
