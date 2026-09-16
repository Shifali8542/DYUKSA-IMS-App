import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { DispatchApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { DispatchNote, DispatchStatus } from '../../../types';

export type DispatchFilter = 'all' | DispatchStatus;

export function useDispatches() {
  const [filter, setFilter] = useState<DispatchFilter>('all');
  const [search, setSearch] = useState('');
  const [dispatches, setDispatches] = useState<DispatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDispatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await DispatchApi.getDispatches({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setDispatches(res.results ?? []);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useFocusEffect(
    useCallback(() => { fetchDispatches(); }, [fetchDispatches])
  );

  return {
    filter, setFilter, search, setSearch,
    dispatches, loading, refreshing, error,
    refresh: () => fetchDispatches(true),
  };
}