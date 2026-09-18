import { useState, useEffect, useCallback } from 'react';
import { DashboardApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import { tokenStorage } from '../../../utils/tokenStorage';
import { getUserDisplayName } from '../../../utils/jwt';
import type { DashboardData, LowStockItem  } from '../../../types';

interface HomeState {
  dashboard: DashboardData | null;
  lowStock: LowStockItem[];
  userName: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHome(): HomeState {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, token] = await Promise.all([
        DashboardApi.getSummary(),
        tokenStorage.getAccessToken(),
      ]);
      setDashboard(dash);
      if (token) setUserName(getUserDisplayName(token));

      // Fetch actual low stock products from inventory report endpoint
      try {
        const items = await DashboardApi.getLowStockProducts(5);
        setLowStock(items);
      } catch {
        setLowStock([]);
      }
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { dashboard, lowStock, userName, loading, error, refresh: fetchAll };
}
