import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props { label: string; onClear: () => void }

/** Small pill shown when a screen was opened with a filter already applied. */
export default function FilterNotice({ label, onClear }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm, flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={onClear}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: colors.primaryLight, borderRadius: borderRadius.full,
          paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
        }}
      >
        <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{label}</Text>
        <Text style={{ color: colors.primary, fontSize: fontSize.xs }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}