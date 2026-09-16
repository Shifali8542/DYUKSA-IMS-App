import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { SalesReturnApi } from '../../../api/api';
import type { SalesReturn } from '../../../types';

export function useSalesReturnDetail(returnId: number) {
  const [sr, setSr]                   = useState<SalesReturn | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [approving, setApproving]     = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SalesReturnApi.get(returnId);
      setSr(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load return');
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleApprove() {
    if (!sr) return;
    Alert.alert(
      'Approve Return?',
      'This will update inventory based on each item\'s disposition (restock, damaged, scrap). This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Approve',
          onPress: async () => {
            setApproving(true);
            try {
              const updated = await SalesReturnApi.approve(sr.id);
              setSr(updated);
              Alert.alert('Approved', 'Return approved and inventory updated.');
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error?.message ?? 'Failed to approve.');
            } finally {
              setApproving(false);
            }
          },
        },
      ],
    );
  }

  return { sr, loading, error, approving, handleApprove, refresh: fetch };
}