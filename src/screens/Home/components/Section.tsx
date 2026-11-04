import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Props { title?: string; children: React.ReactNode; gap?: number }

export default function Section({ title, children, gap }: Props) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.base, marginTop: gap ?? spacing.xl }}>
      {title && (
        <Text style={{
          color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
          letterSpacing: 0.8, marginBottom: spacing.sm,
        }}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}