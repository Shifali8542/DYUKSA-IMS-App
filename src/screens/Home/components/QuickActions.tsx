import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';

export default function QuickActions() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const go = useHomeNavigation();

  const actions = [
    { label: 'Inventory', icon: '📦', onPress: go.openInventory },
    { label: 'Orders', icon: '📋', onPress: go.openOrders },
    { label: 'Scan', icon: '📷', onPress: go.openScanner },
    { label: 'Alerts', icon: '🔔', onPress: go.openAlerts },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.label}
          onPress={a.onPress}
          style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
            paddingVertical: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>{a.icon}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}