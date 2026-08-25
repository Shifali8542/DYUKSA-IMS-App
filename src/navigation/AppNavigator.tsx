import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../screens/Onboarding/Onboarding';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { STORAGE_KEYS } from '../constants';

export default function AppNavigator() {
  const [state, setState] = useState<'loading' | 'onboarding' | 'login' | 'main'>('loading');

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const onboarded = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);

        if (!onboarded) {
          setState('onboarding');
        } else if (!token) {
          setState('login');
        } else {
          setState('main');
        }
      } catch {
        setState('onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (state === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A56DB', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff' }}>DYUKSA IMS</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Inventory Management System</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 30 }} />
      </View>
    );
  }

  if (state === 'onboarding') {
    return (
      <OnboardingScreen
        onDone={async () => {
          await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
          setState('login');
        }}
      />
    );
  }

  if (state === 'login') {
    return <AuthNavigator onAuthenticated={() => setState('main')} />;
  }

  return (
    <MainNavigator
      onLogout={async () => {
        await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
        setState('login');
      }}
    />
  );
}
