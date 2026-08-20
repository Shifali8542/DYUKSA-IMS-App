import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import Button from '../Button/Button';

interface EmptyStateProps {
  title:       string;
  description?: string;
  actionLabel?: string;
  onAction?:   () => void;
  icon?:       string;
}

export default function EmptyState({ title, description, actionLabel, onAction, icon = '📭' }: EmptyStateProps) {
  const { colors, fontSize, spacing } = useTheme();
  return (
    <View style={[styles.wrap, { padding: spacing.xxxl }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.md, marginTop: spacing.base }]}>{title}</Text>
      {description && (
        <Text style={[styles.desc, { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm }]}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.lg }}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { alignItems: 'center', justifyContent: 'center' },
  icon:  { fontSize: 48 },
  title: { fontWeight: '600', textAlign: 'center' },
  desc:  { textAlign: 'center', lineHeight: 22 },
});
