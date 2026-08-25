import { useState, useCallback, useEffect } from 'react';
import { NotificationApi } from '../../../api/api';
import type { Notification } from '../../../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [markingAll,    setMarkingAll]    = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
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
      await NotificationApi.markRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' as const, read_at: new Date().toISOString() })));
    } catch {}
    finally { setMarkingAll(false); }
  }

  const unreadCount = notifications.filter((n) => n.status !== 'read').length;

  return {
    notifications, loading, refreshing, error,
    markingAll, markAllRead, unreadCount,
    refresh: () => fetchNotifications(true),
  };
}
