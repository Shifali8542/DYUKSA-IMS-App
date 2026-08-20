export const palette = {
  // Brand
  primary:       '#1A56DB',
  primaryLight:  '#EBF0FF',
  primaryDark:   '#1341B0',

  // Semantic
  success:       '#16A34A',
  successLight:  '#DCFCE7',
  warning:       '#D97706',
  warningLight:  '#FEF3C7',
  danger:        '#DC2626',
  dangerLight:   '#FEE2E2',
  info:          '#0891B2',
  infoLight:     '#E0F2FE',

  // Neutrals
  white:         '#FFFFFF',
  black:         '#0F172A',
  grey50:        '#F8FAFC',
  grey100:       '#F1F5F9',
  grey200:       '#E2E8F0',
  grey300:       '#CBD5E1',
  grey400:       '#94A3B8',
  grey500:       '#64748B',
  grey600:       '#475569',
  grey700:       '#334155',
  grey800:       '#1E293B',
  grey900:       '#0F172A',
} as const;

export const lightColors = {
  // Backgrounds
  background:       palette.grey50,
  surface:          palette.white,
  surfaceSecondary: palette.grey100,
  border:           palette.grey200,

  // Text
  textPrimary:      palette.grey900,
  textSecondary:    palette.grey500,
  textDisabled:     palette.grey400,
  textInverse:      palette.white,

  // Brand
  primary:          palette.primary,
  primaryLight:     palette.primaryLight,
  primaryDark:      palette.primaryDark,

  // Semantic
  success:          palette.success,
  successLight:     palette.successLight,
  warning:          palette.warning,
  warningLight:     palette.warningLight,
  danger:           palette.danger,
  dangerLight:      palette.dangerLight,
  info:             palette.info,
  infoLight:        palette.infoLight,

  // Navigation
  tabBar:           palette.white,
  tabBarBorder:     palette.grey200,
  tabActive:        palette.primary,
  tabInactive:      palette.grey400,

  // Input
  inputBackground:  palette.white,
  inputBorder:      palette.grey300,
  inputFocusBorder: palette.primary,
  placeholder:      palette.grey400,

  // Card
  cardBackground:   palette.white,
  cardShadow:       'rgba(0,0,0,0.06)',

  // Status bar
  statusBar:        'dark' as const,
} as const;

export type AppColors = {
  [K in keyof typeof lightColors]: string;
};

export const darkColors: AppColors = {
  background:       palette.grey900,
  surface:          palette.grey800,
  surfaceSecondary: palette.grey700,
  border:           palette.grey700,

  textPrimary:      palette.grey50,
  textSecondary:    palette.grey400,
  textDisabled:     palette.grey600,
  textInverse:      palette.grey900,

  primary:          '#4F81F7',
  primaryLight:     '#1E2A4A',
  primaryDark:      '#1A56DB',

  success:          '#22C55E',
  successLight:     '#14291A',
  warning:          '#F59E0B',
  warningLight:     '#2D1F0A',
  danger:           '#EF4444',
  dangerLight:      '#2D0E0E',
  info:             '#22D3EE',
  infoLight:        '#0C2030',

  tabBar:           palette.grey800,
  tabBarBorder:     palette.grey700,
  tabActive:        '#4F81F7',
  tabInactive:      palette.grey500,

  inputBackground:  palette.grey800,
  inputBorder:      palette.grey600,
  inputFocusBorder: '#4F81F7',
  placeholder:      palette.grey500,

  cardBackground:   palette.grey800,
  cardShadow:       'rgba(0,0,0,0.3)',

  statusBar:        'light' as const,
};

