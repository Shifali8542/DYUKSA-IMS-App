import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Customers.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useCustomers } from './hooks/useCustomers';
import SearchBar from '../../components/SearchBar/SearchBar';
import Badge from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import type { Customer, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function CustomersScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { canCreateCustomers } = usePermissions();
  const nav = useNavigation<Nav>();
  const { customers, search, setSearch, loading, refreshing, error, total, refresh } = useCustomers();

  function renderCustomer({ item }: { item: Customer }) {
    return (
      <TouchableOpacity
        onPress={() => nav.navigate('CustomerForm' as any, { customerId: item.id })}
        style={{
          backgroundColor: colors.surface, borderRadius: borderRadius.md,
          padding: spacing.base, marginBottom: spacing.sm,
          borderWidth: 1, borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>
              {item.name}
            </Text>
            <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginTop: 2 }}>
              {item.code}
            </Text>
          </View>
          <Badge label={item.is_active ? 'Active' : 'Inactive'} variant={item.is_active ? 'success' : 'default'} />
        </View>

        {(item.email || item.phone) && (
          <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
            {item.email ? (
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>✉ {item.email}</Text>
            ) : null}
            {item.phone ? (
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>📞 {item.phone}</Text>
            ) : null}
          </View>
        )}

        {item.city ? (
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
            📍 {item.city}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }


  if (loading && customers.length === 0) return <Loader fullScreen message="Loading customers..." />;
  if (error && customers.length === 0) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Customers</Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{total} customers</Text>
      </View>

      {/* Search */}
      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name, code, email..." />
      </View>

      {/* List */}
      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCustomer}
        contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="No customers found"
            description={search ? `No results for "${search}"` : 'Add your first customer.'}
          />
        }
      />

      {/* FAB — Add Customer (role-gated) */}
      {canCreateCustomers && (
        <TouchableOpacity
          onPress={() => nav.navigate('CustomerForm' as any, {})}
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