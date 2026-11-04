import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';
import Card from '../../../components/Card/Card';
import type { DashboardData } from '../../../types';

type Warehouse = NonNullable<DashboardData['warehouses']>[number];

export default function WarehouseCapacity({ warehouses }: { warehouses: Warehouse[] }) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const go = useHomeNavigation();

  return (
    <>
      {warehouses.map((wh) => {
        const pct = wh.capacity_percent;
        const barColor = pct === null ? colors.primary : pct > 80 ? colors.danger : pct > 60 ? colors.warning : colors.success;
        return (
          <TouchableOpacity key={wh.id} activeOpacity={0.7} onPress={go.openWarehouses}>
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{wh.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                  {wh.unlimited ? 'Unlimited capacity' : `${pct}%`}
                </Text>
              </View>
              {!wh.unlimited && (
                <View style={{ height: 8, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }}>
                  <View style={{
                    height: 8, borderRadius: borderRadius.full, backgroundColor: barColor,
                    width: `${Math.min(pct ?? 0, 100)}%`,
                  }} />
                </View>
              )}
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>
                {wh.items_on_hand.toLocaleString()} items
              </Text>
            </Card>
          </TouchableOpacity>
        );
      })}
    </>
  );
}