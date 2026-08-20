import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?:      string;
  error?:      string;
  rightIcon?:  React.ReactNode;
  onRightIconPress?: () => void;
}

export default function Input({ label, error, rightIcon, onRightIconPress, style, ...rest }: InputProps) {
  const { colors, spacing, fontSize, borderRadius, fontWeight } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused ? colors.inputFocusBorder : colors.inputBorder;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputRow,
        {
          backgroundColor: colors.inputBackground,
          borderColor,
          borderRadius:    borderRadius.md,
          borderWidth:     1.5,
          paddingHorizontal: spacing.base,
        },
      ]}>
        <TextInput
          {...rest}
          onFocus={(e) => { setFocused(true);  rest.onFocus?.(e);  }}
          onBlur={(e)  => { setFocused(false); rest.onBlur?.(e);   }}
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            { color: colors.textPrimary, fontSize: fontSize.base, paddingVertical: spacing.md },
            style,
          ]}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:  { marginBottom: 16 },
  label:    {},
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input:    { flex: 1 },
  error:    {},
});
