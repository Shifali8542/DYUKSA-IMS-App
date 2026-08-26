import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Option {
  id: number;
  name: string;
}

interface Props {
  label: string;
  value: number | null;
  options: Option[];
  onSelect: (id: number | null) => void;
  onCreate: (name: string) => Promise<Option | null>;
  onDelete?: (id: number, name: string) => void;
  error?: string;
  required?: boolean;
  createLabel?: string;
  extraField?: { placeholder: string; label: string };
}

export default function InlineCreateField({
  label, value, options, onSelect, onCreate, onDelete, error, required,
  createLabel = 'new', extraField,
}: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [extraVal, setExtraVal] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const extra = extraField ? (extraVal.trim() || name) : '';
      const created = await onCreate(extraField ? `${name}|${extra}` : name);
      if (created) {
        onSelect(created.id);
        setShowCreate(false);
        setNewName('');
        setExtraVal('');
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
        {label}{required ? ' *' : ''}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs, paddingVertical: 4 }}
      >
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onSelect(active ? null : opt.id)}
              onLongPress={() => onDelete && onDelete(opt.id, opt.name)}
              style={{
                paddingHorizontal: spacing.base,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.full,
                borderWidth: 1,
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text style={{
                color: active ? colors.textInverse : colors.textSecondary,
                fontSize: fontSize.xs, fontWeight: fontWeight.medium,
              }}>
                {opt.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Create button */}
        <TouchableOpacity
          onPress={() => setShowCreate(!showCreate)}
          style={{
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            backgroundColor: showCreate ? colors.primaryLight : 'transparent',
          }}
        >
          <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
            + {createLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Inline create input */}
      {showCreate && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
          marginTop: spacing.sm, backgroundColor: colors.surfaceSecondary,
          borderRadius: borderRadius.md, padding: spacing.sm,
          borderWidth: 1, borderColor: colors.border,
        }}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.base, paddingVertical: 4 }}
            autoFocus
          />
          {extraField && (
            <TextInput
              value={extraVal}
              onChangeText={setExtraVal}
              placeholder={extraField.placeholder}
              placeholderTextColor={colors.placeholder}
              style={{ width: 60, color: colors.textPrimary, fontSize: fontSize.base, paddingVertical: 4, textAlign: 'center' }}
            />
          )}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={creating || !newName.trim()}
            style={{
              backgroundColor: colors.primary, borderRadius: borderRadius.sm,
              paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
              opacity: creating || !newName.trim() ? 0.5 : 1,
            }}
          >
            {creating ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }}>{error}</Text>
      )}
    </View>
  );
}