// A temporary screen layout used in Phase 1 so every screen exists
// and can be navigated to. Each later phase replaces one of these
// with the real screen. It already uses the PadelLab look:
// icon tile + uppercase label + big title + glassy card.
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';

export default function PlaceholderScreen({
  eyebrow, // small uppercase label
  title, // big title
  subtitle, // description
  icon = 'cube-outline', // Ionicons name
  phase, // which phase builds the real screen
  withTopInset = false, // true for tab screens (they have no header)
  children, // buttons used to test navigation
}) {
  return (
    <SafeAreaView style={styles.safe} edges={withTopInset ? ['top'] : []}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.iconTile}>
            <Ionicons name={icon} size={24} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.eyebrow}>{eyebrow}</Text>
            <Text style={[typography.title, { marginTop: 4 }]}>{title}</Text>
          </View>
        </View>

        {subtitle ? <Text style={[typography.muted, styles.subtitle]}>{subtitle}</Text> : null}

        <View style={styles.card}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Coming in phase {phase}</Text>
          </View>
          <Text style={typography.muted}>
            This is a placeholder. Use the buttons below to test the navigation.
          </Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>{children}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { marginTop: spacing.md },
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.glassActive,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  pillText: { ...typography.eyebrow, fontSize: 11, color: colors.text },
});
