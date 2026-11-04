import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

/** Shown when a refresh fails but older data is still on screen. */
export default function RefreshNotice({ message }: { message: string }) {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  return (
    <View style={{
      marginHorizontal: spacing.base, marginBottom: spacing.sm, padding: spacing.sm,
      backgroundColor: colors.warningLight, borderRadius: borderRadius.md,
    }}>
      <Text style={{ color: colors.warning, fontSize: fontSize.xs }}>
        Couldn't refresh. Showing the last loaded data. {message}
      </Text>
    </View>
  );
}