import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useStockMovements, MOVEMENT_FILTERS } from './hooks/useStockMovements';
import { MOVEMENT_TYPE_ICON, MOVEMENT_TYPE_COLOR, MOVEMENT_TYPE_LABEL } from '../../constants';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import EmptyState from '../../components/EmptyState/EmptyState';
import type { StockMovement, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function StockMovementsScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const {
    movements, filter, setFilter, search, setSearch,
    loading, refreshing, error, refresh,
  } = useStockMovements();

  function MovementRow({ item }: { item: StockMovement }) {
    const isPositive = parseFloat(item.quantity) > 0;
    const tc = MOVEMENT_TYPE_COLOR[item.movement_type] ?? { bg: colors.surfaceSecondary, text: colors.textSecondary };
    const icon = MOVEMENT_TYPE_ICON[item.movement_type] ?? '📋';
    const label = MOVEMENT_TYPE_LABEL[item.movement_type] ?? item.movement_type;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { productId: item.product })}
        style={{
          backgroundColor: colors.surface, borderRadius: borderRadius.md,
          padding: spacing.base, marginBottom: spacing.sm,
          borderWidth: 1, borderColor: colors.border,
          flexDirection: 'row', alignItems: 'center', gap: spacing.base,
        }}
      >
        {/* Type icon */}
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: tc.bg, alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              {item.product_name}
            </Text>
            <Text style={{
              color: isPositive ? '#10B981' : '#DC2626',
              fontSize: fontSize.sm, fontWeight: fontWeight.bold,
            }}>
              {isPositive ? '+' : ''}{item.quantity}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ color: tc.text, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
              {label}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              Balance: {item.balance_after}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              {item.product_sku} • {item.warehouse_name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          {item.source_reference ? (
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
              Ref: {item.source_reference}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search */}
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, padding: spacing.base }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search reference, notes..." />
      </View>

      {/* Filter chips */}
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <FlatList
          data={MOVEMENT_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingVertical: spacing.sm }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item.key)}
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
                  {item.label}
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
          data={movements}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MovementRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState icon="📋" title="No movements found" description="No stock movements match your filters." />
          }
        />
      )}
    </SafeAreaView>
  );
}