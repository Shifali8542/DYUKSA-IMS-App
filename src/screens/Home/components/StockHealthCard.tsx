import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';
import Card from '../../../components/Card/Card';
import MiniDonutChart from './MiniDonutChart';
import type { DashboardData } from '../../../types';

export default function StockHealthCard({ data }: { data: DashboardData }) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const go = useHomeNavigation();

  const parts = [
    { label: 'Healthy', value: data.healthy_stock_count, color: colors.success },
    { label: 'Low', value: data.low_stock_count, color: colors.warning },
    { label: 'No stock', value: data.no_stock_count, color: colors.danger },
  ];

  return (
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.7} onPress={go.openInventory}>
      <Card style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.lg }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: spacing.sm }}>
          STOCK HEALTH
        </Text>
        <MiniDonutChart
          segments={parts}
          size={110}
          strokeWidth={14}
          centerValue={data.total_products}
          centerLabel="Total"
        />
        <View style={{ marginTop: spacing.base, gap: 4 }}>
          {parts.map((p) => (
            <View key={p.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.color }} />
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{p.label} {p.value}</Text>
            </View>
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  );
}