import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Watermark } from '@components/Watermark';
import { COLORS } from '@constants/theme';
import { STUDENT, VARIANT } from '@constants/student';
import { useAuthStore } from '@stores/authStore';

export const LoginScreen: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const login = useAuthStore(state => state.login);

  const handleLogin = () => {
    if (!inputValue.trim()) {
      Alert.alert(
        'Thông báo',
        VARIANT.authField === 'email'
          ? 'Vui lòng nhập email của bạn!'
          : 'Vui lòng nhập số điện thoại của bạn!'
      );
      return;
    }
    login(inputValue.trim());
  };

  const isWatermarkTop = VARIANT.watermarkAtTop;

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.logo}>KTXGO</Text>
          <Text style={styles.slogan}>Giao đồ tận phòng ký túc xá</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {VARIANT.authField === 'email' ? 'Email sinh viên' : 'Số điện thoại'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                VARIANT.authField === 'email'
                  ? `${STUDENT.mssv}@sv.iuh.edu.vn`
                  : `0328140841 (23710971)`
              }
              placeholderTextColor={COLORS.textLight}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType={VARIANT.authField === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Vào cửa hàng</Text>
          </TouchableOpacity>

          <Text style={styles.hintText}>Auth Stack · chưa có token</Text>
        </View>
      </KeyboardAvoidingView>

      {!isWatermarkTop && <Watermark />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  slogan: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 28,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
