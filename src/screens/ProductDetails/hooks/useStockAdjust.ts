import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { InventoryApi, WarehouseApi } from '../../../api/api';
import type { Warehouse, StockAdjustmentPayload, StockAdjustmentResponse } from '../../../types';

interface AdjustForm {
  warehouse_id: number | null;
  adjustment_type: 'in' | 'out';
  quantity: string;
  reason: string;
}

type FormErrors = Partial<Record<keyof AdjustForm, string>>;

export function useStockAdjust(productId: number) {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<AdjustForm>({
    warehouse_id: null, adjustment_type: 'in', quantity: '', reason: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastResult, setLastResult] = useState<StockAdjustmentResponse | null>(null);

  useEffect(() => {
    WarehouseApi.getWarehouses({ is_active: true })
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, []);

  function open(warehouseId?: number) {
    setForm({ warehouse_id: warehouseId ?? null, adjustment_type: 'in', quantity: '', reason: '' });
    setErrors({});
    setLastResult(null);
    setVisible(true);
  }

  function close() {
    setVisible(false);
  }

  function setField<K extends keyof AdjustForm>(key: K, value: AdjustForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.warehouse_id) e.warehouse_id = 'Select a warehouse';
    if (!form.quantity.trim()) e.quantity = 'Quantity is required';
    else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) e.quantity = 'Must be greater than 0';
    if (!form.reason.trim()) e.reason = 'Reason is required for audit';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const payload: StockAdjustmentPayload = {
        product_id: productId,
        warehouse_id: form.warehouse_id!,
        adjustment_type: form.adjustment_type,
        quantity: form.quantity,
        reason: form.reason.trim(),
      };

      const result = await InventoryApi.adjustStock(payload);
      setLastResult(result);

      const fmtQty = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? v : n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
      };
      Alert.alert(
        'Stock Adjusted',
        `${form.adjustment_type === 'in' ? 'Added' : 'Removed'}: ${fmtQty(form.quantity)} units\nOn hand now: ${fmtQty(result.on_hand_after)}\nAvailable: ${fmtQty(result.available_after)}`,
        [{ text: 'OK', onPress: close }],
      );
      return true;
    } catch (e: any) {
      const errorData = e?.response?.data;
      const detail = errorData?.error?.detail;

      // Show field-level errors from backend validation
      if (detail && typeof detail === 'object') {
        const fieldErrors = Object.entries(detail)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n');
        Alert.alert('Validation Error', fieldErrors);
        return false;
      }

      const msg = errorData?.error?.message
        ?? errorData?.message
        ?? errorData?.detail
        ?? e?.message
        ?? 'Adjustment failed';
      Alert.alert('Error', msg);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    visible, open, close,
    form, setField, errors,
    warehouses, saving, lastResult,
    handleSubmit,
  };
}