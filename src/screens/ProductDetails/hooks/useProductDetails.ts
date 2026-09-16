import { useState, useEffect, useCallback } from 'react';
import { ProductApi, ProductImageApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { Product, ProductImage, ProductStockResponse, StockMovement, Batch } from '../../../types';

export function useProductDetails(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [stockLevels, setStockLevels] = useState<ProductStockResponse['warehouses']>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await ProductApi.getProduct(productId);
      setProduct(p);

      try {
        const stockRes = await ProductApi.getProductStock(productId);
        setStockLevels(stockRes.warehouses ?? []);
      } catch {
        setStockLevels([]);
      }

      try {
        const imgs = await ProductImageApi.getImages(productId);
        setImages(Array.isArray(imgs) ? imgs : []);
      } catch {
        setImages([]);
      }

      try {
        setMovementsLoading(true);
        const mvRes = await ProductApi.getStockMovements(productId);
        setMovements(mvRes.results ?? []);
      } catch {
        setMovements([]);
      } finally {
        setMovementsLoading(false);
      }

      if (p.is_batch_tracked) {
        try {
          const batchRes = await ProductApi.getBatches(productId);
          setBatches(Array.isArray(batchRes) ? batchRes : []);
        } catch {
          setBatches([]);
        }
      }
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  return { product, stockLevels, images, movements, movementsLoading, batches, loading, error, refresh: fetchProduct };
}