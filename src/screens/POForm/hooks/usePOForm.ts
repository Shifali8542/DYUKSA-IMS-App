import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { OrderApi, CustomerApi, WarehouseApi, ProductApi } from '../../../api/api';
import { todayStr } from '../../../utils/formUtils';
import { parseBackendError } from '../../../utils/parseError';
import type { Warehouse, Product, Supplier } from '../../../types';

export interface POLineItem {
  key: string;
  product_id: number | null;
  product_name: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
}

interface POFormFields {
  supplier_id: number | null;
  warehouse_id: number | null;
  order_date: string;
  expected_date: string;
  notes: string;
  items: POLineItem[];
}

const emptyItem = (): POLineItem => ({
  key: Date.now().toString(),
  product_id: null,
  product_name: '',
  quantity: '1',
  unit_price: '0',
  tax_rate: '0',
});


export function usePOForm() {
  const [form, setForm] = useState<POFormFields>({
    supplier_id: null, warehouse_id: null,
    order_date: todayStr(), expected_date: '',
    notes: '', items: [emptyItem()],
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sups, whs] = await Promise.all([
        OrderApi.getSuppliers(),
        WarehouseApi.getWarehouses({ is_active: true }),
      ]);
      setSuppliers(Array.isArray(sups) ? sups : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function searchProducts(query: string) {
    try {
      const res = await ProductApi.getProducts({
        is_active: true,
        search: query || undefined,
        page_size: 30,
      });
      setProducts(res.results ?? []);
    } catch {
    }
  }

  function setField<K extends keyof POFormFields>(key: K, value: POFormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function updateItem(index: number, field: keyof POLineItem, value: any) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  }

  function selectProduct(index: number, product: Product) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        product_id: product.id,
        product_name: `${product.name} (${product.sku})`,
        unit_price: product.cost_price,
        tax_rate: product.tax_rate ?? '0',
      };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));
  }

  function getSubtotal(): number {
    return form.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.supplier_id) e.supplier_id = 'Select a supplier';
    if (!form.warehouse_id) e.warehouse_id = 'Select a warehouse';
    if (!form.order_date) e.order_date = 'Order date is required';

    const validItems = form.items.filter((i) => i.product_id);
    if (validItems.length === 0) e.items = 'Add at least one product';

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (item.product_id && (!item.quantity || parseFloat(item.quantity) <= 0)) {
        e[`item_${i}_qty`] = `Item ${i + 1}: quantity must be > 0`;
      }
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      Alert.alert('Missing Fields', Object.values(e).join('\n'));
      return false;
    }
    return true;
  }

  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const payload = {
        supplier_id: form.supplier_id!,
        warehouse_id: form.warehouse_id!,
        order_date: form.order_date,
        expected_date: form.expected_date || undefined,
        notes: form.notes.trim(),
        items: form.items
          .filter((i) => i.product_id)
          .map((i) => ({
            product_id: i.product_id!,
            quantity: parseFloat(i.quantity) || 1,
            unit_price: parseFloat(i.unit_price) || 0,
            tax_rate: parseFloat(i.tax_rate) || 0,
          })),
      };

      await OrderApi.createPurchaseOrder(payload);
      setSaved(true);
      return true;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    form, setField, errors,
    suppliers, warehouses, products,
    loading, saving, saved,
    updateItem, selectProduct, addItem, removeItem,
    getSubtotal, handleSave, searchProducts,
  };
}