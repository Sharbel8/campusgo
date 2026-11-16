// The bag icon in the top-right corner of the Store Menu and
// Product Details headers. The tab bar is hidden on those screens,
// so this is where the cart badge (number of items) is shown.
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { colors } from '../theme/theme';

export default function CartButton() {
  // useNavigation() gives us "navigation" in a component
  // that is not a screen itself.
  const navigation = useNavigation();
  const { itemCount } = useCart();

  return (
    <Pressable
      // Cart is a tab INSIDE MainTabs, so we name both.
      onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
      hitSlop={10}
      style={styles.button}
    >
      <Ionicons name="bag-handle-outline" size={24} color={colors.text} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 4 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.onAccent, fontSize: 11, fontWeight: '700' },
});
