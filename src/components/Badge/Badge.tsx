import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label:    string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const { colors, fontSize, borderRadius } = useTheme();

  const config: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    danger:  { bg: colors.dangerLight,  text: colors.danger  },
    info:    { bg: colors.infoLight,    text: colors.info    },
    primary: { bg: colors.primaryLight, text: colors.primary },
    default: { bg: colors.surfaceSecondary, text: colors.textSecondary },
  };

  const { bg, text } = config[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: borderRadius.sm }]}>
      <Text style={[styles.label, { color: text, fontSize: fontSize.xs }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontWeight: '600' },
});

// Helper: get variant from order/dispatch/po status string
export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    pending:            'warning',
    draft:              'default',
    confirmed:          'info',
    approved:           'info',
    partially_received: 'warning',
    dispatched:         'primary',
    in_transit:         'primary',
    shipped:            'primary',
    delivered:          'success',
    received:           'success',
    completed:          'success',
    cancelled:          'danger',
    returned:           'danger',
    packed:             'info',
  };
  return map[status] ?? 'default';
}
