// Screen 3a — Store Menu.
// Shows the products of one store, grouped by category
// (Sandwiches, Hot meals...). Tapping a product opens its details.
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import campus from '../data/campus.json';
import ProductImage from '../components/ProductImage';
import { colors, spacing, radius, typography } from '../theme/theme';

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function findStore(storeId) {
  for (let i = 0; i < campus.stores.length; i++) {
    if (campus.stores[i].id === storeId) {
      return campus.stores[i];
    }
  }
  return null;
}

// The brief asks for products GROUPED by category, and every list
// must be a FlatList. So we build ONE list that mixes two kinds of
// rows: a "header" row for each category, then its "product" rows.
//   [ {type:'header', title:'Sandwiches'},
//     {type:'product', product:{...}}, ...
//     {type:'header', title:'Hot meals'}, ... ]
function buildRows(storeId) {
  // 1) Collect the categories of this store, in the JSON order.
  const categories = [];
  for (let i = 0; i < campus.products.length; i++) {
    const product = campus.products[i];
    if (product.storeId === storeId && categories.indexOf(product.category) === -1) {
      categories.push(product.category);
    }
  }

  // 2) For each category: one header, then its products.
  const rows = [];
  for (let c = 0; c < categories.length; c++) {
    rows.push({ type: 'header', key: 'h-' + categories[c], title: categories[c] });
    for (let i = 0; i < campus.products.length; i++) {
      const product = campus.products[i];
      if (product.storeId === storeId && product.category === categories[c]) {
        rows.push({ type: 'product', key: product.id, product: product });
      }
    }
  }
  return rows;
}

function ProductRow(props) {
  const product = props.product;
  const hasOptions = product.sizes || product.extras;

  return (
    <Pressable
      onPress={() => props.onPress(product)}
      style={({ pressed }) => [
        styles.card,
        !product.inStock && styles.cardOut, // faded when out of stock
        pressed && styles.pressed,
      ]}
    >
      <ProductImage productId={product.id} category={product.category} />
      <View style={styles.cardBody}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {hasOptions ? 'from ' : ''}
          {money(product.price)}
        </Text>
        {/* Out-of-stock products are still shown, with a label */}
        {!product.inStock && (
          <View style={styles.outBadge}>
            <Text style={styles.outText}>Out of stock</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
    </Pressable>
  );
}

export default function StoreMenuScreen({ navigation, route }) {
  // storeId comes from Home: navigate('StoreMenu', { storeName, storeId })
  const { storeId } = route.params;
  const store = findStore(storeId);
  const rows = buildRows(storeId);

  function openProduct(product) {
    navigation.navigate('ProductDetails', { productId: product.id });
  }

  // renderItem draws a different row depending on its type.
  function renderRow({ item }) {
    if (item.type === 'header') {
      return <Text style={styles.section}>{item.title}</Text>;
    }
    return <ProductRow product={item.product} onPress={openProduct} />;
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.key}
      renderItem={renderRow}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.info}>
          <Text style={typography.eyebrow}>Store menu</Text>
          <Text style={styles.infoText}>
            {store.category} · ready in about {store.prepMinutes} min · {store.opens}–{store.closes}
          </Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>This store has no products yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  info: { marginBottom: spacing.sm },
  infoText: { ...typography.caption, marginTop: spacing.xs },
  section: { ...typography.heading, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardOut: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
  cardBody: { flex: 1, marginLeft: spacing.md },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  price: { color: colors.textMuted, fontSize: 15, marginTop: 2 },
  outBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
  },
  outText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: 15, marginTop: spacing.md },
});
