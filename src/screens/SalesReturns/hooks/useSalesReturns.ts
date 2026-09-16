import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SalesReturnApi } from '../../../api/api';
import type { SalesReturn } from '../../../types';

export type ReturnFilter = 'all' | 'draft' | 'approved' | 'completed' | 'cancelled';

const FILTERS: ReturnFilter[] = ['all', 'draft', 'approved', 'completed', 'cancelled'];

export function useSalesReturns() {
  const [filter,     setFilter]     = useState<ReturnFilter>('all');
  const [search,     setSearch]     = useState('');
  const [returns,    setReturns]    = useState<SalesReturn[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchReturns = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await SalesReturnApi.list({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setReturns(res.results ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load returns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useFocusEffect(useCallback(() => { fetchReturns(); }, [fetchReturns]));

  return { filter, setFilter, search, setSearch, returns, loading, refreshing, error, filters: FILTERS, refresh: () => fetchReturns(true) };
}