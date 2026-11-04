import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { DispatchApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { DispatchNote, DispatchStatus, MainStackParamList } from '../../../types';

export type DispatchFilter = 'all' | DispatchStatus;

export function useDispatches() {
  const route = useRoute<RouteProp<MainStackParamList, 'Dispatches'>>();
  const [filter, setFilterState] = useState<DispatchFilter>('all');
  const [today, setToday] = useState(false); // "dispatched today" filter from Home

  // Picking any status chip replaces the "today" filter
  function setFilter(f: DispatchFilter) { setFilterState(f); setToday(false); }
  function clearToday() { setToday(false); }
  const [search, setSearch] = useState('');
  const [dispatches, setDispatches] = useState<DispatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Home cards open this screen pre-filtered; `ts` changes on every tap
  const params = route.params;
  useEffect(() => {
    if (!params?.ts) return;
    setToday(!!params.today);
    setFilterState(params.status ?? 'all');
    setSearch('');
  }, [params?.ts]);

  const fetchDispatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await DispatchApi.getDispatches({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
        dispatched_today: today || undefined,
      });
      setDispatches(res.results ?? []);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search, today]);

  useFocusEffect(
    useCallback(() => { fetchDispatches(); }, [fetchDispatches])
  );

  return {
    filter, setFilter, search, setSearch, today, clearToday,
    dispatches, loading, refreshing, error,
    refresh: () => fetchDispatches(true),
  };
}