import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ProductApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { StockMovement } from '../../../types';

export type MovementFilter = 'all' | 'receipt' | 'dispatch' | 'adjustment_in' |
  'adjustment_out' | 'return' | 'transfer_in' | 'transfer_out' | 'damage';

export const MOVEMENT_FILTERS: { key: MovementFilter; label: string }[] = [
  { key: 'all',            label: 'All'         },
  { key: 'receipt',        label: 'Receipt'     },
  { key: 'dispatch',       label: 'Dispatch'    },
  { key: 'adjustment_in',  label: 'Adj In'      },
  { key: 'adjustment_out', label: 'Adj Out'     },
  { key: 'return',         label: 'Return'      },
  { key: 'transfer_in',    label: 'Transfer In' },
  { key: 'transfer_out',   label: 'Transfer Out'},
  { key: 'damage',         label: 'Damage'      },
];

export function useStockMovements() {
  const [movements,  setMovements]  = useState<StockMovement[]>([]);
  const [filter,     setFilter]     = useState<MovementFilter>('all');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchMovements = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await ProductApi.getAllStockMovements({
        movement_type: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setMovements(res.results ?? []);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useFocusEffect(useCallback(() => { fetchMovements(); }, [fetchMovements]));

  return {
    movements, filter, setFilter, search, setSearch,
    loading, refreshing, error,
    refresh: () => fetchMovements(true),
  };
}