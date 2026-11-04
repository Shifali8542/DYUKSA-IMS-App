import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { DashboardApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import { tokenStorage } from '../../../utils/tokenStorage';
import { getUserDisplayName } from '../../../utils/jwt';
import type { DashboardData, LowStockItem } from '../../../types';

export function useHome() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);        // first load only
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    setError(null);
    try {
      const [dash, token] = await Promise.all([
        DashboardApi.getSummary(),
        tokenStorage.getAccessToken(),
      ]);
      setDashboard(dash);
      if (token) setUserName(getUserDisplayName(token));
      if (dash.low_stock_count > 0) {
        DashboardApi.getLowStockProducts(5).then(setLowStock).catch(() => setLowStock([]));
      } else {
        setLowStock([]);
      }
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload whenever Home comes back into view, so numbers are never stale
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return {
    dashboard, lowStock, userName, loading, refreshing, error,
    refresh: () => load(true),
    retry: () => { setLoading(true); load(); },
  };
}