import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';
import StatCard from './StatCard';
import type { DashboardData } from '../../../types';

export default function OverviewGrid({ data }: { data: DashboardData }) {
  const { colors, spacing } = useTheme();
  const go = useHomeNavigation();

  const rows = [
    [
      { icon: '📦', label: 'Products', value: data.total_products, bg: colors.primaryLight, onPress: go.openInventory },
      { icon: '🏭', label: 'Warehouses', value: data.total_warehouses, bg: colors.successLight, onPress: go.openWarehouses },
      { icon: '⚠️', label: 'Low Stock', value: data.low_stock_count, bg: colors.warningLight, onPress: go.openLowStock },
    ],
    [
      { icon: '📋', label: 'Pending Orders', value: data.pending_orders, bg: colors.dangerLight, onPress: go.openConfirmedOrders },
      { icon: '🚚', label: 'Today Dispatch', value: data.today_dispatches, bg: colors.infoLight, onPress: go.openDispatchedToday },
      { icon: '📤', label: 'Pending Disp.', value: data.pending_dispatches, bg: colors.surfaceSecondary, onPress: () => go.openDispatches('pending') },
    ],
  ];

  return (
    <View>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: spacing.sm, marginTop: i === 0 ? 0 : spacing.sm }}>
          {row.map((c) => (
            <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} iconBg={c.bg} onPress={c.onPress} />
          ))}
        </View>
      ))}
    </View>
  );
}