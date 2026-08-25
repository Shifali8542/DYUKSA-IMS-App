import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from './scanner.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useScanner } from './hooks/useScanner';
import Button from '../../components/Button/Button';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Scanner'>;

export default function ScannerScreen({ navigation }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { permission, requestPermission, result, resetScan, torch, toggleTorch, handleBarCodeScanned } = useScanner();
  const { canCreateProducts } = usePermissions();
  
  // ── Permission not granted yet ──
  if (!permission) {
    return (
      <View style={[styles.permBox, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permBox, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>📷</Text>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center', marginBottom: spacing.sm }}>
          Camera Permission Required
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.xl }}>
          To scan barcodes, please allow camera access for DYUKSA IMS.
        </Text>
        <Button title="Allow Camera Access" onPress={requestPermission} size="lg" />
      </View>
    );
  }

  // ── Scan result overlay ──
  function ResultOverlay() {
    if (result.status === 'idle') return null;

    if (result.status === 'searching') {
      return (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, padding: spacing.lg, alignItems: 'center' }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm }}>
            Searching: {result.barcode}
          </Text>
        </View>
      );
    }

    if (result.status === 'found') {
      const p = result.product;
      return (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, padding: spacing.lg }]}>
          <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            PRODUCT FOUND
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
            {p.name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
            SKU: {p.sku}  {p.barcode ? `• Barcode: ${p.barcode}` : ''}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
            Stock: {p.available_stock ?? '—'}  •  Price: ₹{p.selling_price}
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <TouchableOpacity
              onPress={() => { resetScan(); navigation.navigate('ProductDetails', { productId: p.id }); }}
              style={{ flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' }}
            >
              <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetScan}
              style={{ flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (result.status === 'not_found') {
      return (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, padding: spacing.lg }]}>
          <Text style={{ color: colors.warning, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            NOT FOUND
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }}>
            No product matches this barcode
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
            Barcode: {result.barcode}
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            {canCreateProducts && (
              <TouchableOpacity
                onPress={() => { resetScan(); navigation.navigate('ProductForm', { barcode: result.barcode }); }}
                style={{ flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' }}
              >
                <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Create Product</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={resetScan}
              style={{ flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (result.status === 'error') {
      return (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, padding: spacing.lg }]}>
          <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            Error: {result.message}
          </Text>
          <Button title="Try Again" onPress={resetScan} size="sm" variant="ghost" />
        </View>
      );
    }

    return null;
  }

  // ── Main camera view ──
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr', 'datamatrix', 'pdf417'] }}
        onBarcodeScanned={result.status === 'idle' ? handleBarCodeScanned : undefined}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Scan area indicator */}
        {result.status === 'idle' && (
          <View>
            <View style={styles.scanArea} />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
              Point camera at barcode
            </Text>
          </View>
        )}
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 16 }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>✕ Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleTorch}
          style={{ padding: 16 }}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>{torch ? '🔦 ON' : '🔦 OFF'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom result card */}
      <View style={[styles.bottomBar, { paddingBottom: 40 }]}>
        <ResultOverlay />
      </View>
    </View>
  );
}