import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from './ProductDetails.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { InventoryApi } from '../../services/Api';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import type { MainStackParamList, Product } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route }: Props) {
  const { productId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    InventoryApi.getProduct(productId)
      .then(setProduct)
      .catch((e) => setError(e?.message ?? 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <Loader fullScreen />;
  if (error)   return <ErrorState message={error} />;
  if (!product) return null;

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
                {product.is_low_stock && <Badge label="Low Stock" variant="danger" />}
              </View>
            </View>
          </View>
        </Card>

        {/* Stock Summary */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Stock Summary
          </Text>
          <View style={[styles.stockGrid, { gap: spacing.sm }]}>
            {[
              { label: 'Total Stock',  value: product.total_stock, color: colors.success },
              { label: 'Low Threshold',value: product.low_stock_threshold, color: colors.warning },
            ].map((s) => (
              <View key={s.label} style={[styles.stockItem, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base }]}>
                <Text style={{ color: s.color, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>{s.value}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Product Details
          </Text>
          <Row label="Category"       value={product.category_name ?? '—'} />
          <Row label="Unit"           value={product.unit} />
          <Row label="Purchase Price" value={`₹${product.purchase_price}`} />
          <Row label="Selling Price"  value={`₹${product.selling_price}`} />
          <Row label="Last Updated"   value={new Date(product.updated_at).toLocaleDateString()} />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}
