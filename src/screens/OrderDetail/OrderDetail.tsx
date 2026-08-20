import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { styles } from './OrderDetail.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { OrderApi } from '../../services/Api';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import { ORDER_STATUS_LABEL } from '../../constants';
import type { MainStackParamList, SalesOrder } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'OrderDetail'>;

const TRANSITIONS: Record<string, string[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  cancelled: [],
  dispatched:[], // managed by dispatch module
  delivered: [],
};

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [order,      setOrder]      = useState<SalesOrder | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    OrderApi.getSalesOrder(orderId)
      .then(setOrder)
      .catch((e) => setError(e?.message ?? 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleTransition(newStatus: string) {
    if (!order) return;
    Alert.alert(`Change to ${ORDER_STATUS_LABEL[newStatus]}?`, 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setTransitioning(true);
          try {
            const updated = await OrderApi.transitionOrder(order.id, newStatus);
            setOrder(updated ?? { ...order, status: newStatus as any });
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update status.');
          } finally {
            setTransitioning(false);
          }
        },
      },
    ]);
  }

  if (loading) return <Loader fullScreen />;
  if (error)   return <ErrorState message={error} />;
  if (!order)  return null;

  const nextStatuses = TRANSITIONS[order.status] ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Header card */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>{order.order_number}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={ORDER_STATUS_LABEL[order.status] ?? order.status} variant={statusVariant(order.status)} />
          </View>
        </Card>

        {/* Details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>Order Details</Text>
          {[
            ['Customer',    order.customer_name],
            ['Warehouse',   order.warehouse_name],
            ['Delivery',    order.delivery_address || '—'],
            ['Expected',    order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : '—'],
            ['Notes',       order.notes || '—'],
          ].map(([label, value]) => (
            <View key={label} style={[styles.detailRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 2, textAlign: 'right' }}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{item.product_name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>SKU: {item.product_sku} × {item.quantity}</Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>₹{item.total_price}</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Total</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>₹{order.total_amount}</Text>
            </View>
          </Card>
        )}

        {/* Actions */}
        {nextStatuses.length > 0 && (
          <Card>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>Update Status</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              {nextStatuses.map((s) => (
                <Button
                  key={s}
                  title={ORDER_STATUS_LABEL[s] ?? s}
                  onPress={() => handleTransition(s)}
                  loading={transitioning}
                  variant={s === 'cancelled' ? 'danger' : 'primary'}
                  size="sm"
                />
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
