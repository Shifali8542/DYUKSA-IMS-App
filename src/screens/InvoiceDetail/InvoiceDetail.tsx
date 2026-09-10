import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { styles } from './InvoiceDetail.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useInvoiceDetail } from './hooks/useInvoiceDetail';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import { INVOICE_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../../constants';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'InvoiceDetail'>;

const METHODS = ['cash', 'card', 'upi', 'bank', 'cheque'];

export default function InvoiceDetailScreen({ route }: Props) {
  const { invoiceId } = route.params;
  const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    invoice, loading, error, paying, canRecordPayment,
    showPayModal, setShowPayModal, recordPayment,
  } = useInvoiceDetail(invoiceId);

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} />;
  if (!invoice) return null;

  function handleSubmitPayment() {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    recordPayment({
      amount: payAmount,
      payment_date: new Date().toISOString().split('T')[0],
      method: payMethod,
      transaction_reference: payRef,
    });
    setPayAmount('');
    setPayRef('');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Header card */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                {invoice.number}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                {new Date(invoice.invoice_date).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={INVOICE_STATUS_LABEL[invoice.status] ?? invoice.status} variant={statusVariant(invoice.status)} />
          </View>
        </Card>

        {/* Invoice details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Invoice Details
          </Text>
          {([
            ['Customer', invoice.customer_name],
            ['Sales Order', invoice.sales_order_number ?? '—'],
            ['Invoice Date', new Date(invoice.invoice_date).toLocaleDateString()],
            ['Due Date', new Date(invoice.due_date).toLocaleDateString()],
            ['Notes', invoice.notes || '—'],
          ] as [string, string][]).map(([label, value]) => (
            <View key={label} style={[styles.detailRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 2, textAlign: 'right' }}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Line items */}
        {invoice.items.length > 0 && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Items
            </Text>
            {invoice.items.map((item) => (
              <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                    {item.product_name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {item.product_sku}  ×  {item.quantity}  @  ₹{item.unit_price}
                  </Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                  ₹{item.line_total}
                </Text>
              </View>
            ))}

            {/* Totals */}
            <View style={{ marginTop: spacing.base }}>
              {([
                ['Subtotal', invoice.subtotal],
                ['Discount', `-${invoice.discount_total}`],
                ['Tax', invoice.tax_total],
                ['Other Charges', invoice.other_charges],
              ] as [string, string][]).map(([label, value]) => (
                <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{label}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>₹{value}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>Total</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>₹{invoice.total}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Paid</Text>
                <Text style={{ color: colors.success, fontSize: fontSize.xs }}>₹{invoice.paid_amount}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Balance Due</Text>
                <Text style={{ color: parseFloat(invoice.balance_due) > 0 ? colors.danger : colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  ₹{invoice.balance_due}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Payments history */}
        {invoice.payments.length > 0 && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Payments
            </Text>
            {invoice.payments.map((p) => (
              <View key={p.id} style={[styles.itemRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{p.number}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {new Date(p.payment_date).toLocaleDateString()}  •  {p.method_display}
                  </Text>
                  {p.transaction_reference ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Ref: {p.transaction_reference}</Text>
                  ) : null}
                </View>
                <Text style={{ color: colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>₹{p.amount}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Credit notes */}
        {invoice.credit_notes.length > 0 && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Credit Notes
            </Text>
            {invoice.credit_notes.map((cn) => (
              <View key={cn.id} style={[styles.itemRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{cn.number}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {new Date(cn.issue_date).toLocaleDateString()}  •  {cn.reason}
                  </Text>
                </View>
                <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>-₹{cn.amount}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* View PDF */}
        <Button
          title="View Invoice PDF"
          onPress={() => nav.navigate('InvoicePreview', { invoiceId: invoice.id })}
          variant="outline"
          fullWidth
          size="lg"
        />

        {/* Record payment button */}
        {canRecordPayment && (
          <View style={{ marginTop: spacing.sm }}>
            <Button
              title="Record Payment"
              onPress={() => setShowPayModal(true)}
              fullWidth
              size="lg"
            />
          </View>
        )}
      </ScrollView>

      {/* Payment modal */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.base }}>
              Record Payment
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: spacing.base }}>
              Balance due: ₹{invoice.balance_due}
            </Text>

            {/* Amount */}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Amount (₹)</Text>
            <TextInput
              value={payAmount}
              onChangeText={setPayAmount}
              placeholder={invoice.balance_due}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                padding: spacing.sm, fontSize: fontSize.sm, color: colors.textPrimary,
                marginBottom: spacing.base,
              }}
            />

            {/* Method */}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Payment Method</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.base }}>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setPayMethod(m)}
                  style={{
                    paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
                    borderRadius: borderRadius.full, borderWidth: 1,
                    borderColor: payMethod === m ? colors.primary : colors.border,
                    backgroundColor: payMethod === m ? colors.primaryLight : 'transparent',
                  }}
                >
                  <Text style={{
                    color: payMethod === m ? colors.primary : colors.textSecondary,
                    fontSize: fontSize.xs, fontWeight: fontWeight.medium,
                  }}>
                    {PAYMENT_METHOD_LABEL[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reference */}
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Reference (optional)</Text>
            <TextInput
              value={payRef}
              onChangeText={setPayRef}
              placeholder="Transaction ID / Cheque no."
              placeholderTextColor={colors.textSecondary}
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                padding: spacing.sm, fontSize: fontSize.sm, color: colors.textPrimary,
                marginBottom: spacing.lg,
              }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" onPress={() => setShowPayModal(false)} variant="outline" fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Record" onPress={handleSubmitPayment} loading={paying} fullWidth />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}