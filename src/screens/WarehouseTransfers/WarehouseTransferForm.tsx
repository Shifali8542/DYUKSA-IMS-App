import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useWarehouseTransferForm } from './hooks/useWarehouseTransferForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import SearchBar from '../../components/SearchBar/SearchBar';
import type { MainStackParamList, Warehouse, Product } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'WarehouseTransferForm'>;

export default function WarehouseTransferFormScreen({ navigation }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    sourceWarehouseId, setSourceWarehouseId,
    destinationWarehouseId, setDestinationWarehouseId,
    notes, setNotes,
    items, warehouses, products,
    loading, saving, savedId, errors,
    loadWarehouses, searchProducts,
    selectProduct, updateItem, addItem, removeItem,
    handleSave,
  } = useWarehouseTransferForm();

  const [showSourcePicker,      setShowSourcePicker]      = useState(false);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [productPickerIndex,    setProductPickerIndex]    = useState<number | null>(null);
  const [pickerSearch,          setPickerSearch]          = useState('');

  useEffect(() => { loadWarehouses(); }, []);

  useEffect(() => {
    if (savedId) {
      Alert.alert('Transfer Created', 'Warehouse transfer created as draft.', [
        { text: 'View Transfer', onPress: () => { navigation.goBack(); navigation.navigate('WarehouseTransferDetail', { transferId: savedId }); } },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    }
  }, [savedId]);

  const sourceWarehouse      = warehouses.find((w) => w.id === sourceWarehouseId);
  const destinationWarehouse = warehouses.find((w) => w.id === destinationWarehouseId);

  // ── Warehouse Picker Modal
  function WarehousePicker({ visible, title, exclude, onSelect, onClose }: {
    visible: boolean; title: string; exclude?: number | null;
    onSelect: (w: Warehouse) => void; onClose: () => void;
  }) {
    const filtered = warehouses
      .filter((w) => w.id !== exclude)
      .filter((w) => !pickerSearch || w.name.toLowerCase().includes(pickerSearch.toLowerCase()));
    return (
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 }} onPress={onClose}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: borderRadius.lg, maxHeight: '60%', overflow: 'hidden' }}>
            <View style={{ padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>{title}</Text>
              <SearchBar value={pickerSearch} onChangeText={setPickerSearch} placeholder="Search warehouse..." />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(w) => String(w.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: w }) => (
                <TouchableOpacity
                  onPress={() => { onSelect(w); onClose(); setPickerSearch(''); }}
                  style={{ padding: spacing.base, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{w.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{w.code}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // ── Product Picker Modal
  function ProductPicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 }} onPress={onClose}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: borderRadius.lg, maxHeight: '65%', overflow: 'hidden' }}>
            <View style={{ padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>Select Product</Text>
              <SearchBar
                value={pickerSearch}
                onChangeText={(v) => { setPickerSearch(v); searchProducts(v); }}
                placeholder="Search products..."
              />
            </View>
            <FlatList
              data={products}
              keyExtractor={(p) => String(p.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>Type to search products</Text>
                </View>
              }
              renderItem={({ item: p }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (productPickerIndex !== null) selectProduct(productPickerIndex, p);
                    onClose(); setPickerSearch('');
                  }}
                  style={{ padding: spacing.base, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{p.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>SKU: {p.sku}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  if (loading) return <Loader fullScreen message="Loading warehouses..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">

        {/* Warehouse Selection */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Transfer Route
          </Text>

          {/* Source */}
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            From Warehouse *
          </Text>
          <TouchableOpacity
            onPress={() => { setShowSourcePicker(true); setPickerSearch(''); }}
            style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              borderWidth: 1, borderColor: errors.source ? colors.danger : colors.border,
              padding: 12, marginBottom: spacing.xs,
            }}
          >
            <Text style={{ color: sourceWarehouse ? colors.textPrimary : colors.placeholder, fontSize: fontSize.base }}>
              {sourceWarehouse ? `${sourceWarehouse.name} (${sourceWarehouse.code})` : 'Select source warehouse...'}
            </Text>
          </TouchableOpacity>
          {errors.source && <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.sm }}>{errors.source}</Text>}

          {/* Destination */}
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: spacing.xs, marginTop: spacing.sm }}>
            To Warehouse *
          </Text>
          <TouchableOpacity
            onPress={() => { setShowDestinationPicker(true); setPickerSearch(''); }}
            style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              borderWidth: 1, borderColor: errors.destination ? colors.danger : colors.border,
              padding: 12, marginBottom: spacing.xs,
            }}
          >
            <Text style={{ color: destinationWarehouse ? colors.textPrimary : colors.placeholder, fontSize: fontSize.base }}>
              {destinationWarehouse ? `${destinationWarehouse.name} (${destinationWarehouse.code})` : 'Select destination warehouse...'}
            </Text>
          </TouchableOpacity>
          {errors.destination && <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>{errors.destination}</Text>}
        </Card>

        {/* Items */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>
              Products to Transfer
            </Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {errors.items && <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.sm }}>{errors.items}</Text>}

          {items.map((item, index) => (
            <View key={item.key} style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              padding: spacing.base, marginBottom: spacing.sm,
              borderWidth: 1, borderColor: colors.border,
            }}>
              <TouchableOpacity
                onPress={() => { setProductPickerIndex(index); setPickerSearch(''); }}
                style={{
                  backgroundColor: colors.surface, borderRadius: borderRadius.md,
                  padding: spacing.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
                }}
              >
                <Text style={{ color: item.product_id ? colors.textPrimary : colors.placeholder, fontSize: fontSize.sm }}>
                  {item.product_id ? `${item.product_name} (${item.product_sku})` : 'Select product...'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Quantity"
                    value={item.quantity}
                    onChangeText={(v) => updateItem(index, 'quantity', v)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    error={errors[`qty_${index}`]}
                  />
                </View>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)} style={{ marginTop: 16 }}>
                    <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </Card>

        {/* Notes */}
        <Card style={{ marginBottom: spacing.base }}>
          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Reason for transfer, reference, etc."
            multiline
            numberOfLines={3}
          />
        </Card>

        <Button
          title={saving ? 'Creating...' : 'Create Transfer'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>

      <WarehousePicker
        visible={showSourcePicker}
        title="Select Source Warehouse"
        exclude={destinationWarehouseId}
        onSelect={(w) => setSourceWarehouseId(w.id)}
        onClose={() => setShowSourcePicker(false)}
      />
      <WarehousePicker
        visible={showDestinationPicker}
        title="Select Destination Warehouse"
        exclude={sourceWarehouseId}
        onSelect={(w) => setDestinationWarehouseId(w.id)}
        onClose={() => setShowDestinationPicker(false)}
      />
      <ProductPicker
        visible={productPickerIndex !== null}
        onClose={() => setProductPickerIndex(null)}
      />
    </SafeAreaView>
  );
}