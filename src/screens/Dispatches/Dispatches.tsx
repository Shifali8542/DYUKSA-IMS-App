import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Dispatches.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useDispatches, type DispatchFilter } from './hooks/useDispatches';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { DISPATCH_STATUS_LABEL } from '../../constants';
import type { DispatchNote, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const FILTERS: DispatchFilter[] = ['all', 'pending', 'approved', 'dispatched', 'delivered', 'returned'];

export default function DispatchesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<Nav>();
  const {
    filter, setFilter, search, setSearch,
    dispatches, loading, refreshing, error, refresh,
  } = useDispatches();

  function DispatchRow({ item }: { item: DispatchNote }) {
    const isDelivered = item.status === 'delivered';
    const isReturned = item.status === 'returned';

    return (
      <TouchableOpacity
        onPress={() => nav.navigate('DispatchDetail', { dispatchId: item.id })}
        style={{
          backgroundColor: colors.surface, borderRadius: borderRadius.md,
          padding: spacing.base, marginBottom: spacing.sm,
          borderColor: isReturned ? colors.danger : colors.border, borderWidth: 1,
        }}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            {item.dispatch_number}
          </Text>
          <Badge
            label={DISPATCH_STATUS_LABEL[item.status] ?? item.status}
            variant={statusVariant(item.status)}
          />
        </View>

        {/* Customer + Order */}
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs }}>
          {item.customer_name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
          Order: {item.order_number}  •  {item.warehouse_name}
        </Text>

        {/* Carrier + Tracking */}
        {(item.carrier || item.tracking_number) ? (
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs,
            paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border,
          }}>
            {item.carrier ? (
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>🚚 {item.carrier}</Text>
            ) : <View />}
            {item.tracking_number ? (
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: fontWeight.medium }}>#{item.tracking_number}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Timestamps */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          {item.dispatched_at ? (
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
              Shipped: {new Date(item.dispatched_at).toLocaleDateString()}
            </Text>
          ) : null}
          {isDelivered && item.delivered_at ? (
            <Text style={{ color: colors.success, fontSize: 10, fontWeight: fontWeight.medium }}>
              Delivered: {new Date(item.delivered_at).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Dispatches</Text>
      </View>

      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by dispatch#, order# or customer..." />
      </View>

      {/* Filter tabs */}
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = filter === item;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item)}
                style={{
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: borderRadius.full, paddingHorizontal: spacing.base,
                  paddingVertical: spacing.xs, marginRight: spacing.xs, borderWidth: 1,
                }}
              >
                <Text style={{
                  color: active ? colors.textInverse : colors.textSecondary,
                  fontSize: fontSize.xs, fontWeight: fontWeight.medium,
                }}>
                  {item === 'all' ? 'All' : DISPATCH_STATUS_LABEL[item] ?? item}
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
          data={dispatches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <DispatchRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="🚚" title="No dispatches" description="No dispatch notes match your filters." />}
        />
      )}
    </SafeAreaView>
  );
}