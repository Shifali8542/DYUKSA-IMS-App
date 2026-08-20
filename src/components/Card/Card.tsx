import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children:  React.ReactNode;
  style?:    ViewStyle;
  padding?:  number;
}

export default function Card({ children, style, padding }: CardProps) {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.cardBackground,
        borderRadius:    borderRadius.lg,
        padding:         padding ?? spacing.base,
        shadowColor:     colors.cardShadow,
      },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius:  8,
    elevation:     3,
  },
});
