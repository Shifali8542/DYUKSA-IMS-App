import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { OrderApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';

interface PODetailItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: string;
  received_quantity: string;
  pending_quantity: string;
  unit_price: string;
  tax_rate: string;
  line_subtotal: string;
  line_total: string;
}

interface PODetail {
  id: number;
  number: string;
  supplier_name: string;
  warehouse_name: string;
  status: string;
  status_display: string;
  order_date: string;
  expected_date?: string;
  notes: string;
  subtotal: string;
  tax_total: string;
  total: string;
  items: PODetailItem[];
  approved_by_name?: string;
  approved_at?: string;
  cancelled_reason?: string;
  created_at: string;
  created_by_name?: string;
}

export function usePODetail(poId: number) {
  const [po, setPo]                   = useState<PODetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [receiving, setReceiving]     = useState(false);

  const fetchPO = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrderApi.getPurchaseOrder(poId);
      setPo(data as any);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useFocusEffect(useCallback(() => { fetchPO(); }, [fetchPO]));

  async function transition(newStatus: string, reason?: string): Promise<boolean> {
    setTransitioning(true);
    try {
      const data = await OrderApi.transitionPO(poId, newStatus, reason);
      setPo(data as any);
      return true;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setTransitioning(false);
    }
  }

  async function receiveItems(items: { item_id: number; received_quantity: number }[]): Promise<boolean> {
    setReceiving(true);
    try {
      const data = await OrderApi.receivePO(poId, items);
      setPo(data as any);
      Alert.alert('Success', 'Stock received successfully.');
      return true;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setReceiving(false);
    }
  }

  // Available actions based on status
  const actions: { label: string; status: string; variant: string }[] = [];
  if (po) {
    if (po.status === 'draft') {
      actions.push({ label: 'Approve', status: 'approved', variant: 'success' });
      actions.push({ label: 'Cancel', status: 'cancelled', variant: 'danger' });
    }
    if (po.status === 'approved') {
      actions.push({ label: 'Mark Sent', status: 'sent', variant: 'primary' });
      actions.push({ label: 'Cancel', status: 'cancelled', variant: 'danger' });
    }
    if (['approved', 'sent', 'partially_received'].includes(po.status)) {
      actions.push({ label: 'Receive Stock', status: 'receive', variant: 'success' });
    }
  }

  return { po, loading, error, transitioning, receiving, actions, transition, receiveItems, refresh: fetchPO };
}