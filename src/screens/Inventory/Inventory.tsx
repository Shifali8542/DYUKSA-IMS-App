import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Inventory.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useInventory } from './hooks/useInventory';
import SearchBar from '../../components/SearchBar/SearchBar';
import Badge from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import type { Product, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function InventoryScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<Nav>();
  const {
    products, categories, search, setSearch,
    category, setCategory,
    loading, refreshing, error,
    hasMore, total, loadMore, refresh,
  } = useInventory();

  function renderProduct({ item }: { item: Product }) {
    return (
      <TouchableOpacity
        onPress={() => nav.navigate('ProductDetails', { productId: item.id })}
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.base,
            marginBottom: spacing.sm,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <View style={styles.rowLeft}>
          <Text style={[styles.name, { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium }]}>
            {item.name}
          </Text>
          <Text style={[styles.sku, { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }]}>
            SKU: {item.sku}
          </Text>
          {item.category_name && (
            <Text style={[styles.cat, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              {item.category_name}
            </Text>
          )}
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.stock, { color: parseFloat(item.available_stock ?? '0') <= parseFloat(item.reorder_level ?? '0') ? colors.danger : colors.success, fontSize: fontSize.lg, fontWeight: fontWeight.bold }]}>
            {item.available_stock ?? '0'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>units</Text>
          {parseFloat(item.available_stock ?? '0') <= parseFloat(item.reorder_level ?? '0') && <Badge label="Low" variant="danger" />}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading && products.length === 0) return <Loader fullScreen message="Loading inventory..." />;
  if (error && products.length === 0) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing.base, backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }]}>
          Inventory
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{total} products</Text>
      </View>

      {/* Search */}
      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products, SKU..." />
      </View>

      {/* Category filter */}
      {categories.length > 0 && (
        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
          <FlatList
            data={[{ id: undefined, name: 'All' } as any, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id ?? 'all')}
            renderItem={({ item }) => {
              const active = category === item.id;
              return (
                <TouchableOpacity
                  onPress={() => setCategory(item.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.full,
                      paddingHorizontal: spacing.base,
                      paddingVertical: spacing.xs,
                      marginRight: spacing.xs,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={{ color: active ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* List */}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        contentContainerStyle={[styles.list, { padding: spacing.base }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="No products found"
            description={search ? `No results for "${search}"` : 'Your inventory is empty.'}
          />
        }
        ListFooterComponent={hasMore ? <Loader /> : null}
      />
      {/* FAB — Add Product */}
      <TouchableOpacity
        onPress={() => nav.navigate('ProductForm', {})}
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
    </SafeAreaView>
  );
}
