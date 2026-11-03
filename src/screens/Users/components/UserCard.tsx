import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { getRoleLabel } from '../../../constants';
import Badge from '../../../components/Badge/Badge';
import type { ImsDirectoryUser } from '../../../types';

function fullName(u: ImsDirectoryUser): string {
  return `${u.first_name} ${u.last_name}`.trim() || u.username;
}

export default function UserCard({ user }: { user: ImsDirectoryUser }) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const name = fullName(user);

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface, borderRadius: borderRadius.md,
      padding: spacing.base, marginBottom: spacing.sm,
      borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 22, marginRight: spacing.base,
        backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>
          {name}
        </Text>
        <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
          {user.email}
        </Text>
        {user.emp_id ? (
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
            ID: {user.emp_id}
          </Text>
        ) : null}
      </View>

      <Badge label={getRoleLabel(user.ims_role)} variant="primary" />
    </View>
  );
}