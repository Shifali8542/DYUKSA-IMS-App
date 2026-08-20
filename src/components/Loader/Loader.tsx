import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface LoaderProps { message?: string; fullScreen?: boolean; }

export default function Loader({ message, fullScreen = false }: LoaderProps) {
  const { colors, fontSize } = useTheme();
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={[styles.msg, { color: colors.textSecondary, fontSize: fontSize.sm }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:       { alignItems: 'center', justifyContent: 'center', padding: 32 },
  fullScreen: { flex: 1 },
  msg:        { marginTop: 12 },
});
