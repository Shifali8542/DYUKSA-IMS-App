import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { OrderApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { Supplier } from '../../../types';

export interface CreateSupplierPayload {
  code:           string;
  name:           string;
  contact_name?:  string;
  email?:         string;
  phone?:         string;
  tax_number?:    string;
  address?:       string;
  city?:          string;
  state?:         string;
  pincode?:       string;
  payment_terms?: string;
  notes?:         string;
}

export function useSuppliers() {
  const [suppliers,  setSuppliers]  = useState<Supplier[]>([]);
  const [search,     setSearchRaw]  = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [creating,   setCreating]   = useState(false);

  const fetchSuppliers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await OrderApi.getSuppliers({ search: search || undefined });
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useFocusEffect(useCallback(() => { fetchSuppliers(); }, [fetchSuppliers]));

  function setSearch(text: string) {
    setSearchRaw(text);
  }

  async function createSupplier(payload: CreateSupplierPayload): Promise<boolean> {
    setCreating(true);
    try {
      await OrderApi.createSupplier(payload);
      await fetchSuppliers();
      return true;
    } catch (e: any) {
      Alert.alert('Error', parseBackendError(e));
      return false;
    } finally {
      setCreating(false);
    }
  }

  return {
    suppliers, search, setSearch,
    loading, refreshing, error, creating,
    refresh: () => fetchSuppliers(true),
    createSupplier,
  };
}