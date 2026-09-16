import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { OrderApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { SalesOrder, PurchaseOrder } from '../../../types';

export type OrderTab = 'sales' | 'purchase';

export function useOrders() {
  const [tab, setTab] = useState<OrderTab>('sales');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [poOrders, setPoOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      if (tab === 'sales') {
        const res = await OrderApi.getSalesOrders({
          status: status === 'all' ? undefined : status,
          search: search || undefined,
        });
        setSalesOrders(res.results ?? []);
      } else {
        const res = await OrderApi.getPurchaseOrders({
          status: status === 'all' ? undefined : status,
        });
        setPoOrders(res.results ?? []);
      }
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, search, status]);

  useFocusEffect(
    useCallback(() => { fetchOrders(); }, [fetchOrders])
  );

  function changeTab(t: OrderTab) {
    setTab(t);
    setStatus('all');
    setSearch('');
  }

  return {
    tab, changeTab,
    search, setSearch,
    status, setStatus,
    salesOrders, poOrders,
    loading, refreshing, error,
    refresh: () => fetchOrders(true),
    data: tab === 'sales' ? salesOrders : poOrders,
  };
}
