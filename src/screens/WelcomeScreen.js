// Screen 1 — Welcome / Login.
// Phase 1: only the hero part (logo, name, intro) + a temporary
// "Continue" button. Phase 3 adds the real Sign In / Sign Up forms.
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, typography } from '../theme/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.accessPill}>
          <Text style={styles.accessText}>Student & Staff Access</Text>
        </View>

        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>CG</Text>
          </View>
          <View>
            <Text style={styles.appName}>CampusGo</Text>
            <Text style={styles.tagline}>Order · Print · Deliver</Text>
          </View>
        </View>

        <Text style={[typography.hero, styles.center]}>Your break, delivered.</Text>
        <Text style={[typography.muted, styles.center, { marginTop: spacing.md }]}>
          Order from the cafeteria, coffee corner, bookstore and printing office of
          Université Antonine — delivered to your classroom.
        </Text>
      </View>

      <View style={styles.sheet}>
        <Text style={typography.eyebrow}>Phase 1 preview</Text>
        <Text style={[typography.title, { marginTop: 6 }]}>Welcome</Text>
        <Text style={[typography.muted, { marginTop: 6, marginBottom: spacing.lg }]}>
          The sign-in form arrives in phase 3.
        </Text>
        {/* replace() swaps this screen for the tabs, so "back" can't return here */}
        <AppButton title="Continue" onPress={() => navigation.replace('MainTabs')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { flex: 1, justifyContent: 'center', padding: spacing.lg },
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
  accessText: { ...typography.eyebrow, color: colors.text, opacity: 0.7 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -1 },
  appName: { color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -1.2 },
  tagline: { ...typography.eyebrow, fontSize: 11 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
