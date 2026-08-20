import { useState, useEffect, useCallback } from 'react';
import { DashboardApi, InventoryApi } from '../../../services/Api';
import { tokenStorage } from '../../../utils/tokenStorage';
import { getUserDisplayName } from '../../../utils/jwt';
import type { DashboardData, Product } from '../../../types';

interface HomeState {
  dashboard:   DashboardData | null;
  lowStock:    Product[];
  userName:    string;
  loading:     boolean;
  error:       string | null;
  refresh:     () => void;
}

export function useHome(): HomeState {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lowStock,  setLowStock]  = useState<Product[]>([]);
  const [userName,  setUserName]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, lowStockRes, token] = await Promise.all([
        DashboardApi.getSummary(),
        InventoryApi.getLowStock(),
        tokenStorage.getAccessToken(),
      ]);
      setDashboard(dash);
      setLowStock(Array.isArray(lowStockRes) ? lowStockRes.slice(0, 5) : []);
      if (token) setUserName(getUserDisplayName(token));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { dashboard, lowStock, userName, loading, error, refresh: fetchAll };
}
