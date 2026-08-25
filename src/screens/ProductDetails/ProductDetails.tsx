import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styles } from './ProductDetails.styles';
import {
  SafeAreaView
} from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useProductDetails } from './hooks/useProductDetails';
import { ProductApi } from '../../api/api';
import { useStockAdjust } from './hooks/useStockAdjust';
import StockAdjustModal from './components/StockAdjustModal';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { product, stockLevels, loading, error, refresh } = useProductDetails(productId);
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

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
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
        </View>

        {/* Hero */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={styles.hero}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}>
              <Text style={{ fontSize: 32 }}>📦</Text>
            </View>
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
                {product.available_stock ?? '0'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>Available</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center' }}>
              <Text style={{ color: colors.warning, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                {product.reorder_level}
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
                    {sl.on_hand}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    Rsv: {sl.reserved} · Avl: {sl.available}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.sm, fontStyle: 'italic' }}>
              Tap a warehouse to adjust stock
            </Text>
          </Card>
        )}

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
      </ScrollView>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal adjust={adjust} />
    </SafeAreaView>
  );
}