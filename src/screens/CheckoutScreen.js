// Screen 5 — Checkout.
// The user picks a building, a room, and a class break, then pays
// with the Campus Wallet or with cash. Wallet is refused when the
// balance is too low. A slot is disabled if it has passed, or if
// the store cannot prepare the order before that break starts.
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import campus from '../data/campus.json';
import { useCart } from '../context/CartContext';
import { toMinutes, minutesNow, isStoreOpen } from '../utils/storeHours';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, typography } from '../theme/theme';
import { loadWallet, saveWallet } from '../utils/wallet';

const RULES = campus.delivery;

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function deliveryFee(subtotal) {
  if (subtotal > RULES.freeAbove) {
    return 0;
  }
  return RULES.fee;
}

// Skip it when the same building and room are already saved.
async function rememberLocation(building, room) {
  const raw = await AsyncStorage.getItem('locations');
  const list = raw ? JSON.parse(raw) : [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].buildingId === building.id && list[i].room === room) {
      return;
    }
  }
  list.unshift({
    id: 'L-' + String(Date.now()),
    buildingId: building.id,
    buildingName: building.name,
    room: room,
  });
  await AsyncStorage.setItem('locations', JSON.stringify(list));
}

function findStore(id) {
  for (let i = 0; i < campus.stores.length; i++) {
    if (campus.stores[i].id === id) {
      return campus.stores[i];
    }
  }
  return null;
}

function findById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

// '' means the slot can be chosen. Any other text is why it is disabled.
function slotProblem(slot, prepMinutes) {
  // Temporary, for testing at night. Set slotsAlwaysAvailable back to
  // false in campus.json so passed breaks are disabled again.
  if (campus.slotsAlwaysAvailable) {
    return '';
  }
  const now = minutesNow();
  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  if (end <= now) {
    return 'Already passed';
  }
  if (start < now + prepMinutes) {
    return 'Too soon to prepare';
  }
  return '';
}

export default function CheckoutScreen({ navigation }) {
  const { items, cartStoreId, subtotal, clearCart } = useCart();
  const store = findStore(cartStoreId);
  const fee = deliveryFee(subtotal);
  const total = subtotal + fee;
  const open = store ? isStoreOpen(store) : false;

  const [buildingId, setBuildingId] = useState('');
  const [room, setRoom] = useState('');
  const [slotId, setSlotId] = useState('');
  const [payment, setPayment] = useState('cash');
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  // This account's balance, so a low balance blocks wallet payment.
  useEffect(() => {
    loadWallet().then((wallet) => {
      setBalance(wallet.balance);
    });
  }, []);

  async function placeOrder() {
    setError('');
    if (!store || items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!open) {
      setError(store.name + ' is closed and cannot take this order.');
      return;
    }
    if (subtotal < RULES.minimum) {
      setError('Minimum order is ' + money(RULES.minimum) + '.');
      return;
    }
    if (buildingId === '') {
      setError('Choose a building.');
      return;
    }
    if (room.trim() === '') {
      setError('Enter the room number.');
      return;
    }
    const slot = findById(campus.slots, slotId);
    if (slot === null || slotProblem(slot, store.prepMinutes) !== '') {
      setError('Choose a delivery slot that is still available.');
      return;
    }
    if (payment === 'wallet' && balance < total) {
      setError('Not enough money in the Campus Wallet. The balance is ' + money(balance) + '.');
      return;
    }

    setPlacing(true);
    const building = findById(campus.buildings, buildingId);
    const order = {
      id: 'CG-' + String(Date.now()).slice(-6),
      storeId: store.id,
      storeName: store.name,
      items: JSON.parse(JSON.stringify(items)),
      subtotal: subtotal,
      deliveryFee: fee,
      total: total,
      buildingId: building.id,
      buildingName: building.name,
      room: room.trim(),
      slotId: slot.id,
      slotLabel: slot.label,
      payment: payment,
      status: 'Received',
      createdAt: new Date().toISOString(),
    };

    if (payment === 'wallet') {
      const wallet = await loadWallet();
      const nextBalance = Math.round((wallet.balance - total) * 100) / 100;
      const entry = {
        id: 'T-' + order.id,
        type: 'payment',
        label: store.name + ' · ' + order.id,
        amount: -total,
        createdAt: order.createdAt,
      };
      await saveWallet(nextBalance, [entry].concat(wallet.transactions));
    }

    // Keep this building and room on the profile for next time.
    await rememberLocation(building, room.trim());

    const saved = await AsyncStorage.getItem('orders');
    const orders = saved ? JSON.parse(saved) : [];
    orders.unshift(order);
    await AsyncStorage.setItem('orders', JSON.stringify(orders));

    clearCart();
    navigation.replace('OrderTracking', {
      orderId: order.id,
      buildingName: order.buildingName,
      room: order.room,
    });
  }

  const header = (
    <View>
      <Text style={typography.eyebrow}>Checkout</Text>
      <Text style={typography.title}>Delivery</Text>
      {store && (
        <Text style={styles.intro}>
          {store.name} · {money(subtotal)} + {fee === 0 ? 'free delivery' : money(fee) + ' delivery'} ={' '}
          {money(total)}
        </Text>
      )}
      {store && !open && (
        <Text style={styles.error}>{store.name} is closed (open {store.opens}–{store.closes}).</Text>
      )}

      <Text style={styles.label}>BUILDING</Text>
    </View>
  );

  const footer = (
    <View>
      <Text style={styles.label}>ROOM</Text>
      <TextInput
        style={styles.input}
        value={room}
        onChangeText={setRoom}
        placeholder="e.g. 204"
        placeholderTextColor={colors.textFaint}
      />

      <Text style={styles.label}>CLASS BREAK</Text>
      <Text style={styles.hint}>
        {store
          ? store.name + ' needs ' + store.prepMinutes + ' min, so a break that starts sooner is disabled.'
          : ''}
      </Text>
      <FlatList
        data={campus.slots}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={{ height: campus.slots.length * 84 }}
        renderItem={({ item }) => {
          const problem = store ? slotProblem(item, store.prepMinutes) : 'Unavailable';
          const disabled = problem !== '';
          const selected = item.id === slotId;
          return (
            <Pressable
              disabled={disabled}
              onPress={() => setSlotId(item.id)}
              style={[styles.choice, selected && styles.choiceOn, disabled && styles.choiceOff]}
            >
              <Text style={styles.choiceText}>{item.label}</Text>
              {disabled && <Text style={styles.problem}>{problem}</Text>}
            </Pressable>
          );
        }}
      />

      <Text style={styles.label}>PAYMENT</Text>
      <View style={styles.payRow}>
        <Pressable
          onPress={() => setPayment('wallet')}
          style={[styles.payButton, payment === 'wallet' && styles.choiceOn]}
        >
          <Text style={styles.choiceText}>Campus Wallet</Text>
          <Text style={styles.hint}>{money(balance)}</Text>
        </Pressable>
        <Pressable
          onPress={() => setPayment('cash')}
          style={[styles.payButton, payment === 'cash' && styles.choiceOn]}
        >
          <Text style={styles.choiceText}>Cash on delivery</Text>
        </Pressable>
      </View>

      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <AppButton
        title={placing ? 'Please wait…' : 'Place order · ' + money(total)}
        onPress={placeOrder}
        disabled={placing || !open || items.length === 0}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={campus.buildings}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={({ item }) => {
          const selected = item.id === buildingId;
          return (
            <Pressable
              onPress={() => setBuildingId(item.id)}
              style={[styles.choice, selected && styles.choiceOn]}
            >
              <Text style={styles.choiceText}>{item.name}</Text>
            </Pressable>
          );
        }}
        ListFooterComponent={footer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  intro: { color: colors.textMuted, fontSize: 15, marginBottom: spacing.md },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: { color: colors.textFaint, fontSize: 13, marginBottom: spacing.sm },
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
  choice: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  choiceOn: { borderColor: colors.accent, backgroundColor: colors.glassActive },
  choiceOff: { opacity: 0.45 },
  choiceText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  problem: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  payRow: { flexDirection: 'row', gap: spacing.sm },
  payButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.md, marginBottom: spacing.sm },
});
