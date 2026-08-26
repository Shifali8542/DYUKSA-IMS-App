import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ProductApi, CategoryApi, BrandApi, UnitApi } from '../../../api/api';
import type { Product, ProductCreatePayload, Category, Brand, Unit } from '../../../types';

interface FormFields {
  name: string;
  sku: string;
  description: string;
  category: number | null;
  brand: number | null;
  unit: number | null;
  cost_price: string;
  selling_price: string;
  reorder_level: string;
  tax_rate: string;
  barcode: string;
  is_active: boolean;
}

const EMPTY_FORM: FormFields = {
  name: '', sku: '', description: '', category: null, brand: null, unit: null,
  cost_price: '', selling_price: '', reorder_level: '', tax_rate: '', barcode: '',
  is_active: true,
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

export function useProductForm(productId?: number, prefillBarcode?: string) {
  const isEdit = !!productId;

  const [form, setForm] = useState<FormFields>({ ...EMPTY_FORM, barcode: prefillBarcode ?? '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, brs, uns] = await Promise.all([
        CategoryApi.getCategories(),
        BrandApi.getBrands(),
        UnitApi.getUnits(),
      ]);
      setCategories(Array.isArray(cats) ? cats.filter((c) => c.is_active) : []);
      setBrands(Array.isArray(brs) ? brs.filter((b) => b.is_active) : []);
      setUnits(Array.isArray(uns) ? uns.filter((u) => u.is_active) : []);

      if (productId) {
        const product = await ProductApi.getProduct(productId);
        setForm({
          name: product.name,
          sku: product.sku,
          description: product.description ?? '',
          category: product.category,
          brand: product.brand ?? null,
          unit: product.unit,
          cost_price: product.cost_price,
          selling_price: product.selling_price,
          reorder_level: product.reorder_level,
          tax_rate: product.tax_rate ?? '0.00',
          barcode: product.barcode ?? '',
          is_active: product.is_active,
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

  // ── Inline create callbacks 
  async function createCategory(name: string): Promise<{ id: number; name: string } | null> {
    try {
      const created = await CategoryApi.createCategory({ name });
      setCategories((prev) => [...prev, created]);
      return created;
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.name?.[0] ?? e?.message ?? 'Failed to create category');
      return null;
    }
  }

  async function createBrand(name: string): Promise<{ id: number; name: string } | null> {
    try {
      const created = await BrandApi.createBrand({ name });
      setBrands((prev) => [...prev, created]);
      return created;
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.name?.[0] ?? e?.message ?? 'Failed to create brand');
      return null;
    }
  }

  async function createUnit(input: string): Promise<{ id: number; name: string } | null> {
    try {
      // Input format from InlineCreateField with extraField: "name|symbol"
      const parts = input.split('|');
      const name = parts[0].trim();
      const symbol = (parts[1] ?? '').trim() || name;
      const created = await UnitApi.createUnit({ name, symbol });
      setUnits((prev) => [...prev, created]);
      return { id: created.id, name: `${created.name} (${created.symbol})` };
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.name?.[0] ?? e?.message ?? 'Failed to create unit');
      return null;
    }
  }

  // ── Inline delete callbacks 
  function deleteCategory(id: number, name: string) {
    Alert.alert('Delete Category', `Delete "${name}"? This only works if no products use it.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await CategoryApi.deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            if (form.category === id) setField('category', null);
          } catch (e: any) {
            Alert.alert('Cannot Delete', e?.response?.data?.error?.message ?? e?.response?.data?.detail ?? 'This category is in use by products.');
          }
        }
      },
    ]);
  }

  function deleteBrand(id: number, name: string) {
    Alert.alert('Delete Brand', `Delete "${name}"? This only works if no products use it.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await BrandApi.deleteBrand(id);
            setBrands((prev) => prev.filter((b) => b.id !== id));
            if (form.brand === id) setField('brand', null);
          } catch (e: any) {
            Alert.alert('Cannot Delete', e?.response?.data?.error?.message ?? e?.response?.data?.detail ?? 'This brand is in use by products.');
          }
        }
      },
    ]);
  }

  function deleteUnit(id: number, name: string) {
    Alert.alert('Delete Unit', `Delete "${name}"? This only works if no products use it.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await UnitApi.deleteUnit(id);
            setUnits((prev) => prev.filter((u) => u.id !== id));
            if (form.unit === id) setField('unit', null);
          } catch (e: any) {
            Alert.alert('Cannot Delete', e?.response?.data?.error?.message ?? e?.response?.data?.detail ?? 'This unit is in use by products.');
          }
        }
      },
    ]);
  }
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.unit) e.unit = 'Unit is required';
    if (!form.cost_price.trim()) e.cost_price = 'Cost price is required';
    else if (isNaN(Number(form.cost_price)) || Number(form.cost_price) < 0)
      e.cost_price = 'Enter a valid price';
    if (!form.selling_price.trim()) e.selling_price = 'Selling price is required';
    else if (isNaN(Number(form.selling_price)) || Number(form.selling_price) < 0)
      e.selling_price = 'Enter a valid price';
    if (form.reorder_level && (isNaN(Number(form.reorder_level)) || Number(form.reorder_level) < 0))
      e.reorder_level = 'Enter a valid number';

    setErrors(e);
    const errorCount = Object.keys(e).length;
    if (errorCount > 0) {
      Alert.alert('Missing Fields', Object.values(e).filter(Boolean).join('\n'));
    }
    return errorCount === 0;
  }

  // ── Submit 
  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const payload: ProductCreatePayload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category!,
        unit: form.unit!,
        cost_price: form.cost_price,
        selling_price: form.selling_price,
        reorder_level: form.reorder_level || '0',
        brand: form.brand || undefined,
        tax_rate: form.tax_rate || '0.00',
        description: form.description.trim(),
        barcode: form.barcode.trim() || undefined,
        is_active: form.is_active,
      };

      if (isEdit && productId) {
        await ProductApi.updateProduct(productId, payload);
      } else {
        await ProductApi.createProduct(payload);
      }

      setSaved(true);
      return true;
    } catch (e: any) {
      const errorData = e?.response?.data;
      const errorObj = errorData?.error;

      // Parse field-level validation errors from DRF
      // Backend wraps in: {success: false, error: {code, message, detail: {field: [errors]}}}
      const detail = errorObj?.detail;
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
          const fieldList = Object.values(fe).filter(Boolean).join('\n');
          Alert.alert('Validation Error', fieldList);
          return false;
        }
      }

      // Show the error message from the envelope
      const msg = errorObj?.message
        ?? errorData?.message
        ?? errorData?.detail
        ?? e?.message
        ?? 'Failed to save product';
      Alert.alert('Error', msg);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    form, setField, errors,
    categories, brands, units,
    loading, saving, saved,
    isEdit, handleSave,
    createCategory, createBrand, createUnit,
    deleteCategory, deleteBrand, deleteUnit,
  };
}