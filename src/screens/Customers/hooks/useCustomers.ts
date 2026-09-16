import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CustomerApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { Customer } from '../../../types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearchRaw] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setSearch(text: string) {
    setSearchRaw(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(text), 400);
  }

  const fetchCustomers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await CustomerApi.getCustomers({
        search: debouncedSearch || undefined,
      });
      setCustomers(res.results ?? []);
      setTotal(res.count ?? 0);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  useFocusEffect(
    useCallback(() => { fetchCustomers(); }, [debouncedSearch])
  );

  return {
    customers, search, setSearch,
    loading, refreshing, error, total,
    refresh: () => fetchCustomers(true),
  };
}