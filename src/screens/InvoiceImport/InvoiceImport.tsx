import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ProductApi, WarehouseApi } from '../../api/api';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import type { MainStackParamList, InvoiceRow, InvoiceImportSummary, Warehouse } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'InvoiceImport'>;
type Phase = 'reading' | 'review' | 'failed';
type ItemErrors = Partial<Record<keyof InvoiceRow, string>>;

function friendly(e: any): string {
    const status = e?.response?.status;
    if (status === 403) return 'You do not have permission to import invoices.';
    if (!e?.response) return 'Please check your internet connection and try again.';
    const msg = e?.response?.data?.error?.message;
    if (msg && status < 500) return msg;
    return 'Something went wrong. Please try again.';
}

function isBadNumber(v: string) {
    return v.trim() !== '' && (isNaN(Number(v)) || Number(v) < 0);
}
function totals(items: InvoiceRow[]) {
    let sub = 0;
    let tax = 0;
    items.forEach((r) => {
        const line = (Number(r.quantity) || 0) * (Number(r.cost_price) || 0);
        sub += line;
        tax += (line * (Number(r.tax_rate) || 0)) / 100;
    });
    return { sub, tax, total: sub + tax };
}

const money = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoiceImportScreen({ route, navigation }: Props) {
    const { file } = route.params;
    const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);

    const [phase, setPhase] = useState<Phase>('reading');
    const [message, setMessage] = useState('');
    const [rows, setRows] = useState<InvoiceRow[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [reference, setReference] = useState('');
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [warehouseId, setWarehouseId] = useState<number | null>(null);
    const [step, setStep] = useState(0);
    const [itemErrors, setItemErrors] = useState<ItemErrors>({});
    const [summary, setSummary] = useState<InvoiceImportSummary | null>(null);
    const [checking, setChecking] = useState(false);
    const [checkError, setCheckError] = useState('');
    const [saving, setSaving] = useState(false);

    const summaryStep = rows.length + 1;
    const isDetails = step === 0;
    const isSummary = step === summaryStep;
    const itemIndex = step - 1;
    const total = rows.length + 2;

    useEffect(() => {
        readFile();
        WarehouseApi.getWarehouses({ is_active: true })
            .then((list) => {
                setWarehouses(list);
                if (list.length === 1) setWarehouseId(list[0].id);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        if (phase === 'review' && isSummary) runCheck();
    }, [step]);

    async function readFile() {
        setPhase('reading');
        setMessage('');
        try {
            const res = await ProductApi.extractDocument(file);
            setRows(res.rows.map((r) => ({ ...r, flags: r.flags ?? [] })));
            setWarnings(res.warnings ?? []);
            setStep(0);
            setPhase('review');
        } catch (e: any) {
            setMessage(friendly(e));
            setPhase('failed');
        }
    }

    function buildPayload(dryRun: boolean) {
        return {
            rows: rows.map(({ name, sku, quantity, cost_price, tax_rate }) => ({ name, sku, quantity, cost_price, tax_rate })),
            warehouse: warehouseId,
            reference: reference.trim(),
            dry_run: dryRun,
        };
    }

    async function runCheck() {
        setSummary(null);
        setCheckError('');
        if (rows.length === 0) return;
        setChecking(true);
        try {
            setSummary(await ProductApi.importInvoice(buildPayload(true)));
        } catch (e: any) {
            setCheckError(friendly(e));
        } finally {
            setChecking(false);
        }
    }

    async function confirmSave() {
        setSaving(true);
        try {
            const res = await ProductApi.importInvoice(buildPayload(false));
            Alert.alert('Done', `${res.will_create} new product${res.will_create === 1 ? '' : 's'} created and stock added.`, [
                { text: 'OK', onPress: () => navigation.pop(2) },
            ]);
        } catch (e: any) {
            Alert.alert('Could not import', friendly(e));
        } finally {
            setSaving(false);
        }
    }

    function updateRow(key: keyof InvoiceRow, value: string) {
        setRows((prev) => prev.map((r, i) => (i === itemIndex ? { ...r, [key]: value } : r)));
        if (itemErrors[key]) setItemErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function removeCurrent() {
        const left = rows.length - 1;
        setRows((prev) => prev.filter((_, i) => i !== itemIndex));
        setItemErrors({});
        setStep(left === 0 ? 1 : Math.min(step, left));
    }

    function addItem() {
        setRows((prev) => [...prev, { name: '', sku: '', quantity: '', cost_price: '', tax_rate: '', flags: [] }]);
        setItemErrors({});
        setStep(rows.length + 1);
    }

    function goNext() {
        if (isDetails) {
            if (rows.some((r) => Number(r.quantity) > 0) && !warehouseId) {
                Alert.alert('Choose a warehouse', 'Please choose the warehouse where this stock should be added.');
                return;
            }
            setStep(1);
            return;
        }
        const row = rows[itemIndex];
        const e: ItemErrors = {};
        if (!row.name.trim()) e.name = 'Please enter the product name';
        if (isBadNumber(row.quantity)) e.quantity = 'Enter a valid number';
        if (isBadNumber(row.cost_price)) e.cost_price = 'Enter a valid price';
        if (isBadNumber(row.tax_rate)) e.tax_rate = 'Enter a valid number';
        if (Object.keys(e).length) { setItemErrors(e); return; }
        setItemErrors({});
        setStep(step + 1);
    }

    function goBack() {
        setItemErrors({});
        setStep(step - 1);
    }

    if (phase === 'reading') {
        return (
            <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginTop: spacing.base }}>
                    Reading your invoice...
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'center' }}>
                    This can take a few seconds for photos and scans.
                </Text>
            </SafeAreaView>
        );
    }

    if (phase === 'failed') {
        return (
            <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
                <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>📄</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, textAlign: 'center' }}>
                    We could not read this file
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'center', marginBottom: spacing.base }}>
                    {message}
                </Text>
                <Button title="Try Again" onPress={readFile} />
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.base }}>
                    <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Choose another file</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const stepTitle = isDetails ? 'Invoice details' : isSummary ? 'Review & save' : `Item ${step} of ${rows.length}`;
    const row = rows[itemIndex];
    const warehouseName = warehouses.find((w) => w.id === warehouseId)?.name ?? '—';
    const canConfirm = !!summary && !checking && (summary.will_create > 0 || summary.will_add_stock > 0);

    return (
        <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: spacing.base }}>
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 6 }}>
                            Step {step + 1} of {total} · {stepTitle}
                        </Text>
                        <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.border }}>
                            <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.primary, width: `${((step + 1) / total) * 100}%` }} />
                        </View>
                    </View>

                    {isDetails && (
                        <>
                            <Card style={{ marginBottom: spacing.base }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 48, height: 48, borderRadius: borderRadius.lg, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.base }}>
                                        <Text style={{ fontSize: 24 }}>{/\.pdf$/i.test(file.name) ? '📄' : '🖼️'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                                            We found {rows.length} item{rows.length === 1 ? '' : 's'}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }} numberOfLines={1}>{file.name}</Text>
                                    </View>
                                </View>
                            </Card>

                            {warnings.map((w, i) => (
                                <View key={i} style={{ backgroundColor: colors.warningLight, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.base }}>
                                    <Text style={{ color: colors.warning, fontSize: fontSize.xs }}>{w}</Text>
                                </View>
                            ))}

                            <Card style={{ marginBottom: spacing.base }}>
                                <Input
                                    label="Invoice number (recommended)"
                                    value={reference}
                                    onChangeText={setReference}
                                    placeholder="e.g. INV-2026-014"
                                />
                                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: -spacing.xs, marginBottom: spacing.base }}>
                                    Stops the same invoice from being added twice.
                                </Text>

                                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
                                    Add stock to *
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                                    {warehouses.map((w) => {
                                        const active = warehouseId === w.id;
                                        return (
                                            <TouchableOpacity
                                                key={w.id}
                                                onPress={() => setWarehouseId(w.id)}
                                                style={{
                                                    paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1,
                                                    backgroundColor: active ? colors.primary : colors.surface,
                                                    borderColor: active ? colors.primary : colors.border,
                                                }}
                                            >
                                                <Text style={{ color: active ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>{w.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </Card>

                            <Card style={{ marginBottom: spacing.base, backgroundColor: colors.primaryLight }}>
                                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>What happens next</Text>
                                {[
                                    'Check each item and fix anything that looks wrong',
                                    'Review the total and the stock that will be added',
                                    'Confirm to save. Nothing is saved before that',
                                ].map((t, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i === 2 ? 0 : spacing.sm }}>
                                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
                                            <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>{i + 1}</Text>
                                        </View>
                                        <Text style={{ flex: 1, color: colors.textSecondary, fontSize: fontSize.sm }}>{t}</Text>
                                    </View>
                                ))}
                                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.sm }}>
                                    Photos and scans can be misread, so please check the numbers.
                                </Text>
                            </Card>
                        </>
                    )}

                    {!isDetails && !isSummary && row && (
                        <Card style={{ marginBottom: spacing.base }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>Item {step}</Text>
                                <TouchableOpacity onPress={removeCurrent} hitSlop={10}>
                                    <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Remove item</Text>
                                </TouchableOpacity>
                            </View>

                            {(row.flags ?? []).length > 0 && (
                                <View style={{ backgroundColor: colors.warningLight, borderRadius: borderRadius.sm, padding: spacing.xs, marginBottom: spacing.sm }}>
                                    <Text style={{ color: colors.warning, fontSize: fontSize.xs }}>{(row.flags ?? []).join(' · ')}</Text>
                                </View>
                            )}

                            <Input label="Product name *" value={row.name} onChangeText={(v) => updateRow('name', v)} placeholder="Product name" error={itemErrors.name} />
                            <Input label="SKU (optional)" value={row.sku} onChangeText={(v) => updateRow('sku', v)} autoCapitalize="characters" placeholder="Auto-created if empty" />
                            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                                <View style={{ flex: 1 }}>
                                    <Input label="Qty" value={row.quantity} onChangeText={(v) => updateRow('quantity', v)} keyboardType="decimal-pad" placeholder="0" error={itemErrors.quantity} />
                                </View>
                                <View style={{ flex: 1.3 }}>
                                    <Input label="Cost price" value={row.cost_price} onChangeText={(v) => updateRow('cost_price', v)} keyboardType="decimal-pad" placeholder="0.00" error={itemErrors.cost_price} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Input label="Tax %" value={row.tax_rate} onChangeText={(v) => updateRow('tax_rate', v)} keyboardType="decimal-pad" placeholder="0" error={itemErrors.tax_rate} />
                                </View>
                            </View>
                        </Card>
                    )}

                    {isSummary && (
                        <>
                            <Card style={{ marginBottom: spacing.base, backgroundColor: colors.primaryLight }}>
                                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Invoice total (estimate)</Text>
                                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: fontWeight.bold, marginVertical: 2 }}>{money(totals(rows).total)}</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                                    {money(totals(rows).sub)} items + {money(totals(rows).tax)} tax
                                </Text>
                            </Card>

                            <Card style={{ marginBottom: spacing.base }}>
                                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs }}>Your items</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: spacing.sm }}>
                                    Invoice: {reference.trim() || 'not entered'} · Warehouse: {warehouseName}
                                </Text>
                                {rows.length === 0 && (
                                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>No items yet. Tap "Add item" to enter one.</Text>
                                )}
                                {rows.map((r, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => setStep(i + 1)}
                                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }} numberOfLines={1}>
                                                {r.name || 'Unnamed item'}
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                                                {r.quantity || '0'} × {r.cost_price || '0'}{r.tax_rate ? ` · ${r.tax_rate}% tax` : ''}
                                            </Text>
                                        </View>
                                        {(r.flags ?? []).length > 0 && <Text style={{ color: colors.warning, fontSize: fontSize.xs, marginRight: spacing.sm }}>⚠ Check</Text>}
                                        <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Edit</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={addItem} style={{ marginTop: spacing.sm }}>
                                    <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>+ Add item</Text>
                                </TouchableOpacity>
                            </Card>

                            <Card style={{ marginBottom: spacing.base, borderWidth: 1, borderColor: summary && !checkError ? colors.success : colors.border }}>
                                {checking && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <ActivityIndicator color={colors.primary} />
                                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginLeft: spacing.sm }}>Checking your items...</Text>
                                    </View>
                                )}
                                {!checking && !!checkError && (
                                    <>
                                        <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{checkError}</Text>
                                        <TouchableOpacity onPress={runCheck} style={{ marginTop: spacing.sm }}>
                                            <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Try again</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                {!checking && !checkError && summary && (
                                    <>
                                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs }}>Ready to save</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>New products: {summary.will_create}</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Items getting stock: {summary.will_add_stock}</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Total units added: {summary.stock_units}</Text>
                                        {summary.errors.length > 0 && (
                                            <View style={{ marginTop: spacing.sm }}>
                                                <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                                                    {summary.skipped} item{summary.skipped === 1 ? '' : 's'} will be skipped
                                                </Text>
                                                {summary.errors.map((er, i) => (
                                                    <Text key={i} style={{ color: colors.danger, fontSize: fontSize.xs }}>Item {er.row}: {er.error}</Text>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}
                            </Card>

                            {!checking && !checkError && summary && summary.will_create === 0 && summary.will_add_stock > 0 && (
                                <View style={{ backgroundColor: colors.warningLight, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.base }}>
                                    <Text style={{ color: colors.warning, fontSize: fontSize.xs }}>
                                        These products already exist, so only stock will be added to them.
                                    </Text>
                                </View>
                            )}
                            {!reference.trim() && (
                                <View style={{ backgroundColor: colors.warningLight, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.base }}>
                                    <Text style={{ color: colors.warning, fontSize: fontSize.xs }}>
                                        No invoice number entered. If this invoice is imported again, the stock will be added twice.
                                    </Text>
                                </View>
                            )}
                            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center' }}>
                                Nothing is saved until you tap Confirm & Save.
                            </Text>
                        </>
                    )}
                </ScrollView>

                <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                    paddingHorizontal: spacing.base, paddingTop: spacing.sm,
                    paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 0) + spacing.sm,
                    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
                    elevation: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 },
                }}>
                    {step > 0 && (
                        <View style={{ flex: 1 }}>
                            <Button title="Back" variant="outline" size="lg" fullWidth style={{ paddingHorizontal: 8 }} onPress={goBack} />
                        </View>
                    )}
                    <View style={{ flex: 2 }}>
                        {isSummary ? (
                            <Button title={saving ? 'Saving...' : 'Confirm & Save'} size="lg" fullWidth style={{ paddingHorizontal: 8 }} loading={saving} disabled={!canConfirm} onPress={confirmSave} />
                        ) : (
                            <Button title="Next" size="lg" fullWidth style={{ paddingHorizontal: 8 }} onPress={goNext} />
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}