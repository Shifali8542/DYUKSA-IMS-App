// ── Centralized Typography System ─────────────────────────────────────────
import { Platform } from 'react-native';

export const fontFamily = {
  regular:  Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium:   Platform.OS === 'ios' ? 'System' : 'Roboto',
  semibold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold:     Platform.OS === 'ios' ? 'System' : 'Roboto',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  xxxl: 36,
} as const;

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};

export const lineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
} as const;

// Pre-built text styles — use these directly in StyleSheets
export const textStyles = {
  h1: { fontSize: fontSize.xxl,  fontWeight: fontWeight.bold,     lineHeight: fontSize.xxl  * 1.2 },
  h2: { fontSize: fontSize.xl,   fontWeight: fontWeight.bold,     lineHeight: fontSize.xl   * 1.25 },
  h3: { fontSize: fontSize.lg,   fontWeight: fontWeight.semibold, lineHeight: fontSize.lg   * 1.3 },
  h4: { fontSize: fontSize.md,   fontWeight: fontWeight.semibold, lineHeight: fontSize.md   * 1.35 },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.regular,  lineHeight: fontSize.base * 1.5 },
  bodyMedium: { fontSize: fontSize.base, fontWeight: fontWeight.medium, lineHeight: fontSize.base * 1.5 },
  caption: { fontSize: fontSize.sm,  fontWeight: fontWeight.regular,  lineHeight: fontSize.sm   * 1.4 },
  label: { fontSize: fontSize.xs,  fontWeight: fontWeight.medium,   lineHeight: fontSize.xs   * 1.4 },
} as const;
