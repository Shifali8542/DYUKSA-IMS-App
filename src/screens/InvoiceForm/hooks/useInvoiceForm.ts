import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { InvoiceApi, CustomerApi, ProductApi } from '../../../api/api';
import type { Customer, Product } from '../../../types';

export interface InvoiceLineItem {
  key:          string;
  product_id:   number | null;
  product_name: string;
  description:  string;
  quantity:     string;
  unit_price:   string;
  discount:     string;
  tax_rate:     string;
}

interface InvoiceFormFields {
  customer_id:  number | null;
  invoice_date: string;
  due_date:     string;
  notes:        string;
}

type FormErrors = Record<string, string>;

let keyCounter = 0;
function nextKey() { return `inv_item_${++keyCounter}`; }

function emptyItem(): InvoiceLineItem {
  return { key: nextKey(), product_id: null, product_name: '', description: '', quantity: '1', unit_price: '', discount: '0', tax_rate: '0' };
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dueDateStr(days = 30): string {
  const d = new Date(Date.now() + days * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useInvoiceForm() {
  const [form, setForm] = useState<InvoiceFormFields>({
    customer_id: null, invoice_date: todayStr(), due_date: dueDateStr(), notes: '',
  });
  const [items,     setItems]     = useState<InvoiceLineItem[]>([emptyItem()]);
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [savedId,   setSavedId]   = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes] = await Promise.all([
        CustomerApi.getCustomers({ search: '' }),
      ]);
      setCustomers(custRes.results ?? []);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function searchProducts(query: string) {
    try {
      const res = await ProductApi.getProducts({
        is_active: true, search: query || undefined, page_size: 30,
      });
      setProducts(res.results ?? []);
    } catch { /* silently fail */ }
  }

  function setField<K extends keyof InvoiceFormFields>(key: K, value: InvoiceFormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function updateItem(key: string, field: keyof InvoiceLineItem, value: any) {
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
        ? { ...it, product_id: product.id, product_name: product.name, description: product.name, unit_price: product.selling_price, tax_rate: product.tax_rate ?? '0' }
        : it
    ));
  }

  function addItem() { setItems((prev) => [...prev, emptyItem()]); }

  function removeItem(key: string) {
    setItems((prev) => prev.length <= 1 ? prev : prev.filter((it) => it.key !== key));
  }

  function getSubtotal(): number {
    return items.reduce((sum, it) => {
      const qty = parseFloat(it.quantity) || 0;
      const price = parseFloat(it.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.customer_id) e.customer_id = 'Select a customer';
    if (!form.invoice_date) e.invoice_date = 'Invoice date required';
    if (!form.due_date) e.due_date = 'Due date required';

    items.forEach((it) => {
      if (!it.product_id) e[`item_${it.key}`] = 'Select a product';
      else if (!it.quantity || parseFloat(it.quantity) <= 0) e[`item_${it.key}`] = 'Quantity must be > 0';
      else if (!it.unit_price || parseFloat(it.unit_price) < 0) e[`item_${it.key}`] = 'Price required';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const payload = {
        customer: form.customer_id!,
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        notes: form.notes,
        items: items.map((it) => ({
          product: it.product_id!,
          description: it.description || it.product_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount: it.discount || '0',
          tax_rate: it.tax_rate || '0',
        })),
      };

      const invoice = await InvoiceApi.createInvoice(payload);
      setSavedId(invoice.id);
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.response?.data?.error?.message ?? e?.message ?? 'Failed to create invoice';
      Alert.alert('Error', msg);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    form, setField, items, errors,
    customers, products, searchProducts,
    loading, saving, savedId,
    updateItem, selectProduct, addItem, removeItem,
    getSubtotal, handleSave,
  };
}