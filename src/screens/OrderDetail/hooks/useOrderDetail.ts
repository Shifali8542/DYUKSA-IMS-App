import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderApi } from '../../../api/api';
import { ORDER_STATUS_LABEL } from '../../../constants';
import type { SalesOrder, MainStackParamList } from '../../../types';


function getActions(order: SalesOrder | null) {
  if (!order) return [];

  const hasInvoice = order.invoice_id !== null;
  const actions: { label: string; action: 'confirm' | 'cancel' | 'invoice' | 'view_invoice' | 'create_dispatch' | 'view_dispatch' | 'create_return'; variant: 'primary' | 'danger' }[] = [];

  if (order.status === 'draft') {
    actions.push({ label: 'Confirm', action: 'confirm', variant: 'primary' });
    actions.push({ label: 'Cancel', action: 'cancel', variant: 'danger' });
  } else if (['confirmed', 'packed', 'dispatched', 'delivered'].includes(order.status)) {
    if (hasInvoice) {
      actions.push({ label: `View Invoice ${order.invoice_number ?? ''}`, action: 'view_invoice', variant: 'primary' });
    } else {
      actions.push({ label: 'Generate Invoice', action: 'invoice', variant: 'primary' });
    }

    const hasDispatch = order.dispatch_note_id !== null;
    if (hasDispatch) {
      actions.push({ label: `View Dispatch ${order.dispatch_number ?? ''}`, action: 'view_dispatch', variant: 'primary' });
    } else if (['confirmed', 'packed'].includes(order.status)) {
      actions.push({ label: 'Create Dispatch', action: 'create_dispatch', variant: 'primary' });
    }

    if (order.status === 'confirmed') {
      actions.push({ label: 'Cancel', action: 'cancel', variant: 'danger' });
    }

    if (['delivered', 'dispatched'].includes(order.status)) {
      actions.push({ label: 'Create Return', action: 'create_return', variant: 'danger' });
    }
  }

  return actions;
}

export function useOrderDetail(orderId: number) {
  const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrderApi.getSalesOrder(orderId);
      setOrder(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  function handleAction(action: 'confirm' | 'cancel' | 'invoice' | 'view_invoice' | 'create_dispatch' | 'view_dispatch' | 'create_return') {
    if (!order) return;

    if (action === 'view_invoice') {
      if (order.invoice_id) {
        nav.navigate('InvoiceDetail', { invoiceId: order.invoice_id });
      }
      return;
    }

    if (action === 'view_dispatch') {
      if (order.dispatch_note_id) {
        nav.navigate('DispatchDetail', { dispatchId: order.dispatch_note_id });
      }
      return;
    }

    if (action === 'create_return') {
      nav.navigate('SalesReturnForm', {
        orderId: order.id,
        customerId: order.customer,
        warehouseId: order.warehouse,
      });
      return;
    }

    if (action === 'create_dispatch') {
      Alert.alert('Create Dispatch?', `Create dispatch note for order ${order.order_number}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Create',
          onPress: async () => {
            setTransitioning(true);
            try {
              const { DispatchApi } = await import('../../../api/api');
              const dn = await DispatchApi.createDispatch({
                order: order.id,
                warehouse: order.warehouse,
                delivery_address: order.delivery_address,
              });
              Alert.alert('Dispatch Created', `${dn.dispatch_number} created.`, [
                { text: 'View Dispatch', onPress: () => nav.navigate('DispatchDetail', { dispatchId: dn.id }) },
                { text: 'Stay Here', style: 'cancel' },
              ]);
              await fetchOrder();
            } catch (e: any) {
              const msg = e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e?.message ?? 'Failed to create dispatch.';
              Alert.alert('Error', msg);
            } finally {
              setTransitioning(false);
            }
          },
        },
      ]);
      return;
    }

    if (action === 'invoice') {
      Alert.alert('Generate Invoice?', `Create an invoice for order ${order.order_number}?`, [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Generate',
          onPress: async () => {
            setTransitioning(true);
            try {
              const invoice = await OrderApi.generateInvoice(order.id);
              Alert.alert('Invoice Created', `Invoice ${invoice.number} generated.`, [
                { text: 'View Invoice', onPress: () => nav.navigate('InvoiceDetail', { invoiceId: invoice.id }) },
                { text: 'Stay Here', style: 'cancel' },
              ]);
              await fetchOrder();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? e?.response?.data?.error?.message ?? 'Failed to generate invoice.');
            } finally {
              setTransitioning(false);
            }
          },
        },
      ]);
      return;
    }

    const label = action === 'confirm' ? 'Confirm' : 'Cancel';
    Alert.alert(`${label} this order?`, 'This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: `Yes, ${label}`,
        style: action === 'cancel' ? 'destructive' : 'default',
        onPress: async () => {
          setTransitioning(true);
          try {
            const updated = action === 'confirm'
              ? await OrderApi.confirmOrder(order.id)
              : await OrderApi.cancelOrder(order.id);
            setOrder(updated ?? { ...order, status: action === 'confirm' ? 'confirmed' : 'cancelled' });
          } catch (e: any) {
            const errMsg = e?.response?.data?.message ?? e?.response?.data?.error?.message ?? e?.response?.data?.error ?? JSON.stringify(e?.response?.data) ?? 'Failed to update status.';
            Alert.alert('Error', errMsg);
          } finally {
            setTransitioning(false);
          }
        },
      },
    ]);
  }

  const actions = getActions(order);

  return { order, loading, error, transitioning, actions, handleAction, refresh: fetchOrder };
}
