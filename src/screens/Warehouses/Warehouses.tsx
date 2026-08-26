import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { styles } from './Warehouses.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useWarehouses } from './hooks/useWarehouses';
import type { CreateWarehousePayload } from './hooks/useWarehouses';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import type { Warehouse } from '../../types';

const EMPTY_FORM: CreateWarehousePayload = {
  name: '', code: '', address: '', city: '', state: '', pincode: '', capacity: 0,
};

export default function WarehousesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { isAdmin } = usePermissions();
  const { warehouses, loading, refreshing, error, creating, refresh, createWarehouse } = useWarehouses();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateWarehousePayload>(EMPTY_FORM);
  const [expanded, setExpanded] = useState<number | null>(null);

  function setField(key: keyof CreateWarehousePayload, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    if (!form.code.trim()) return;
    const success = await createWarehouse({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      capacity: Number(form.capacity) || 0,
    });
    if (success) {
      setShowForm(false);
      setForm(EMPTY_FORM);
    }
  }

  function renderWarehouse({ item }: { item: Warehouse }) {
    const isExpanded = expanded === item.id;
    const capacityPct = item.capacity > 0 ? Math.min(100, Math.round((0 / item.capacity) * 100)) : 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(isExpanded ? null : item.id)}
      >
        <Card style={{ marginBottom: spacing.sm }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 48, height: 48, borderRadius: borderRadius.lg,
              backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
              marginRight: spacing.base,
            }}>
              <Text style={{ fontSize: 24 }}>🏭</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                {item.name}
              </Text>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 1 }}>
                {item.code}
              </Text>
            </View>
            <Badge label={item.is_active ? 'Active' : 'Inactive'} variant={item.is_active ? 'success' : 'default'} />
          </View>

          {/* Location row */}
          {(item.city || item.state) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>📍</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                {[item.city, item.state, item.pincode].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {/* Capacity bar */}
          {item.capacity > 0 && (
            <View style={{ marginTop: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Capacity</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.capacity} units</Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }}>
                <View style={{
                  height: 6, borderRadius: borderRadius.full,
                  width: `${capacityPct}%` as any,
                  backgroundColor: capacityPct > 80 ? '#DC2626' : capacityPct > 60 ? '#D97706' : '#10B981',
                  minWidth: capacityPct > 0 ? 6 : 0,
                }} />
              </View>
            </View>
          )}

          {/* Expanded details */}
          {isExpanded && (
            <View style={{
              marginTop: spacing.base, paddingTop: spacing.base,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}>
              {item.address ? (
                <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 70 }}>Address</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, flex: 1 }}>{item.address}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 70 }}>Status</Text>
                <Text style={{ color: item.is_active ? colors.success : colors.danger, fontSize: fontSize.xs }}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 70 }}>Capacity</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs }}>
                  {item.capacity > 0 ? `${item.capacity} units` : 'Unlimited'}
                </Text>
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }

  if (loading) return <Loader fullScreen message="Loading warehouses..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1,
        padding: spacing.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
            Warehouses
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
            {warehouses.length} location{warehouses.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={{
              backgroundColor: colors.primary, borderRadius: borderRadius.md,
              paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Text style={{ color: colors.textInverse, fontSize: 16 }}>+</Text>
            <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
              Add Warehouse
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={warehouses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWarehouse}
        contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="🏭"
            title="No warehouses"
            description={isAdmin ? 'Tap + to add your first warehouse.' : 'No warehouses configured yet.'}
          />
        }
      />

      {/* ── Create Warehouse Modal (Admin only) ── */}
      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              maxHeight: '85%',
            }}>
              {/* Modal header */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border,
              }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                  Add Warehouse
                </Text>
                <TouchableOpacity onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 24 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: spacing.base }} keyboardShouldPersistTaps="handled">
                {/* Name */}
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                  Warehouse Name *
                </Text>
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setField('name', v)}
                  placeholder="e.g. Main Warehouse"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, {
                    color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                  }]}
                />

                {/* Code */}
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                  Warehouse Code *
                </Text>
                <TextInput
                  value={form.code}
                  onChangeText={(v) => setField('code', v)}
                  placeholder="e.g. WH-01"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="characters"
                  style={[styles.input, {
                    color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                  }]}
                />

                {/* City + State row */}
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                      City
                    </Text>
                    <TextInput
                      value={form.city}
                      onChangeText={(v) => setField('city', v)}
                      placeholder="City"
                      placeholderTextColor={colors.placeholder}
                      style={[styles.input, {
                        color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                        borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                      }]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                      State
                    </Text>
                    <TextInput
                      value={form.state}
                      onChangeText={(v) => setField('state', v)}
                      placeholder="State"
                      placeholderTextColor={colors.placeholder}
                      style={[styles.input, {
                        color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                        borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                      }]}
                    />
                  </View>
                </View>

                {/* Pincode + Capacity row */}
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                      Pincode
                    </Text>
                    <TextInput
                      value={form.pincode}
                      onChangeText={(v) => setField('pincode', v)}
                      placeholder="Pincode"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="number-pad"
                      style={[styles.input, {
                        color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                        borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                      }]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                      Capacity (units)
                    </Text>
                    <TextInput
                      value={form.capacity ? String(form.capacity) : ''}
                      onChangeText={(v) => setField('capacity', parseInt(v) || 0)}
                      placeholder="0 = unlimited"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="number-pad"
                      style={[styles.input, {
                        color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                        borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                      }]}
                    />
                  </View>
                </View>

                {/* Address */}
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                  Address
                </Text>
                <TextInput
                  value={form.address}
                  onChangeText={(v) => setField('address', v)}
                  placeholder="Full address"
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={2}
                  style={[styles.input, styles.textArea, {
                    color: colors.textPrimary, backgroundColor: colors.surfaceSecondary,
                    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
                  }]}
                />

                {/* Submit */}
                <View style={{ marginTop: spacing.base, marginBottom: spacing.xl }}>
                  <Button
                    title={creating ? 'Creating...' : 'Create Warehouse'}
                    onPress={handleCreate}
                    loading={creating}
                    fullWidth
                    size="lg"
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}