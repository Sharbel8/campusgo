// Screen 5 — Cart.
// Shows what is saved in the cart, with + / − and remove.
// The delivery fee and the $2 minimum are worked out here.
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import campus from '../data/campus.json';
import { useCart } from '../context/CartContext';
import AppButton from '../components/AppButton';
import ProductImage from '../components/ProductImage';
import { colors, spacing, radius, typography } from '../theme/theme';

const RULES = campus.delivery;

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

// Free when the goods cost more than $10. Otherwise $0.50.
function deliveryFee(subtotal) {
  if (subtotal > RULES.freeAbove) {
    return 0;
  }
  return RULES.fee;
}

function findStore(id) {
  for (let i = 0; i < campus.stores.length; i++) {
    if (campus.stores[i].id === id) {
      return campus.stores[i];
    }
  }
  return null;
}

function detailText(item) {
  const parts = [];
  if (item.size) {
    parts.push(item.size);
  }
  if (item.extras && item.extras.length > 0) {
    for (let i = 0; i < item.extras.length; i++) {
      parts.push(item.extras[i]);
    }
  }
  return parts.join(' · ');
}

function CartLine(props) {
  const item = props.item;
  const lineTotal = item.unitPrice * item.quantity;
  const details = detailText(item);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <ProductImage productId={item.productId} category={item.category} />
        <View style={styles.cardBody}>
          <Text style={styles.name}>{item.name}</Text>
          {details !== '' && <Text style={styles.details}>{details}</Text>}
          <Text style={styles.each}>{money(item.unitPrice)} each</Text>
        </View>
        <Text style={styles.lineTotal}>{money(lineTotal)}</Text>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.stepper}>
          <Pressable onPress={() => props.onChange(item.key, -1)} style={styles.stepButton}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable onPress={() => props.onChange(item.key, 1)} style={styles.stepButton}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => props.onRemove(item.key)}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }) {
  const { items, cartStoreId, subtotal, changeQuantity, removeItem } = useCart();
  const store = findStore(cartStoreId);
  const fee = items.length === 0 ? 0 : deliveryFee(subtotal);
  const total = subtotal + fee;
  const belowMinimum = items.length > 0 && subtotal < RULES.minimum;

  function goToCheckout() {
    if (items.length === 0 || belowMinimum) {
      return;
    }
    navigation.navigate('Checkout');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <CartLine item={item} onChange={changeQuantity} onRemove={removeItem} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={typography.eyebrow}>Your order</Text>
            <Text style={typography.title}>Cart</Text>
            {store && <Text style={styles.storeLine}>From {store.name}</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        ListFooterComponent={
          items.length === 0 ? null : (
            <View style={styles.summary}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Subtotal</Text>
                <Text style={styles.rowValue}>{money(subtotal)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{fee === 0 ? 'Delivery (free above $10)' : 'Delivery'}</Text>
                <Text style={styles.rowValue}>{fee === 0 ? 'Free' : money(fee)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{money(total)}</Text>
              </View>
              {belowMinimum && (
                <Text style={styles.error}>Minimum order is {money(RULES.minimum)}.</Text>
              )}
              <AppButton title="Checkout" onPress={goToCheckout} disabled={belowMinimum} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  storeLine: { color: colors.textMuted, fontSize: 15, marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontSize: 16, marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardBody: { flex: 1, marginLeft: spacing.md, marginRight: spacing.md },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  details: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  each: { color: colors.textFaint, fontSize: 13, marginTop: 4 },
  lineTotal: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  qty: { color: colors.text, fontSize: 16, fontWeight: '700', marginHorizontal: spacing.md },
  remove: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  summary: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: colors.textMuted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  totalLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
  totalValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 14, marginBottom: spacing.md, marginTop: spacing.sm },
});
