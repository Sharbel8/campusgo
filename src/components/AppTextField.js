// A label + text box. Same idea as the Cat component in class:
// the parent passes props, this component only displays them.
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/theme';

const AppTextField = (props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
      />
    </View>
  );
};

export default AppTextField;

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  },
});
