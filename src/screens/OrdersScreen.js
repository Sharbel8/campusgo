// Screen 7 — Order history.
// Every placed order is saved under the key 'orders'. This tab
// lists them, filters by store and status, and can put one order
// back into the cart with Reorder.
import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import campus from '../data/campus.json';
import { useCart } from '../context/CartContext';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, typography } from '../theme/theme';

const STATUSES = ['All', 'Received', 'Preparing', 'On the way', 'Delivered', 'Cancelled'];

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function productById(id) {
  for (let i = 0; i < campus.products.length; i++) {
    if (campus.products[i].id === id) {
      return campus.products[i];
    }
  }
  return null;
}

function when(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const minutes = date.getMinutes();
  const mm = minutes < 10 ? '0' + minutes : String(minutes);
  const hours = date.getHours();
  const hh = hours < 10 ? '0' + hours : String(hours);
  return date.getDate() + '/' + (date.getMonth() + 1) + '  ' + hh + ':' + mm;
}

function itemSummary(items) {
  const parts = [];
  for (let i = 0; i < items.length; i++) {
    parts.push(items[i].quantity + ' × ' + items[i].name);
  }
  return parts.join(', ');
}

function stars(count) {
  let text = '';
  for (let i = 0; i < count; i++) {
    text = text + '★';
  }
  return text;
}

// Keep an order only when it matches the two chips the user picked.
function matchingOrders(orders, storeId, status) {
  const result = [];
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const storeOk = storeId === 'all' || order.storeId === storeId;
    const statusOk = status === 'All' || order.status === status;
    if (storeOk && statusOk) {
      result.push(order);
    }
  }
  return result;
}

function statusStyle(status) {
  if (status === 'Delivered') return 'ok';
  if (status === 'Cancelled') return 'no';
  if (status === 'Preparing' || status === 'On the way') return 'wait';
  return 'new';
}

function OrderCard(props) {
  const order = props.order;
  const tone = statusStyle(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardBody}>
          <Text style={styles.storeName}>{order.storeName}</Text>
          <Text style={styles.when}>{when(order.createdAt)} · {order.id}</Text>
        </View>
        <View style={[styles.badge, styles['badge_' + tone]]}>
          <Text style={styles.badgeText}>{order.status}</Text>
        </View>
      </View>
      <Text style={styles.summary}>{itemSummary(order.items)}</Text>
      <Text style={styles.meta}>
        {order.buildingName}, Room {order.room} · {order.slotLabel}
      </Text>
      <Text style={styles.total}>
        {money(order.total)} · {order.payment === 'wallet' ? 'Campus Wallet' : 'Cash'}
      </Text>
      {order.rating > 0 && <Text style={styles.rating}>{stars(order.rating)}</Text>}
      <View style={styles.actions}>
        <Pressable onPress={() => props.onTrack(order)}>
          <Text style={styles.track}>Track</Text>
        </Pressable>
        <AppButton title="Reorder" variant="secondary" onPress={() => props.onReorder(order)} style={styles.reorder} />
      </View>
    </View>
  );
}

export default function OrdersScreen({ navigation }) {
  const { items, cartStoreId, addItem, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [storeId, setStoreId] = useState('all');
  const [status, setStatus] = useState('All');
  const [note, setNote] = useState('');

  const storeFilters = [{ id: 'all', name: 'All stores' }].concat(campus.stores);
  const visible = matchingOrders(orders, storeId, status);

  // Reload every time this tab is opened. A status that changed on
  // the tracking screen is then already saved and shows up here.
  useEffect(() => {
    function loadOrders() {
      AsyncStorage.getItem('orders').then((value) => {
        setOrders(value ? JSON.parse(value) : []);
      });
    }
    loadOrders();
    return navigation.addListener('focus', loadOrders);
  }, [navigation]);

  function trackOrder(order) {
    navigation.navigate('OrderTracking', {
      orderId: order.id,
      buildingName: order.buildingName,
      room: order.room,
    });
  }

  // Copy the lines that are still in stock. A print job is not a
  // product in the menu, so it is always allowed.
  function linesToAdd(order) {
    const lines = [];
    const skipped = [];
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const product = productById(item.productId);
      if (product && product.inStock === false) {
        skipped.push(item.name);
      } else {
        const copy = {
          key: item.productId === 'print' ? 'print-' + Date.now() + '-' + i : item.key,
          productId: item.productId,
          storeId: item.storeId,
          name: item.name,
          category: item.category,
          size: item.size,
          extras: item.extras,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        };
        lines.push(copy);
      }
    }
    return { lines: lines, skipped: skipped };
  }

  function putInCart(order, emptyFirst) {
    const result = linesToAdd(order);
    if (result.lines.length === 0) {
      setNote('Those items are out of stock, so nothing was added.');
      return;
    }
    if (emptyFirst) {
      clearCart();
    }
    for (let i = 0; i < result.lines.length; i++) {
      addItem(result.lines[i]);
    }
    if (result.skipped.length > 0) {
      setNote('Added to the cart. Left out (out of stock): ' + result.skipped.join(', ') + '.');
    } else {
      setNote('');
    }
    navigation.navigate('Cart');
  }

  function reorder(order) {
    const otherStore = items.length > 0 && cartStoreId !== order.storeId;
    if (otherStore) {
      Alert.alert(
        'Start a new cart?',
        'Your cart has items from another store. Empty it and add this order?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Empty cart', style: 'destructive', onPress: () => putInCart(order, true) },
        ]
      );
      return;
    }
    putInCart(order, false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <OrderCard order={item} onTrack={trackOrder} onReorder={reorder} />}
        ListHeaderComponent={
          <View>
            <Text style={typography.eyebrow}>History</Text>
            <Text style={typography.title}>Orders</Text>
            <Text style={styles.intro}>Filter by store or status. Reorder puts the same items back in the cart.</Text>
            {note !== '' && <Text style={styles.note}>{note}</Text>}

            <FlatList
              horizontal
              data={storeFilters}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setStoreId(item.id)}
                  style={[styles.chip, storeId === item.id && styles.chipOn]}
                >
                  <Text style={[styles.chipText, storeId === item.id && styles.chipTextOn]}>{item.name}</Text>
                </Pressable>
              )}
            />
            <FlatList
              horizontal
              data={STATUSES}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setStatus(item)}
                  style={[styles.chip, status === item && styles.chipOn]}
                >
                  <Text style={[styles.chipText, status === item && styles.chipTextOn]}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {orders.length === 0 ? 'No orders yet. Place one from the cart.' : 'No order matches those filters.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  intro: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, marginBottom: spacing.md },
  note: { color: colors.warning, fontSize: 14, marginBottom: spacing.md },
  chips: { paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextOn: { color: colors.onAccent },
  empty: { color: colors.textMuted, fontSize: 16, marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardBody: { flex: 1, marginRight: spacing.md },
  storeName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  when: { color: colors.textFaint, fontSize: 13, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  badge_ok: { backgroundColor: colors.success },
  badge_no: { backgroundColor: colors.danger },
  badge_wait: { backgroundColor: colors.warning },
  badge_new: { backgroundColor: colors.surface2 },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  summary: { color: colors.text, fontSize: 15, marginTop: spacing.sm },
  meta: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  total: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: spacing.sm },
  rating: { color: colors.warning, fontSize: 16, marginTop: 4 },
  actions: { marginTop: spacing.md },
  track: { color: colors.accent, fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
  reorder: { height: 48 },
});
