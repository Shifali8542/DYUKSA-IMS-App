import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SalesReturnApi } from '../../api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useSalesReturnDetail } from './hooks/useSalesReturnDetail';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import { RETURN_STATUS_LABEL, DISPOSITION_LABEL, DISPOSITION_ICON } from '../../constants';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'SalesReturnDetail'>;

export default function SalesReturnDetailScreen({ route }: Props) {
  const { returnId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { sr, loading, error, approving, handleApprove, refresh } = useSalesReturnDetail(returnId);
  const [showRefund, setShowRefund] = useState(false);
  const [refundAmt, setRefundAmt] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [refundRef, setRefundRef] = useState('');
  const [refunding, setRefunding] = useState(false);

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} />;
  if (!sr) return null;

  function DetailRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 2, textAlign: 'right' }}>{value || '—'}</Text>
      </View>
    );
  }

  const dispositionColor: Record<string, string> = {
    restock: '#10B981', damaged: '#DC2626', scrap: '#6B7280', inspection: '#F59E0B',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Header */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>{sr.number}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                {new Date(sr.return_date).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={RETURN_STATUS_LABEL[sr.status] ?? sr.status} variant={statusVariant(sr.status)} />
          </View>
        </Card>

        {/* Return details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Return Details
          </Text>
          <DetailRow label="Customer" value={sr.customer_name} />
          <DetailRow label="Order" value={sr.order_number} />
          <DetailRow label="Warehouse" value={sr.warehouse_name} />
          <DetailRow label="Reason" value={sr.reason} />
          <DetailRow label="Notes" value={sr.notes} />
          <DetailRow label="Created By" value={sr.created_by?.toString() ?? '—'} />
          {sr.approved_by_name && <DetailRow label="Approved By" value={sr.approved_by_name} />}
          {sr.approved_at && <DetailRow label="Approved At" value={new Date(sr.approved_at).toLocaleString()} />}
        </Card>

        {/* Return items with disposition */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Return Items
          </Text>
          {sr.items.map((item, idx) => (
            <View
              key={item.id}
              style={{
                padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xs,
                backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                    {item.product_name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.product_sku}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                    ×{item.quantity}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>₹{item.line_total}</Text>
                </View>
              </View>

              {/* Disposition badge */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs,
                paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, gap: 6,
              }}>
                <Text style={{ fontSize: 14 }}>{DISPOSITION_ICON[item.disposition] ?? '📋'}</Text>
                <View style={{
                  backgroundColor: dispositionColor[item.disposition] + '15',
                  borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 2,
                }}>
                  <Text style={{ color: dispositionColor[item.disposition], fontSize: 11, fontWeight: fontWeight.semibold }}>
                    {DISPOSITION_LABEL[item.disposition] ?? item.disposition}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* RMA / Return Shipping */}
        {(sr.rma_number || sr.return_carrier || sr.return_tracking_number) ? (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Return Shipping
            </Text>
            {sr.rma_number ? <DetailRow label="RMA Number" value={sr.rma_number} /> : null}
            {sr.return_carrier ? <DetailRow label="Carrier" value={sr.return_carrier} /> : null}
            {sr.return_tracking_number ? <DetailRow label="Tracking" value={sr.return_tracking_number} /> : null}
            {sr.return_received_at ? <DetailRow label="Received" value={new Date(sr.return_received_at).toLocaleString()} /> : null}
          </Card>
        ) : null}

        {/* View linked order */}
        <Button
          title={`View Order ${sr.order_number}`}
          onPress={() => nav.navigate('OrderDetail', { orderId: sr.sales_order })}
          variant="outline"
          fullWidth
          size="lg"
        />

        {/* Approve button */}
        {sr.status === 'draft' && (
          <View style={{ marginTop: spacing.base }}>
            <Button
              title={approving ? 'Approving...' : 'Approve Return'}
              onPress={handleApprove}
              loading={approving}
              fullWidth
              size="lg"
            />
          </View>
        )}

        {/* Refund section */}
        {sr.refund_status === 'processed' ? (
          <Card style={{ marginTop: spacing.base, borderWidth: 1, borderColor: '#10B981' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 20 }}>💰</Text>
              <Text style={{ color: '#10B981', fontSize: fontSize.md, fontWeight: fontWeight.bold }}>Refund Processed</Text>
            </View>
            <DetailRow label="Amount" value={`₹${sr.refund_amount}`} />
            <DetailRow label="Method" value={sr.refund_method} />
            {sr.refund_reference ? <DetailRow label="Reference" value={sr.refund_reference} /> : null}
            {sr.refunded_at ? <DetailRow label="Refunded At" value={new Date(sr.refunded_at).toLocaleString()} /> : null}
          </Card>
        ) : sr.status === 'approved' ? (
          <View style={{ marginTop: spacing.base }}>
            <Button
              title="Process Refund"
              onPress={() => {
                const total = sr.items.reduce((s, i) => s + parseFloat(i.line_total), 0);
                setRefundAmt(total.toFixed(2));
                setShowRefund(true);
              }}
              variant="outline"
              fullWidth
              size="lg"
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Refund modal */}
      <Modal visible={showRefund} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.base }}>
              Process Refund
            </Text>

            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Amount (₹)</Text>
            <TextInput
              value={refundAmt}
              onChangeText={setRefundAmt}
              keyboardType="decimal-pad"
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                padding: spacing.sm, fontSize: fontSize.sm, color: colors.textPrimary, marginBottom: spacing.base,
              }}
            />

            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Method</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.base }}>
              {['original', 'cash', 'bank', 'upi', 'credit'].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setRefundMethod(m)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full,
                    backgroundColor: refundMethod === m ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: refundMethod === m ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{
                    color: refundMethod === m ? colors.textInverse : colors.textSecondary,
                    fontSize: 12, fontWeight: refundMethod === m ? '600' : '400',
                  }}>
                    {m === 'original' ? 'Original Method' : m === 'credit' ? 'Store Credit' : m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Reference (optional)</Text>
            <TextInput
              value={refundRef}
              onChangeText={setRefundRef}
              placeholder="Transaction ID / UTR"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                padding: spacing.sm, fontSize: fontSize.sm, color: colors.textPrimary, marginBottom: spacing.lg,
              }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" onPress={() => setShowRefund(false)} variant="outline" fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={refunding ? 'Processing...' : 'Confirm Refund'}
                  loading={refunding}
                  onPress={async () => {
                    setRefunding(true);
                    try {
                      await SalesReturnApi.processRefund(sr.id, {
                        amount: refundAmt, method: refundMethod, reference: refundRef,
                      });
                      setShowRefund(false);
                      refresh();
                    } catch (e: any) {
                      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Failed to process refund.');
                    } finally {
                      setRefunding(false);
                    }
                  }}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}