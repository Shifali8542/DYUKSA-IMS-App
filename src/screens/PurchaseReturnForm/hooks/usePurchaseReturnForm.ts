import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { PurchaseReturnApi, OrderApi } from '../../../api/api';

export interface ReturnLineItem {
  key: string;
  product_id: number;
  product_name: string;
  product_sku: string;
  max_qty: number;
  quantity: string;
  unit_price: string;
  selected: boolean;
}

let keyCounter = 0;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function usePurchaseReturnForm(poId: number, supplierId: number, warehouseId: number) {
  const [items, setItems]     = useState<ReturnLineItem[]>([]);
  const [reason, setReason]   = useState('');
  const [notes, setNotes]     = useState('');
  const [returnDate, setReturnDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const loadPO = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (await import('../../../api/api')).imsClient.get(`/api/v1/purchase-orders/${poId}/`);
      const po = data.data ?? data;
      const lineItems: ReturnLineItem[] = (po.items ?? []).map((item: any) => ({
        key: `pri_${++keyCounter}`,
        product_id: item.product ?? item.product_id,
        product_name: item.product_name ?? '',
        product_sku: item.product_sku ?? '',
        max_qty: parseFloat(item.received_quantity ?? item.quantity ?? 0),
        quantity: String(item.received_quantity ?? item.quantity ?? 0),
        unit_price: String(item.unit_price ?? 0),
        selected: true,
      }));
      setItems(lineItems);
    } catch {
      Alert.alert('Error', 'Failed to load purchase order.');
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useEffect(() => { loadPO(); }, [loadPO]);

  function toggleItem(key: string) {
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, selected: !i.selected } : i));
  }

  function updateItem(key: string, field: keyof ReturnLineItem, value: any) {
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, [field]: value } : i));
  }

  async function handleSave(): Promise<boolean> {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
      Alert.alert('Error', 'Select at least one item to return.');
      return false;
    }
    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason for the return.');
      return false;
    }
    for (const item of selected) {
      const qty = parseFloat(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        Alert.alert('Error', `${item.product_name}: quantity must be > 0.`);
        return false;
      }
      if (qty > item.max_qty) {
        Alert.alert('Error', `${item.product_name}: max returnable is ${item.max_qty}.`);
        return false;
      }
    }

    setSaving(true);
    try {
      const pr = await PurchaseReturnApi.create({
        purchase_order_id: poId,
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        return_date: returnDate,
        reason,
        notes,
        items: selected.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });
      setSavedId(pr.id);
      return true;
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Failed to create return.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { items, reason, setReason, notes, setNotes, returnDate, setReturnDate, loading, saving, savedId, toggleItem, updateItem, handleSave };
}