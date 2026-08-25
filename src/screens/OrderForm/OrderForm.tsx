import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styles } from './OrderForm.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useOrderForm } from './hooks/useOrderForm';
import OrderItemRow from './components/OrderItemRow';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'OrderForm'>;

export default function OrderFormScreen({ navigation }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    form, setField, items, errors,
    customers, warehouses, products,
    loading, saving, saved,
    updateItem, selectProduct, addItem, removeItem,
    getSubtotal, handleSave,
  } = useOrderForm();

  useEffect(() => {
    if (saved) {
      Alert.alert('Success', 'Sales order created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [saved]);

  if (loading) return <Loader fullScreen message="Loading..." />;

  const subtotal = getSubtotal();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Customer */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Customer *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            {customers.map((c) => {
              const active = c.id === form.customer_id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setField('customer_id', active ? null : c.id)}
                  style={{
                    paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
                    borderRadius: borderRadius.full, borderWidth: 1,
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: active ? colors.textInverse : colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {customers.length === 0 && (
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }}>
              No customers found. Create customers from admin panel first.
            </Text>
          )}
          {errors.customer_id && (
            <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }}>{errors.customer_id}</Text>
          )}
        </Card>

        {/* Warehouse */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Warehouse *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            {warehouses.map((w) => {
              const active = w.id === form.warehouse_id;
              return (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setField('warehouse_id', active ? null : w.id)}
                  style={{
                    paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
                    borderRadius: borderRadius.full, borderWidth: 1,
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: active ? colors.textInverse : colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                    {w.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.warehouse_id && (
            <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }}>{errors.warehouse_id}</Text>
          )}
        </Card>

        {/* Order Info */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Order Details
          </Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Order Date *"
                value={form.order_date}
                onChangeText={(v) => setField('order_date', v)}
                placeholder="YYYY-MM-DD"
                error={errors.order_date}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Expected Delivery"
                value={form.expected_delivery}
                onChangeText={(v) => setField('expected_delivery', v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          <Input
            label="Delivery Address"
            value={form.delivery_address}
            onChangeText={(v) => setField('delivery_address', v)}
            placeholder="Optional"
          />
          <Input
            label="Notes"
            value={form.notes}
            onChangeText={(v) => setField('notes', v)}
            placeholder="Optional notes"
            multiline
            numberOfLines={2}
          />
        </Card>

        {/* Line Items */}
        <View style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>
              Items ({items.length})
            </Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                + Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {errors.items && (
            <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.sm }}>{errors.items}</Text>
          )}

          {items.map((item) => (
            <OrderItemRow
              key={item.key}
              item={item}
              products={products}
              error={errors[`item_${item.key}`]}
              onSelectProduct={selectProduct}
              onUpdate={updateItem}
              onRemove={removeItem}
              canRemove={items.length > 1}
            />
          ))}
        </View>

        {/* Summary */}
        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.totalRow}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.base }}>Subtotal</Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Submit */}
        <Button
          title={saving ? 'Creating...' : 'Create Order'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}