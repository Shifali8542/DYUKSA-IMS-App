import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WarehouseApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { Warehouse } from '../../../types';

interface WarehouseState {
  warehouses:  Warehouse[];
  loading:     boolean;
  refreshing:  boolean;
  error:       string | null;
  creating:    boolean;
  refresh:     () => void;
  createWarehouse: (payload: CreateWarehousePayload) => Promise<boolean>;
}

export interface CreateWarehousePayload {
  name:     string;
  code:     string;
  address?: string;
  city?:    string;
  state?:   string;
  pincode?: string;
  capacity?: number;
}

export function useWarehouses(): WarehouseState {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [creating,   setCreating]   = useState(false);

  const fetchWarehouses = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await WarehouseApi.getWarehouses({ is_active: true });
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load warehouses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchWarehouses(); }, [fetchWarehouses])
  );

  async function createWarehouse(payload: CreateWarehousePayload): Promise<boolean> {
    setCreating(true);
    try {
      await WarehouseApi.createWarehouse(payload);
      await fetchWarehouses();
      return true;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setCreating(false);
    }
  }

  return {
    warehouses, loading, refreshing, error, creating,
    refresh: () => fetchWarehouses(true),
    createWarehouse,
  };
}