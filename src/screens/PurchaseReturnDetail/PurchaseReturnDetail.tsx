import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePurchaseReturnDetail } from './hooks/usePurchaseReturnDetail';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import { RETURN_STATUS_LABEL } from '../../constants';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'PurchaseReturnDetail'>;

export default function PurchaseReturnDetailScreen({ route }: Props) {
  const { returnId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { pr, loading, error, approving, handleApprove } = usePurchaseReturnDetail(returnId);

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} />;
  if (!pr) return null;

  function DetailRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 2, textAlign: 'right' }}>{value || '—'}</Text>
      </View>
    );
  }

  const totalValue = pr.items.reduce((sum, i) => sum + parseFloat(i.line_total), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Header */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>{pr.number}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                {new Date(pr.return_date).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={RETURN_STATUS_LABEL[pr.status] ?? pr.status} variant={statusVariant(pr.status)} />
          </View>
        </Card>

        {/* Return details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Return Details
          </Text>
          <DetailRow label="Supplier" value={pr.supplier_name} />
          <DetailRow label="Purchase Order" value={pr.po_number} />
          <DetailRow label="Warehouse" value={pr.warehouse_name} />
          <DetailRow label="Reason" value={pr.reason} />
          <DetailRow label="Notes" value={pr.notes} />
        </Card>

        {/* Return items */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Items Being Returned
          </Text>
          {pr.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xs,
                backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
              }}
            >
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
          ))}

          {/* Total */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            paddingTop: spacing.sm, marginTop: spacing.xs, borderTopWidth: 2, borderTopColor: colors.border,
          }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>Total</Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>₹{totalValue.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Approve button */}
        {pr.status === 'draft' && (
          <Button
            title={approving ? 'Approving...' : 'Approve & Deduct Stock'}
            onPress={handleApprove}
            loading={approving}
            variant="danger"
            fullWidth
            size="lg"
          />
        )}

        {pr.status === 'completed' && (
          <Card style={{ backgroundColor: '#ECFDF5', borderColor: '#10B981', borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 20 }}>✅</Text>
              <Text style={{ color: '#10B981', fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                Return approved — stock has been deducted from {pr.warehouse_name}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}