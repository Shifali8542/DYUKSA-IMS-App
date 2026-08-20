import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './ForgotPassword.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { AuthApi } from '../../services/Api';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const [step,     setStep]     = useState<Step>('email');
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSendOtp() {
    if (!email.trim()) return Alert.alert('Error', 'Enter your email.');
    setLoading(true);
    try {
      await AuthApi.forgotPassword(email.trim());
      setStep('otp');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not send OTP.');
    } finally { setLoading(false); }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) return Alert.alert('Error', 'Enter the OTP.');
    setLoading(true);
    try {
      await AuthApi.verifyOtp(email, otp.trim());
      setStep('password');
    } catch {
      Alert.alert('Error', 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  }

  async function handleSetPassword() {
    if (!password || password !== confirm)
      return Alert.alert('Error', 'Passwords do not match.');
    setLoading(true);
    try {
      await AuthApi.setNewPassword(email, otp, password);
      Alert.alert('Success', 'Password changed successfully. Please login.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to set password.');
    } finally { setLoading(false); }
  }

  const stepTitles: Record<Step, string> = {
    email:    'Forgot Password',
    otp:      'Enter OTP',
    password: 'Set New Password',
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.xs }}>
            {stepTitles[step]}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.xl }}>
            {step === 'email' ? 'Enter your email to receive an OTP.'
            : step === 'otp'  ? `We sent a code to ${email}`
            :                   'Choose a strong new password.'}
          </Text>

          {step === 'email' && (
            <>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Button title="Send OTP" onPress={handleSendOtp} loading={loading} fullWidth />
            </>
          )}

          {step === 'otp' && (
            <>
              <Input label="OTP Code" value={otp} onChangeText={setOtp} placeholder="Enter 6-digit code" keyboardType="number-pad" />
              <Button title="Verify OTP" onPress={handleVerifyOtp} loading={loading} fullWidth />
            </>
          )}

          {step === 'password' && (
            <>
              <Input label="New Password"     value={password} onChangeText={setPassword} placeholder="Min 8 characters" secureTextEntry />
              <Input label="Confirm Password" value={confirm}  onChangeText={setConfirm}  placeholder="Repeat password"   secureTextEntry />
              <Button title="Set New Password" onPress={handleSetPassword} loading={loading} fullWidth />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


