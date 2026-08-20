// ── Centralized Spacing System ─────────────────────────────────────────────
// All padding, margin, gap values come from here. No hardcoded numbers.

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const;

export const borderRadius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

export const iconSize = {
  xs:  14,
  sm:  18,
  md:  22,
  lg:  28,
  xl:  36,
} as const;
