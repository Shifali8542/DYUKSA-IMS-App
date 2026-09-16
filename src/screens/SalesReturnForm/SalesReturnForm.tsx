import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useSalesReturnForm } from './hooks/useSalesReturnForm';
import type { SalesReturnLineItem } from './hooks/useSalesReturnForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import { DISPOSITION_LABEL, DISPOSITION_ICON } from '../../constants';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'SalesReturnForm'>;

const DISPOSITIONS = ['inspection', 'restock', 'damaged', 'scrap'] as const;

export default function SalesReturnFormScreen({ route, navigation }: Props) {
  const { orderId, customerId, warehouseId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    order, items, reason, setReason, notes, setNotes, returnDate, setReturnDate,
    loading, saving, savedId, toggleItem, updateItem, handleSave,
  } = useSalesReturnForm(orderId, customerId, warehouseId);

  useEffect(() => {
    if (savedId) {
      Alert.alert('Return Created', 'Sales return created successfully.', [
        { text: 'View Return', onPress: () => { navigation.goBack(); navigation.navigate('SalesReturnDetail', { returnId: savedId }); } },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    }
  }, [savedId]);

  if (loading) return <Loader fullScreen />;

  const dispositionColor: Record<string, string> = {
    inspection: colors.warning ?? '#F59E0B', restock: '#10B981', damaged: '#DC2626', scrap: '#6B7280',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">

        {/* Order info */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Creating return for</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginTop: 2 }}>
            {order?.order_number ?? `Order #${orderId}`}
          </Text>
        </Card>

        {/* Return date + reason */}
        <Card style={{ marginBottom: spacing.base }}>
          <Input label="Return Date *" value={returnDate} onChangeText={setReturnDate} placeholder="YYYY-MM-DD" />
          <Input label="Reason *" value={reason} onChangeText={setReason} placeholder="Why is this being returned?" multiline numberOfLines={3} />
          <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Internal notes" multiline />
        </Card>

        {/* Items to return */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Select Items to Return
          </Text>

          {items.map((item) => (
            <View
              key={item.key}
              style={{
                marginBottom: spacing.sm, padding: spacing.sm, borderRadius: borderRadius.md,
                backgroundColor: item.selected ? colors.surfaceSecondary : colors.surface,
                borderWidth: 1, borderColor: item.selected ? colors.primary : colors.border,
                opacity: item.selected ? 1 : 0.5,
              }}
            >
              {/* Select toggle + product info */}
              <TouchableOpacity onPress={() => toggleItem(item.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                  borderColor: item.selected ? colors.primary : colors.border,
                  backgroundColor: item.selected ? colors.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.selected && <Text style={{ color: colors.textInverse, fontSize: 12, fontWeight: '700' }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{item.product_name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.product_sku}  •  Max: {item.max_qty}</Text>
                </View>
              </TouchableOpacity>

              {item.selected && (
                <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                  {/* Quantity */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 40 }}>Qty:</Text>
                    <View style={{ flex: 1 }}>
                      <Input
                        value={item.quantity}
                        onChangeText={(v) => updateItem(item.key, 'quantity', v)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                      />
                    </View>
                  </View>

                  {/* Disposition picker */}
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Disposition:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                    {DISPOSITIONS.map((d) => {
                      const active = item.disposition === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() => updateItem(item.key, 'disposition', d)}
                          style={{
                            flexDirection: 'row', alignItems: 'center', gap: 4,
                            paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.full,
                            backgroundColor: active ? dispositionColor[d] + '20' : colors.surface,
                            borderWidth: 1, borderColor: active ? dispositionColor[d] : colors.border,
                          }}
                        >
                          <Text style={{ fontSize: 12 }}>{DISPOSITION_ICON[d]}</Text>
                          <Text style={{
                            fontSize: 11, fontWeight: active ? '600' : '400',
                            color: active ? dispositionColor[d] : colors.textSecondary,
                          }}>
                            {DISPOSITION_LABEL[d]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ))}
        </Card>

        <Button
          title={saving ? 'Creating...' : 'Create Return'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}