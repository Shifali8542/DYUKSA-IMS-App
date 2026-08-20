import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './Login.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { AuthApi } from '../../services/Api';
import { tokenStorage } from '../../utils/tokenStorage';
import type { AuthStackParamList } from '../../types';

interface Props { onAuthenticated: () => void; }

export default function LoginScreen({ onAuthenticated }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<{ username?: string; password?: string }>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!username.trim()) e.username = 'Username or email is required';
    if (!password)        e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const tokens = await AuthApi.login(username.trim(), password);
      await tokenStorage.setTokens(tokens.access, tokens.refresh);
      onAuthenticated();
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.detail
        ?? 'Incorrect username or password.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={[styles.header, { paddingTop: spacing.xxxl, paddingBottom: spacing.xxl }]}>
            <View style={[styles.logo, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]}>
              <Text style={styles.logoText}>D</Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: spacing.base }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSize.base, marginTop: spacing.xs }]}>
              Sign in to DYUKSA IMS
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.form, { paddingHorizontal: spacing.xl }]}>
            <Input
              label="Username or Email"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username or email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={errors.username}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry={!showPass}
              error={errors.password}
              rightIcon={<Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{showPass ? 'Hide' : 'Show'}</Text>}
              onRightIconPress={() => setShowPass((v) => !v)}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}
            >
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button title="Sign In" onPress={handleLogin} loading={loading} fullWidth size="lg" />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


