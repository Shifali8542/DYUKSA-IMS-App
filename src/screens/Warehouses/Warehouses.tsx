import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { styles } from './Warehouses.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { WarehouseApi } from '../../api/api';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import type { Warehouse } from '../../types';

export default function WarehousesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function fetchWarehouses(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await WarehouseApi.getWarehouses({ is_active: true });
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load warehouses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchWarehouses(); }, []);

  function renderWarehouse({ item }: { item: Warehouse }) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.base, marginBottom: spacing.sm, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={{ fontSize: 20 }}>🏭</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>{item.name}</Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginTop: 2 }}>{item.code}</Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: item.is_active ? colors.successLight : colors.dangerLight, borderRadius: borderRadius.sm }]}>
            <Text style={{ color: item.is_active ? colors.success : colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.medium, paddingHorizontal: 8, paddingVertical: 2 }}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {(item.city || item.state) && (
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.sm }}>
            📍 {[item.city, item.state, item.pincode].filter(Boolean).join(', ')}
          </Text>
        )}

        {item.address && (
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }} numberOfLines={2}>
            {item.address}
          </Text>
        )}

        {item.capacity > 0 && (
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
            Capacity: {item.capacity} units
          </Text>
        )}
      </View>
    );
  }

  if (loading) return <Loader fullScreen />;
  if (error)   return <ErrorState message={error} onRetry={() => fetchWarehouses()} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <FlatList
        data={warehouses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWarehouse}
        contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchWarehouses(true)} tintColor={colors.primary} />}
        ListHeaderComponent={
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 0.8, marginBottom: spacing.sm }}>
            {warehouses.length} WAREHOUSE{warehouses.length !== 1 ? 'S' : ''}
          </Text>
        }
        ListEmptyComponent={<EmptyState icon="🏭" title="No warehouses" description="No warehouses found." />}
      />
    </SafeAreaView>
  );
}
