import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Share } from 'react-native';
import { styles } from './ProductDetails.styles';
import {
  SafeAreaView
} from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useProductDetails } from './hooks/useProductDetails';
import { ProductApi, imsClient } from '../../api/api';
import { tokenStorage } from '../../utils/tokenStorage';
import { useStockAdjust } from './hooks/useStockAdjust';
import StockAdjustModal from './components/StockAdjustModal';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import type { MainStackParamList } from '../../types';


type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetails'>;

/** Format backend decimal strings: 2.000 → "2", 2.500 → "2.5", 2.123 → "2.12" */
const fmtQty = (v: string | number | undefined): string => {
  const n = parseFloat(String(v ?? '0'));
  if (isNaN(n)) return '0';
  if (n % 1 === 0) return String(Math.round(n));
  return n.toFixed(2).replace(/0$/, '');
};

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { canEditProducts, canDeleteProducts, canAdjustStock } = usePermissions();
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { product, stockLevels, images, movements, movementsLoading, batches, loading, error, refresh } = useProductDetails(productId);
  const adjust = useStockAdjust(productId);
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    Alert.alert(
      'Delete Product',
      'This will deactivate the product if it has transaction history, or permanently delete it. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await ProductApi.deleteProduct(productId);
            } catch (e: any) {
              // 204 is success, ignore. Only show error for real failures.
              if (e?.response?.status && e.response.status !== 204) {
                Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Delete failed');
                setDeleting(false);
                return;
              }
            }
            setDeleting(false);
            navigation.goBack();
            setTimeout(() => Alert.alert('Done', 'Product deleted.'), 300);
          },
        },
      ]
    );
  }

  // Refresh product data after stock adjustment
  useEffect(() => {
    if (adjust.lastResult) refresh();
  }, [adjust.lastResult]);

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!product) return null;

  const isLow = parseFloat(product.available_stock ?? '0') <= parseFloat(product.reorder_level ?? '0');

  function Row({ label, value }: { label: string; value: string | number }) {
    return (
      <View style={[styles.row, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 1, textAlign: 'right' }}>{value}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Action Buttons (role-gated) */}
        {(canEditProducts || canAdjustStock || canDeleteProducts) && (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
            {canEditProducts && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ProductForm', { productId: product.id })}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.primary, borderRadius: borderRadius.md,
                  paddingVertical: spacing.md,
                }}
              >
                <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Edit</Text>
              </TouchableOpacity>
            )}
            {canAdjustStock && (
              <TouchableOpacity
                onPress={() => adjust.open()}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.success, borderRadius: borderRadius.md,
                  paddingVertical: spacing.md,
                }}
              >
                <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Adjust Stock</Text>
              </TouchableOpacity>
            )}
            {canDeleteProducts && (
              <TouchableOpacity
                onPress={() => handleDelete()}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.danger, borderRadius: borderRadius.md,
                  paddingVertical: spacing.md,
                }}
              >
                <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hero */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={styles.hero}>
            {images.length > 0 && images[0].image_url ? (
              <Image
                source={{ uri: images[0].image_url }}
                style={{ width: 72, height: 72, borderRadius: borderRadius.md }}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}>
                <Text style={{ fontSize: 32 }}>📦</Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: spacing.base }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>{product.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>SKU: {product.sku}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.xs }}>
                <Badge label={product.is_active ? 'Active' : 'Inactive'} variant={product.is_active ? 'success' : 'default'} />
                {isLow && <Badge label="Low Stock" variant="danger" />}
              </View>
            </View>
          </View>
        </Card>

        {/* Stock Summary */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Stock Summary
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center' }}>
              <Text style={{ color: isLow ? colors.danger : colors.success, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                {fmtQty(product.available_stock)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>Available</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center' }}>
              <Text style={{ color: colors.warning, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                {fmtQty(product.reorder_level)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>Reorder Level</Text>
            </View>
          </View>
        </Card>

        {/* Stock by Warehouse */}
        {stockLevels.length > 0 && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
              Stock by Warehouse
            </Text>
            {stockLevels.map((sl, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => adjust.open(sl.warehouse_id)}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: spacing.sm,
                  borderBottomWidth: idx < stockLevels.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{sl.warehouse_name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{sl.warehouse_code}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: sl.is_low_stock ? colors.danger : colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {fmtQty(sl.on_hand)}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    Rsv: {fmtQty(sl.reserved)} · Avl: {fmtQty(sl.available)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.sm, fontStyle: 'italic' }}>
              Tap a warehouse to adjust stock
            </Text>
          </Card>
        )}

        {/* Batch / Expiry Tracking */}
        {product.is_batch_tracked && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
              Batch / Expiry Tracking
            </Text>

            {batches.length === 0 ? (
              <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginBottom: spacing.xs }}>📦</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>No batches recorded yet</Text>
              </View>
            ) : (
              batches.map((batch: any, idx: number) => {
                const isExpired = batch.is_expired;
                const daysLeft = batch.days_until_expiry;
                const isNearExpiry = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;

                return (
                  <View
                    key={batch.id}
                    style={{
                      padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xs,
                      backgroundColor: isExpired ? '#FEE2E2' : isNearExpiry ? '#FFFBEB' : colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: isExpired ? '#DC2626' : isNearExpiry ? '#F59E0B' : colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                            {batch.batch_number}
                          </Text>
                          {isExpired && (
                            <View style={{ backgroundColor: '#DC2626', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '600' }}>EXPIRED</Text>
                            </View>
                          )}
                          {isNearExpiry && (
                            <View style={{ backgroundColor: '#F59E0B', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '600' }}>{daysLeft}d left</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                          {batch.warehouse_name}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                          {fmtQty(batch.quantity)}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 10 }}>units</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: isExpired ? '#FECACA' : colors.border }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                        MFG: {batch.manufacturing_date ? new Date(batch.manufacturing_date).toLocaleDateString() : '—'}
                      </Text>
                      <Text style={{ color: isExpired ? '#DC2626' : isNearExpiry ? '#F59E0B' : colors.textSecondary, fontSize: 10, fontWeight: isExpired || isNearExpiry ? '600' : '400' }}>
                        EXP: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '—'}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: spacing.xs, fontStyle: 'italic' }}>
              Ordered by expiry date (FEFO — First Expiry, First Out)
            </Text>
          </Card>
        )}

        {/* Barcode & Label */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Barcode & Label
          </Text>

          {product.barcode ? (
            <View style={{ alignItems: 'center', marginBottom: spacing.base }}>
              <View style={{
                backgroundColor: '#fff', borderRadius: borderRadius.md, padding: spacing.base,
                borderWidth: 1, borderColor: colors.border, width: '100%', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Barcode
                </Text>
                <Text style={{ fontSize: 22, fontFamily: 'Courier', letterSpacing: 3, color: colors.textPrimary, fontWeight: fontWeight.bold }}>
                  {product.barcode}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginBottom: spacing.base }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: spacing.sm }}>
                No barcode assigned
              </Text>
              {canEditProducts && (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const res = await ProductApi.generateBarcode(product.id);
                      Alert.alert('Barcode Generated', `Barcode: ${res.barcode}`);
                      refresh();
                    } catch (e: any) {
                      Alert.alert('Error', 'Failed to generate barcode.');
                    }
                  }}
                  style={{
                    backgroundColor: colors.primary, borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
                  }}
                >
                  <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    Generate Barcode
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Label actions */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={async () => {
                const accessToken = await tokenStorage.getAccessToken();
                const baseURL = imsClient.defaults.baseURL ?? '';
                const url = `${baseURL}/api/v1/products/${product.id}/barcode-label/?size=standard`;

                try {
                  const resp = await fetch(url, {
                    headers: { Authorization: `Bearer ${accessToken ?? ''}` },
                  });
                  const html = await resp.text();
                  const { printAsync } = await import('expo-print');
                  await printAsync({ html });
                } catch {
                  Alert.alert('Error', 'Failed to print label.');
                }
              }}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
                paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 14 }}>🏷️</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Print Label</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                const accessToken = await tokenStorage.getAccessToken();
                const baseURL = imsClient.defaults.baseURL ?? '';
                const url = `${baseURL}/api/v1/products/${product.id}/barcode-label/?size=sheet`;

                try {
                  const resp = await fetch(url, {
                    headers: { Authorization: `Bearer ${accessToken ?? ''}` },
                  });
                  const html = await resp.text();
                  const { printToFileAsync } = await import('expo-print');
                  const { shareAsync } = await import('expo-sharing');
                  const { uri } = await printToFileAsync({ html });
                  await shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Label Sheet' });
                } catch {
                  Alert.alert('Error', 'Failed to generate label sheet.');
                }
              }}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
                paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 14 }}>📄</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Label Sheet</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Product Details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Product Details
          </Text>
          <Row label="Category" value={product.category_name ?? '—'} />
          <Row label="Brand" value={product.brand_name ?? '—'} />
          <Row label="Unit" value={product.unit_symbol ?? String(product.unit)} />
          <Row label="Cost Price" value={`₹${product.cost_price}`} />
          <Row label="Selling Price" value={`₹${product.selling_price}`} />
          <Row label="Tax Rate" value={`${product.tax_rate ?? '0'}%`} />
          <Row label="Reorder Level" value={product.reorder_level} />
          <Row label="Last Updated" value={new Date(product.updated_at).toLocaleDateString()} />
        </Card>

        {/* Stock Movement History */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Stock History
          </Text>

          {movementsLoading ? (
            <View style={{ padding: spacing.lg, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Loading history...</Text>
            </View>
          ) : movements.length === 0 ? (
            <View style={{ padding: spacing.lg, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: spacing.xs }}>📋</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>No stock movements yet</Text>
            </View>
          ) : (
            movements.map((mv, idx) => {
              const isPositive = parseFloat(mv.quantity) > 0;
              const typeColors: Record<string, { bg: string; text: string; icon: string }> = {
                receipt: { bg: '#ECFDF5', text: '#10B981', icon: '📥' },
                adjustment_in: { bg: '#ECFDF5', text: '#10B981', icon: '➕' },
                return: { bg: '#EFF6FF', text: '#3B82F6', icon: '🔄' },
                transfer_in: { bg: '#EFF6FF', text: '#3B82F6', icon: '📦' },
                dispatch: { bg: '#FFFBEB', text: '#F59E0B', icon: '🚚' },
                delivery: { bg: '#FFFBEB', text: '#F59E0B', icon: '✅' },
                adjustment_out: { bg: '#FEE2E2', text: '#DC2626', icon: '➖' },
                reservation: { bg: '#F5F3FF', text: '#6366F1', icon: '🔒' },
                release: { bg: '#F5F3FF', text: '#6366F1', icon: '🔓' },
                damage: { bg: '#FEE2E2', text: '#DC2626', icon: '💥' },
                transfer_out: { bg: '#FEE2E2', text: '#DC2626', icon: '📤' },
              };
              const tc = typeColors[mv.movement_type] ?? { bg: colors.surfaceSecondary, text: colors.textSecondary, icon: '📋' };
              const typeLabel = mv.movement_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <View
                  key={mv.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                    paddingVertical: spacing.sm,
                    borderBottomWidth: idx < movements.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  {/* Icon */}
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: tc.bg, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 16 }}>{tc.icon}</Text>
                  </View>

                  {/* Details */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                        {typeLabel}
                      </Text>
                      <Text style={{
                        color: isPositive ? '#10B981' : '#DC2626',
                        fontSize: fontSize.sm, fontWeight: fontWeight.bold,
                      }}>
                        {isPositive ? '+' : ''}{fmtQty(mv.quantity)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                        {mv.source_reference || mv.reference}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                        Bal: {fmtQty(mv.balance_after)}
                      </Text>
                    </View>

                    {mv.notes ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 1, fontStyle: 'italic' }}>
                        {mv.notes}
                      </Text>
                    ) : null}

                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
                      {new Date(mv.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {movements.length > 0 && (
            <View style={{
              flexDirection: 'row', justifyContent: 'center',
              paddingTop: spacing.sm, marginTop: spacing.xs,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                Showing latest {movements.length} movements • Immutable ledger
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal adjust={adjust} />
    </SafeAreaView>
  );
}