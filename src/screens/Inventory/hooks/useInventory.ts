import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ProductApi, CategoryApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { Product, Category } from '../../../types';
import { PAGE_SIZE } from '../../../constants';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearchRaw] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  function setSearch(text: string) {
    setSearchRaw(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(text), 400);
  }

  const fetchProducts = useCallback(async (pageNum: number, reset: boolean) => {
    if (reset) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const res = await ProductApi.getProducts({
        search: debouncedSearch || undefined,
        category: category,
        is_active: true,
        ordering: '-updated_at',
        page: pageNum,
        page_size: PAGE_SIZE,
      });
      const results = res.results ?? [];
      setProducts(reset ? results : (prev) => [...prev, ...results]);
      setTotal(res.count);
      setHasMore(!!res.next);
      setPage(pageNum);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, category]);

  // Auto-refresh when screen regains focus (e.g. returning from ProductForm)
  useFocusEffect(
    useCallback(() => {
      fetchProducts(1, true);
    }, [debouncedSearch, category])
  );

  function loadMore() {
    if (!hasMore || loading || refreshing) return;
    fetchProducts(page + 1, false);
  }

  // Fetch categories once
  useEffect(() => {
    CategoryApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  return {
    products, categories, search, setSearch,
    category, setCategory,
    loading, refreshing, error,
    hasMore, total, loadMore,
    refresh: () => fetchProducts(1, true),
  };
}
