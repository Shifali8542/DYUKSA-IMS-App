import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';
import Card from '../../../components/Card/Card';
import MiniBarChart from './MiniBarChart';
import type { DashboardData } from '../../../types';

type PO = NonNullable<DashboardData['purchase_orders']>;

export default function PurchaseOrdersCard({ po }: { po: PO }) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const go = useHomeNavigation();

  // Sent / partially received orders are not in the four named buckets
  const open = Math.max(po.total - (po.draft + po.approved + po.received + po.cancelled), 0);
  const bars = [
    { label: 'Draft', value: po.draft, color: colors.textSecondary },
    { label: 'Approved', value: po.approved, color: colors.info },
    { label: 'Open', value: open, color: colors.warning },
    { label: 'Received', value: po.received, color: colors.success },
    { label: 'Cancelled', value: po.cancelled, color: colors.danger },
  ];

  return (
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.7} onPress={go.openPurchaseOrders}>
      <Card style={{ flex: 1 }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 }}>
          PURCHASE ORDERS · {po.total}
        </Text>
        {po.total === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center' }}>
              No purchase orders yet
            </Text>
          </View>
        ) : (
          <MiniBarChart bars={bars} height={80} barWidth={18} />
        )}
      </Card>
    </TouchableOpacity>
  );
}