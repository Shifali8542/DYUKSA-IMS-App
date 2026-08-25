import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from './Profile.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import type { User, JwtPayload } from '../../types';
import { getRoleLabel } from '../../constants';
import { UserApi } from '../../api/api';
import { tokenStorage } from '../../utils/tokenStorage';
import { decodeJwtPayload } from '../../utils/jwt';
import Loader from '../../components/Loader/Loader';
import Card from '../../components/Card/Card';
import Badge from '../../components/Badge/Badge';

export default function ProfileScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [user,    setUser]    = useState<User | null>(null);
  const [jwt,     setJwt]     = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, token] = await Promise.all([UserApi.getMe(), tokenStorage.getAccessToken()]);
        setUser(u);
        if (token) setJwt(decodeJwtPayload(token));
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <Loader fullScreen />;

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
    : jwt ? [jwt.first_name, jwt.last_name].filter(Boolean).join(' ') || jwt.username : 'User';

  const role    = user?.ims_role ?? jwt?.platform_roles?.ims ?? '—';
  const email   = user?.email    ?? jwt?.email    ?? '—';
  const orgName = jwt?.org_name  ?? '—';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Avatar + name */}
        <Card style={{ alignItems: 'center', marginBottom: spacing.base, paddingVertical: spacing.xl }}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.full }]}>
            <Text style={{ fontSize: 36, color: colors.primary, fontWeight: fontWeight.bold }}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: spacing.base }}>
            {displayName}
          </Text>
          <Badge label={getRoleLabel(String(role))} variant="primary" />
        </Card>

        {/* Info */}
        <Card>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Account Info
          </Text>
          {[
            { label: 'Email',        value: email },
            { label: 'Username',     value: user?.username ?? jwt?.username ?? '—' },
            { label: 'Organisation', value: orgName },
            { label: 'Role',         value: getRoleLabel(String(role)) },
            { label: 'Status',       value: user?.is_active ? 'Active' : 'Inactive' },
          ].map(({ label, value }) => (
            <View key={label} style={[styles.row, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 1.5, textAlign: 'right' }} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
