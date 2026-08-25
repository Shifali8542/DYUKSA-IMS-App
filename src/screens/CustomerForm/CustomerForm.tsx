import React, { useEffect } from 'react';
import { ScrollView, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useCustomerForm } from './hooks/useCustomerForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'CustomerForm'>;

export default function CustomerFormScreen({ route, navigation }: Props) {
  const customerId = (route.params as any)?.customerId;
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { form, setField, errors, loading, saving, saved, isEdit, handleSave } = useCustomerForm(customerId);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Customer' : 'Add Customer' });
  }, [isEdit, navigation]);

  useEffect(() => {
    if (saved) {
      Alert.alert('Success', isEdit ? 'Customer updated.' : 'Customer created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [saved]);

  if (loading) return <Loader fullScreen message="Loading..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Customer Information
          </Text>

          <Input
            label="Customer Code *"
            value={form.code}
            onChangeText={(v) => setField('code', v)}
            placeholder="e.g. CUST-001"
            autoCapitalize="characters"
            error={errors.code}
            editable={!isEdit}
          />

          <Input
            label="Customer Name *"
            value={form.name}
            onChangeText={(v) => setField('name', v)}
            placeholder="Full name or business name"
            error={errors.name}
          />

          <Input
            label="Email"
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            placeholder="customer@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Phone"
            value={form.phone}
            onChangeText={(v) => setField('phone', v)}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
          />

          <Input
            label="Tax Number (GST/PAN)"
            value={form.tax_number}
            onChangeText={(v) => setField('tax_number', v)}
            placeholder="Optional"
            autoCapitalize="characters"
          />
        </Card>

        <Card style={{ marginBottom: spacing.xl }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Address
          </Text>

          <Input
            label="Address"
            value={form.address}
            onChangeText={(v) => setField('address', v)}
            placeholder="Street address"
            multiline
            numberOfLines={2}
          />

          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => setField('city', v)}
            placeholder="City"
          />
        </Card>

        <Button
          title={saving ? 'Saving...' : (isEdit ? 'Update Customer' : 'Create Customer')}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}