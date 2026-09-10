import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InvoiceApi } from '../../../api/api';
import type { Invoice } from '../../../types';

export type InvoiceFilter = 'all' | 'draft' | 'finalized' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export function useInvoices() {
  const [filter,     setFilter]     = useState<InvoiceFilter>('all');
  const [search,     setSearch]     = useState('');
  const [invoices,   setInvoices]   = useState<Invoice[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchInvoices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await InvoiceApi.getInvoices({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setInvoices(res.results ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useFocusEffect(
    useCallback(() => { fetchInvoices(); }, [fetchInvoices])
  );

  return {
    filter, setFilter,
    search, setSearch,
    invoices,
    loading, refreshing, error,
    refresh: () => fetchInvoices(true),
  };
}