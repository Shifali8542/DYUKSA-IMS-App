import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useWarehouseTransfers, TRANSFER_FILTERS } from './hooks/useWarehouseTransfers';
import { usePermissions } from '../../hooks/usePermissions';
import { TRANSFER_STATUS_LABEL } from '../../constants';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import EmptyState from '../../components/EmptyState/EmptyState';
import type { WarehouseTransfer, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function WarehouseTransfersScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const { canManageTransfers } = usePermissions();
  const {
    transfers, filter, setFilter, search, setSearch,
    loading, refreshing, error, refresh,
  } = useWarehouseTransfers();

  function TransferRow({ item }: { item: WarehouseTransfer }) {
    const isDraft = item.status === 'draft';
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('WarehouseTransferDetail', { transferId: item.id })}
        style={{
          backgroundColor: colors.surface, borderRadius: borderRadius.md,
          padding: spacing.base, marginBottom: spacing.sm,
          borderWidth: 1, borderColor: isDraft ? colors.primary : colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            {item.number}
          </Text>
          <Badge
            label={TRANSFER_STATUS_LABEL[item.status] ?? item.status}
            variant={statusVariant(item.status)}
          />
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
          📦 {item.source_warehouse_name}  →  🏭 {item.destination_warehouse_name}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
            {item.items.length} product{item.items.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.surface, borderBottomColor: colors.border,
        borderBottomWidth: 1, padding: spacing.base,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
          Transfers
        </Text>
        {canManageTransfers && (
          <TouchableOpacity
            onPress={() => navigation.navigate('WarehouseTransferForm')}
            style={{
              backgroundColor: colors.primary, borderRadius: borderRadius.full,
              width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.textInverse, fontSize: 20, fontWeight: fontWeight.bold, marginTop: -2 }}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={{ backgroundColor: colors.surface, padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search transfer number..." />
      </View>

      {/* Filters */}
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <FlatList
          data={TRANSFER_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingVertical: spacing.sm }}
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
                  {item === 'all' ? 'All' : TRANSFER_STATUS_LABEL[item]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List */}
      {loading ? (
        <Loader fullScreen />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={transfers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TransferRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState icon="🔄" title="No transfers found" description="No warehouse transfers match your filters." />
          }
        />
      )}
    </SafeAreaView>
  );
}