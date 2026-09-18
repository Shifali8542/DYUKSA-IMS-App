import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { styles } from './Home.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from '../../navigation/DrawerContext';
import { useTheme } from '../../theme/ThemeContext';
import { useHome } from './hooks/useHome';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import StatCard from './components/StatCard';
import MiniDonutChart from './components/MiniDonutChart';
import MiniBarChart from './components/MiniBarChart';


export default function HomeScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { dashboard, lowStock, userName, loading, error, refresh } = useHome();
  const navigation = useNavigation<any>();
  const { openDrawer } = useDrawer();

  if (loading) return <Loader fullScreen message="Loading dashboard..." />;
  if (error && !dashboard) return <ErrorState message={error} onRetry={refresh} />;

  const d = dashboard;

  // ── Quick Actions ──
  const quickActions = [
    { label: 'Inventory', icon: '📦', onPress: () => navigation.navigate('MainTabs', { screen: 'Inventory' }) },
    { label: 'Orders', icon: '📋', onPress: () => navigation.navigate('MainTabs', { screen: 'Orders' }) },
    { label: 'Scan', icon: '📷', onPress: () => navigation.navigate('Scanner') },
    { label: 'Alerts', icon: '🔔', onPress: () => navigation.navigate('MainTabs', { screen: 'Alerts' }) },
  ];

  // ── Stock health data for donut ──
  const totalProducts = d?.total_products ?? 0;
  const lowStockCount = d?.low_stock_count ?? 0;
  const healthyStock = Math.max(totalProducts - lowStockCount, 0);

  // ── PO status data for bar chart ──
  const po = d?.purchase_orders;
  const poBars = po ? [
    { label: 'Draft', value: po.draft, color: '#6B7280' },
    { label: 'Approved', value: po.approved, color: '#3B82F6' },
    { label: 'Received', value: po.received, color: '#10B981' },
    { label: 'Cancelled', value: po.cancelled, color: '#EF4444' },
  ] : [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.lg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => openDrawer()}
              style={{
                width: 40, height: 40, borderRadius: borderRadius.md,
                backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
                marginRight: spacing.base, borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 18 }}>☰</Text>
            </TouchableOpacity>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Good day,</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                {userName || 'User'} 👋
              </Text>
            </View>
          </View>
          <View style={{
            backgroundColor: colors.primaryLight, borderRadius: borderRadius.full,
            paddingHorizontal: 14, paddingVertical: 6,
          }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>IMS</Text>
          </View>
        </View>

        {/* ── KPI Row 1 — Primary Stats ── */}
        <View style={{ paddingHorizontal: spacing.base }}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }]}>
            OVERVIEW
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <StatCard icon="📦" label="Products" value={d?.total_products ?? 0} iconBg="#EEF2FF" />
            <StatCard icon="🏭" label="Warehouses" value={d?.total_warehouses ?? 0} iconBg="#F0FDF4" />
            <StatCard icon="⚠️" label="Low Stock" value={d?.low_stock_count ?? 0} iconBg="#FFFBEB" />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <StatCard icon="📋" label="Pending Orders" value={d?.pending_orders ?? 0} iconBg="#FFF1F2" />
            <StatCard icon="🚚" label="Today Dispatch" value={d?.today_dispatches ?? 0} iconBg="#F0F9FF" />
            <StatCard icon="📤" label="Pending Disp." value={d?.pending_dispatches ?? 0} iconBg="#FDF4FF" />
          </View>
        </View>

        {/* ── Charts Row — Stock Health + PO Status ── */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }]}>
            ANALYTICS
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {/* Stock Health Donut */}
            <Card style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.lg }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: spacing.sm }}>
                STOCK HEALTH
              </Text>
              <MiniDonutChart
                segments={[
                  { value: healthyStock, color: '#10B981', label: 'Healthy' },
                  { value: lowStockCount, color: '#F59E0B', label: 'Low' },
                ]}
                size={110}
                strokeWidth={14}
                centerValue={totalProducts}
                centerLabel="Total"
              />
              <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.base }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                  <Text style={{ color: colors.textSecondary, fontSize: 9 }}>Healthy {healthyStock}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' }} />
                  <Text style={{ color: colors.textSecondary, fontSize: 9 }}>Low {lowStockCount}</Text>
                </View>
              </View>
            </Card>

            {/* PO Status Bar Chart */}
            <Card style={{ flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: spacing.xs }}>
                PURCHASE ORDERS
              </Text>
              {poBars.length > 0 ? (
                <MiniBarChart bars={poBars} height={80} barWidth={24} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>No PO data</Text>
                </View>
              )}
            </Card>
          </View>
        </View>

        {/* ── Revenue Card (if available) ── */}
        {(d?.revenue_30_days || d?.orders_30_days) && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.sm }}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5 }}>
                    LAST 30 DAYS
                  </Text>
                  {d?.revenue_30_days && (
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: 4 }}>
                      ₹{parseFloat(d.revenue_30_days).toLocaleString()}
                    </Text>
                  )}
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    Revenue
                  </Text>
                </View>
                {d?.orders_30_days !== undefined && (
                  <View style={{ alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
                    <Text style={{ color: colors.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>{d.orders_30_days}</Text>
                    <Text style={{ color: colors.primary, fontSize: 9 }}>Orders</Text>
                  </View>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* ── Quick Actions ── */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }]}>
            QUICK ACTIONS
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={action.onPress}
                style={{
                  flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
                  paddingVertical: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>{action.icon}</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Low Stock Alerts ── */}
        {lowStock.length > 0 && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }]}>
              LOW STOCK ALERTS
            </Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {lowStock.map((p, index) => (
                <TouchableOpacity
                  key={p.product_id}
                  onPress={() => navigation.navigate('ProductDetails', { productId: p.product_id })}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: spacing.base,
                    borderBottomWidth: index < lowStock.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: borderRadius.md,
                    backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center', marginRight: spacing.base,
                  }}>
                    <Text style={{ fontSize: 16 }}>⚠️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{p.product_name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>SKU: {p.sku} • {p.warehouse}</Text>
                  </View>
                  <Badge label={`${p.available} left`} variant="danger" />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* ── Warehouse Capacity ── */}
        {d?.warehouses && d.warehouses.length > 0 && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }]}>
              WAREHOUSE CAPACITY
            </Text>
            {d.warehouses.map((wh) => (
              <Card key={wh.id} style={{ marginBottom: spacing.sm }}>
                <View style={[styles.whHeader, { marginBottom: spacing.xs }]}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{wh.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{wh.capacity_percent}%</Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
                  <View style={[styles.progressFill, {
                    borderRadius: borderRadius.full,
                    width: `${Math.min(wh.capacity_percent, 100)}%` as any,
                    backgroundColor: wh.capacity_percent > 80 ? '#DC2626' : wh.capacity_percent > 60 ? '#D97706' : '#16A34A',
                  }]} />
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>{wh.items_on_hand} items</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}