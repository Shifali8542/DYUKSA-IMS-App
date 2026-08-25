import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { OrderApi } from '../../../api/api';
import { ORDER_STATUS_LABEL } from '../../../constants';
import type { SalesOrder } from '../../../types';

// Backend has specific confirm/cancel endpoints
const NEXT_ACTIONS: Record<string, { label: string; action: 'confirm' | 'cancel'; variant: 'primary' | 'danger' }[]> = {
  draft:     [{ label: 'Confirm', action: 'confirm', variant: 'primary' }, { label: 'Cancel', action: 'cancel', variant: 'danger' }],
  confirmed: [{ label: 'Cancel', action: 'cancel', variant: 'danger' }],
  packed:    [],
  dispatched:[],
  delivered: [],
  cancelled: [],
};

export function useOrderDetail(orderId: number) {
  const [order,         setOrder]         = useState<SalesOrder | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrderApi.getSalesOrder(orderId);
      setOrder(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  function handleAction(action: 'confirm' | 'cancel') {
    if (!order) return;
    const label = action === 'confirm' ? 'Confirm' : 'Cancel';
    Alert.alert(`${label} this order?`, 'This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: `Yes, ${label}`,
        style: action === 'cancel' ? 'destructive' : 'default',
        onPress: async () => {
          setTransitioning(true);
          try {
            const updated = action === 'confirm'
              ? await OrderApi.confirmOrder(order.id)
              : await OrderApi.cancelOrder(order.id);
            setOrder(updated ?? { ...order, status: action === 'confirm' ? 'confirmed' : 'cancelled' });
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? e?.response?.data?.error?.message ?? 'Failed to update status.');
          } finally {
            setTransitioning(false);
          }
        },
      },
    ]);
  }

  const actions = order ? (NEXT_ACTIONS[order.status] ?? []) : [];

  return { order, loading, error, transitioning, actions, handleAction, refresh: fetchOrder };
}
