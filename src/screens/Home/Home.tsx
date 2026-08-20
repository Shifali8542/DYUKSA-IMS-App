import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from '../../navigation/MainNavigator';
import { useTheme } from '../../theme/ThemeContext';
import { useHome } from './hooks/useHome';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import { styles } from './Home.styles';
import type { Product } from '../../types';

export default function HomeScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { dashboard, lowStock, userName, loading, error, refresh } = useHome();
  const navigation = useNavigation<any>();
  const { openDrawer } = useDrawer();

  if (loading) return <Loader fullScreen message="Loading dashboard..." />;
  if (error && !dashboard) return <ErrorState message={error} onRetry={refresh} />;

  const d = dashboard;

  const kpis = [
    { label: 'Total Products', value: d?.total_products ?? 0, icon: '📦', bg: '#EEF2FF', color: '#4F46E5' },
    { label: 'Warehouses', value: d?.total_warehouses ?? 0, icon: '🏭', bg: '#F0FDF4', color: '#16A34A' },
    { label: 'Low Stock', value: d?.low_stock_count ?? 0, icon: '⚠️', bg: '#FFFBEB', color: '#D97706' },
    { label: 'Pending Orders', value: d?.pending_orders ?? 0, icon: '📋', bg: '#FFF1F2', color: '#E11D48' },
    { label: 'Dispatches Today', value: d?.today_dispatches ?? 0, icon: '🚚', bg: '#F0F9FF', color: '#0284C7' },
    { label: 'Pending Dispatch', value: d?.pending_dispatches ?? 0, icon: '📤', bg: '#FDF4FF', color: '#A21CAF' },
  ];

  const quickActions = [
    { label: 'Inventory', icon: '📦', onPress: () => navigation.navigate('MainTabs', { screen: 'Inventory' }) },
    { label: 'Orders', icon: '📋', onPress: () => navigation.navigate('MainTabs', { screen: 'Orders' }) },
    { label: 'Warehouses', icon: '🏭', onPress: () => navigation.navigate('Warehouses') },
    { label: 'Alerts', icon: '🔔', onPress: () => navigation.navigate('MainTabs', { screen: 'Alerts' }) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header with Hamburger ─────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.lg,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => openDrawer()}
              style={{
                width: 40, height: 40, borderRadius: borderRadius.md,
                backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
                marginRight: spacing.base, borderWidth: 1, borderColor: colors.border,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
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

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.base }}>
          <Text style={{
            color: colors.textSecondary, fontSize: fontSize.xs,
            fontWeight: fontWeight.semibold, letterSpacing: 1, marginBottom: spacing.sm,
          }}>
            OVERVIEW
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {kpis.map((kpi) => (
              <View
                key={kpi.label}
                style={{
                  width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
                  padding: spacing.base, borderWidth: 1, borderColor: colors.border,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: borderRadius.md,
                  backgroundColor: kpi.bg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
                }}>
                  <Text style={{ fontSize: 22 }}>{kpi.icon}</Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
                  {kpi.value}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                  {kpi.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <Text style={{
            color: colors.textSecondary, fontSize: fontSize.xs,
            fontWeight: fontWeight.semibold, letterSpacing: 1, marginBottom: spacing.sm,
          }}>
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
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>{action.icon}</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Low Stock Alerts ──────────────────────────────────────── */}
        {lowStock.length > 0 && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
            <Text style={{
              color: colors.textSecondary, fontSize: fontSize.xs,
              fontWeight: fontWeight.semibold, letterSpacing: 1, marginBottom: spacing.sm,
            }}>
              LOW STOCK ALERTS
            </Text>
            <View style={{
              backgroundColor: colors.surface, borderRadius: borderRadius.lg,
              borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
            }}>
              {lowStock.map((p: Product, index: number) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => navigation.navigate('ProductDetails', { productId: p.id })}
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
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{p.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>SKU: {p.sku}</Text>
                  </View>
                  <Badge label={`${p.total_stock} left`} variant="danger" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Warehouse Capacity ────────────────────────────────────── */}
        {d?.warehouses && d.warehouses.length > 0 && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
            <Text style={{
              color: colors.textSecondary, fontSize: fontSize.xs,
              fontWeight: fontWeight.semibold, letterSpacing: 1, marginBottom: spacing.sm,
            }}>
              WAREHOUSE CAPACITY
            </Text>
            {d.warehouses.map((wh) => (
              <View key={wh.id} style={{
                backgroundColor: colors.surface, borderRadius: borderRadius.lg,
                padding: spacing.base, marginBottom: spacing.sm,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{wh.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{wh.percent}%</Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }}>
                  <View style={{
                    height: 8, borderRadius: borderRadius.full,
                    width: `${Math.min(wh.percent, 100)}%` as any,
                    backgroundColor: wh.percent > 80 ? '#DC2626' : wh.percent > 60 ? '#D97706' : '#16A34A',
                  }} />
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>{wh.items} items</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}