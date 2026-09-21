import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useWarehouseTransferDetail } from './hooks/useWarehouseTransferDetail';
import { usePermissions } from '../../hooks/usePermissions';
import { TRANSFER_STATUS_LABEL } from '../../constants';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import TransferStockAdjust from './components/TransferStockAdjust';
import type { MainStackParamList, WarehouseTransferItem } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'WarehouseTransferDetail'>;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatQty(qty: string) {
  const n = parseFloat(qty);
  return Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/\.?0+$/, '');
}

export default function WarehouseTransferDetailScreen({ route }: Props) {
  const { transferId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { canManageTransfers, canAdjustStock } = usePermissions();
  const {
    transfer, loading, actioning, error,
    stockMap, adjustProductId, adjustWarehouseId, openAdjust, closeAdjust,
    handleComplete, handleCancel, refresh,
  } = useWarehouseTransferDetail(transferId);

  if (loading) return <Loader fullScreen />;
  if (error || !transfer) return <ErrorState message={error ?? 'Transfer not found'} onRetry={refresh} />;

  const isDraft = transfer.status === 'draft';
  const totalUnits = transfer.items.reduce((sum, i) => sum + parseFloat(i.quantity), 0);

  // Status color
  const statusColor =
    transfer.status === 'completed' ? '#10B981' :
      transfer.status === 'cancelled' ? '#DC2626' : '#F59E0B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header Card ── */}
        <Card style={{ marginBottom: spacing.base }}>

          {/* Transfer number + status */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 2 }}>
                Transfer ID
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, letterSpacing: 0.5 }}>
                {transfer.number}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 6,
              borderRadius: borderRadius.full,
              backgroundColor: statusColor + '18',
              borderWidth: 1, borderColor: statusColor,
            }}>
              <Text style={{ color: statusColor, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                {TRANSFER_STATUS_LABEL[transfer.status] ?? transfer.status}
              </Text>
            </View>
          </View>

          {/* Route */}
          <View style={{
            flexDirection: 'row', alignItems: 'stretch',
            backgroundColor: colors.surfaceSecondary,
            borderRadius: borderRadius.md,
            overflow: 'hidden',
            marginBottom: spacing.base,
          }}>
            {/* From */}
            <View style={{ flex: 1, padding: spacing.base, alignItems: 'center' }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                marginBottom: spacing.xs,
              }}>
                <Text style={{ fontSize: 18 }}>📤</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: 4 }}>
                FROM
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                {transfer.source_warehouse_name}
              </Text>
            </View>

            {/* Arrow divider */}
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.sm }}>
              <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center', justifyContent: 'center',
                marginVertical: spacing.xs,
              }}>
                <Text style={{ color: '#fff', fontSize: 14 }}>→</Text>
              </View>
              <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />
            </View>

            {/* To */}
            <View style={{ flex: 1, padding: spacing.base, alignItems: 'center' }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center',
                marginBottom: spacing.xs,
              }}>
                <Text style={{ fontSize: 18 }}>📥</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: 4 }}>
                TO
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                {transfer.destination_warehouse_name}
              </Text>
            </View>
          </View>

          {/* Meta row */}
          <View style={{ flexDirection: 'row', gap: spacing.base, flexWrap: 'wrap' }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold }}>CREATED</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, marginTop: 2 }}>
                {formatDate(transfer.created_at)}
              </Text>
            </View>
            {transfer.completed_at && (
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold }}>COMPLETED</Text>
                <Text style={{ color: '#10B981', fontSize: fontSize.xs, marginTop: 2 }}>
                  {formatDate(transfer.completed_at)}
                </Text>
              </View>
            )}
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold }}>TOTAL UNITS</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, marginTop: 2 }}>
                {formatQty(String(totalUnits))}
              </Text>
            </View>
          </View>

          {/* Cancelled reason */}
          {transfer.cancelled_reason ? (
            <View style={{
              marginTop: spacing.sm, padding: spacing.sm,
              backgroundColor: '#FEF2F2', borderRadius: borderRadius.md,
              borderLeftWidth: 3, borderLeftColor: '#DC2626',
            }}>
              <Text style={{ color: '#DC2626', fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                Cancellation Reason
              </Text>
              <Text style={{ color: '#991B1B', fontSize: fontSize.xs, marginTop: 2 }}>
                {transfer.cancelled_reason}
              </Text>
            </View>
          ) : null}

          {/* Notes */}
          {transfer.notes ? (
            <View style={{
              marginTop: spacing.sm, padding: spacing.sm,
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold }}>NOTES</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, marginTop: 2 }}>
                {transfer.notes}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* ── Items Card ── */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>
              Products
            </Text>
            <View style={{
              backgroundColor: colors.primaryLight ?? '#EFF3FF',
              borderRadius: borderRadius.full,
              paddingHorizontal: 10, paddingVertical: 3,
            }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                {transfer.items.length} item{transfer.items.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {transfer.items.map((item: WarehouseTransferItem, index: number) => {
            const available = parseFloat(stockMap[item.product] ?? '0');
            const needed = parseFloat(item.quantity);
            const isShort = isDraft && available < needed;

            return (
              <View key={item.id}>
                <View style={{
                  paddingVertical: spacing.base,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.base,
                }}>
                  {/* Index badge */}
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: isShort ? '#FEE2E2' : colors.surfaceSecondary,
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Text style={{
                      color: isShort ? '#DC2626' : colors.textSecondary,
                      fontSize: fontSize.xs, fontWeight: fontWeight.bold,
                    }}>
                      {index + 1}
                    </Text>
                  </View>

                  {/* Product info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                      {item.product_name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                      SKU: {item.product_sku}
                    </Text>
                    {isDraft && (
                      <Text style={{
                        color: isShort ? '#DC2626' : '#10B981',
                        fontSize: fontSize.xs, marginTop: 2, fontWeight: fontWeight.medium,
                      }}>
                        Available: {formatQty(String(available))} {isShort ? `(need ${formatQty(item.quantity)})` : '✓'}
                      </Text>
                    )}
                  </View>

                  {/* Quantity pill */}
                  <View style={{
                    backgroundColor: isShort ? '#DC2626' : colors.primary,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: 12, paddingVertical: 5,
                    minWidth: 52, alignItems: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                      ×{formatQty(item.quantity)}
                    </Text>
                  </View>
                </View>

                {/* Insufficient stock warning + Add Stock button */}
                {isShort && canAdjustStock && (
                  <View style={{
                    marginBottom: spacing.sm,
                    padding: spacing.sm,
                    backgroundColor: '#FEF2F2',
                    borderRadius: borderRadius.md,
                    borderWidth: 1, borderColor: '#FECACA',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#DC2626', fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                        ⚠️ Insufficient stock
                      </Text>
                      <Text style={{ color: '#991B1B', fontSize: 10, marginTop: 2 }}>
                        Need {formatQty(item.quantity)}, have {formatQty(String(available))}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        openAdjust(item.product, transfer.source_warehouse);
                      }}
                      style={{
                        backgroundColor: '#DC2626',
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.xs,
                        marginLeft: spacing.sm,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                        + Add Stock
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* No permission to adjust — show info only */}
                {isShort && !canAdjustStock && (
                  <View style={{
                    marginBottom: spacing.sm, padding: spacing.sm,
                    backgroundColor: '#FEF2F2', borderRadius: borderRadius.md,
                    borderWidth: 1, borderColor: '#FECACA',
                  }}>
                    <Text style={{ color: '#DC2626', fontSize: fontSize.xs }}>
                      ⚠️ Insufficient stock — contact your warehouse manager to add stock before completing this transfer.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </Card>

        {/* ── Actions ── */}
        {isDraft && canManageTransfers && (
          <View style={{ gap: spacing.sm }}>
            <Button
              title={actioning ? 'Processing...' : '✓  Complete Transfer'}
              onPress={handleComplete}
              loading={actioning}
              fullWidth
              size="lg"
            />
            <Button
              title="✕  Cancel Transfer"
              onPress={handleCancel}
              loading={actioning}
              fullWidth
              size="lg"
              variant="danger"
            />
          </View>
        )}

        {/* Completed state — no actions */}
        {transfer.status === 'completed' && (
          <View style={{
            padding: spacing.base, borderRadius: borderRadius.md,
            backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981',
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
          }}>
            <Text style={{ fontSize: 20 }}>✅</Text>
            <Text style={{ color: '#065F46', fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 1 }}>
              Transfer complete. Stock has been moved to {transfer.destination_warehouse_name}.
            </Text>
          </View>
        )}

        {transfer.status === 'cancelled' && (
          <View style={{
            padding: spacing.base, borderRadius: borderRadius.md,
            backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#DC2626',
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
          }}>
            <Text style={{ fontSize: 20 }}>❌</Text>
            <Text style={{ color: '#991B1B', fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 1 }}>
              This transfer was cancelled. No stock was moved.
            </Text>
          </View>
        )}

      </ScrollView>
      {/* Stock Adjust Modal */}
      {adjustProductId && adjustWarehouseId && (
        <TransferStockAdjust
          productId={adjustProductId}
          warehouseId={adjustWarehouseId}
          warehouseName={transfer.source_warehouse_name}
          productName={transfer.items.find((i) => i.product === adjustProductId)?.product_name ?? ''}
          onClose={closeAdjust}
        />
      )}
    </SafeAreaView>
  );
}