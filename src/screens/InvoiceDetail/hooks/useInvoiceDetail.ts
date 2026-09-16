import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { InvoiceApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import { PAYMENT_METHOD_LABEL } from '../../../constants';
import type { Invoice } from '../../../types';

export function useInvoiceDetail(invoiceId: number) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InvoiceApi.getInvoice(invoiceId);
      setInvoice(data);
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  async function recordPayment(payload: {
    amount: string;
    payment_date: string;
    method: string;
    transaction_reference?: string;
    notes?: string;
  }) {
    if (!invoice) return;
    setPaying(true);
    try {
      await InvoiceApi.recordPayment(invoice.id, payload);
      Alert.alert('Payment Recorded', `₹${payload.amount} recorded via ${PAYMENT_METHOD_LABEL[payload.method] ?? payload.method}.`);
      setShowPayModal(false);
      await fetchInvoice();
    } catch (e: any) {
      Alert.alert('Payment Failed', parseBackendError(e));
    } finally {
      setPaying(false);
    }
  }

  const canRecordPayment = invoice
    ? !['paid', 'cancelled'].includes(invoice.status) && parseFloat(invoice.balance_due) > 0
    : false;

  return {
    invoice, loading, error, paying, canRecordPayment,
    showPayModal, setShowPayModal,
    recordPayment, refresh: fetchInvoice,
  };
}