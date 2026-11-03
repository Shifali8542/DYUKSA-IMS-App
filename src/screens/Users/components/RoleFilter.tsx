import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { getRoleLabel } from '../../../constants';

interface Props {
  roles: string[];
  selected: string | null;
  onSelect: (role: string | null) => void;
}

export default function RoleFilter({ roles, selected, onSelect }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const options: (string | null)[] = [null, ...roles];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.md, gap: spacing.sm }}
    >
      {options.map((r) => {
        const active = r === selected;
        return (
          <TouchableOpacity
            key={r ?? 'all'}
            onPress={() => onSelect(r)}
            style={{
              paddingHorizontal: spacing.md, paddingVertical: 6,
              borderRadius: borderRadius.full, borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.primary : colors.surface,
            }}
          >
            <Text style={{
              fontSize: fontSize.xs, fontWeight: fontWeight.medium,
              color: active ? colors.textInverse : colors.textSecondary,
            }}>
              {r ? getRoleLabel(r) : 'All'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}