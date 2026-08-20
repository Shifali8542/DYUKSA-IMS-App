import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title:      string;
  onPress:    () => void;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  style?:     ViewStyle;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, style,
}: ButtonProps) {
  const { colors, spacing, fontSize, borderRadius, fontWeight } = useTheme();

  const isDisabled = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary:   colors.primary,
    secondary: colors.surfaceSecondary,
    outline:   'transparent',
    danger:    colors.danger,
    ghost:     'transparent',
  };

  const textColor: Record<ButtonVariant, string> = {
    primary:   colors.textInverse,
    secondary: colors.textPrimary,
    outline:   colors.primary,
    danger:    colors.textInverse,
    ghost:     colors.primary,
  };

  const pad: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number }> = {
    sm: { paddingVertical: spacing.xs,  paddingHorizontal: spacing.md },
    md: { paddingVertical: spacing.md,  paddingHorizontal: spacing.xl },
    lg: { paddingVertical: spacing.base,paddingHorizontal: spacing.xxl },
  };

  const fs: Record<ButtonSize, number> = {
    sm: fontSize.sm,
    md: fontSize.base,
    lg: fontSize.md,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor:   bg[variant],
          borderColor:       variant === 'outline' ? colors.primary : 'transparent',
          borderWidth:       variant === 'outline' ? 1.5 : 0,
          borderRadius:      borderRadius.md,
          opacity:           isDisabled ? 0.5 : 1,
          alignSelf:         fullWidth ? 'stretch' : 'flex-start',
          ...pad[size],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} size="small" />
      ) : (
        <Text style={{ color: textColor[variant], fontSize: fs[size], fontWeight: fontWeight.semibold }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
