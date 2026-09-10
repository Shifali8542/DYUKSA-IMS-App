import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Invoices.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useInvoices, type InvoiceFilter } from './hooks/useInvoices';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { INVOICE_STATUS_LABEL } from '../../constants';
import type { Invoice, MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const FILTERS: InvoiceFilter[] = ['all', 'draft', 'finalized', 'partially_paid', 'paid', 'overdue', 'cancelled'];

export default function InvoicesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<Nav>();
  const {
    filter, setFilter, search, setSearch,
    invoices, loading, refreshing, error, refresh,
  } = useInvoices();

  function InvoiceRow({ item }: { item: Invoice }) {
    const isPaid = item.status === 'paid';
    const isOverdue = item.status === 'overdue';

    return (
      <TouchableOpacity
        onPress={() => nav.navigate('InvoiceDetail', { invoiceId: item.id })}
        style={{
          backgroundColor: colors.surface, borderRadius: borderRadius.md,
          padding: spacing.base, marginBottom: spacing.sm,
          borderColor: isOverdue ? colors.danger : colors.border, borderWidth: 1,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            {item.number}
          </Text>
          <Badge
            label={INVOICE_STATUS_LABEL[item.status] ?? item.status}
            variant={statusVariant(item.status)}
          />
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
          {item.customer_name}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
            {new Date(item.invoice_date).toLocaleDateString()}
          </Text>
          <Text style={{ color: isPaid ? colors.success : colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            ₹{item.total}
          </Text>
        </View>

        {!isPaid && parseFloat(item.balance_due) > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
              Due: {new Date(item.due_date).toLocaleDateString()}
            </Text>
            <Text style={{ color: isOverdue ? colors.danger : colors.warning, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
              Balance: ₹{item.balance_due}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Invoices</Text>
        <TouchableOpacity
          onPress={() => nav.navigate('InvoiceForm')}
          style={{
            backgroundColor: colors.primary, borderRadius: borderRadius.full,
            width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.textInverse, fontSize: 20, fontWeight: fontWeight.bold, marginTop: -2 }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search invoices..." />
      </View>

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
                  {item === 'all' ? 'All' : INVOICE_STATUS_LABEL[item] ?? item}
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
          data={invoices}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <InvoiceRow item={item} />}
          contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="🧾" title="No invoices found" description="No invoices match your filters." />}
        />
      )}
    </SafeAreaView>
  );
}