import { useState, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { ProductApi } from '../../../api/api';
import type { Product } from '../../../types';

export type ScanResult =
  | { status: 'idle' }
  | { status: 'searching'; barcode: string }
  | { status: 'found'; barcode: string; product: Product }
  | { status: 'not_found'; barcode: string }
  | { status: 'error'; barcode: string; message: string };

export function useScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult]   = useState<ScanResult>({ status: 'idle' });
  const [torch, setTorch]     = useState(false);
  const lastScanRef           = useRef<string>('');
  const cooldownRef           = useRef<boolean>(false);

  const handleBarCodeScanned = useCallback(async ({ data }: { type: string; data: string }) => {
    if (cooldownRef.current) return;
    if (data === lastScanRef.current) return;

    cooldownRef.current = true;
    lastScanRef.current = data;
    setTimeout(() => { cooldownRef.current = false; }, 2000);

    Vibration.vibrate(100);
    setResult({ status: 'searching', barcode: data });

    try {
      const res = await ProductApi.getProducts({ search: data, page_size: 5 });
      const products = res.results ?? [];
      const exact = products.find((p) => p.barcode === data || p.sku === data);

      if (exact) {
        setResult({ status: 'found', barcode: data, product: exact });
      } else if (products.length > 0) {
        setResult({ status: 'found', barcode: data, product: products[0] });
      } else {
        setResult({ status: 'not_found', barcode: data });
      }
    } catch (e: any) {
      setResult({ status: 'error', barcode: data, message: e?.message ?? 'Search failed' });
    }
  }, []);

  function resetScan() {
    setResult({ status: 'idle' });
    lastScanRef.current = '';
  }

  function toggleTorch() {
    setTorch((prev) => !prev);
  }

  return { permission, requestPermission, result, resetScan, torch, toggleTorch, handleBarCodeScanned };
}