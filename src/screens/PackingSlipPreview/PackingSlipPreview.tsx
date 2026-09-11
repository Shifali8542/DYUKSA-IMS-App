import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';
import { usePackingSlipPreview } from './hooks/usePackingSlipPreview';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';

export default function PackingSlipPreviewScreen({ route }: any) {
  const { dispatchId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { html, loading, error, sharing, shareAsPdf, printSlip } = usePackingSlipPreview(dispatchId);

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} />;
  if (!html) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <View style={{ flex: 1 }}>
        <WebView source={{ html }} style={{ flex: 1, backgroundColor: '#fff' }} originWhitelist={['*']} scalesPageToFit />
      </View>

      <View style={{
        flexDirection: 'row', gap: spacing.sm, padding: spacing.base,
        backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={shareAsPdf} disabled={sharing}
          style={{
            flex: 1, alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm,
          }}
        >
          {sharing ? <ActivityIndicator color={colors.textInverse} size="small" /> :
            <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Share PDF</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={printSlip}
          style={{
            flex: 1, alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.surface, borderRadius: borderRadius.md,
            paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>Print</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}