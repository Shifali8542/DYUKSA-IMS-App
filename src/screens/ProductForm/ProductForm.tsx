import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Switch, Alert, TouchableOpacity,
  Image, Modal, FlatList, Pressable,
} from 'react-native';
import { styles } from './ProductForm.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useProductForm } from './hooks/useProductForm';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import SearchBar from '../../components/SearchBar/SearchBar';
import InlineCreateField from '../../components/InlineCreateField/InlineCreateField';
import type { MainStackParamList, Supplier } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'ProductForm'>;

export default function ProductFormScreen({ route, navigation }: Props) {
  const productId = route.params?.productId;
  const prefillBarcode = (route.params as any)?.barcode;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const {
    form, setField, errors,
    categories, brands, units, suppliers,
    loading, saving, saved, isEdit,
    handleSave, pickImage, takePhoto,
    createCategory, createBrand, createUnit,
    deleteCategory, deleteBrand, deleteUnit,
  } = useProductForm(productId, prefillBarcode);

  const [showVendorPicker, setShowVendorPicker] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Product' : 'Add Product' });
  }, [isEdit]);

  useEffect(() => {
    if (saved) {
      Alert.alert('Success', isEdit ? 'Product updated.' : 'Product created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [saved]);

  async function onSubmit() {
    const ok = await handleSave();
    if (!ok && !saved) scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  if (loading) return <Loader fullScreen message="Loading..." />;

  const selectedVendor = suppliers.find((s) => s.id === form.preferred_vendor);
  const filteredVendors = vendorSearch
    ? suppliers.filter((s) => s.name.toLowerCase().includes(vendorSearch.toLowerCase()) || s.code.toLowerCase().includes(vendorSearch.toLowerCase()))
    : suppliers;

  // ── Section Header Component ──
  function SectionHeader({ icon, title }: { icon: string; title: string }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.base }}>
        <View style={{
          width: 32, height: 32, borderRadius: borderRadius.md,
          backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
          marginRight: spacing.sm,
        }}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
          {title}
        </Text>
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
        {/* ── Product Image ── */}
        <Card style={{ marginBottom: spacing.base, alignItems: 'center', paddingVertical: spacing.xl }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Add Image', 'Choose source', [
              { text: 'Camera', onPress: takePhoto },
              { text: 'Gallery', onPress: pickImage },
              { text: 'Cancel', style: 'cancel' },
            ])}
            style={{
              width: 120, height: 120, borderRadius: borderRadius.lg,
              backgroundColor: colors.surfaceSecondary, borderWidth: 2,
              borderColor: colors.border, borderStyle: 'dashed',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}
          >
            {form.image_uri ? (
              <Image source={{ uri: form.image_uri }} style={{ width: 120, height: 120 }} resizeMode="cover" />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 36 }}>📷</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {form.image_uri && (
            <TouchableOpacity onPress={() => setField('image_uri', null)} style={{ marginTop: spacing.sm }}>
              <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>Remove Image</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Basic Information ── */}
        <Card style={{ marginBottom: spacing.base }}>
          <SectionHeader icon="📋" title="Basic Information" />

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
                placeholder="Scan or type"
              />
            </View>
          </View>

          <Input
            label="HSN / SAC Code"
            value={form.hsn_code}
            onChangeText={(v) => setField('hsn_code', v)}
            placeholder="e.g. 85176290 (for GST)"
          />

          <Input
            label="Description"
            value={form.description}
            onChangeText={(v) => setField('description', v)}
            placeholder="Product description"
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* ── Classification ── */}
        <Card style={{ marginBottom: spacing.base }}>
          <SectionHeader icon="🏷️" title="Classification" />

          <InlineCreateField
            label="Category" required
            value={form.category} options={categories}
            onSelect={(id) => setField('category', id)}
            onCreate={createCategory} onDelete={deleteCategory}
            error={errors.category} createLabel="New Category"
          />

          <InlineCreateField
            label="Brand"
            value={form.brand} options={brands}
            onSelect={(id) => setField('brand', id)}
            onCreate={createBrand} onDelete={deleteBrand}
            createLabel="New Brand"
          />

          <InlineCreateField
            label="Unit" required
            value={form.unit}
            options={units.map((u) => ({ id: u.id, name: `${u.name} (${u.symbol})` }))}
            onSelect={(id) => setField('unit', id)}
            onCreate={createUnit} onDelete={deleteUnit}
            createLabel="New Unit"
            extraField={{ placeholder: 'Symbol', label: 'Symbol' }}
          />
        </Card>

        {/* ── Pricing & Tax ── */}
        <Card style={{ marginBottom: spacing.base }}>
          <SectionHeader icon="💰" title="Pricing & Tax" />

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
              />
            </View>
          </View>

          {/* Margin indicator */}
          {form.cost_price && form.selling_price && Number(form.cost_price) > 0 && (
            <View style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              padding: spacing.sm, flexDirection: 'row', justifyContent: 'space-between',
              marginTop: spacing.sm,
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Profit Margin</Text>
              <Text style={{
                color: Number(form.selling_price) >= Number(form.cost_price) ? '#10B981' : '#EF4444',
                fontSize: fontSize.xs, fontWeight: fontWeight.bold,
              }}>
                {(((Number(form.selling_price) - Number(form.cost_price)) / Number(form.cost_price)) * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </Card>

        {/* ── Weight & Dimensions ── */}
        <Card style={{ marginBottom: spacing.base }}>
          <SectionHeader icon="📐" title="Weight & Dimensions" />

          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Input
                label="Weight"
                value={form.weight}
                onChangeText={(v) => setField('weight', v)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: 6 }}>
                Unit
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {['kg', 'g', 'lb'].map((wu) => (
                  <TouchableOpacity
                    key={wu}
                    onPress={() => setField('weight_unit', wu)}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: borderRadius.sm,
                      backgroundColor: form.weight_unit === wu ? colors.primary : colors.surfaceSecondary,
                      borderWidth: 1, borderColor: form.weight_unit === wu ? colors.primary : colors.border,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: form.weight_unit === wu ? colors.textInverse : colors.textSecondary,
                      fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
                    }}>{wu}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginTop: spacing.sm, marginBottom: 6 }}>
            Dimensions (cm)
          </Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Input label="Length" value={form.length} onChangeText={(v) => setField('length', v)} placeholder="L" keyboardType="decimal-pad" />
            </View>
            <View style={styles.half}>
              <Input label="Width" value={form.width} onChangeText={(v) => setField('width', v)} placeholder="W" keyboardType="decimal-pad" />
            </View>
            <View style={styles.half}>
              <Input label="Height" value={form.height} onChangeText={(v) => setField('height', v)} placeholder="H" keyboardType="decimal-pad" />
            </View>
          </View>
        </Card>

        {/* ── Preferred Vendor ── */}
        <Card style={{ marginBottom: spacing.base }}>
          <SectionHeader icon="🏢" title="Preferred Vendor" />

          <TouchableOpacity
            onPress={() => { setShowVendorPicker(true); setVendorSearch(''); }}
            style={{
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              borderWidth: 1, borderColor: colors.border, padding: 12,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Text style={{ color: selectedVendor ? colors.textPrimary : colors.placeholder, fontSize: fontSize.base }}>
              {selectedVendor ? `${selectedVendor.name} (${selectedVendor.code})` : 'Select preferred vendor...'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>▼</Text>
          </TouchableOpacity>

          {selectedVendor && (
            <TouchableOpacity onPress={() => setField('preferred_vendor', null)} style={{ marginTop: spacing.xs }}>
              <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>Clear vendor</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Status ── */}
        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: spacing.sm }}>
                {form.is_active ? '🟢' : '🔴'}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium }}>
                {form.is_active ? 'Active Product' : 'Inactive Product'}
              </Text>
            </View>
            <Switch
              value={form.is_active}
              onValueChange={(v) => setField('is_active', v)}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </Card>

        {/* ── Submit ── */}
        <Button
          title={saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          onPress={onSubmit}
          loading={saving}
          fullWidth
          size="lg"
        />
      </ScrollView>

      {/* ── Vendor Picker Modal ── */}
      <Modal visible={showVendorPicker} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={() => setShowVendorPicker(false)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: colors.surface, borderRadius: borderRadius.lg,
            maxHeight: '60%', overflow: 'hidden',
          }}>
            <View style={{ padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>
                Select Vendor
              </Text>
              <SearchBar value={vendorSearch} onChangeText={setVendorSearch} placeholder="Search vendors..." />
            </View>
            <FlatList
              data={filteredVendors}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>No vendors found</Text>
                </View>
              }
              renderItem={({ item }: { item: Supplier }) => (
                <TouchableOpacity
                  onPress={() => { setField('preferred_vendor', item.id); setShowVendorPicker(false); }}
                  style={{
                    padding: spacing.base, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                    backgroundColor: item.id === form.preferred_vendor ? colors.primaryLight : 'transparent',
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.code} • {item.city ?? ''}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}