import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WarehouseTransferApi, ProductApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { WarehouseTransfer } from '../../../types';

export function useWarehouseTransferDetail(transferId: number) {
  const [transfer, setTransfer] = useState<WarehouseTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<Record<number, string>>({});
  const [adjustProductId, setAdjustProductId] = useState<number | null>(null);
  const [adjustWarehouseId, setAdjustWarehouseId] = useState<number | null>(null);

  const fetchTransfer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await WarehouseTransferApi.get(transferId);
      setTransfer(t);
      await fetchStockLevels(t);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, [transferId]);

  useFocusEffect(useCallback(() => { fetchTransfer(); }, [fetchTransfer]));

  // Fetch available stock for each item in source warehouse
  async function fetchStockLevels(t: typeof transfer) {
    if (!t) return;
    const map: Record<number, string> = {};
    await Promise.all(
      t.items.map(async (item) => {
        try {
          const stock = await ProductApi.getProductStock(item.product);
          const wh = stock.warehouses.find((w) => w.warehouse_id === t.source_warehouse);
          map[item.product] = wh?.available ?? '0';
        } catch {
          map[item.product] = '0';
        }
      })
    );
    setStockMap(map);
  }

  async function handleComplete() {
    Alert.alert(
      'Complete Transfer',
      'This will move stock from source to destination warehouse. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', style: 'default', onPress: () => completeTransfer() },
      ]
    );
  }

  async function completeTransfer() {
    setActioning(true);
    try {
      const updated = await WarehouseTransferApi.complete(transferId);
      setTransfer(updated);
      setTimeout(() => Alert.alert('Success', 'Transfer completed. Stock has been moved.'), 300);
    } catch (e: any) {
      setTimeout(() => Alert.alert('Transfer Failed', parseBackendError(e)), 300);
    } finally {
      setActioning(false);
    }
  }

  async function handleCancel() {
    Alert.alert(
      'Cancel Transfer',
      'Are you sure you want to cancel this transfer?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelTransfer() },
      ]
    );
  }

  async function cancelTransfer() {
    setActioning(true);
    try {
      const updated = await WarehouseTransferApi.cancel(transferId);
      setTransfer(updated);
    } catch (e: any) {
      setTimeout(() => Alert.alert('Error', parseBackendError(e)), 300);
    } finally {
      setActioning(false);
    }
  }

  return {
    transfer, loading, actioning, error,
    stockMap,
    adjustProductId, adjustWarehouseId,
    openAdjust: (productId: number, warehouseId: number) => {
      setAdjustProductId(productId);
      setAdjustWarehouseId(warehouseId);
    },
    closeAdjust: () => {
      setAdjustProductId(null);
      setAdjustWarehouseId(null);
      fetchTransfer();
    },
    handleComplete, handleCancel,
    refresh: fetchTransfer,
  };
}