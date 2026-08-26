import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { styles } from './Suppliers.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useSuppliers } from './hooks/useSuppliers';
import type { CreateSupplierPayload } from './hooks/useSuppliers';
import SearchBar from '../../components/SearchBar/SearchBar';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import type { Supplier } from '../../types';

const EMPTY_FORM: CreateSupplierPayload = {
  code: '', name: '', contact_name: '', email: '', phone: '',
  tax_number: '', address: '', city: '', state: '', pincode: '',
  payment_terms: '', notes: '',
};

export default function SuppliersScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { canManagePurchasing, isAdmin } = usePermissions();
  const canCreate = canManagePurchasing || isAdmin;
  const { suppliers, search, setSearch, loading, refreshing, error, creating, refresh, createSupplier } = useSuppliers();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateSupplierPayload>(EMPTY_FORM);
  const [expanded, setExpanded] = useState<number | null>(null);

  function setField(key: keyof CreateSupplierPayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.code.trim()) return;
    const success = await createSupplier({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    });
    if (success) {
      setShowForm(false);
      setForm(EMPTY_FORM);
    }
  }

  function renderSupplier({ item }: { item: Supplier }) {
    const isExpanded = expanded === item.id;
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => setExpanded(isExpanded ? null : item.id)}>
        <Card style={{ marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 48, height: 48, borderRadius: borderRadius.lg,
              backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
              marginRight: spacing.base,
            }}>
              <Text style={{ fontSize: 24 }}>🏢</Text>
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

          {(item.email || item.phone) && (
            <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
              {item.email ? <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>✉ {item.email}</Text> : null}
              {item.phone ? <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>📞 {item.phone}</Text> : null}
            </View>
          )}

          {item.city && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>📍</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.city}</Text>
            </View>
          )}

          {isExpanded && (
            <View style={{
              marginTop: spacing.base, paddingTop: spacing.base,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}>
              {item.contact_name ? <DetailRow label="Contact" value={item.contact_name} /> : null}
              {item.tax_number ? <DetailRow label="GST/Tax" value={item.tax_number} /> : null}
              {item.address ? <DetailRow label="Address" value={item.address} /> : null}
              {item.payment_terms ? <DetailRow label="Terms" value={item.payment_terms} /> : null}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }

  function DetailRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, width: 70 }}>{label}</Text>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, flex: 1 }}>{value}</Text>
      </View>
    );
  }

  if (loading) return <Loader fullScreen message="Loading suppliers..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1,
        padding: spacing.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Suppliers</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</Text>
        </View>
        {canCreate && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={{
              backgroundColor: colors.primary, borderRadius: borderRadius.md,
              paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Text style={{ color: colors.textInverse, fontSize: 16 }}>+</Text>
            <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Add Supplier</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={{ padding: spacing.base, backgroundColor: colors.surface }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name, code, email..." />
      </View>

      {/* List */}
      <FlatList
        data={suppliers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSupplier}
        contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="🏢"
            title="No suppliers"
            description={canCreate ? 'Tap + to add your first supplier.' : 'No suppliers configured yet.'}
          />
        }
      />

      {/* Create Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }}
          >
            <Pressable onPress={() => {}} style={{
              backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              maxHeight: '90%',
            }}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border,
              }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Add Supplier</Text>
                <TouchableOpacity onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 24 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: spacing.base }} keyboardShouldPersistTaps="handled">
                <FormField label="Supplier Name *" value={form.name} onChange={(v) => setField('name', v)} placeholder="e.g. ABC Traders" />
                <FormField label="Supplier Code *" value={form.code} onChange={(v) => setField('code', v)} placeholder="e.g. SUP-001" autoCapitalize="characters" />

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <FormField label="Contact Person" value={form.contact_name ?? ''} onChange={(v) => setField('contact_name', v)} placeholder="Name" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormField label="Phone" value={form.phone ?? ''} onChange={(v) => setField('phone', v)} placeholder="Phone" keyboardType="phone-pad" />
                  </View>
                </View>

                <FormField label="Email" value={form.email ?? ''} onChange={(v) => setField('email', v)} placeholder="email@example.com" keyboardType="email-address" />

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <FormField label="City" value={form.city ?? ''} onChange={(v) => setField('city', v)} placeholder="City" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormField label="State" value={form.state ?? ''} onChange={(v) => setField('state', v)} placeholder="State" />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <FormField label="Pincode" value={form.pincode ?? ''} onChange={(v) => setField('pincode', v)} placeholder="Pincode" keyboardType="number-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormField label="GST / Tax ID" value={form.tax_number ?? ''} onChange={(v) => setField('tax_number', v)} placeholder="GSTIN" />
                  </View>
                </View>

                <FormField label="Payment Terms" value={form.payment_terms ?? ''} onChange={(v) => setField('payment_terms', v)} placeholder="e.g. Net 30" />
                <FormField label="Address" value={form.address ?? ''} onChange={(v) => setField('address', v)} placeholder="Full address" multiline />

                <View style={{ marginTop: spacing.base, marginBottom: spacing.xl }}>
                  <Button title={creating ? 'Creating...' : 'Create Supplier'} onPress={handleCreate} loading={creating} fullWidth size="lg" />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({ label, value, onChange, placeholder, multiline, keyboardType, autoCapitalize }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  multiline?: boolean; keyboardType?: any; autoCapitalize?: any;
}) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
          borderWidth: 1, borderColor: colors.border,
          paddingHorizontal: 14, paddingVertical: 10,
          color: colors.textPrimary, fontSize: fontSize.sm,
          ...(multiline ? { minHeight: 60, textAlignVertical: 'top' as any } : {}),
        }}
      />
    </View>
  );
}