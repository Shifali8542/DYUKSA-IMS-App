import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Segment {
  value: number;
  color: string;
  label: string;
}

interface Props {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export default function MiniDonutChart({ segments, size = 120, strokeWidth = 14, centerLabel, centerValue }: Props) {
  const { colors, fontSize, fontWeight } = useTheme();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: colors.surfaceSecondary,
      }} />

      {/* Segment rings using rotation trick */}
      {total > 0 && segments.map((seg, i) => {
        const pct = seg.value / total;
        const rotation = accumulated * 360 - 90;
        accumulated += pct;
        const dashLength = pct * circumference;

        return (
          <View
            key={i}
            style={{
              position: 'absolute', width: size, height: size,
              transform: [{ rotate: `${rotation}deg` }],
            }}
          >
            <View style={{
              width: size, height: size, borderRadius: size / 2,
              borderWidth: strokeWidth, borderColor: 'transparent',
              borderTopColor: seg.color,
              borderRightColor: pct > 0.25 ? seg.color : 'transparent',
              borderBottomColor: pct > 0.5 ? seg.color : 'transparent',
              borderLeftColor: pct > 0.75 ? seg.color : 'transparent',
            }} />
          </View>
        );
      })}

      {/* Center text */}
      <View style={{ alignItems: 'center' }}>
        {centerValue !== undefined && (
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {centerValue}
          </Text>
        )}
        {centerLabel && (
          <Text style={{ color: colors.textSecondary, fontSize: 9, marginTop: 1 }}>
            {centerLabel}
          </Text>
        )}
      </View>
    </View>
  );
}