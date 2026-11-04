import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { styles } from './Home.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawer } from '../../navigation/DrawerContext';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { getRoleLabel } from '../../constants';
import { useHome } from './hooks/useHome';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Section from './components/Section';
import HomeHeader from './components/HomeHeader';
import RefreshNotice from './components/RefreshNotice';
import OverviewGrid from './components/OverviewGrid';
import StockHealthCard from './components/StockHealthCard';
import PurchaseOrdersCard from './components/PurchaseOrdersCard';
import RevenueCard from './components/RevenueCard';
import QuickActions from './components/QuickActions';
import LowStockList from './components/LowStockList';
import WarehouseCapacity from './components/WarehouseCapacity';

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { role } = usePermissions();
  const { openDrawer } = useDrawer();
  const { dashboard: d, lowStock, userName, loading, refreshing, error, refresh, retry } = useHome();

  if (!d) {
    return loading
      ? <Loader fullScreen message="Loading dashboard..." />
      : <ErrorState message={error ?? undefined} onRetry={retry} />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader userName={userName} roleLabel={role ? getRoleLabel(role) : ''} onMenu={openDrawer} />
        {error && <RefreshNotice message={error} />}

        <Section title="OVERVIEW" gap={0}>
          <OverviewGrid data={d} />
        </Section>

        <Section title="ANALYTICS">
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <StockHealthCard data={d} />
            {d.can_view_reports && d.purchase_orders && <PurchaseOrdersCard po={d.purchase_orders} />}
          </View>
        </Section>

        {d.can_view_reports && (
          <Section gap={spacing.sm}>
            <RevenueCard data={d} />
          </Section>
        )}

        <Section title="QUICK ACTIONS">
          <QuickActions />
        </Section>

        {lowStock.length > 0 && (
          <Section title="LOW STOCK ALERTS">
            <LowStockList items={lowStock} />
          </Section>
        )}

        {!!d.warehouses?.length && (
          <Section title="WAREHOUSE CAPACITY">
            <WarehouseCapacity warehouses={d.warehouses} />
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}