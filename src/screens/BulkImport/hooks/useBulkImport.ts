import { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { imsClient } from '../../../api/api';
import { tokenStorage } from '../../../utils/tokenStorage';
import { parseBackendError } from '../../../utils/parseError';

export interface ImportResult {
  dry_run: boolean;
  total_rows: number;
  created: number;
  updated: number;
  skipped: number;
  will_create?: number;
  will_update?: number;
  will_skip?: number;
  errors: { row: number; sku?: string; error: string }[];
}

export type ImportMode = 'create' | 'update' | 'upsert';

type ImportStatus = 'idle' | 'picking' | 'previewing' | 'uploading' | 'done' | 'error';

export function useBulkImport() {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [file, setFile] = useState<{ name: string; uri: string; type: string } | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>('create');
  const [progress, setProgress] = useState(0);

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

  function _buildFormData() {
    const formData = new FormData();
    formData.append('file', {
      uri: file!.uri,
      name: file!.name,
      type: file!.type,
    } as any);
    return formData;
  }

  async function _postImport(queryStr: string) {
    const accessToken = await tokenStorage.getAccessToken();
    const baseURL = imsClient.defaults.baseURL ?? '';
    const url = `${baseURL}/api/v1/products/bulk-import/?${queryStr}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken ?? ''}`,
      },
      body: _buildFormData(),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => null);
      throw new Error(errBody?.message ?? errBody?.error ?? `Server error ${resp.status}`);
    }

    const json = await resp.json();
    return json.data ?? json;
  }

  async function dryRun(): Promise<boolean> {
    if (!file) {
      Alert.alert('Error', 'Select a file first.');
      return false;
    }

    setStatus('previewing');
    setError(null);
    setPreview(null);

    try {
      const previewResult = await _postImport(`mode=${mode}&dry_run=true`);
      setPreview(previewResult);
      setStatus('idle');
      return true;
    } catch (e: any) {
      setError(e.message ?? 'Preview failed.');
      setStatus('error');
      return false;
    }
  }

  async function upload(): Promise<boolean> {
    if (!file) {
      Alert.alert('Error', 'Select a file first.');
      return false;
    }

    setStatus('uploading');
    setError(null);
    setProgress(0);

    try {
      const importResult = await _postImport(`mode=${mode}`);
      setResult(importResult);
      setProgress(100);
      setStatus('done');
      return true;
    } catch (e: any) {
      const msg = e.message ?? 'Import failed.';
      setError(msg);
      setStatus('error');
      Alert.alert('Import Failed', msg);
      return false;
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    setMode('create');
    setStatus('idle');
  }
    async function downloadTemplate(fmt: 'csv' | 'xlsx' = 'csv') {
    try {
      const baseURL = imsClient.defaults.baseURL ?? '';
      const url = `${baseURL}/api/v1/products/bulk-import-template/?format=${fmt}`;
      await Linking.openURL(url);
      return true;
    } catch {
      Alert.alert('Error', 'Failed to download template.');
      return null;
    }
  }

  return {
    status, file, result, preview, error, mode, progress,
    pickFile, dryRun, upload, reset, setMode, downloadTemplate,
  };
}