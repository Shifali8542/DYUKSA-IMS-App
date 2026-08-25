import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { OrderApi, CustomerApi, WarehouseApi, ProductApi } from '../../../api/api';
import type {
  Customer, Warehouse, Product,
  CreateOrderPayload, CreateOrderItemPayload,
} from '../../../types';

export interface OrderLineItem {
  key:        string;
  product_id: number | null;
  product_name: string;
  quantity:   string;
  unit_price: string;
  discount:   string;
  tax_rate:   string;
}

interface OrderFormFields {
  customer_id:       number | null;
  warehouse_id:      number | null;
  order_date:        string;
  expected_delivery: string;
  delivery_address:  string;
  notes:             string;
}

type FormErrors = Record<string, string>;

let keyCounter = 0;
function nextKey() { return `item_${++keyCounter}`; }

function emptyItem(): OrderLineItem {
  return { key: nextKey(), product_id: null, product_name: '', quantity: '1', unit_price: '', discount: '0', tax_rate: '0' };
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useOrderForm() {
  const [form, setForm] = useState<OrderFormFields>({
    customer_id: null, warehouse_id: null,
    order_date: todayStr(), expected_delivery: '', delivery_address: '', notes: '',
  });
  const [items,     setItems]     = useState<OrderLineItem[]>([emptyItem()]);
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // Load picker data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, whRes, prodRes] = await Promise.all([
        CustomerApi.getCustomers({ search: '' }),
        WarehouseApi.getWarehouses({ is_active: true }),
        ProductApi.getProducts({ is_active: true, page_size: 200 }),
      ]);
      setCustomers(custRes.results ?? []);
      setWarehouses(Array.isArray(whRes) ? whRes : []);
      setProducts(prodRes.results ?? []);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Form field setter
  function setField<K extends keyof OrderFormFields>(key: K, value: OrderFormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  // Line item management
  function updateItem(key: string, field: keyof OrderLineItem, value: any) {
    setItems((prev) => prev.map((it) => it.key === key ? { ...it, [field]: value } : it));
    if (errors[`item_${key}`]) {
      setErrors((prev) => { const n = { ...prev }; delete n[`item_${key}`]; return n; });
    }
  }

  function selectProduct(key: string, productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) => prev.map((it) =>
      it.key === key
        ? { ...it, product_id: product.id, product_name: product.name, unit_price: product.selling_price, tax_rate: product.tax_rate ?? '0' }
        : it
    ));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.length <= 1 ? prev : prev.filter((it) => it.key !== key));
  }

  // Compute totals
  function getSubtotal(): number {
    return items.reduce((sum, it) => {
      const qty = parseFloat(it.quantity) || 0;
      const price = parseFloat(it.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
  }

  // Validate
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.customer_id) e.customer_id = 'Select a customer';
    if (!form.warehouse_id) e.warehouse_id = 'Select a warehouse';
    if (!form.order_date) e.order_date = 'Order date is required';

    if (items.length === 0) {
      e.items = 'Add at least one item';
    } else {
      items.forEach((it) => {
        if (!it.product_id) e[`item_${it.key}`] = 'Select a product';
        else if (!it.quantity || parseFloat(it.quantity) <= 0) e[`item_${it.key}`] = 'Quantity must be > 0';
        else if (!it.unit_price || parseFloat(it.unit_price) < 0) e[`item_${it.key}`] = 'Price is required';
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Submit
  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const orderItems: CreateOrderItemPayload[] = items.map((it) => ({
        product_id: it.product_id!,
        quantity:   it.quantity,
        unit_price: it.unit_price,
        discount:   it.discount || '0',
        tax_rate:   it.tax_rate || '0',
      }));

      const payload: CreateOrderPayload = {
        customer_id:      form.customer_id!,
        warehouse_id:     form.warehouse_id!,
        order_date:       form.order_date,
        expected_delivery: form.expected_delivery || undefined,
        delivery_address:  form.delivery_address,
        notes:            form.notes,
        items:            orderItems,
      };

      await OrderApi.createOrder(payload);
      setSaved(true);
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message
        ?? e?.response?.data?.error?.message
        ?? e?.response?.data?.detail
        ?? e?.message
        ?? 'Failed to create order';
      Alert.alert('Error', msg);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    form, setField, items, errors,
    customers, warehouses, products,
    loading, saving, saved,
    updateItem, selectProduct, addItem, removeItem,
    getSubtotal, handleSave,
  };
}