import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styles } from './Notifications.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { NotificationApi } from '../../services/Api';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import Button from '../../components/Button/Button';
import { NOTIFICATION_TYPE_LABEL } from '../../constants';
import type { Notification } from '../../types';

const TYPE_ICONS: Record<string, string> = {
  low_stock:       '⚠️',
  order_confirmed: '✅',
  order_delivered: '📦',
  po_received:     '📥',
  transfer_done:   '🔄',
  invoice_overdue: '💸',
  general:         'ℹ️',
};

export default function NotificationsScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [markingAll,    setMarkingAll]    = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await NotificationApi.getNotifications();
      setNotifications(res.results ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await NotificationApi.markRead([]);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
    finally { setMarkingAll(false); }
  }

  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function renderItem({ item }: { item: Notification }) {
    const icon = TYPE_ICONS[item.notification_type] ?? 'ℹ️';
    return (
      <View style={[
        styles.item,
        {
          backgroundColor: item.is_read ? colors.surface : colors.primaryLight,
          borderRadius:    borderRadius.md,
          padding:         spacing.base,
          marginBottom:    spacing.sm,
          borderLeftWidth: 4,
          borderLeftColor: item.is_read ? colors.border : colors.primary,
        },
      ]}>
        <View style={styles.itemRow}>
          <Text style={{ fontSize: 22, marginRight: spacing.sm }}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                {NOTIFICATION_TYPE_LABEL[item.notification_type] ?? 'Notification'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                {getTimeAgo(item.created_at)}
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, lineHeight: 20 }}>{item.message}</Text>
          </View>
        </View>
      </View>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <Loader fullScreen />;
  if (error)   return <ErrorState message={error} onRetry={fetchNotifications} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.base }]}>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Button title="Mark all read" onPress={markAllRead} loading={markingAll} variant="ghost" size="sm" />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchNotifications(true)} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />}
      />
    </SafeAreaView>
  );
}
