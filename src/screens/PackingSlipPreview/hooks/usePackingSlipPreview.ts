import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { imsClient } from '../../../api/api';
import { tokenStorage } from '../../../utils/tokenStorage';

export function usePackingSlipPreview(dispatchId: number) {
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
      const resp = await fetch(`${baseURL}/api/v1/dispatch/${dispatchId}/packing-slip/`, {
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      });
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      setHtml(await resp.text());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load packing slip');
    } finally {
      setLoading(false);
    }
  }, [dispatchId]);

  useEffect(() => { fetchHtml(); }, [fetchHtml]);

  async function shareAsPdf() {
    if (!html) return;
    setSharing(true);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Packing Slip' });
      }
    } catch { Alert.alert('Error', 'Failed to generate PDF.'); }
    finally { setSharing(false); }
  }

  async function printSlip() {
    if (!html) return;
    try { await Print.printAsync({ html }); }
    catch { Alert.alert('Error', 'Failed to print.'); }
  }

  return { html, loading, error, sharing, shareAsPdf, printSlip };
}