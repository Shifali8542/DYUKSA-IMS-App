import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Input from '../../../components/Input/Input';
import SearchBar from '../../../components/SearchBar/SearchBar';
import type { Product } from '../../../types';
import type { OrderLineItem } from '../hooks/useOrderForm';

interface Props {
  item:          OrderLineItem;
  products:      Product[];
  error?:        string;
  onSelectProduct: (key: string, productId: number) => void;
  onUpdate:      (key: string, field: keyof OrderLineItem, value: any) => void;
  onRemove:      (key: string) => void;
  canRemove:     boolean;
}

export default function OrderItemRow({ item, products, error, onSelectProduct, onUpdate, onRemove, canRemove }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lineTotal = ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2);

  return (
    <View style={{
      backgroundColor: colors.surface, borderRadius: borderRadius.md,
      padding: spacing.base, marginBottom: spacing.sm,
      borderWidth: 1, borderColor: error ? colors.danger : colors.border,
    }}>
      {/* Product Selector */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
          padding: spacing.md, marginBottom: spacing.sm,
          borderWidth: 1, borderColor: colors.border,
        }}
      >
        <Text style={{
          color: item.product_id ? colors.textPrimary : colors.placeholder,
          fontSize: fontSize.base,
        }}>
          {item.product_id ? item.product_name : 'Select product...'}
        </Text>
      </TouchableOpacity>

      {/* Quantity + Price row */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input
            label="Qty"
            value={item.quantity}
            onChangeText={(v) => onUpdate(item.key, 'quantity', v)}
            keyboardType="decimal-pad"
            placeholder="1"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Unit Price"
            value={item.unit_price}
            onChangeText={(v) => onUpdate(item.key, 'unit_price', v)}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Line Total</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>₹{lineTotal}</Text>
        </View>
      </View>

      {/* Error + Remove */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
        {error ? (
          <Text style={{ color: colors.danger, fontSize: fontSize.xs, flex: 1 }}>{error}</Text>
        ) : <View />}
        {canRemove && (
          <TouchableOpacity onPress={() => onRemove(item.key)}>
            <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <Pressable
          onPress={() => setShowPicker(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
              maxHeight: '70%', padding: spacing.base,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.base }}>
              Select Product
            </Text>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or SKU..." />
            <FlatList
              data={filtered}
              keyExtractor={(p) => String(p.id)}
              style={{ marginTop: spacing.sm }}
              renderItem={({ item: prod }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelectProduct(item.key, prod.id);
                    setShowPicker(false);
                    setSearch('');
                  }}
                  style={{
                    padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border,
                    backgroundColor: prod.id === item.product_id ? colors.primaryLight : 'transparent',
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium }}>
                    {prod.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    SKU: {prod.sku}  •  ₹{prod.selling_price}  •  Stock: {prod.available_stock ?? '—'}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', padding: spacing.xl }}>
                  No products found
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}