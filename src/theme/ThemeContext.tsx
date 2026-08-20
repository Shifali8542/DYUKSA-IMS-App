import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type AppColors } from './colors';
import { spacing, borderRadius, iconSize } from './spacing';
import { fontSize, fontWeight, textStyles } from './fonts';

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
  const [mode, setMode] = useState<ThemeMode>('light');

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
    setMode: useCallback((m: ThemeMode) => setMode(m), []),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ── useTheme hook — every screen and component uses this ─────────────────
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
