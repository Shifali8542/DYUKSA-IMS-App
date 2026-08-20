import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './Splash.styles';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.appName}>DYUKSA IMS</Text>
          <Text style={styles.tagline}>Inventory Management System</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}


