import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';
import { formatMoney } from '../../../utils/formatMoney';
import Card from '../../../components/Card/Card';
import type { DashboardData } from '../../../types';

export default function RevenueCard({ data }: { data: DashboardData }) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const go = useHomeNavigation();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={go.openReports}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.5 }}>
              LAST 30 DAYS
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: 4 }}>
              {formatMoney(data.revenue_30_days, data.currency)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Revenue</Text>
          </View>
          <View style={{ alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
              {data.orders_30_days ?? '–'}
            </Text>
            <Text style={{ color: colors.primary, fontSize: fontSize.xs }}>Orders</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}