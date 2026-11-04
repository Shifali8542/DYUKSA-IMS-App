import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Props { userName: string; roleLabel: string; onMenu: () => void }

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeHeader({ userName, roleLabel, onMenu }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.lg,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity
          onPress={onMenu}
          accessibilityLabel="Open menu"
          style={{
            width: 40, height: 40, borderRadius: borderRadius.md, marginRight: spacing.base,
            backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 18 }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{greeting()},</Text>
          <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {userName ? `${userName} 👋` : '👋'}
          </Text>
        </View>
      </View>
      {!!roleLabel && (
        <View style={{
          backgroundColor: colors.primaryLight, borderRadius: borderRadius.full,
          paddingHorizontal: 12, paddingVertical: 6, marginLeft: spacing.sm,
        }}>
          <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>{roleLabel}</Text>
        </View>
      )}
    </View>
  );
}