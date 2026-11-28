// Screen 1 — Welcome / Login / Sign up.
// Written the same way as class: one function component, useState
// for each box, and if statements for the checks.
import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppButton from '../components/AppButton';
import AppTextField from '../components/AppTextField';
import { colors, spacing, radius, typography } from '../theme/theme';

import uaLogo from '../../assets/ua-logo.png';

// Keep only the number characters. "03 123 456" becomes "03123456".
function onlyDigits(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch >= '0' && ch <= '9') {
      result = result + ch;
    }
  }
  return result;
}

export default function WelcomeScreen({ navigation }) {
  // 'login' shows email + password. 'signup' shows the full form.
  const [mode, setMode] = useState('login');

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // One message under the form (in red appearing for all errors).
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === '' || !cleanEmail.endsWith('@ua.edu.lb')) {
      setError('Email must end with @ua.edu.lb.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // AsyncStorage is the phone's saved text. 'users' is the list of accounts.
    const saved = await AsyncStorage.getItem('users');
    const users = saved ? JSON.parse(saved) : [];

    let found = null;
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === cleanEmail && users[i].password === password) {
        found = users[i];
      }
    }

    if (found === null) {
      setError('Email or password is incorrect.');
      return;
    }

    // Accounts created before the wallet field existed start at 0.
    if (typeof found.walletBalance !== 'number') {
      found.walletBalance = 0;
    }
    if (!found.transactions) {
      found.transactions = [];
    }

    // Remember who is logged in, then open the tabs.
    // replace() removes this screen, so Back cannot return to it.
    await AsyncStorage.setItem('users', JSON.stringify(users));
    await AsyncStorage.setItem('session', JSON.stringify(found));
    navigation.replace('MainTabs');
  };

  const handleSignUp = async () => {
    if (fullName.trim().indexOf(' ') === -1) {
      setError('Enter your first and last name.');
      return;
    }

    const id = studentId.trim();
    if (onlyDigits(id) !== id || id.length < 5 || id.length > 10) {
      setError('ID must be 5 to 10 digits.');
      return;
    }

    if (faculty.trim() === '') {
      setError('Enter your faculty.');
      return;
    }

    let digits = onlyDigits(phone);
    if (digits.indexOf('961') === 0) {
      digits = digits.slice(3);
    }
    if (digits.length !== 8) {
      setError('Enter an 8-digit phone number, e.g. 03123456.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === '' || !cleanEmail.endsWith('@ua.edu.lb')) {
      setError('Email must end with @ua.edu.lb.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const saved = await AsyncStorage.getItem('users');
    const users = saved ? JSON.parse(saved) : [];

    for (let i = 0; i < users.length; i++) {
      if (users[i].email === cleanEmail) {
        setError('An account with this email already exists. Sign in instead.');
        return;
      }
    }

    //if all checks pass, create the account and save it to AsyncStorage.
    const account = {
      fullName: fullName.trim(),
      studentId: id,
      faculty: faculty.trim(),
      phone: digits,
      email: cleanEmail,
      password: password,
      walletBalance: 0,
      transactions: [],
    };

    users.push(account);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    await AsyncStorage.setItem('session', JSON.stringify(account));
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* When the keyboard opens, this shrinks the page so the
          field you are typing in stays above the keyboard.
          "padding" is the iPhone way. Android already resizes the screen. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.hero}>
          <View style={styles.accessPill}>
            <Text style={styles.accessText}>Student & Staff Access</Text>
          </View>

          <View style={styles.logoLockup}>
            <Image source={uaLogo} style={styles.logoMark} />
            <Text style={styles.appName}>CampusGo</Text>
          </View>
          <Text style={styles.tagline}>Order · Print · Deliver</Text>
          <Text style={[typography.muted, styles.center]}>
            Order from campus and get it in your classroom during the break.
          </Text>
        </View>

        <View style={styles.sheet}>
          <View style={styles.switcher}>
            <Pressable
              onPress={() => {
                setMode('login');
                setError('');
              }}
              style={[styles.switchBtn, mode === 'login' && styles.switchBtnOn]}
            >
              <Text style={styles.switchText}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode('signup');
                setError('');
              }}
              style={[styles.switchBtn, mode === 'signup' && styles.switchBtnOn]}
            >
              <Text style={styles.switchText}>Sign up</Text>
            </Pressable>
          </View>

          {mode === 'signup' && (
            <View>
              <AppTextField
                label="FULL NAME"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Charbel Estephan"
                autoCapitalize="words"
              />
              <AppTextField
                label="STUDENT / STAFF ID"
                value={studentId}
                onChangeText={setStudentId}
                placeholder="202210546"
                keyboardType="number-pad"
              />
              <AppTextField
                label="FACULTY"
                value={faculty}
                onChangeText={setFaculty}
                placeholder="Engineering"
                autoCapitalize="words"
              />
              <AppTextField
                label="PHONE"
                value={phone}
                onChangeText={setPhone}
                placeholder="03123456"
                keyboardType="phone-pad"
              />
            </View>
          )}

          <AppTextField
            label="UNIVERSITY EMAIL"
            value={email}
            onChangeText={setEmail}
            placeholder="name@ua.edu.lb"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppTextField
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          {mode === 'login' ? (
            <AppButton title="Sign in" onPress={handleLogin} />
          ) : (
            <AppButton title="Create account" onPress={handleSignUp} />
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },
  hero: { padding: spacing.lg },
  center: { textAlign: 'center' },
  accessPill: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  accessText: { color: colors.text, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  logoLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoMark: { width: 64, height: 66, marginRight: spacing.sm, backgroundColor: colors.background },
  appName: { color: colors.text, fontSize: 32, fontWeight: '800' },
  tagline: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.lg,
  },
  switchBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnOn: { backgroundColor: colors.glassActive },
  switchText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 14, marginBottom: spacing.md, textAlign: 'center' },
});
