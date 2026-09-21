import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { InventoryApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';

interface Props {
  productId:     number;
  warehouseId:   number;
  warehouseName: string;
  productName:   string;
  onClose: () => void;
}

export default function TransferStockAdjust({ productId, warehouseId, warehouseName, productName, onClose }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [quantity, setQuantity] = useState('');
  const [reason,   setReason]   = useState('');
  const [errors,   setErrors]   = useState<{ quantity?: string; reason?: string }>({});
  const [saving,   setSaving]   = useState(false);

  function validate(): boolean {
    const e: { quantity?: string; reason?: string } = {};
    if (!quantity.trim())                              e.quantity = 'Quantity is required';
    else if (isNaN(Number(quantity)) || Number(quantity) <= 0) e.quantity = 'Must be greater than 0';
    if (!reason.trim())                                e.reason   = 'Reason is required for audit';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await InventoryApi.adjustStock({
        product_id:      productId,
        warehouse_id:    warehouseId,
        adjustment_type: 'in',
        quantity,
        reason: reason.trim(),
      });
      Alert.alert(
        'Stock Added',
        `Added ${quantity} units to ${warehouseName}.\nAvailable now: ${result.available_after}`,
        [{ text: 'OK', onPress: onClose }],
      );
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: spacing.base, maxHeight: '80%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                Add Stock
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.lg }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Locked context banner */}
            <View style={{
              backgroundColor: '#EFF6FF', borderRadius: borderRadius.md,
              padding: spacing.base, marginBottom: spacing.base,
              borderWidth: 1, borderColor: '#BFDBFE',
            }}>
              <Text style={{ color: '#1E40AF', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 4 }}>
                Adding stock to source warehouse
              </Text>
              <Text style={{ color: '#1E3A8A', fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                🏭 {warehouseName}
              </Text>
              <Text style={{ color: '#1E40AF', fontSize: fontSize.xs, marginTop: 2 }}>
                Product: {productName}
              </Text>
            </View>

            {/* Quantity */}
            <Input
              label="Quantity to Add *"
              value={quantity}
              onChangeText={(v) => { setQuantity(v); if (errors.quantity) setErrors((p) => ({ ...p, quantity: undefined })); }}
              placeholder="Enter quantity"
              keyboardType="decimal-pad"
              error={errors.quantity}
            />

            {/* Reason */}
            <Input
              label="Reason *"
              value={reason}
              onChangeText={(v) => { setReason(v); if (errors.reason) setErrors((p) => ({ ...p, reason: undefined })); }}
              placeholder="e.g. Stock replenishment for transfer"
              multiline
              numberOfLines={3}
              error={errors.reason}
            />

            {/* Submit */}
            <Button
              title={saving ? 'Adding Stock...' : 'Add Stock'}
              onPress={handleSubmit}
              loading={saving}
              fullWidth
              size="lg"
            />

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}