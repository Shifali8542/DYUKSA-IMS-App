import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Orders.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { OrderApi } from '../../services/Api';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { ORDER_STATUS_LABEL, PO_STATUS_LABEL } from '../../constants';
import type { SalesOrder, PurchaseOrder, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Tab = 'sales' | 'purchase' | 'dispatch';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

export default function OrdersScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<Nav>();

  const [tab,        setTab]       = useState<Tab>('sales');
  const [search,     setSearch]    = useState('');
  const [status,     setStatus]    = useState('all');
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [poOrders,   setPoOrders]  = useState<PurchaseOrder[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [refreshing, setRefreshing]= useState(false);
  const [error,      setError]     = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      if (tab === 'sales') {
        const res = await OrderApi.getSalesOrders({ status: status === 'all' ? undefined : status, search: search || undefined });
        setSalesOrders(res.results ?? []);
      } else if (tab === 'purchase') {
        const res = await OrderApi.getPurchaseOrders({ status: status === 'all' ? undefined : status });
        setPoOrders(res.results ?? []);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function SalesRow({ item }: { item: SalesOrder }) {
    return (
      <TouchableOpacity
        onPress={() => nav.navigate('OrderDetail', { orderId: item.id })}
        style={[styles.row, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.sm, borderColor: colors.border, borderWidth: 1 }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{item.order_number}</Text>
          <Badge label={ORDER_STATUS_LABEL[item.status] ?? item.status} variant={statusVariant(item.status)} />
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.customer_name}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.warehouse_name}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>₹{item.total_amount}</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  }

  function PoRow({ item }: { item: PurchaseOrder }) {
    return (
      <View style={[styles.row, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.sm, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{item.number}</Text>
          <Badge label={PO_STATUS_LABEL[item.status] ?? item.status} variant={statusVariant(item.status)} />
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.supplier_name}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{new Date(item.created_at).toLocaleDateString()}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>₹{item.total_amount}</Text>
        </View>
      </View>
    );
  }

  const data = tab === 'sales' ? salesOrders : poOrders;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base }]}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Orders</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface, paddingHorizontal: spacing.base, paddingBottom: spacing.sm }]}>
        {(['sales', 'purchase'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => { setTab(t); setStatus('all'); }}
            style={[
              styles.tabBtn,
              {
                borderBottomWidth: 2,
                borderBottomColor: tab === t ? colors.primary : 'transparent',
                paddingBottom: spacing.sm,
                marginRight: spacing.lg,
              },
            ]}
          >
            <Text style={{ color: tab === t ? colors.primary : colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              {t === 'sales' ? 'Sales Orders' : 'Purchase Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${tab} orders...`} />
      </View>

      {/* Status filter */}
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = status === item;
            return (
              <TouchableOpacity
                onPress={() => setStatus(item)}
                style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border, borderRadius: borderRadius.full, paddingHorizontal: spacing.base, paddingVertical: spacing.xs, marginRight: spacing.xs, borderWidth: 1 }]}
              >
                <Text style={{ color: active ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                  {item === 'all' ? 'All' : ORDER_STATUS_LABEL[item] ?? item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <Loader fullScreen />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => tab === 'sales' ? <SalesRow item={item} /> : <PoRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="📋" title="No orders found" description="No orders match your filters." />}
        />
      )}
    </SafeAreaView>
  );
}
