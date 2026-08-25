import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  bars: Bar[];
  height?: number;
  barWidth?: number;
  showValues?: boolean;
}

export default function MiniBarChart({ bars, height = 100, barWidth = 28, showValues = true }: Props) {
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: height + 24, paddingTop: 16 }}>
      {bars.map((bar, i) => {
        const barHeight = Math.max((bar.value / maxVal) * height, 4);
        const barColor = bar.color ?? colors.primary;
        return (
          <View key={i} style={{ alignItems: 'center', flex: 1 }}>
            {showValues && bar.value > 0 && (
              <Text style={{ color: colors.textSecondary, fontSize: 8, fontWeight: fontWeight.medium, marginBottom: 2 }}>
                {bar.value}
              </Text>
            )}
            <View style={{
              width: barWidth, height: barHeight, borderRadius: borderRadius.sm,
              backgroundColor: barColor,
            }} />
            <Text style={{ color: colors.textSecondary, fontSize: 8, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>
              {bar.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}