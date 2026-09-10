import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useInvoiceForm } from './hooks/useInvoiceForm';
import OrderItemRow from '../OrderForm/components/OrderItemRow';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'InvoiceForm'>;

export default function InvoiceFormScreen({ navigation }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    form, setField, items, errors,
    customers, products, searchProducts,
    loading, saving, savedId,
    updateItem, selectProduct, addItem, removeItem,
    getSubtotal, handleSave,
  } = useInvoiceForm();

  useEffect(() => {
    if (savedId) {
      Alert.alert('Invoice Created', 'Invoice created successfully.', [
        { text: 'View Invoice', onPress: () => { navigation.goBack(); navigation.navigate('InvoiceDetail', { invoiceId: savedId }); } },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    }
  }, [savedId]);

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">

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
                  <Text style={{ color: active ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs }}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.customer_id && <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: 4 }}>{errors.customer_id}</Text>}
        </Card>

        {/* Dates */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Input label="Invoice date *" value={form.invoice_date} onChangeText={(v) => setField('invoice_date', v)} placeholder="YYYY-MM-DD" />
              {errors.invoice_date && <Text style={{ color: colors.danger, fontSize: 10 }}>{errors.invoice_date}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Due date *" value={form.due_date} onChangeText={(v) => setField('due_date', v)} placeholder="YYYY-MM-DD" />
              {errors.due_date && <Text style={{ color: colors.danger, fontSize: 10 }}>{errors.due_date}</Text>}
            </View>
          </View>
          <Input label="Notes" value={form.notes} onChangeText={(v) => setField('notes', v)} placeholder="Optional notes" multiline />
        </Card>

        {/* Line items */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Items
          </Text>
          {items.map((item) => (
            <OrderItemRow
              key={item.key}
              item={item as any}
              products={products}
              onSearchProducts={searchProducts}
              error={errors[`item_${item.key}`]}
              onSelectProduct={selectProduct}
              onUpdate={updateItem as any}
              onRemove={removeItem}
              canRemove={items.length > 1}
            />
          ))}
          <TouchableOpacity onPress={addItem} style={{ paddingVertical: spacing.sm }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>+ Add item</Text>
          </TouchableOpacity>
        </Card>

        {/* Subtotal */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Subtotal</Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>₹{getSubtotal().toFixed(2)}</Text>
          </View>
        </Card>

        <Button
          title={saving ? 'Creating...' : 'Create Invoice'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}