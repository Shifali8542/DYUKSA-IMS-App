import { useState, useCallback, useEffect } from 'react';
import { InventoryApi } from '../../../services/Api';
import type { Product, Category } from '../../../types';
import { PAGE_SIZE } from '../../../constants';

export function useInventory() {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState<number | undefined>();
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [total,       setTotal]       = useState(0);

  const fetchProducts = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const res = await InventoryApi.getProducts({
        search:   search || undefined,
        category: category,
        page:     currentPage,
        page_size: PAGE_SIZE,
      } as any);
      const results = res.results ?? [];
      setProducts(reset ? results : (prev) => [...prev, ...results]);
      setTotal(res.count);
      setHasMore(!!res.next);
      if (reset) setPage(1);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchProducts(true);
  }, [search, category]);

  async function loadMore() {
    if (!hasMore || loading) return;
    setPage((p) => p + 1);
    await fetchProducts(false);
  }

  async function fetchCategories() {
    try {
      const cats = await InventoryApi.getCategories();
      setCategories(cats);
    } catch {}
  }

  useEffect(() => { fetchCategories(); }, []);

  return {
    products, categories, search, setSearch,
    category, setCategory,
    loading, refreshing, error,
    hasMore, total, loadMore,
    refresh: () => fetchProducts(true),
  };
}
