// A reusable button with three looks:
//  - "primary":   solid blue (main action)
//  - "secondary": glassy dark with a thin border (like "Continue with Google")
//  - "ghost":     text only
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';

export default function AppButton({ title, onPress, variant = 'primary', disabled = false, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'ghost' && styles.ghostText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  text: { color: colors.text, fontSize: 16, fontWeight: '700' },
  ghostText: { color: colors.accent },
});
