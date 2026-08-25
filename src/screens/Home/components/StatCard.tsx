import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Props {
  icon:     string;
  label:    string;
  value:    string | number;
  iconBg?:  string;
  onPress?: () => void;
  compact?: boolean;
}

export default function StatCard({ icon, label, value, iconBg, onPress, compact }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();

  const content = (
    <View style={{
      backgroundColor: colors.surface, borderRadius: borderRadius.lg,
      padding: compact ? spacing.sm : spacing.base,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
      flex: 1,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: compact ? spacing.xs : spacing.sm }}>
        <View style={{
          width: compact ? 32 : 40, height: compact ? 32 : 40,
          borderRadius: borderRadius.md,
          backgroundColor: iconBg ?? colors.primaryLight,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: compact ? 16 : 20 }}>{icon}</Text>
        </View>
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: compact ? fontSize.lg : fontSize.xxl, fontWeight: fontWeight.bold }}>
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: compact ? 10 : fontSize.xs, marginTop: 1 }}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>{content}</TouchableOpacity>;
  }
  return content;
}