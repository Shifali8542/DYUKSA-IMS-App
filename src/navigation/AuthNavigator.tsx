import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types';
import LoginScreen from '../screens/Login/Login';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPassword';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface Props {
  onAuthenticated: () => void;
}

export default function AuthNavigator({ onAuthenticated }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {() => <LoginScreen onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: 'Reset Password', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}
