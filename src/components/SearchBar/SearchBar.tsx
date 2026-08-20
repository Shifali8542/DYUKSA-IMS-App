import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SearchBarProps {
  value:          string;
  onChangeText:   (text: string) => void;
  placeholder?:   string;
  onClear?:       () => void;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search...', onClear }: SearchBarProps) {
  const { colors, spacing, fontSize, borderRadius } = useTheme();

  return (
    <View style={[
      styles.wrap,
      {
        backgroundColor:  colors.inputBackground,
        borderColor:      colors.border,
        borderRadius:     borderRadius.md,
        paddingHorizontal: spacing.base,
        borderWidth:      1,
      },
    ]}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        returnKeyType="search"
        style={[styles.input, { color: colors.textPrimary, fontSize: fontSize.base, paddingVertical: spacing.md }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => { onChangeText(''); onClear?.(); }}>
          <Text style={[styles.clear, { color: colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center' },
  icon:  { fontSize: 16, marginRight: 8 },
  input: { flex: 1 },
  clear: { fontSize: 16, paddingLeft: 8 },
});
