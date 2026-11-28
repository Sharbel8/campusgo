// Screen 3b — Product Details.
// The user picks a size, extras and a quantity, sees the price
// update live, and adds the product to the cart.
import { useState } from 'react';
import { View, Text, Pressable, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import campus from '../data/campus.json';
import { useCart } from '../context/CartContext';
import AppButton from '../components/AppButton';
import ProductImage from '../components/ProductImage';
import { colors, spacing, radius, typography } from '../theme/theme';

const MAX_QUANTITY = 20;

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function findById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

export default function ProductDetailsScreen({ navigation, route }) {
  const { productId } = route.params;
  const product = findById(campus.products, productId);
  const store = findById(campus.stores, product.storeId);

  // Products without sizes/extras in the JSON get empty lists.
  const sizes = product.sizes || [];
  const extras = product.extras || [];

  // What the user has chosen. The first size is selected by default.
  const [sizeName, setSizeName] = useState(sizes.length > 0 ? sizes[0].name : null);
  const [chosenExtras, setChosenExtras] = useState([]); // list of extra names
  const [quantity, setQuantity] = useState(1);

  const { cartStoreId, addItem, clearCart } = useCart();

  // ---- Live price --------------------------------------------
  // These lines run again on every render, and a render happens
  // every time a useState value changes. So the price is always
  // up to date, without any extra code.
  let unitPrice = product.price;  //unit price is the price of the product being updated live
  for (let i = 0; i < sizes.length; i++) {
    if (sizes[i].name === sizeName) {
      unitPrice += sizes[i].price;
    }
  }
  for (let i = 0; i < extras.length; i++) {
    if (chosenExtras.indexOf(extras[i].name) !== -1) {
      unitPrice += extras[i].price;
    }
  }
  const total = unitPrice * quantity;

  // Tap an extra once to add it, tap again to remove it.
  function toggleExtra(name) {
    if (chosenExtras.indexOf(name) !== -1) {
      setChosenExtras(chosenExtras.filter((extra) => extra !== name));//filter out if already checked in the list
    } else {
      setChosenExtras([...chosenExtras, name]);
    }
  }

  function changeQuantity(amount) {
    const next = quantity + amount;
    if (next >= 1 && next <= MAX_QUANTITY) {
      setQuantity(next);
    }
  }

  // ---- Add to cart -------------------------------------------
  function buildCartItem() {
    // Keep the extras in the JSON order, so "Oat milk + Extra shot"
    // and "Extra shot + Oat milk" become the same cart line.
    const extrasInOrder = [];
    for (let i = 0; i < extras.length; i++) {
      if (chosenExtras.indexOf(extras[i].name) !== -1) {
        extrasInOrder.push(extras[i].name);
      }
    }
    return {
      key: product.id + '|' + (sizeName || '') + '|' + extrasInOrder.join('+'),
      productId: product.id,
      storeId: product.storeId,
      name: product.name,
      category: product.category,
      size: sizeName,
      extras: extrasInOrder,
      unitPrice: unitPrice,
      quantity: quantity,
    };
  }

  function addAndGoBack(item) {
    addItem(item);
    navigation.goBack(); // back to the menu; the badge shows the new count
  }

  function onAddPress() {
    const item = buildCartItem();

    // RULE: the cart holds products from ONE store only.
    if (cartStoreId !== null && cartStoreId !== product.storeId) {
      const cartStore = findById(campus.stores, cartStoreId);
      Alert.alert(
        'Start a new cart?',
        'Your cart has items from ' + cartStore.name + '. Empty it to add items from ' + store.name + '?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Empty cart',
            style: 'destructive',
            onPress: () => {
              clearCart();
              addAndGoBack(item);
            },
          },
        ],
      );
      return;
    }

    addAndGoBack(item);
  }

  // ---- Screen ------------------------------------------------
  // The extras are the list (FlatList). Everything above them goes
  // in ListHeaderComponent so the whole page scrolls together.
  const header = (
    <View>
      <View style={styles.hero}>
        <ProductImage productId={product.id} category={product.category} size={120} />
      </View>
      <Text style={typography.eyebrow}>
        {store.name} · {product.category}
      </Text>
      <Text style={[typography.title, styles.title]}>{product.name}</Text>
      <Text style={styles.basePrice}>{money(product.price)}</Text>

      {!product.inStock && (
        <View style={styles.outBox}>
          <Ionicons name="alert-circle" size={18} color={colors.text} />
          <Text style={styles.outText}>Out of stock. You can't add this product right now.</Text>
        </View>
      )}

      {sizes.length > 0 && (
        <View>
          <Text style={styles.label}>SIZE</Text>
          <FlatList
            horizontal
            data={sizes}
            keyExtractor={(item) => item.name}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const on = item.name === sizeName;
              return (
                <Pressable onPress={() => setSizeName(item.name)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {item.name}
                    {item.price > 0 ? ' +' + money(item.price) : ''}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {extras.length > 0 && <Text style={styles.label}>EXTRAS</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={extras}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        renderItem={({ item }) => {
          const on = chosenExtras.indexOf(item.name) !== -1;  //if the extra is in the list, then it is checked
          return (
            <Pressable onPress={() => toggleExtra(item.name)} style={[styles.extra, on && styles.extraOn]}>
              <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={colors.text} /> //checkbox if checked, square-outline if not checked
              <Text style={styles.extraName}>{item.name}</Text>
              <Text style={styles.extraPrice}>{item.price > 0 ? '+' + money(item.price) : 'Free'}</Text>
            </Pressable>
          );
        }}
      />

      {/* Bottom bar: quantity selector + Add button, always visible */}
      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <Pressable  //minus button
            onPress={() => changeQuantity(-1)}
            disabled={quantity <= 1}
            style={[styles.qtyButton, quantity <= 1 && styles.qtyDisabled]}
          >
            <Ionicons name="remove" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.qty}>{quantity}</Text>
          <Pressable
            onPress={() => changeQuantity(1)}
            disabled={quantity >= MAX_QUANTITY}
            style={[styles.qtyButton, quantity >= MAX_QUANTITY && styles.qtyDisabled]}
          >
            <Ionicons name="add" size={22} color={colors.text} />
          </Pressable>
        </View>
        <AppButton
          style={styles.addButton}
          title={product.inStock ? 'Add · ' + money(total) : 'Out of stock'}
          disabled={!product.inStock}
          onPress={onAddPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.sm },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  title: { marginTop: spacing.xs },
  basePrice: { color: colors.textMuted, fontSize: 18, fontWeight: '600', marginTop: spacing.xs },
  outBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  outText: { color: colors.text, fontWeight: '600', flex: 1 },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextOn: { color: colors.onAccent },
  extra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  extraOn: { borderColor: colors.accent, backgroundColor: colors.surface2 },
  extraName: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1, marginLeft: spacing.sm },
  extraPrice: { color: colors.textMuted, fontSize: 15 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.tabBar,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
  qtyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisabled: { opacity: 0.4 },
  qty: { color: colors.text, fontSize: 20, fontWeight: '700', minWidth: 36, textAlign: 'center' },
  addButton: { flex: 1 },
});
