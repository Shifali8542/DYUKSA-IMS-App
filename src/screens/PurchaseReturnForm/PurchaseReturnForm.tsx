import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePurchaseReturnForm } from './hooks/usePurchaseReturnForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'PurchaseReturnForm'>;

export default function PurchaseReturnFormScreen({ route, navigation }: Props) {
  const { poId, supplierId, warehouseId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    items, reason, setReason, notes, setNotes, returnDate, setReturnDate,
    loading, saving, savedId, toggleItem, updateItem, handleSave,
  } = usePurchaseReturnForm(poId, supplierId, warehouseId);

  useEffect(() => {
    if (savedId) {
      Alert.alert('Return Created', 'Purchase return created successfully.', [
        { text: 'View Return', onPress: () => { navigation.goBack(); navigation.navigate('PurchaseReturnDetail', { returnId: savedId }); } },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    }
  }, [savedId]);

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">

        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Creating return for</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginTop: 2 }}>
            PO #{poId}
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.base }}>
          <Input label="Return Date *" value={returnDate} onChangeText={setReturnDate} placeholder="YYYY-MM-DD" />
          <Input label="Reason *" value={reason} onChangeText={setReason} placeholder="e.g. Defective items, wrong product" multiline numberOfLines={3} />
          <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Internal notes" multiline />
        </Card>

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
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.product_sku}  •  Received: {item.max_qty}</Text>
                </View>
              </TouchableOpacity>

              {item.selected && (
                <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 80 }}>Return qty:</Text>
                    <View style={{ flex: 1 }}>
                      <Input value={item.quantity} onChangeText={(v) => updateItem(item.key, 'quantity', v)} keyboardType="decimal-pad" />
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </Card>

        <Button title={saving ? 'Creating...' : 'Create Return'} onPress={handleSave} loading={saving} fullWidth size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}