import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { styles } from './ProductForm.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useProductForm } from './hooks/useProductForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import InlineCreateField from '../../components/InlineCreateField/InlineCreateField';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'ProductForm'>;

export default function ProductFormScreen({ route, navigation }: Props) {
  const productId = route.params?.productId;
  const prefillBarcode = (route.params as any)?.barcode;
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const {
    form, setField, errors,
    categories, brands, units,
    loading, saving, saved,
    isEdit, handleSave,
    createCategory, createBrand, createUnit,
  } = useProductForm(productId, prefillBarcode);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Product' : 'Add Product' });
  }, [isEdit, navigation]);

  useEffect(() => {
    if (saved) {
      Alert.alert('Success', isEdit ? 'Product updated.' : 'Product created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [saved]);

  const scrollRef = useRef<ScrollView>(null);

  async function onSubmit() {
    const success = await handleSave();
    if (!success && !saved) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Basic Information
          </Text>

          <Input
            label="Product Name *"
            value={form.name}
            onChangeText={(v) => setField('name', v)}
            placeholder="e.g. Wireless Mouse"
            error={errors.name}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="SKU *"
                value={form.sku}
                onChangeText={(v) => setField('sku', v)}
                placeholder="e.g. WM-001"
                autoCapitalize="characters"
                error={errors.sku}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Barcode"
                value={form.barcode}
                onChangeText={(v) => setField('barcode', v)}
                placeholder="Optional"
              />
            </View>
          </View>

          <Input
            label="Description"
            value={form.description}
            onChangeText={(v) => setField('description', v)}
            placeholder="Optional product description"
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* Classification */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Classification
          </Text>

          <InlineCreateField
            label="Category"
            required
            value={form.category}
            options={categories}
            onSelect={(id) => setField('category', id)}
            onCreate={createCategory}
            error={errors.category}
            createLabel="New Category"
          />

          <InlineCreateField
            label="Brand"
            value={form.brand}
            options={brands}
            onSelect={(id) => setField('brand', id)}
            onCreate={createBrand}
            createLabel="New Brand"
          />

          <InlineCreateField
            label="Unit"
            required
            value={form.unit}
            options={units.map((u) => ({ id: u.id, name: `${u.name} (${u.symbol})` }))}
            onSelect={(id) => setField('unit', id)}
            onCreate={createUnit}
            createLabel="New Unit"
            extraField={{ placeholder: 'Symbol', label: 'Symbol' }}
          />
        </Card>

        {/* Pricing */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Pricing
          </Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Cost Price *"
                value={form.cost_price}
                onChangeText={(v) => setField('cost_price', v)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.cost_price}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Selling Price *"
                value={form.selling_price}
                onChangeText={(v) => setField('selling_price', v)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.selling_price}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Tax Rate %"
                value={form.tax_rate}
                onChangeText={(v) => setField('tax_rate', v)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Reorder Level"
                value={form.reorder_level}
                onChangeText={(v) => setField('reorder_level', v)}
                placeholder="0"
                keyboardType="decimal-pad"
                error={errors.reorder_level}
              />
            </View>
          </View>
        </Card>

        {/* Status */}
        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.switchRow}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium }}>
              Active Product
            </Text>
            <Switch
              value={form.is_active}
              onValueChange={(v) => setField('is_active', v)}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </Card>

        {/* Submit */}
        <Button
          title={saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          onPress={onSubmit}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}