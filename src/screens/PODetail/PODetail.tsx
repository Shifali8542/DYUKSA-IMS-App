import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { styles } from './PODetail.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePODetail } from './hooks/usePODetail';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { PO_STATUS_LABEL } from '../../constants';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'PODetail'>;

export default function PODetailScreen({ route, navigation }: Props) {
  const poId = route.params.poId;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { canManagePurchasing } = usePermissions();
  const { po, loading, error, transitioning, receiving, actions, transition, receiveItems, refresh } = usePODetail(poId);
  const [receiveMode, setReceiveMode] = useState(false);
  const [receiveQtys, setReceiveQtys] = useState<Record<number, string>>({});

  if (loading) return <Loader fullScreen message="Loading PO..." />;
  if (error || !po) return <ErrorState message={error ?? 'PO not found'} onRetry={refresh} />;

  function handleAction(action: { label: string; status: string }) {
    if (action.status === 'receive') {
      setReceiveMode(true);
      const qtys: Record<number, string> = {};
      po!.items.forEach((item) => { qtys[item.id] = String(parseFloat(item.pending_quantity) || 0); });
      setReceiveQtys(qtys);
      return;
    }

    if (action.status === 'cancelled') {
      Alert.prompt ? Alert.prompt('Cancel Reason', 'Why are you cancelling this PO?', [
        { text: 'Back', style: 'cancel' },
        { text: 'Cancel PO', style: 'destructive', onPress: (reason?: string) => transition('cancelled', reason ?? 'Cancelled') },
      ]) : Alert.alert('Cancel PO', 'Are you sure?', [
        { text: 'Back', style: 'cancel' },
        { text: 'Cancel PO', style: 'destructive', onPress: () => transition('cancelled', 'Cancelled by user') },
      ]);
      return;
    }

    Alert.alert(`${action.label}?`, `Move PO to "${action.label}"?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => transition(action.status) },
    ]);
  }

  async function handleReceive() {
    const items = Object.entries(receiveQtys)
      .map(([id, qty]) => ({ item_id: parseInt(id), received_quantity: parseFloat(qty) || 0 }))
      .filter((i) => i.received_quantity > 0);

    if (items.length === 0) {
      Alert.alert('Error', 'Enter quantity for at least one item.');
      return;
    }

    const ok = await receiveItems(items);
    if (ok) setReceiveMode(false);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                PURCHASE ORDER
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: 2 }}>
                {po.number}
              </Text>
            </View>
            <Badge label={PO_STATUS_LABEL[po.status] ?? po.status} variant={statusVariant(po.status)} />
          </View>

          <View style={{ marginTop: spacing.base, gap: spacing.xs }}>
            <DetailRow label="Supplier" value={po.supplier_name} />
            <DetailRow label="Warehouse" value={po.warehouse_name} />
            <DetailRow label="Order Date" value={po.order_date} />
            {po.expected_date && <DetailRow label="Expected" value={po.expected_date} />}
            {po.approved_by_name && <DetailRow label="Approved By" value={`${po.approved_by_name} (${po.approved_at?.split('T')[0] ?? ''})`} />}
            {po.notes ? <DetailRow label="Notes" value={po.notes} /> : null}
            {po.cancelled_reason ? <DetailRow label="Cancel Reason" value={po.cancelled_reason} /> : null}
            <DetailRow label="Created" value={`${po.created_by_name ?? ''} • ${new Date(po.created_at).toLocaleDateString()}`} />
          </View>
        </Card>

        {/* Items */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Items ({po.items.length})
          </Text>

          {po.items.map((item, idx) => (
            <View key={item.id} style={{
              paddingVertical: spacing.sm,
              borderBottomWidth: idx < po.items.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                {item.product_name}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                SKU: {item.product_sku}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                  Qty: {item.quantity} × ₹{item.unit_price}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                  ₹{item.line_total}
                </Text>
              </View>

              {parseFloat(item.received_quantity) > 0 && (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                  <Text style={{ color: colors.success, fontSize: fontSize.xs }}>
                    Received: {item.received_quantity}
                  </Text>
                  {parseFloat(item.pending_quantity) > 0 && (
                    <Text style={{ color: colors.warning, fontSize: fontSize.xs }}>
                      Pending: {item.pending_quantity}
                    </Text>
                  )}
                </View>
              )}

              {/* Receive mode — quantity input */}
              {receiveMode && parseFloat(item.pending_quantity) > 0 && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                  marginTop: spacing.sm, backgroundColor: colors.surfaceSecondary,
                  borderRadius: borderRadius.md, padding: spacing.sm,
                }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, flex: 1 }}>
                    Receive qty (max {item.pending_quantity}):
                  </Text>
                  <TextInput
                    value={receiveQtys[item.id] ?? ''}
                    onChangeText={(v) => setReceiveQtys((prev) => ({ ...prev, [item.id]: v }))}
                    keyboardType="decimal-pad"
                    style={{
                      width: 80, textAlign: 'center', color: colors.textPrimary,
                      backgroundColor: colors.surface, borderRadius: borderRadius.sm,
                      borderWidth: 1, borderColor: colors.border, paddingVertical: 6,
                      fontSize: fontSize.sm,
                    }}
                  />
                </View>
              )}
            </View>
          ))}

          {/* Totals */}
          <View style={{ marginTop: spacing.base, paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Subtotal</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm }}>₹{po.subtotal}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Tax</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm }}>₹{po.tax_total}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>Total</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>₹{po.total}</Text>
            </View>
          </View>
        </Card>

        {/* Action buttons */}
        {canManagePurchasing && !receiveMode && actions.length > 0 && (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.status}
                onPress={() => handleAction(action)}
                disabled={transitioning}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: action.variant === 'success' ? colors.success
                    : action.variant === 'danger' ? colors.danger
                    : colors.primary,
                  opacity: transitioning ? 0.5 : 1,
                }}
              >
                <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Receive mode buttons */}
        {receiveMode && (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={handleReceive}
              disabled={receiving}
              style={{
                flex: 1, alignItems: 'center', paddingVertical: spacing.md,
                borderRadius: borderRadius.md, backgroundColor: colors.success,
                opacity: receiving ? 0.5 : 1,
              }}
            >
              <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                {receiving ? 'Receiving...' : 'Confirm Receive'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReceiveMode(false)}
              style={{
                flex: 1, alignItems: 'center', paddingVertical: spacing.md,
                borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors, fontSize, fontWeight, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 2 }}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 90 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, flex: 1, fontWeight: fontWeight.medium }}>{value}</Text>
    </View>
  );
}