import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import type { useStockAdjust } from '../hooks/useStockAdjust';

type AdjustHook = ReturnType<typeof useStockAdjust>;

interface Props {
  adjust: AdjustHook;
}

export default function StockAdjustModal({ adjust }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { visible, close, form, setField, errors, warehouses, saving, handleSubmit } = adjust;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        onPress={close}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                Adjust Stock
              </Text>
              <TouchableOpacity onPress={close}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.lg }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Warehouse Picker */}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
              Warehouse *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, marginBottom: spacing.sm }}>
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
                    <Text style={{ color: active ? colors.textInverse : colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.warehouse_id && (
              <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.sm }}>{errors.warehouse_id}</Text>
            )}

            {/* Type Toggle */}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
              Adjustment Type
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
              {(['in', 'out'] as const).map((type) => {
                const active = form.adjustment_type === type;
                const color = type === 'in' ? colors.success : colors.danger;
                const bgColor = type === 'in' ? colors.successLight : colors.dangerLight;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setField('adjustment_type', type)}
                    style={{
                      flex: 1, alignItems: 'center',
                      paddingVertical: spacing.md, borderRadius: borderRadius.md,
                      borderWidth: 2, borderColor: active ? color : colors.border,
                      backgroundColor: active ? bgColor : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{type === 'in' ? '📥' : '📤'}</Text>
                    <Text style={{ color: active ? color : colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                      Stock {type === 'in' ? 'In' : 'Out'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quantity */}
            <Input
              label="Quantity *"
              value={form.quantity}
              onChangeText={(v) => setField('quantity', v)}
              placeholder="Enter quantity"
              keyboardType="decimal-pad"
              error={errors.quantity}
            />

            {/* Reason */}
            <Input
              label="Reason *"
              value={form.reason}
              onChangeText={(v) => setField('reason', v)}
              placeholder="e.g. Received from supplier, Damaged goods..."
              multiline
              numberOfLines={3}
              error={errors.reason}
            />

            {/* Submit */}
            <Button
              title={saving ? 'Adjusting...' : `Apply ${form.adjustment_type === 'in' ? 'Stock In' : 'Stock Out'}`}
              onPress={handleSubmit}
              loading={saving}
              fullWidth
              size="lg"
              variant={form.adjustment_type === 'in' ? 'primary' : 'danger'}
            />

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}