import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ActivityIndicator,
  Modal, FlatList, Pressable,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Option {
  id: number;
  name: string;
}

interface Props {
  label:        string;
  value:        number | null;
  options:      Option[];
  onSelect:     (id: number | null) => void;
  onCreate:     (name: string) => Promise<Option | null>;
  onDelete?:    (id: number, name: string) => void;
  error?:       string;
  required?:    boolean;
  createLabel?: string;
  extraField?:  { placeholder: string; label: string };
}

export default function InlineCreateField({
  label, value, options, onSelect, onCreate, onDelete, error, required,
  createLabel = 'New', extraField,
}: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreate, setShowCreate]     = useState(false);
  const [newName, setNewName]           = useState('');
  const [extraVal, setExtraVal]         = useState('');
  const [creating, setCreating]         = useState(false);
  const [search, setSearch]             = useState('');

  const selectedOption = options.find((o) => o.id === value);

  const filtered = search.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  function openDropdown() {
    setDropdownOpen(true);
    setSearch('');
    setShowCreate(false);
  }

  function selectItem(id: number | null) {
    onSelect(id);
    setDropdownOpen(false);
    setSearch('');
  }

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
        setDropdownOpen(false);
        setNewName('');
        setExtraVal('');
        setSearch('');
      }
    } finally {
      setCreating(false);
    }
  }

  function handleLongPress(item: Option) {
    if (onDelete) {
      setDropdownOpen(false);
      setTimeout(() => onDelete(item.id, item.name), 200);
    }
  }

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Label */}
      <Text style={{
        color: colors.textSecondary, fontSize: fontSize.xs,
        fontWeight: fontWeight.medium, marginBottom: spacing.xs,
      }}>
        {label}{required ? ' *' : ''}
      </Text>

      {/* Selector button */}
      <TouchableOpacity
        onPress={openDropdown}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
          borderWidth: 1, borderColor: error ? colors.danger : colors.border,
          paddingHorizontal: spacing.base, paddingVertical: 12,
        }}
      >
        <Text style={{
          color: selectedOption ? colors.textPrimary : colors.placeholder,
          fontSize: fontSize.base,
          flex: 1,
        }}>
          {selectedOption ? selectedOption.name : `Select ${label.toLowerCase()}...`}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>▼</Text>
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs }}>{error}</Text>
      )}

      {/* Dropdown Modal */}
      <Modal visible={dropdownOpen} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }}
          onPress={() => setDropdownOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.surface, borderRadius: borderRadius.lg,
              maxHeight: 420, overflow: 'hidden',
              shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
            }}
          >
            {/* Header */}
            <View style={{
              padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
              <Text style={{
                color: colors.textPrimary, fontSize: fontSize.md,
                fontWeight: fontWeight.bold, marginBottom: spacing.sm,
              }}>
                Select {label}
              </Text>

              {/* Search input */}
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor={colors.placeholder}
                autoFocus
                style={{
                  backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
                  borderWidth: 1, borderColor: colors.border,
                  paddingHorizontal: spacing.base, paddingVertical: 10,
                  color: colors.textPrimary, fontSize: fontSize.sm,
                }}
              />
            </View>

            {/* Options list */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              style={{ maxHeight: 220 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                    {search ? `No results for "${search}"` : `No ${label.toLowerCase()} yet`}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.id === value;
                return (
                  <TouchableOpacity
                    onPress={() => selectItem(item.id)}
                    onLongPress={() => handleLongPress(item)}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: spacing.base, paddingVertical: 14,
                      backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                      borderBottomWidth: 0.5, borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{
                      flex: 1, color: isSelected ? colors.primary : colors.textPrimary,
                      fontSize: fontSize.sm, fontWeight: isSelected ? fontWeight.semibold : fontWeight.regular,
                    }}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* Footer — Create new + Clear */}
            <View style={{
              borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.sm,
            }}>
              {/* Inline create form */}
              {showCreate ? (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
                  backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
                  padding: spacing.sm, borderWidth: 1, borderColor: colors.border,
                }}>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Name"
                    placeholderTextColor={colors.placeholder}
                    autoFocus
                    style={{
                      flex: 1, color: colors.textPrimary,
                      fontSize: fontSize.sm, paddingVertical: 4,
                    }}
                  />
                  {extraField && (
                    <TextInput
                      value={extraVal}
                      onChangeText={setExtraVal}
                      placeholder={extraField.placeholder}
                      placeholderTextColor={colors.placeholder}
                      style={{
                        width: 60, color: colors.textPrimary,
                        fontSize: fontSize.sm, paddingVertical: 4, textAlign: 'center',
                      }}
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
                      <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                        Add
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowCreate(false); setNewName(''); setExtraVal(''); }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 18, paddingHorizontal: 4 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => setShowCreate(true)}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: colors.primaryLight, borderRadius: borderRadius.md,
                      paddingVertical: 10, gap: 6,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 16 }}>+</Text>
                    <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                      {createLabel}
                    </Text>
                  </TouchableOpacity>

                  {value && (
                    <TouchableOpacity
                      onPress={() => selectItem(null)}
                      style={{
                        paddingHorizontal: spacing.base, justifyContent: 'center',
                        borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {onDelete && !showCreate && (
                <Text style={{
                  color: colors.textSecondary, fontSize: 9,
                  textAlign: 'center', marginTop: spacing.xs,
                }}>
                  Long-press any item to delete
                </Text>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}