import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ALIGN } from '../constants/theme';
import { API_ENDPOINTS } from '../utils/api';
import axios from 'axios';

export default function LoginScreen({ onLoginSuccess, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.login, {
        email,
        password,
      });

      const data = response.data;

      if (data.success) {
        // Check if user has memberships
        if (data.memberships && data.memberships.length > 0) {
          // Pass user and memberships to parent
          onLoginSuccess(data.user, data.memberships);
        } else {
          // No memberships
          Alert.alert('No Membership', "You don't have any active gym memberships.");
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Could not connect to server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onForgotPassword();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="fitness" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>
            GYM<Text style={styles.titleAccent}>NEXUS</Text>
          </Text>
          <Text style={styles.subtitle}>Crush your limits today.</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              // placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              // placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Gradient Button */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} disabled={isLoading}>
            <LinearGradient
              colors={[COLORS.primary, '#96E6A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Text style={styles.buttonText}>SIGN IN</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Biometric Login Mock */}
          <TouchableOpacity style={styles.biometricBtn}>
            <Ionicons name="finger-print" size={32} color={COLORS.primary} />
            <Text style={styles.biometricText}>Tap to use FaceID</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
  },
  titleAccent: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 1,
  },
  biometricBtn: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    ...ALIGN.rowBetween,
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
