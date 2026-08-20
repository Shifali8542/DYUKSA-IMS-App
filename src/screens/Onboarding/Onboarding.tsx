import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { styles } from './Onboarding.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', icon: '📦', title: 'Inventory at a Glance', desc: 'View stock levels across all your warehouses in real-time from anywhere.' },
  { id: '2', icon: '📋', title: 'Manage Orders Fast',    desc: 'Track sales orders, purchase orders, and dispatch — all from your phone.' },
  { id: '3', icon: '🔔', title: 'Never Miss a Alert',   desc: 'Get instant low-stock alerts and order updates wherever you are.' },
];

interface Props { onDone: () => void; }

export default function OnboardingScreen({ onDone }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  function next() {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      onDone();
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: spacing.xl }]}>
              {item.title}
            </Text>
            <Text style={[styles.desc, { color: colors.textSecondary, fontSize: fontSize.base, marginTop: spacing.base }]}>
              {item.desc}
            </Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[
            styles.dot,
            { backgroundColor: i === index ? colors.primary : colors.border, width: i === index ? 24 : 8 },
          ]} />
        ))}
      </View>

      <View style={[styles.footer, { padding: spacing.xl }]}>
        <TouchableOpacity
          onPress={next}
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
        >
          <Text style={[styles.btnText, { color: colors.textInverse, fontSize: fontSize.base, fontWeight: fontWeight.semibold }]}>
            {index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {index < SLIDES.length - 1 && (
          <TouchableOpacity onPress={onDone} style={{ marginTop: spacing.base, alignSelf: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}


