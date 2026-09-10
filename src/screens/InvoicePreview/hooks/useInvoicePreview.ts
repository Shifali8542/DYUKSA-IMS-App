import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { imsClient } from '../../../api/api';
import { tokenStorage } from '../../../utils/tokenStorage';

export function useInvoicePreview(invoiceId: number) {
  const [html, setHtml]       = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const fetchHtml = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await tokenStorage.getAccessToken();
      const baseURL = imsClient.defaults.baseURL ?? '';
      const url = `${baseURL}/api/v1/invoices/${invoiceId}/pdf/`;

      const resp = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      });

      if (!resp.ok) throw new Error(`Server error ${resp.status}`);

      const text = await resp.text();
      setHtml(text);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { fetchHtml(); }, [fetchHtml]);

  async function shareAsPdf() {
    if (!html) return;
    setSharing(true);
    try {
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Invoice PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Saved', `Invoice saved to ${uri}`);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to generate PDF.');
    } finally {
      setSharing(false);
    }
  }

  async function printInvoice() {
    if (!html) return;
    try {
      await Print.printAsync({ html });
    } catch {
      Alert.alert('Error', 'Failed to print.');
    }
  }

  return { html, loading, error, sharing, shareAsPdf, printInvoice };
}