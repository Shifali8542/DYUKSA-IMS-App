import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProductApi, CategoryApi, BrandApi, UnitApi, OrderApi, imsClient } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { Category, Brand, Unit, Supplier } from '../../../types';

interface FormFields {
  name:          string;
  sku:           string;
  description:   string;
  category:      number | null;
  brand:         number | null;
  unit:          number | null;
  cost_price:    string;
  selling_price: string;
  reorder_level: string;
  tax_rate:      string;
  hsn_code:      string;
  barcode:       string;
  weight:        string;
  weight_unit:   string;
  length:        string;
  width:         string;
  height:        string;
  preferred_vendor: number | null;
  is_active:     boolean;
  image_uri:     string | null;
}

const EMPTY_FORM: FormFields = {
  name: '', sku: '', description: '', category: null, brand: null, unit: null,
  cost_price: '', selling_price: '', reorder_level: '', tax_rate: '', hsn_code: '',
  barcode: '', weight: '', weight_unit: 'kg', length: '', width: '', height: '',
  preferred_vendor: null, is_active: true, image_uri: null,
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

export function useProductForm(productId?: number, prefillBarcode?: string) {
  const isEdit = !!productId;

  const [form,       setForm]       = useState<FormFields>({ ...EMPTY_FORM, barcode: prefillBarcode ?? '' });
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands,     setBrands]     = useState<Brand[]>([]);
  const [units,      setUnits]      = useState<Unit[]>([]);
  const [suppliers,  setSuppliers]  = useState<Supplier[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, brs, uns, sups] = await Promise.all([
        CategoryApi.getCategories(),
        BrandApi.getBrands(),
        UnitApi.getUnits(),
        OrderApi.getSuppliers().catch(() => []),
      ]);
      setCategories(Array.isArray(cats) ? cats.filter((c) => c.is_active) : []);
      setBrands(Array.isArray(brs) ? brs.filter((b) => b.is_active) : []);
      setUnits(Array.isArray(uns) ? uns.filter((u) => u.is_active) : []);
      setSuppliers(Array.isArray(sups) ? sups : []);

      if (productId) {
        const product = await ProductApi.getProduct(productId);
        setForm({
          name:          product.name,
          sku:           product.sku,
          description:   product.description ?? '',
          category:      product.category,
          brand:         product.brand ?? null,
          unit:          product.unit,
          cost_price:    product.cost_price,
          selling_price: product.selling_price,
          reorder_level: product.reorder_level,
          tax_rate:      product.tax_rate ?? '0.00',
          hsn_code:      product.hsn_code ?? '',
          barcode:       product.barcode ?? '',
          weight:        product.weight ?? '',
          weight_unit:   product.weight_unit ?? 'kg',
          length:        product.length ?? '',
          width:         product.width ?? '',
          height:        product.height ?? '',
          preferred_vendor: product.preferred_vendor ?? null,
          is_active:     product.is_active,
          image_uri:     product.image ?? null,
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { loadData(); }, [loadData]);

  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ── Image picker ─────────────────────────────────────────────────────────
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setField('image_uri', result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setField('image_uri', result.assets[0].uri);
    }
  }

  // ── Inline create callbacks ──────────────────────────────────────────────
  async function createCategory(name: string): Promise<{ id: number; name: string } | null> {
    try {
      const created = await CategoryApi.createCategory({ name });
      setCategories((prev) => [...prev, created]);
      return created;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return null;
    }
  }

  async function createBrand(name: string): Promise<{ id: number; name: string } | null> {
    try {
      const created = await BrandApi.createBrand({ name });
      setBrands((prev) => [...prev, created]);
      return created;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return null;
    }
  }

  async function createUnit(input: string): Promise<{ id: number; name: string } | null> {
    try {
      const parts = input.split('|');
      const name = parts[0].trim();
      const symbol = (parts[1] ?? '').trim() || name;
      const created = await UnitApi.createUnit({ name, symbol });
      setUnits((prev) => [...prev, created]);
      return { id: created.id, name: `${created.name} (${created.symbol})` };
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return null;
    }
  }

  // ── Inline delete callbacks ──────────────────────────────────────────────
  function deleteCategory(id: number, name: string) {
    Alert.alert('Delete Category', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await CategoryApi.deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          if (form.category === id) setField('category', null);
        } catch (e: any) { Alert.alert('Cannot Delete', parseBackendError(e)); }
      }},
    ]);
  }

  function deleteBrand(id: number, name: string) {
    Alert.alert('Delete Brand', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await BrandApi.deleteBrand(id);
          setBrands((prev) => prev.filter((b) => b.id !== id));
          if (form.brand === id) setField('brand', null);
        } catch (e: any) { Alert.alert('Cannot Delete', parseBackendError(e)); }
      }},
    ]);
  }

  function deleteUnit(id: number, name: string) {
    Alert.alert('Delete Unit', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await UnitApi.deleteUnit(id);
          setUnits((prev) => prev.filter((u) => u.id !== id));
          if (form.unit === id) setField('unit', null);
        } catch (e: any) { Alert.alert('Cannot Delete', parseBackendError(e)); }
      }},
    ]);
  }

  // ── Validation ───────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim())        e.name = 'Product name is required';
    if (!form.sku.trim())         e.sku = 'SKU is required';
    if (!form.category)           e.category = 'Category is required';
    if (!form.unit)               e.unit = 'Unit is required';
    if (!form.cost_price.trim())  e.cost_price = 'Cost price is required';
    else if (isNaN(Number(form.cost_price)) || Number(form.cost_price) < 0)
      e.cost_price = 'Enter a valid price';
    if (!form.selling_price.trim()) e.selling_price = 'Selling price is required';
    else if (isNaN(Number(form.selling_price)) || Number(form.selling_price) < 0)
      e.selling_price = 'Enter a valid price';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      Alert.alert('Missing Fields', Object.values(e).filter(Boolean).join('\n'));
    }
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const payload: any = {
        name:          form.name.trim(),
        sku:           form.sku.trim(),
        category:      form.category!,
        unit:          form.unit!,
        cost_price:    form.cost_price,
        selling_price: form.selling_price,
        reorder_level: form.reorder_level || '0',
        brand:         form.brand || undefined,
        tax_rate:      form.tax_rate || '0.00',
        hsn_code:      form.hsn_code.trim(),
        description:   form.description.trim(),
        barcode:       form.barcode.trim() || undefined,
        weight:        form.weight || undefined,
        weight_unit:   form.weight_unit || 'kg',
        length:        form.length || undefined,
        width:         form.width || undefined,
        height:        form.height || undefined,
        preferred_vendor: form.preferred_vendor || undefined,
        is_active:     form.is_active,
      };

      let savedProduct;
      if (isEdit && productId) {
        savedProduct = await ProductApi.updateProduct(productId, payload);
      } else {
        savedProduct = await ProductApi.createProduct(payload);
      }

      // Upload image if changed (new local URI)
      if (form.image_uri && form.image_uri.startsWith('file://')) {
        try {
          const imageForm = new FormData();
          imageForm.append('image', {
            uri: form.image_uri,
            name: 'product.jpg',
            type: 'image/jpeg',
          } as any);
          await imsClient.patch(`/api/v1/products/${savedProduct.id}/`, imageForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch { /* Image upload failed silently — product still saved */ }
      }

      setSaved(true);
      return true;
    } catch (e: any) {
      const errorData = e?.response?.data;
      const detail = errorData?.error?.detail;
      if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        const fe: FormErrors = {};
        for (const key of Object.keys(detail)) {
          if (key in EMPTY_FORM) {
            const val = detail[key];
            fe[key as keyof FormFields] = Array.isArray(val) ? val[0] : String(val);
          }
        }
        if (Object.keys(fe).length > 0) {
          setErrors(fe);
          Alert.alert('Validation Error', Object.values(fe).filter(Boolean).join('\n'));
          return false;
        }
      }
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    form, setField, errors,
    categories, brands, units, suppliers,
    loading, saving, saved, isEdit,
    handleSave, pickImage, takePhoto,
    createCategory, createBrand, createUnit,
    deleteCategory, deleteBrand, deleteUnit,
  };
}