import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Orders.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useOrders, type OrderTab } from './hooks/useOrders';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { ORDER_STATUS_LABEL, PO_STATUS_LABEL } from '../../constants';
import type { SalesOrder, PurchaseOrder, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Backend uses 'draft' not 'pending' for sales orders
const STATUS_FILTERS = ['all', 'draft', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

export default function OrdersScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { canCreateOrders } = usePermissions();
  const nav = useNavigation<Nav>();
  const {
    tab, changeTab, search, setSearch, status, setStatus,
    salesOrders, poOrders, loading, refreshing, error, refresh, data,
  } = useOrders();

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
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            ₹{item.total ?? item.subtotal ?? '—'}
          </Text>
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
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>₹{item.total}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base }]}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Orders</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface, paddingHorizontal: spacing.base, paddingBottom: spacing.sm }]}>
        {(['sales', 'purchase'] as OrderTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => changeTab(t)}
            style={[styles.tabBtn, {
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? colors.primary : 'transparent',
              paddingBottom: spacing.sm, marginRight: spacing.lg,
            }]}
          >
            <Text style={{ color: tab === t ? colors.primary : colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              {t === 'sales' ? 'Sales Orders' : 'Purchase Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => tab === 'sales' ? <SalesRow item={item} /> : <PoRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="📋" title="No orders found" description="No orders match your filters." />}
        />
      )}
      {/* FAB — Create Order */}
      {canCreateOrders && (
        <TouchableOpacity
          onPress={() => nav.navigate('OrderForm')}
          style={{
            position: 'absolute', bottom: 24, right: spacing.base,
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
          }}
        >
          <Text style={{ color: colors.textInverse, fontSize: 28, fontWeight: '300', marginTop: -2 }}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
