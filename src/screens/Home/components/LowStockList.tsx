import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useHomeNavigation } from '../hooks/useHomeNavigation';
import Card from '../../../components/Card/Card';
import Badge from '../../../components/Badge/Badge';
import type { LowStockItem } from '../../../types';

export default function LowStockList({ items }: { items: LowStockItem[] }) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const go = useHomeNavigation();

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {items.map((p, i) => (
        <TouchableOpacity
          key={`${p.product_id}-${p.warehouse}`}
          onPress={() => go.openProduct(p.product_id)}
          style={{
            flexDirection: 'row', alignItems: 'center', padding: spacing.base,
            borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: colors.border,
          }}
        >
          <View style={{
            width: 36, height: 36, borderRadius: borderRadius.md, marginRight: spacing.base,
            backgroundColor: colors.warningLight, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{p.product_name}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>SKU: {p.sku} • {p.warehouse}</Text>
          </View>
          <Badge label={`${p.available} left`} variant="danger" />
        </TouchableOpacity>
      ))}
    </Card>
  );
}