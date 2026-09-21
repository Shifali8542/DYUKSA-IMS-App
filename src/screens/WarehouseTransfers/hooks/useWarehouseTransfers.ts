import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { WarehouseTransferApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { WarehouseTransfer } from '../../../types';

export type TransferFilter = 'all' | 'draft' | 'completed' | 'cancelled';

export const TRANSFER_FILTERS: TransferFilter[] = ['all', 'draft', 'completed', 'cancelled'];

export function useWarehouseTransfers() {
  const [transfers,  setTransfers]  = useState<WarehouseTransfer[]>([]);
  const [filter,     setFilter]     = useState<TransferFilter>('all');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchTransfers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await WarehouseTransferApi.list({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setTransfers(res.results ?? []);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useFocusEffect(useCallback(() => { fetchTransfers(); }, [fetchTransfers]));

  return {
    transfers, filter, setFilter, search, setSearch,
    loading, refreshing, error,
    refresh: () => fetchTransfers(true),
  };
}