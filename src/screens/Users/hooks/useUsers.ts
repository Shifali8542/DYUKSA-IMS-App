import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { UserApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import type { ImsDirectoryUser } from '../../../types';

const LEFT_COMPANY = ['resigned', 'terminated', 'inactive', 'absconded'];

export function useUsers() {
  const [users, setUsers] = useState<ImsDirectoryUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const all = await UserApi.getDirectory();
      setUsers(all.filter((u) =>
        u.is_active && !LEFT_COMPANY.includes((u.employment_status ?? '').toLowerCase()),
      ));
    } catch (e: any) {
      setError(parseBackendError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Roles that actually exist in the list, for the filter chips
  const roles = useMemo(
    () => Array.from(
      new Set(users.map((u) => u.ims_role).filter((r): r is string => !!r)),
    ).sort(),
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (role && u.ims_role !== role) return false;
      if (!q) return true;
      return `${u.first_name} ${u.last_name} ${u.email} ${u.emp_id}`.toLowerCase().includes(q);
    });
  }, [users, search, role]);

  return {
    users: filtered, total: users.length, roles,
    search, setSearch, role, setRole,
    loading, refreshing, error,
    refresh: () => load(true),
  };
}