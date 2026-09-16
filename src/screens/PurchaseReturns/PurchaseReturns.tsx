import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePurchaseReturns } from './hooks/usePurchaseReturns';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { RETURN_STATUS_LABEL } from '../../constants';
import type { PurchaseReturn, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function PurchaseReturnsScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<Nav>();
  const { filter, setFilter, search, setSearch, returns, loading, refreshing, error, filters, refresh } = usePurchaseReturns();

  function ReturnRow({ item }: { item: PurchaseReturn }) {
    const totalQty = item.items.reduce((sum, i) => sum + parseFloat(i.quantity), 0);
    const totalValue = item.items.reduce((sum, i) => sum + parseFloat(i.line_total), 0);

    return (
      <TouchableOpacity
        onPress={() => nav.navigate('PurchaseReturnDetail', { returnId: item.id })}
        style={{
          backgroundColor: colors.surface, borderRadius: borderRadius.md,
          padding: spacing.base, marginBottom: spacing.sm,
          borderWidth: 1, borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            {item.number}
          </Text>
          <Badge label={RETURN_STATUS_LABEL[item.status] ?? item.status} variant={statusVariant(item.status)} />
        </View>

        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs }}>{item.supplier_name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
          PO: {item.po_number}  •  {item.warehouse_name}
        </Text>

        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs,
          paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            {item.items.length} items  •  {totalQty} units
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: fontWeight.semibold }}>
            ₹{totalValue.toFixed(2)}
          </Text>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
          {new Date(item.return_date).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Purchase Returns</Text>
      </View>

      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by return# or supplier..." />
      </View>

      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
        <FlatList
          data={filters}
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
                <Text style={{ color: active ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                  {item === 'all' ? 'All' : RETURN_STATUS_LABEL[item] ?? item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? <Loader fullScreen /> : error ? <ErrorState message={error} onRetry={refresh} /> : (
        <FlatList
          data={returns}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ReturnRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="📤" title="No returns" description="No purchase returns found." />}
        />
      )}
    </SafeAreaView>
  );
}