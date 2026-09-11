import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { styles } from './DispatchDetail.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useDispatchDetail } from './hooks/useDispatchDetail';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import Badge, { statusVariant } from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import { DISPATCH_STATUS_LABEL } from '../../constants';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'DispatchDetail'>;

export default function DispatchDetailScreen({ route }: Props) {
  const { dispatchId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const {
    dispatch, loading, error, transitioning, actions,
    handleTransition, updateTracking,
  } = useDispatchDetail(dispatchId);

  // Tracking modal state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} />;
  if (!dispatch) return null;

  function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
      <View style={[styles.detailRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>{label}</Text>
        <Text style={{ color: valueColor ?? colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, flex: 2, textAlign: 'right' }}>{value || '—'}</Text>
      </View>
    );
  }

  const hasTracking = dispatch.carrier || dispatch.tracking_number;
  const canEditTracking = dispatch.status === 'dispatched';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>

        {/* Header */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                {dispatch.dispatch_number}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                {new Date(dispatch.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={DISPATCH_STATUS_LABEL[dispatch.status] ?? dispatch.status} variant={statusVariant(dispatch.status)} />
          </View>
        </Card>

        {/* Dispatch details */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
            Dispatch Details
          </Text>
          <DetailRow label="Order" value={dispatch.order_number} />
          <DetailRow label="Customer" value={dispatch.customer_name} />
          <DetailRow label="Warehouse" value={dispatch.warehouse_name} />
          <DetailRow label="Delivery Address" value={dispatch.delivery_address} />
          <DetailRow label="Notes" value={dispatch.notes} />
          <DetailRow label="Created By" value={dispatch.created_by_name} />
        </Card>

        {/* Tracking info */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>
              Shipping & Tracking
            </Text>
            {canEditTracking && (
              <TouchableOpacity
                onPress={() => {
                  setCarrier(dispatch.carrier ?? '');
                  setTrackingNum(dispatch.tracking_number ?? '');
                  setShowTrackingModal(true);
                }}
              >
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  {hasTracking ? 'Edit' : '+ Add'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <DetailRow label="Carrier" value={dispatch.carrier} />
          <DetailRow label="Tracking Number" value={dispatch.tracking_number} valueColor={dispatch.tracking_number ? colors.primary : undefined} />
        </Card>

        {/* Courier / AWB info */}
        {(dispatch.awb_code || dispatch.courier_name) ? (
          <Card style={{ marginBottom: spacing.base, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Courier Details
            </Text>
            {dispatch.courier_name ? (
              <View style={[styles.detailRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>Courier</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, flex: 2, textAlign: 'right' }}>{dispatch.courier_name}</Text>
              </View>
            ) : null}
            {dispatch.awb_code ? (
              <View style={[styles.detailRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>AWB Code</Text>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.bold, flex: 2, textAlign: 'right' }}>{dispatch.awb_code}</Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Dispatch items */}
        {dispatch.items && dispatch.items.length > 0 && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Items in this shipment
            </Text>
            {dispatch.items.map((item) => (
              <View key={item.id} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                    {item.product_name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {item.product_sku}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: colors.primaryLight, borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.sm, paddingVertical: 4,
                }}>
                  <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                    ×{item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Timeline */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Timeline
          </Text>

          {[
            { label: 'Created', time: dispatch.created_at, icon: '📝', active: true },
            { label: 'Approved', time: dispatch.approved_at, icon: '✅', active: !!dispatch.approved_at },
            { label: 'Dispatched', time: dispatch.dispatched_at, icon: '🚚', active: !!dispatch.dispatched_at },
            { label: 'Delivered', time: dispatch.delivered_at, icon: '📦', active: !!dispatch.delivered_at },
          ].map((step, idx, arr) => (
            <View key={step.label} style={{ flexDirection: 'row', marginBottom: idx < arr.length - 1 ? 0 : 0 }}>
              {/* Timeline line + dot */}
              <View style={{ width: 32, alignItems: 'center' }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: step.active ? colors.primary : colors.border,
                }}>
                  <Text style={{ fontSize: 12 }}>{step.active ? step.icon : '⏳'}</Text>
                </View>
                {idx < arr.length - 1 && (
                  <View style={{
                    width: 2, height: 32,
                    backgroundColor: step.active ? colors.primary : colors.border,
                  }} />
                )}
              </View>

              {/* Content */}
              <View style={{ flex: 1, paddingLeft: spacing.sm, paddingBottom: idx < arr.length - 1 ? spacing.sm : 0 }}>
                <Text style={{
                  color: step.active ? colors.textPrimary : colors.textSecondary,
                  fontSize: fontSize.sm, fontWeight: step.active ? fontWeight.semibold : fontWeight.regular,
                }}>
                  {step.label}
                </Text>
                {step.time ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1 }}>
                    {new Date(step.time).toLocaleString()}
                  </Text>
                ) : (
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1, fontStyle: 'italic' }}>
                    Pending
                  </Text>
                )}
              </View>
            </View>
          ))}

          {dispatch.status === 'returned' && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm,
              padding: spacing.sm, backgroundColor: '#FEE2E2', borderRadius: borderRadius.md,
            }}>
              <Text style={{ fontSize: 14, marginRight: spacing.xs }}>🔄</Text>
              <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                This shipment was returned
              </Text>
            </View>
          )}
        </Card>

        {/* Action links */}
        <View style={{ gap: spacing.sm, marginBottom: spacing.base }}>
          <Button
            title="View Packing Slip"
            onPress={() => nav.navigate('PackingSlipPreview' as any, { dispatchId: dispatch.id })}
            variant="outline"
            fullWidth
            size="lg"
          />
          <Button
            title="Share Tracking Link"
            onPress={async () => {
              const { Share } = await import('react-native');
              const baseURL = (await import('../../api/api')).imsClient.defaults.baseURL ?? '';
              const url = `${baseURL}/track/${dispatch.dispatch_number}/`;
              Share.share({ message: `Track your shipment: ${url}`, url });
            }}
            variant="outline"
            fullWidth
            size="lg"
          />
          <Button
            title={`View Order ${dispatch.order_number}`}
            onPress={() => nav.navigate('OrderDetail', { orderId: dispatch.order })}
            variant="outline"
            fullWidth
            size="lg"
          />
        </View>

        {/* Action buttons */}
        {actions.length > 0 && (
          <Card style={{ marginTop: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Actions
            </Text>
            <View style={{ gap: spacing.sm }}>
              {actions.map((a) => (
                <Button
                  key={a.to}
                  title={a.label}
                  onPress={() => handleTransition(a.to)}
                  loading={transitioning}
                  variant={a.variant === 'danger' ? 'danger' : 'primary'}
                  fullWidth
                  size="lg"
                />
              ))}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Tracking edit modal */}
      <Modal visible={showTrackingModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.base }}>
              Shipping Details
            </Text>

            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Carrier</Text>
            <TextInput
              value={carrier}
              onChangeText={setCarrier}
              placeholder="e.g. Delhivery, BlueDart, DTDC"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                padding: spacing.sm, fontSize: fontSize.sm, color: colors.textPrimary,
                marginBottom: spacing.base,
              }}
            />

            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 }}>Tracking Number</Text>
            <TextInput
              value={trackingNum}
              onChangeText={setTrackingNum}
              placeholder="e.g. AWB12345678"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                padding: spacing.sm, fontSize: fontSize.sm, color: colors.textPrimary,
                marginBottom: spacing.lg,
              }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" onPress={() => setShowTrackingModal(false)} variant="outline" fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Save"
                  onPress={() => {
                    updateTracking(carrier, trackingNum);
                    setShowTrackingModal(false);
                  }}
                  loading={transitioning}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}