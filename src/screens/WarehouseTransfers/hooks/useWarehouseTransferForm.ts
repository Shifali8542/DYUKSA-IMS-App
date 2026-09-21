import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { WarehouseTransferApi, WarehouseApi, ProductApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import { nextLineKey } from '../../../utils/formUtils';
import type { Warehouse, Product } from '../../../types';

export interface TransferLineItem {
  key:          string;
  product_id:   number | null;
  product_name: string;
  product_sku:  string;
  quantity:     string;
}

const emptyItem = (): TransferLineItem => ({
  key:          nextLineKey('trf'),
  product_id:   null,
  product_name: '',
  product_sku:  '',
  quantity:     '1',
});

export function useWarehouseTransferForm() {
  const [sourceWarehouseId, setSourceWarehouseId]           = useState<number | null>(null);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null);
  const [notes,    setNotes]    = useState('');
  const [items,    setItems]    = useState<TransferLineItem[]>([emptyItem()]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [savedId,  setSavedId]  = useState<number | null>(null);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const whs = await WarehouseApi.getWarehouses({ is_active: true });
      setWarehouses(Array.isArray(whs) ? whs : []);
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  async function searchProducts(query: string) {
    try {
      const res = await ProductApi.getProducts({
        is_active: true,
        search: query || undefined,
        page_size: 30,
      });
      setProducts(res.results ?? []);
    } catch {
      // silently fail — user can retry search
    }
  }

  function selectProduct(index: number, product: Product) {
    setItems((prev) => prev.map((item, i) =>
      i === index
        ? { ...item, product_id: product.id, product_name: product.name, product_sku: product.sku }
        : item
    ));
  }

  function updateItem(index: number, field: keyof TransferLineItem, value: any) {
    setItems((prev) => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!sourceWarehouseId)      e.source      = 'Select a source warehouse';
    if (!destinationWarehouseId) e.destination = 'Select a destination warehouse';
    if (sourceWarehouseId && destinationWarehouseId && sourceWarehouseId === destinationWarehouseId)
      e.destination = 'Source and destination must be different';
    if (items.every((i) => !i.product_id))
      e.items = 'Add at least one product';
    items.forEach((item, idx) => {
      if (item.product_id && (!item.quantity || parseFloat(item.quantity) <= 0))
        e[`qty_${idx}`] = `Item ${idx + 1}: quantity must be greater than 0`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;
    setSaving(true);
    try {
      const validItems = items
        .filter((i) => i.product_id)
        .map((i) => ({ product: i.product_id as number, quantity: i.quantity }));
      const result = await WarehouseTransferApi.create({
        source_warehouse:      sourceWarehouseId!,
        destination_warehouse: destinationWarehouseId!,
        notes,
        items: validItems,
      });
      setSavedId(result.id);
      return true;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    sourceWarehouseId, setSourceWarehouseId,
    destinationWarehouseId, setDestinationWarehouseId,
    notes, setNotes,
    items, warehouses, products,
    loading, saving, savedId, errors,
    loadWarehouses, searchProducts,
    selectProduct, updateItem, addItem, removeItem,
    handleSave,
  };
}