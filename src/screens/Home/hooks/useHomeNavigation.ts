import { useNavigation } from '@react-navigation/native';
import type { DispatchStatus } from '../../../types';

/** Every place a Home card or button can take the user. */
export function useHomeNavigation() {
  const nav = useNavigation<any>();
  const tab = (screen: string, params?: object) =>
    nav.navigate('MainTabs', { screen, params: { ...params, ts: Date.now() } });

  return {
    openInventory: () => tab('Inventory', { lowStock: false }),
    openLowStock: () => tab('Inventory', { lowStock: true }),
    openConfirmedOrders: () => tab('Orders', { tab: 'sales', status: 'confirmed' }),
    openPurchaseOrders: () => tab('Orders', { tab: 'purchase', status: 'all' }),
    openOrders: () => tab('Orders', { tab: 'sales', status: 'all' }),
    openAlerts: () => tab('Alerts'),
    openWarehouses: () => nav.navigate('Warehouses'),
    openDispatches: (status?: DispatchStatus) => nav.navigate('Dispatches', { status, ts: Date.now() }),
    openDispatchedToday: () => nav.navigate('Dispatches', { today: true, ts: Date.now() }),
    openReports: () => nav.navigate('Reports'),
    openScanner: () => nav.navigate('Scanner'),
    openProduct: (productId: number) => nav.navigate('ProductDetails', { productId }),
  };
}