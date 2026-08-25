import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { styles } from './More.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { AuthApi } from '../../api/api';
import { tokenStorage } from '../../utils/tokenStorage';
import type { MainStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
interface Props { onLogout: () => void; }


export default function MoreScreen({ onLogout }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { canCreateCustomers, isAdmin } = usePermissions();
  const nav = useNavigation<Nav>();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { label: 'My Profile', icon: '👤', screen: 'Profile', show: true },
    { label: 'Customers', icon: '👥', screen: 'Customers', show: canCreateCustomers },
    { label: 'Warehouses', icon: '🏭', screen: 'Warehouses', show: true },
    { label: 'Settings', icon: '⚙️', screen: 'Settings', show: true },
  ].filter((item) => item.show);

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            const refresh = await tokenStorage.getRefreshToken();
            if (refresh) await AuthApi.logout(refresh).catch(() => { });
          } finally {
            await tokenStorage.clear();
            onLogout();
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.lg }}>
          More
        </Text>

        <View style={[styles.section, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border, borderWidth: 1 }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => nav.navigate(item.screen as any)}
              style={[
                styles.menuItem,
                {
                  padding: spacing.base,
                  borderBottomWidth: index < menuItems.length - 1 ? 0.5 : 0,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 20, marginRight: spacing.base }}>{item.icon}</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium, flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: colors.dangerLight,
              borderRadius: borderRadius.lg,
              padding: spacing.base,
              marginTop: spacing.base,
              opacity: loggingOut ? 0.5 : 1,
            },
          ]}
        >
          <Text style={{ fontSize: 20, marginRight: spacing.base }}>🚪</Text>
          <Text style={{ color: colors.danger, fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
