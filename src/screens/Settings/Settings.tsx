import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './Settings.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeMode } from '../../theme/ThemeContext';
import Card from '../../components/Card/Card';

export default function SettingsScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius, isDark, mode, setMode } = useTheme();

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'System Default', value: 'system' },
    { label: 'Light',          value: 'light'  },
    { label: 'Dark',           value: 'dark'   },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Theme */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Appearance
          </Text>
          {themeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setMode(opt.value)}
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === opt.value ? colors.primaryLight : colors.surfaceSecondary,
                  borderRadius:    borderRadius.md,
                  padding:         spacing.base,
                  marginBottom:    spacing.xs,
                  borderWidth:     1,
                  borderColor:     mode === opt.value ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text style={{ color: mode === opt.value ? colors.primary : colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium }}>
                {opt.label}
              </Text>
              {mode === opt.value && <Text style={{ color: colors.primary }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Card>

        {/* App Info */}
        <Card>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            App Information
          </Text>
          {[
            ['App Name',  'DYUKSA IMS'],
            ['Version',   '1.0.0'],
            ['Platform',  'React Native + Expo SDK 54'],
            ['Backend',   'Django 6.x REST API'],
          ].map(([label, value]) => (
            <View key={label} style={[styles.row, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{value}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
