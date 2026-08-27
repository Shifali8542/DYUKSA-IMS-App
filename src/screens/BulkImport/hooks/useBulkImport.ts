import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { imsClient } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';

export interface ImportResult {
  total_rows: number;
  created:    number;
  skipped:    number;
  errors:     { row: number; sku?: string; error: string }[];
}

type ImportStatus = 'idle' | 'picking' | 'uploading' | 'done' | 'error';

export function useBulkImport() {
  const [status, setStatus]   = useState<ImportStatus>('idle');
  const [file, setFile]       = useState<{ name: string; uri: string; type: string } | null>(null);
  const [result, setResult]   = useState<ImportResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function pickFile() {
    setStatus('picking');
    setError(null);
    setResult(null);

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        setStatus('idle');
        return;
      }

      const picked = res.assets[0];
      setFile({
        name: picked.name,
        uri: picked.uri,
        type: picked.mimeType ?? 'application/octet-stream',
      });
      setStatus('idle');
    } catch (e: any) {
      setError('Failed to pick file.');
      setStatus('error');
    }
  }

  async function upload(): Promise<boolean> {
    if (!file) {
      Alert.alert('Error', 'Select a file first.');
      return false;
    }

    setStatus('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const { data } = await imsClient.post('/api/v1/products/bulk-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      const importResult = data.data ?? data;
      setResult(importResult);
      setStatus('done');
      return true;
    } catch (e: any) {
      const msg = parseBackendError(e);
      setError(msg);
      setStatus('error');
      Alert.alert('Import Failed', msg);
      return false;
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus('idle');
  }

  return { status, file, result, error, pickFile, upload, reset };
}