import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import Button from '../Button/Button';

interface ErrorStateProps { message?: string; onRetry?: () => void; }

export default function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  const { colors, fontSize, spacing } = useTheme();
  return (
    <View style={[styles.wrap, { padding: spacing.xxxl }]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.md, marginTop: spacing.base }]}>
        Something went wrong
      </Text>
      <Text style={[styles.msg, { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm }]}>
        {message}
      </Text>
      {onRetry && (
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Try Again" onPress={onRetry} variant="outline" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { alignItems: 'center', justifyContent: 'center' },
  icon:  { fontSize: 40 },
  title: { fontWeight: '600', textAlign: 'center' },
  msg:   { textAlign: 'center', lineHeight: 22 },
});
