import { useState, useEffect, useCallback } from 'react';
import { ProductApi, ProductImageApi } from '../../../api/api';
import type { Product, ProductImage, ProductStockResponse } from '../../../types';

export function useProductDetails(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [stockLevels, setStockLevels] = useState<ProductStockResponse['warehouses']>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
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
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

    return { product, stockLevels, images, loading, error, refresh: fetchProduct };
}