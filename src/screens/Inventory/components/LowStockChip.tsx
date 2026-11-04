import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Props { active: boolean; onToggle: () => void }

export default function LowStockChip({ active, onToggle }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm, flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1,
          borderRadius: borderRadius.full, paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
          backgroundColor: active ? colors.warning : colors.surface,
          borderColor: active ? colors.warning : colors.border,
        }}
      >
        <Text style={{ fontSize: fontSize.xs }}>⚠️</Text>
        <Text style={{ color: active ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
          Low stock only
        </Text>
      </TouchableOpacity>
    </View>
  );
}