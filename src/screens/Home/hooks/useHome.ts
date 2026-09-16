import { useState, useEffect, useCallback } from 'react';
import { DashboardApi, ProductApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import { tokenStorage } from '../../../utils/tokenStorage';
import { getUserDisplayName } from '../../../utils/jwt';
import type { DashboardData, Product } from '../../../types';

interface HomeState {
  dashboard: DashboardData | null;
  lowStock: Product[];
  userName: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHome(): HomeState {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
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

      // Fetch low stock products separately (won't block dashboard)
      try {
        const lowStockRes = await ProductApi.getProducts({ is_active: true, page_size: 5 } as any);
        // Filter for low stock items if backend returns the flag
        const items = lowStockRes.results ?? [];
        setLowStock(items.filter((p) => parseFloat(p.available_stock ?? '0') <= parseFloat(p.reorder_level ?? '0')).slice(0, 5));
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
