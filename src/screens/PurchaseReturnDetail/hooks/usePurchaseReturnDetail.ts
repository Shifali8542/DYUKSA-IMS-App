import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { PurchaseReturnApi } from '../../../api/api';
import type { PurchaseReturn } from '../../../types';

export function usePurchaseReturnDetail(returnId: number) {
  const [pr, setPr]               = useState<PurchaseReturn | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPr(await PurchaseReturnApi.get(returnId));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load return');
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleApprove() {
    if (!pr) return;
    Alert.alert(
      'Approve Return?',
      'This will deduct stock from the warehouse for all items. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Approve',
          style: 'destructive',
          onPress: async () => {
            setApproving(true);
            try {
              const updated = await PurchaseReturnApi.approve(pr.id);
              setPr(updated);
              Alert.alert('Approved', 'Purchase return approved and stock deducted.');
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

  return { pr, loading, error, approving, handleApprove, refresh: fetch };
}