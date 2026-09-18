import React, { useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useReports, type ReportTab } from './hooks/useReports';
import { usePermissions } from '../../hooks/usePermissions';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Card from '../../components/Card/Card';
import Badge from '../../components/Badge/Badge';
import type { SalesReportRow, InventoryReportRow, PurchaseReportRow } from '../../types';

const TABS: { key: ReportTab; label: string; icon: string }[] = [
    { key: 'sales', label: 'Sales', icon: '📋' },
    { key: 'inventory', label: 'Inventory', icon: '📦' },
    { key: 'purchase', label: 'Purchase', icon: '🛒' },
];

export default function ReportsScreen() {
    const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
    const { canViewReports, canViewInventory } = usePermissions();
    const {
        tab, setTab,
        salesRows, salesSummary,
        invRows, invStockValue, invLowOnly, setInvLowOnly,
        poRows, poSummary,
        loading, refreshing, error,
        refresh, refetchInventory,
    } = useReports();

    useEffect(() => {
        if (invLowOnly !== undefined) refetchInventory();
    }, [invLowOnly]);

    if (loading) return <Loader fullScreen message="Loading reports..." />;
    if (error) return <ErrorState message={error} onRetry={refresh} />;

    // ── Sales Row
    function SalesRow({ item }: { item: SalesReportRow }) {
        return (
            <View style={{
                backgroundColor: colors.surface, borderRadius: borderRadius.md,
                padding: spacing.base, marginBottom: spacing.sm,
                borderWidth: 1, borderColor: colors.border,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                        {item.order_number}
                    </Text>
                    <Text style={{ color: colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                        ₹{parseFloat(item.total).toLocaleString()}
                    </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                    {item.customer} • {item.warehouse}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {new Date(item.order_date).toLocaleDateString()}
                </Text>
            </View>
        );
    }

    // ── Inventory Row
    function InventoryRow({ item }: { item: InventoryReportRow }) {
        return (
            <View style={{
                backgroundColor: colors.surface, borderRadius: borderRadius.md,
                padding: spacing.base, marginBottom: spacing.sm,
                borderWidth: 1, borderColor: item.is_low_stock ? colors.danger : colors.border,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                            {item.product_name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                            SKU: {item.sku} • {item.warehouse}
                        </Text>
                    </View>
                    {item.is_low_stock && <Badge label="Low Stock" variant="danger" />}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                        On Hand: {item.on_hand} • Available: {item.available}
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                        ₹{parseFloat(item.stock_value).toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    }

    // ── Purchase Row
    function PurchaseRow({ item }: { item: PurchaseReportRow }) {
        return (
            <View style={{
                backgroundColor: colors.surface, borderRadius: borderRadius.md,
                padding: spacing.base, marginBottom: spacing.sm,
                borderWidth: 1, borderColor: colors.border,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                        {item.po_number}
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                        ₹{parseFloat(item.total).toLocaleString()}
                    </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                    {item.supplier} • {item.warehouse}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {new Date(item.order_date).toLocaleDateString()} • {item.items_count} items
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{
                backgroundColor: colors.surface, borderBottomColor: colors.border,
                borderBottomWidth: 1, padding: spacing.base,
            }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                    Reports
                </Text>
            </View>

            {/* Tabs */}
            <View style={{
                flexDirection: 'row', backgroundColor: colors.surface,
                borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
                {TABS.map((t) => {
                    const active = tab === t.key;
                    return (
                        <TouchableOpacity
                            key={t.key}
                            onPress={() => setTab(t.key)}
                            style={{
                                flex: 1, paddingVertical: spacing.base, alignItems: 'center',
                                borderBottomWidth: 2,
                                borderBottomColor: active ? colors.primary : 'transparent',
                            }}
                        >
                            <Text style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</Text>
                            <Text style={{
                                color: active ? colors.primary : colors.textSecondary,
                                fontSize: fontSize.xs, fontWeight: active ? fontWeight.bold : fontWeight.medium,
                            }}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Content */}
            <FlatList<SalesReportRow | InventoryReportRow | PurchaseReportRow>
                data={
                    tab === 'sales' ? salesRows :
                        tab === 'inventory' ? invRows : poRows
                }
                keyExtractor={(_, i) => String(i)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
                ListHeaderComponent={
                    <View style={{ padding: spacing.base }}>
                        {/* Summary card */}
                        {tab === 'sales' && salesSummary && canViewReports && (
                            <Card style={{ marginBottom: spacing.base, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Total Revenue</Text>
                                    <Text style={{ color: colors.success, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                                        ₹{parseFloat(salesSummary.total_revenue).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Orders</Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                                        {salesSummary.order_count}
                                    </Text>
                                </View>
                            </Card>
                        )}

                        {tab === 'inventory' && canViewInventory && (
                            <Card style={{ marginBottom: spacing.base }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Total Stock Value</Text>
                                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                                            ₹{parseFloat(invStockValue).toLocaleString()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setInvLowOnly(!invLowOnly)}
                                        style={{
                                            paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
                                            borderRadius: borderRadius.full, borderWidth: 1,
                                            backgroundColor: invLowOnly ? colors.danger : colors.surface,
                                            borderColor: invLowOnly ? colors.danger : colors.border,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
                                            color: invLowOnly ? colors.textInverse : colors.textSecondary,
                                        }}>
                                            ⚠️ Low Stock Only
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        )}

                        {tab === 'purchase' && poSummary && canViewReports && (
                            <Card style={{ marginBottom: spacing.base, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Total Purchased</Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                                        ₹{parseFloat(poSummary.total_value).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>POs</Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                                        {poSummary.po_count}
                                    </Text>
                                </View>
                            </Card>
                        )}
                    </View>
                }
                renderItem={({ item }) =>
                    tab === 'sales' ? <SalesRow item={item as SalesReportRow} /> :
                        tab === 'inventory' ? <InventoryRow item={item as unknown as InventoryReportRow} /> :
                            <PurchaseRow item={item as unknown as PurchaseReportRow} />
                }
                contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 40 }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Text style={{ fontSize: 32 }}>📊</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm }}>
                            No data available
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}