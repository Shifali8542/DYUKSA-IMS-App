import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useInvoiceSettings } from './hooks/useInvoiceSettings';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';

function SectionTitle({ title, colors, fontSize, fontWeight, spacing }: any) {
    return (
        <Text style={{
            color: colors.textPrimary, fontSize: fontSize.md,
            fontWeight: fontWeight.semibold, marginBottom: spacing.sm, marginTop: spacing.sm,
        }}>
            {title}
        </Text>
    );
}

export default function InvoiceSettingsScreen() {
    const { colors, spacing, fontSize, fontWeight } = useTheme();
    const nav = useNavigation();
    const { form, setField, loading, saving, error, save } = useInvoiceSettings();

    if (loading) return <Loader fullScreen />;
    if (error) return <ErrorState message={error} />;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Company identity */}
                    <Card style={{ marginBottom: spacing.base }}>
                        <SectionTitle title="Company identity" colors={colors} fontSize={fontSize} fontWeight={fontWeight} spacing={spacing} />
                        <Input
                            label="Company name"
                            value={form.company_name ?? ''}
                            onChangeText={(v) => setField('company_name', v)}
                            placeholder="Leave empty to use org name"
                        />
                        <Input
                            label="Logo URL"
                            value={form.logo_url ?? ''}
                            onChangeText={(v) => setField('logo_url', v)}
                            placeholder="https://example.com/logo.png"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Tagline"
                            value={form.tagline ?? ''}
                            onChangeText={(v) => setField('tagline', v)}
                            placeholder="e.g. Quality products since 2010"
                        />
                    </Card>

                    {/* Address */}
                    <Card style={{ marginBottom: spacing.base }}>
                        <SectionTitle title="Address" colors={colors} fontSize={fontSize} fontWeight={fontWeight} spacing={spacing} />
                        <Input
                            label="Address line 1"
                            value={form.address_line1 ?? ''}
                            onChangeText={(v) => setField('address_line1', v)}
                            placeholder="Street address"
                        />
                        <Input
                            label="Address line 2"
                            value={form.address_line2 ?? ''}
                            onChangeText={(v) => setField('address_line2', v)}
                            placeholder="Floor, building, landmark"
                        />
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="City"
                                    value={form.city ?? ''}
                                    onChangeText={(v) => setField('city', v)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="State"
                                    value={form.state ?? ''}
                                    onChangeText={(v) => setField('state', v)}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Pincode"
                                    value={form.pincode ?? ''}
                                    onChangeText={(v) => setField('pincode', v)}
                                    keyboardType="number-pad"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Country"
                                    value={form.country ?? ''}
                                    onChangeText={(v) => setField('country', v)}
                                />
                            </View>
                        </View>
                    </Card>

                    {/* Contact */}
                    <Card style={{ marginBottom: spacing.base }}>
                        <SectionTitle title="Contact" colors={colors} fontSize={fontSize} fontWeight={fontWeight} spacing={spacing} />
                        <Input
                            label="Phone"
                            value={form.phone ?? ''}
                            onChangeText={(v) => setField('phone', v)}
                            keyboardType="phone-pad"
                        />
                        <Input
                            label="Email"
                            value={form.email ?? ''}
                            onChangeText={(v) => setField('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Website"
                            value={form.website ?? ''}
                            onChangeText={(v) => setField('website', v)}
                            autoCapitalize="none"
                            placeholder="https://yourcompany.com"
                        />
                    </Card>

                    {/* Tax / Legal */}
                    <Card style={{ marginBottom: spacing.base }}>
                        <SectionTitle title="Tax and legal" colors={colors} fontSize={fontSize} fontWeight={fontWeight} spacing={spacing} />
                        <Input
                            label="GSTIN"
                            value={form.gstin ?? ''}
                            onChangeText={(v) => setField('gstin', v)}
                            autoCapitalize="characters"
                            placeholder="e.g. 27AABCU9603R1ZM"
                        />
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="PAN"
                                    value={form.pan ?? ''}
                                    onChangeText={(v) => setField('pan', v)}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="CIN"
                                    value={form.cin ?? ''}
                                    onChangeText={(v) => setField('cin', v)}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>
                    </Card>

                    {/* Bank details */}
                    <Card style={{ marginBottom: spacing.base }}>
                        <SectionTitle title="Bank details" colors={colors} fontSize={fontSize} fontWeight={fontWeight} spacing={spacing} />
                        <Input
                            label="Bank name"
                            value={form.bank_name ?? ''}
                            onChangeText={(v) => setField('bank_name', v)}
                            placeholder="e.g. HDFC Bank"
                        />
                        <Input
                            label="Account number"
                            value={form.bank_account_number ?? ''}
                            onChangeText={(v) => setField('bank_account_number', v)}
                            keyboardType="number-pad"
                        />
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="IFSC code"
                                    value={form.bank_ifsc ?? ''}
                                    onChangeText={(v) => setField('bank_ifsc', v)}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Branch"
                                    value={form.bank_branch ?? ''}
                                    onChangeText={(v) => setField('bank_branch', v)}
                                />
                            </View>
                        </View>
                    </Card>

                    {/* Invoice defaults */}
                    <Card style={{ marginBottom: spacing.base }}>
                        <SectionTitle title="Invoice defaults" colors={colors} fontSize={fontSize} fontWeight={fontWeight} spacing={spacing} />
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Invoice prefix"
                                    value={form.invoice_prefix ?? ''}
                                    onChangeText={(v) => setField('invoice_prefix', v)}
                                    placeholder="e.g. ACME-INV"
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Due days (default)"
                                    value={String(form.default_due_days ?? 30)}
                                    onChangeText={(v) => setField('default_due_days', parseInt(v) || 0)}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                        <Input
                            label="Payment instructions"
                            value={form.payment_instructions ?? ''}
                            onChangeText={(v) => setField('payment_instructions', v)}
                            placeholder="e.g. Pay via UPI to company@upi"
                            multiline
                            numberOfLines={2}
                        />
                        <Input
                            label="Terms and conditions"
                            value={form.terms_and_conditions ?? ''}
                            onChangeText={(v) => setField('terms_and_conditions', v)}
                            placeholder="Printed at the bottom of every invoice"
                            multiline
                            numberOfLines={4}
                        />
                        <Input
                            label="Footer note"
                            value={form.invoice_footer_note ?? ''}
                            onChangeText={(v) => setField('invoice_footer_note', v)}
                            placeholder="Small text at the very bottom"
                        />
                    </Card>

                    <Button
                        title={saving ? 'Saving...' : 'Save Settings'}
                        onPress={async () => {
                            const success = await save();
                            if (success) nav.goBack();
                        }}
                        loading={saving}
                        fullWidth
                        size="lg"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}