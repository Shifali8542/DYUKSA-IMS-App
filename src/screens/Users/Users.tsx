import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './Users.styles';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useUsers } from './hooks/useUsers';
import UserCard from './components/UserCard';
import RoleFilter from './components/RoleFilter';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';

export default function UsersScreen() {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { canManageUsers } = usePermissions();
  const {
    users, total, roles, search, setSearch, role, setRole,
    loading, refreshing, error, refresh,
  } = useUsers();

  if (!canManageUsers) {
    return (
      <EmptyState icon="🔒" title="Admins only" description="You don't have access to the user list." />
    );
  }
  if (loading && total === 0) return <Loader fullScreen message="Loading users..." />;
  if (error && total === 0) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
          Team Members
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
          {total} active users · Roles are managed in Dyuksa Central
        </Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, email, employee ID..." />
      </View>
      <View style={{ backgroundColor: colors.surface }}>
        <RoleFilter roles={roles} selected={role} onSelect={setRole} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={[styles.list, { padding: spacing.base }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="No users found"
            description={search || role ? 'Try a different search or filter.' : 'No active IMS users yet.'}
          />
        }
      />
    </SafeAreaView>
  );
}