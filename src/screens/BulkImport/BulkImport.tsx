import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from './BulkImport.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useBulkImport } from './hooks/useBulkImport';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import type { MainStackParamList } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'BulkImport'>;

export default function BulkImportScreen({ navigation }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const {
    status, file, result, preview, error, mode, progress,
    pickFile, dryRun, upload, reset, setMode, downloadTemplate,
  } = useBulkImport();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Header info */}
        <Card style={{ marginBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.base }}>
            <View style={{
              width: 48, height: 48, borderRadius: borderRadius.lg,
              backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
              marginRight: spacing.base,
            }}>
              <Text style={{ fontSize: 24 }}>📤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                Bulk Product Import
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                Upload CSV or Excel file to import products
              </Text>
            </View>
          </View>

          {/* Supported format info */}
          <View style={{
            backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
            padding: spacing.base, borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginBottom: spacing.sm }}>
              SUPPORTED FORMATS
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 18 }}>
              CSV (.csv) or Excel (.xlsx, .xls)
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginTop: spacing.base, marginBottom: spacing.sm }}>
              REQUIRED COLUMNS
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs }}>
              name (or product_name, item)
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: fontWeight.semibold, letterSpacing: 0.5, marginTop: spacing.base, marginBottom: spacing.sm }}>
              OPTIONAL COLUMNS
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 18 }}>
              sku, barcode, cost_price, selling_price, tax_rate, reorder_level, category, brand, unit, description
            </Text>
            <View style={{
              backgroundColor: colors.primaryLight, borderRadius: borderRadius.sm,
              padding: spacing.sm, marginTop: spacing.base,
            }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs }}>
                💡 Categories, brands, and units are auto-created if they don't exist. SKU is auto-generated from product name if not provided.
              </Text>
            </View>

            {/* Download template */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.base }}>
              <TouchableOpacity
                onPress={() => downloadTemplate('csv')}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.background, borderRadius: borderRadius.md,
                  paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  ⬇ CSV Template
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => downloadTemplate('xlsx')}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.background, borderRadius: borderRadius.md,
                  paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  ⬇ Excel Template
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* File picker */}
        <Card style={{ marginBottom: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.base }}>
            Select File
          </Text>

          {!file ? (
            <TouchableOpacity
              onPress={pickFile}
              disabled={status === 'picking'}
              style={{
                borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
                borderRadius: borderRadius.lg, paddingVertical: spacing.xl,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: colors.surfaceSecondary,
                opacity: status === 'picking' ? 0.5 : 1,
              }}
            >
              {status === 'picking' ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>📁</Text>
                  <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                    Tap to select file
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>
                    .csv, .xlsx, or .xls
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
              padding: spacing.base, borderWidth: 1, borderColor: colors.border,
            }}>
              <View style={{
                width: 44, height: 44, borderRadius: borderRadius.md,
                backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
                marginRight: spacing.base,
              }}>
                <Text style={{ fontSize: 20 }}>
                  {file.name.endsWith('.csv') ? '📄' : '📊'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                  Ready to upload
                </Text>
              </View>
              <TouchableOpacity onPress={reset}>
                <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Import mode picker */}
        {file && status !== 'done' && (
          <Card style={{ marginBottom: spacing.base }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Import Mode
            </Text>
            {([
              { key: 'create', label: 'Create new products only', desc: 'Skip if SKU exists' },
              { key: 'update', label: 'Update existing only', desc: 'Skip if SKU not found' },
              { key: 'upsert', label: 'Create + Update both', desc: 'Best for syncing data' },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setMode(opt.key)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: spacing.sm, paddingHorizontal: spacing.sm,
                  borderRadius: borderRadius.md, marginBottom: spacing.xs,
                  backgroundColor: mode === opt.key ? colors.primaryLight : 'transparent',
                  borderWidth: 1,
                  borderColor: mode === opt.key ? colors.primary : colors.border,
                }}
              >
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  borderWidth: 2, borderColor: mode === opt.key ? colors.primary : colors.border,
                  alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
                }}>
                  {mode === opt.key && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    {opt.label}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 1 }}>
                    {opt.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Preview + Upload buttons */}
        {file && status !== 'done' && (
          <View style={{ gap: spacing.sm }}>
            {!preview && (
              <Button
                title={status === 'previewing' ? 'Validating...' : 'Preview Import'}
                onPress={dryRun}
                loading={status === 'previewing'}
                variant="outline"
                fullWidth
                size="lg"
              />
            )}
            {preview && preview.errors.length === 0 && (
              <Button
                title={status === 'uploading' ? 'Importing...' : 'Confirm Import'}
                onPress={upload}
                loading={status === 'uploading'}
                fullWidth
                size="lg"
              />
            )}
            {preview && preview.errors.length > 0 && (
              <View style={{ gap: spacing.sm }}>
                <Button
                  title={status === 'uploading' ? 'Importing...' : 'Import Anyway (skip errors)'}
                  onPress={upload}
                  loading={status === 'uploading'}
                  variant="outline"
                  fullWidth
                  size="lg"
                />
              </View>
            )}
          </View>
        )}

        {/* Upload progress bar */}
        {status === 'uploading' && progress > 0 && (
          <View style={{ marginTop: spacing.sm }}>
            <View style={{
              height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden',
            }}>
              <View style={{
                height: 6, width: `${progress}%`, backgroundColor: colors.primary, borderRadius: 3,
              }} />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center', marginTop: 4 }}>
              {progress}% uploaded
            </Text>
          </View>
        )}

        {/* Dry-run preview result */}
        {preview && status !== 'done' && (
          <Card style={{ marginTop: spacing.base, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
              Preview Summary (nothing saved yet)
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
              <StatBox label="Will Create" value={preview.will_create ?? 0} color="#10B981" bgColor="#ECFDF5" />
              <StatBox label="Will Update" value={preview.will_update ?? 0} color="#3B82F6" bgColor="#EFF6FF" />
              <StatBox label="Will Skip" value={preview.will_skip ?? 0} color="#F59E0B" bgColor="#FFFBEB" />
            </View>
            {preview.errors.length > 0 && (
              <View style={{ marginTop: spacing.xs }}>
                <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.xs }}>
                  Errors found ({preview.errors.length})
                </Text>
                {preview.errors.slice(0, 10).map((err, idx) => (
                  <Text key={idx} style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 2 }}>
                    Row {err.row}{err.sku ? ` (${err.sku})` : ''}: {err.error}
                  </Text>
                ))}
                {preview.errors.length > 10 && (
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                    ...and {preview.errors.length - 10} more
                  </Text>
                )}
              </View>
            )}
          </Card>
        )}

        {/* Error */}
        {error && status === 'error' && (
          <Card style={{ marginTop: spacing.base, borderWidth: 1, borderColor: colors.danger }}>
            <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.xs }}>
              Import Failed
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              {error}
            </Text>
            <TouchableOpacity onPress={reset} style={{ marginTop: spacing.base }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Result summary */}
        {result && (
          <View style={{ marginTop: spacing.base }}>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
              <StatBox
                label="Total"
                value={result.total_rows}
                color={colors.textPrimary}
                bgColor={colors.surfaceSecondary}
              />
              <StatBox
                label="Created"
                value={result.created}
                color="#10B981"
                bgColor="#ECFDF5"
              />
              <StatBox
                label="Updated"
                value={result.updated}
                color="#3B82F6"
                bgColor="#EFF6FF"
              />
              <StatBox
                label="Skipped"
                value={result.skipped}
                color={result.skipped > 0 ? '#F59E0B' : colors.textSecondary}
                bgColor={result.skipped > 0 ? '#FFFBEB' : colors.surfaceSecondary}
              />
            </View>

            {/* Success message */}
            {(result.created > 0 || result.updated > 0) && (
              <Card style={{ marginBottom: spacing.base, borderWidth: 1, borderColor: '#10B981' }}>
                <Text style={{ color: '#10B981', fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                  ✅ {result.created} created, {result.updated} updated successfully!
                </Text>
              </Card>
            )}

            {/* Error rows */}
            {result.errors.length > 0 && (
              <Card>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm }}>
                  Skipped Rows ({result.errors.length})
                </Text>
                {result.errors.slice(0, 20).map((err, idx) => (
                  <View key={idx} style={{
                    paddingVertical: spacing.sm,
                    borderBottomWidth: idx < Math.min(result.errors.length, 20) - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                      <Text style={{ fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Row {err.row}</Text>
                      {err.sku ? ` (${err.sku})` : ''}: {err.error}
                    </Text>
                  </View>
                ))}
                {result.errors.length > 20 && (
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.sm }}>
                    ...and {result.errors.length - 20} more
                  </Text>
                )}
              </Card>
            )}

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.base }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md,
                  paddingVertical: spacing.md, alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                  Go to Inventory
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={reset}
                style={{
                  flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
                  paddingVertical: spacing.md, alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                  Import Another
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  const { spacing, fontSize, fontWeight, borderRadius } = useTheme();
  return (
    <View style={{
      flex: 1, backgroundColor: bgColor, borderRadius: borderRadius.md,
      padding: spacing.base, alignItems: 'center',
    }}>
      <Text style={{ color, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>{value}</Text>
      <Text style={{ color, fontSize: 9, marginTop: 2 }}>{label}</Text>
    </View>
  );
}