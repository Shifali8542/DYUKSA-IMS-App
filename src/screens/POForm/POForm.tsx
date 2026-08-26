import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, FlatList, Pressable } from 'react-native';
import { styles } from './POForm.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePOForm } from './hooks/usePOForm';
import type { POLineItem } from './hooks/usePOForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import SearchBar from '../../components/SearchBar/SearchBar';
import type { MainStackParamList, Product, Supplier, Warehouse } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'POForm'>;

export default function POFormScreen({ navigation }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const {
    form, setField, errors,
    suppliers, warehouses, products,
    loading, saving, saved,
    updateItem, selectProduct, addItem, removeItem,
    getSubtotal, handleSave,
  } = usePOForm();

  // Picker modals
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [productPickerIndex, setProductPickerIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    if (saved) {
      Alert.alert('Success', 'Purchase order created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [saved]);

  async function onSubmit() {
    const ok = await handleSave();
    if (!ok && !saved) scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  if (loading) return <Loader fullScreen message="Loading..." />;

  const selectedSupplier = suppliers.find((s) => s.id === form.supplier_id);
  const selectedWarehouse = warehouses.find((w) => w.id === form.warehouse_id);
  const subtotal = getSubtotal();

  // ── Picker Modal (reusable for supplier/warehouse/product) ──
  function PickerModal<T extends { id: number; name: string }>({
    visible, title, data, onSelect, onClose, renderExtra,
  }: {
    visible: boolean; title: string; data: T[];
    onSelect: (item: T) => void; onClose: () => void;
    renderExtra?: (item: T) => string;
  }) {
    const filtered = pickerSearch
      ? data.filter((d) => d.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
          (('sku' in d) ? (d as any).sku?.toLowerCase().includes(pickerSearch.toLowerCase()) : false) ||
          (('code' in d) ? (d as any).code?.toLowerCase().includes(pickerSearch.toLowerCase()) : false))
      : data;

    return (
      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={onClose}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: colors.surface, borderRadius: borderRadius.lg,
            maxHeight: '70%', overflow: 'hidden',
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
          }}>
            <View style={{ padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>
                {title}
              </Text>
              <SearchBar value={pickerSearch} onChangeText={setPickerSearch} placeholder={`Search ${title.toLowerCase()}...`} />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>No results found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onSelect(item); onClose(); setPickerSearch(''); }}
                  style={{
                    padding: spacing.base, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                    {item.name}
                  </Text>
                  {renderExtra && (
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                      {renderExtra(item)}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // ── Line Item Row ──
  function ItemRow({ item, index }: { item: POLineItem; index: number }) {
    return (
      <View style={{
        backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
        padding: spacing.base, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
      }}>
        {/* Product selector */}
        <TouchableOpacity
          onPress={() => { setProductPickerIndex(index); setPickerSearch(''); }}
          style={{
            backgroundColor: colors.surface, borderRadius: borderRadius.md,
            padding: spacing.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
          }}
        >
          <Text style={{
            color: item.product_id ? colors.textPrimary : colors.placeholder,
            fontSize: fontSize.sm,
          }}>
            {item.product_id ? item.product_name : 'Select product...'}
          </Text>
        </TouchableOpacity>

        {/* Qty + Price row */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Qty"
              value={item.quantity}
              onChangeText={(v) => updateItem(index, 'quantity', v)}
              keyboardType="decimal-pad"
              placeholder="1"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Unit Price"
              value={item.unit_price}
              onChangeText={(v) => updateItem(index, 'unit_price', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Tax %"
              value={item.tax_rate}
              onChangeText={(v) => updateItem(index, 'tax_rate', v)}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </View>
        </View>

        {/* Line total + remove */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
            Line: ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
          </Text>
          {form.items.length > 1 && (
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Supplier + Warehouse */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Order Details
          </Text>

          {/* Supplier */}
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Supplier *
          </Text>
          <TouchableOpacity
            onPress={() => { setShowSupplierPicker(true); setPickerSearch(''); }}
            style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              borderWidth: 1, borderColor: errors.supplier_id ? colors.danger : colors.border,
              padding: 12, marginBottom: spacing.base,
            }}
          >
            <Text style={{ color: selectedSupplier ? colors.textPrimary : colors.placeholder, fontSize: fontSize.base }}>
              {selectedSupplier ? `${selectedSupplier.name} (${selectedSupplier.code})` : 'Select supplier...'}
            </Text>
          </TouchableOpacity>

          {/* Warehouse */}
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Receive at Warehouse *
          </Text>
          <TouchableOpacity
            onPress={() => { setShowWarehousePicker(true); setPickerSearch(''); }}
            style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              borderWidth: 1, borderColor: errors.warehouse_id ? colors.danger : colors.border,
              padding: 12, marginBottom: spacing.base,
            }}
          >
            <Text style={{ color: selectedWarehouse ? colors.textPrimary : colors.placeholder, fontSize: fontSize.base }}>
              {selectedWarehouse ? `${selectedWarehouse.name} (${selectedWarehouse.code})` : 'Select warehouse...'}
            </Text>
          </TouchableOpacity>

          {/* Dates */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Order Date *"
                value={form.order_date}
                onChangeText={(v) => setField('order_date', v)}
                placeholder="YYYY-MM-DD"
                error={errors.order_date}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Expected Date"
                value={form.expected_date}
                onChangeText={(v) => setField('expected_date', v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

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
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>
              Items
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

          {form.items.map((item, index) => (
            <ItemRow key={item.key} item={item} index={index} />
          ))}

          {/* Subtotal */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: colors.border,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
              Subtotal
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Submit */}
        <Button
          title={saving ? 'Creating...' : 'Create Purchase Order'}
          onPress={onSubmit}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>

      {/* Picker Modals */}
      <PickerModal
        visible={showSupplierPicker}
        title="Select Supplier"
        data={suppliers}
        onSelect={(s) => setField('supplier_id', s.id)}
        onClose={() => setShowSupplierPicker(false)}
        renderExtra={(s: any) => `${s.code} • ${s.city ?? ''}`}
      />

      <PickerModal
        visible={showWarehousePicker}
        title="Select Warehouse"
        data={warehouses}
        onSelect={(w) => setField('warehouse_id', w.id)}
        onClose={() => setShowWarehousePicker(false)}
        renderExtra={(w: any) => `${w.code} • ${w.city ?? ''}`}
      />

      <PickerModal
        visible={productPickerIndex !== null}
        title="Select Product"
        data={products}
        onSelect={(p) => { if (productPickerIndex !== null) selectProduct(productPickerIndex, p); }}
        onClose={() => setProductPickerIndex(null)}
        renderExtra={(p: any) => `SKU: ${p.sku} • ₹${p.cost_price}`}
      />
    </SafeAreaView>
  );
}