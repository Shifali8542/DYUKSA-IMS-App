import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './KpiCard.styles';
import { useTheme } from '../../../theme/ThemeContext';

interface KpiCardProps {
  label:    string;
  value:    string | number;
  icon:     string;
  color:    string;
  bgColor:  string;
  onPress?: () => void;
}

export default function KpiCard({ label, value, icon, color, bgColor, onPress }: KpiCardProps) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderRadius:    borderRadius.lg,
          padding:         spacing.base,
          shadowColor:     colors.cardShadow,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: bgColor, borderRadius: borderRadius.md }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: spacing.sm }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
