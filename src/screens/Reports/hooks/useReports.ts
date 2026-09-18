import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ReportApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type {
  SalesReportRow, SalesReportSummary,
  InventoryReportRow,
  PurchaseReportRow, PurchaseReportSummary,
} from '../../../types';

export type ReportTab = 'sales' | 'inventory' | 'purchase';

export function useReports() {
  const [tab, setTab] = useState<ReportTab>('sales');

  // Sales
  const [salesRows,    setSalesRows]    = useState<SalesReportRow[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);

  // Inventory
  const [invRows,       setInvRows]       = useState<InventoryReportRow[]>([]);
  const [invStockValue, setInvStockValue] = useState<string>('0');
  const [invLowOnly,    setInvLowOnly]    = useState(false);

  // Purchase
  const [poRows,    setPoRows]    = useState<PurchaseReportRow[]>([]);
  const [poSummary, setPoSummary] = useState<PurchaseReportSummary | null>(null);

  // Shared
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    const res = await ReportApi.getSalesReport();
    setSalesRows(res.results ?? []);
    setSalesSummary(res.summary ?? null);
  }, []);

  const fetchInventory = useCallback(async () => {
    const res = await ReportApi.getInventoryReport({ low_stock: invLowOnly || undefined });
    setInvRows(res.results ?? []);
    setInvStockValue(res.total_stock_value ?? '0');
  }, [invLowOnly]);

  const fetchPurchase = useCallback(async () => {
    const res = await ReportApi.getPurchaseReport();
    setPoRows(res.results ?? []);
    setPoSummary(res.summary ?? null);
  }, []);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSales(), fetchInventory(), fetchPurchase()]);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSales, fetchInventory, fetchPurchase]);

  // Refetch inventory when low-stock filter changes
  const refetchInventory = useCallback(async () => {
    setLoading(true);
    try { await fetchInventory(); }
    catch (e: any) { setError(parseBackendError(e)); }
    finally { setLoading(false); }
  }, [fetchInventory]);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  return {
    tab, setTab,
    salesRows, salesSummary,
    invRows, invStockValue, invLowOnly, setInvLowOnly,
    poRows, poSummary,
    loading, refreshing, error,
    refresh: () => fetchAll(true),
    refetchInventory,
  };
}