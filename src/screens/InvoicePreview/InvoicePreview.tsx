import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useInvoicePreview } from './hooks/useInvoicePreview';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'InvoicePreview'>;

export default function InvoicePreviewScreen({ route }: Props) {
  const { invoiceId } = route.params;
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const { html, loading, error, sharing, shareAsPdf, printInvoice } = useInvoicePreview(invoiceId);

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} />;
  if (!html) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      {/* Invoice rendered in WebView */}
      <View style={{ flex: 1 }}>
        <WebView
          source={{ html }}
          style={{ flex: 1, backgroundColor: '#fff' }}
          originWhitelist={['*']}
          scalesPageToFit
        />
      </View>

      {/* Bottom action bar */}
      <View style={{
        flexDirection: 'row', gap: spacing.sm,
        padding: spacing.base,
        backgroundColor: colors.surface,
        borderTopWidth: 1, borderTopColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={shareAsPdf}
          disabled={sharing}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.primary, borderRadius: borderRadius.md,
            paddingVertical: spacing.sm, gap: spacing.xs,
          }}
        >
          {sharing ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              Share PDF
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={printInvoice}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.surface, borderRadius: borderRadius.md,
            paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
            Print
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}