// Screen 6 — Order tracking.
// The status moves on its own: Received → Preparing → On the way →
// Delivered. A timer in useEffect does that, and the cleanup
// function stops the timer when you leave the screen or cancel.
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, typography } from '../theme/theme';
import { loadWallet, saveWallet } from '../utils/wallet';

const STEP_KEYS = ['Received', 'Preparing', 'On the way', 'Delivered'];
const COURIERS = ['Rami Khoury', 'Nadia Haddad', 'Karim Nassar', 'Maya Saleh'];
const STEP_MS = 5000;

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function nextStatus(current) {
  if (current === 'Received') return 'Preparing';
  if (current === 'Preparing') return 'On the way';
  if (current === 'On the way') return 'Delivered';
  return current;
}

function stepIndex(status) {
  for (let i = 0; i < STEP_KEYS.length; i++) {
    if (STEP_KEYS[i] === status) return i;
  }
  return -1;
}

// The same order id always gets the same courier.
function courierFor(id) {
  let total = 0;
  for (let i = 0; i < id.length; i++) {
    total = total + id.charCodeAt(i);
  }
  return COURIERS[total % COURIERS.length];
}

async function updateSavedOrder(id, changes) {
  const raw = await AsyncStorage.getItem('orders');
  const orders = raw ? JSON.parse(raw) : [];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].id === id) {
      orders[i] = { ...orders[i], ...changes };
    }
  }
  await AsyncStorage.setItem('orders', JSON.stringify(orders));
}

export default function OrderTrackingScreen({ route }) {
  const orderId = route.params.orderId;
  const [order, setOrder] = useState(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('Received');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSaved, setRatingSaved] = useState(false);

  // Read the order that checkout saved, once.
  useEffect(() => {
    AsyncStorage.getItem('orders').then((value) => {
      const orders = value ? JSON.parse(value) : [];
      let found = null;
      for (let i = 0; i < orders.length; i++) {
        if (orders[i].id === orderId) {
          found = orders[i];
        }
      }
      if (found) {
        setOrder(found);
        setStatus(found.status);
        if (found.rating) {
          setRating(found.rating);
          setRatingSaved(true);
        }
        if (found.comment) {
          setComment(found.comment);
        }
      }
      setReady(true);
    });
  }, [orderId]);

  // Move the status one step every 5 seconds.
  // The function returned at the end is the cleanup: it clears the
  // timer so it does not keep running after cancel or after leaving.
  useEffect(() => {
    if (!ready || order === null) return;
    if (status === 'Delivered' || status === 'Cancelled') return;

    const timer = setTimeout(() => {
      const next = nextStatus(status);
      setStatus(next);
      updateSavedOrder(order.id, { status: next });
    }, STEP_MS);

    return () => clearTimeout(timer);
  }, [ready, order, status]);

  const buildingName = order ? order.buildingName : route.params.buildingName || 'the building';
  const room = order ? order.room : route.params.room || '';
  const deliveredLabel = 'Delivered to ' + buildingName + (room !== '' ? ', Room ' + room : '');
  const steps = [
    { key: 'Received', label: 'Received' },
    { key: 'Preparing', label: 'Preparing' },
    { key: 'On the way', label: 'On the way' },
    { key: 'Delivered', label: deliveredLabel },
  ];
  const current = stepIndex(status);

  async function cancelOrder() {
    if (status !== 'Received' || order === null) return;
    setStatus('Cancelled');
    await updateSavedOrder(order.id, { status: 'Cancelled' });
    // Give the wallet payment back. Cash was never taken.
    if (order.payment === 'wallet') {
      const wallet = await loadWallet();
      const next = Math.round((wallet.balance + order.total) * 100) / 100;
      const entry = {
        id: 'T-refund-' + order.id,
        type: 'refund',
        label: 'Refund · ' + order.id,
        amount: order.total,
        createdAt: new Date().toISOString(),
      };
      await saveWallet(next, [entry].concat(wallet.transactions));
    }
  }

  async function saveRating() {
    if (rating < 1 || order === null) return;
    await updateSavedOrder(order.id, { rating: rating, comment: comment.trim() });
    setRatingSaved(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={steps}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={typography.eyebrow}>Order {orderId}</Text>
            <Text style={typography.title}>{status === 'Cancelled' ? 'Cancelled' : status}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>COURIER</Text>
              <Text style={styles.infoValue}>{courierFor(orderId)}</Text>
              <Text style={styles.infoLabel}>ARRIVING</Text>
              <Text style={styles.infoValue}>{order && order.slotLabel ? order.slotLabel : 'During the next break'}</Text>
              {order && (
                <Text style={styles.infoNote}>
                  {order.storeName} · {money(order.total)} · {order.payment === 'wallet' ? 'Campus Wallet' : 'Cash'}
                </Text>
              )}
            </View>
            {status === 'Cancelled' && (
              <Text style={styles.cancelled}>This order was cancelled. It will not be delivered.</Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const done = status !== 'Cancelled' && current >= index;
          const active = status !== 'Cancelled' && current === index;
          return (
            <View style={styles.stepRow}>
              <View style={styles.rail}>
                <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]} />
                {index < steps.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}
              </View>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{item.label}</Text>
            </View>
          );
        }}
        ListFooterComponent={
          <View>
            {status === 'Received' && (
              <AppButton title="Cancel order" variant="secondary" onPress={cancelOrder} />
            )}
            {status === 'Delivered' && (
              <View style={styles.rateCard}>
                <Text style={styles.infoLabel}>RATE THIS ORDER</Text>
                <FlatList
                  horizontal
                  data={[1, 2, 3, 4, 5]}
                  keyExtractor={(item) => String(item)}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => setRating(item)} style={styles.star}>
                      <Text style={styles.starText}>{item <= rating ? '★' : '☆'}</Text>
                    </Pressable>
                  )}
                />
                <TextInput
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a comment"
                  placeholderTextColor={colors.textFaint}
                />
                {ratingSaved ? (
                  <Text style={styles.saved}>Thanks, your rating was saved.</Text>
                ) : (
                  <AppButton title="Save rating" onPress={saveRating} disabled={rating < 1} />
                )}
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: spacing.sm },
  infoValue: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  infoNote: { color: colors.textMuted, fontSize: 14, marginTop: spacing.md },
  cancelled: { color: colors.danger, fontSize: 15, marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rail: { width: 28, alignItems: 'center' },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginTop: 2,
  },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotActive: { backgroundColor: colors.warning, borderColor: colors.warning },
  line: { width: 2, flex: 1, minHeight: 28, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.success },
  stepLabel: { flex: 1, color: colors.textMuted, fontSize: 16, paddingBottom: spacing.lg },
  stepLabelDone: { color: colors.text, fontWeight: '700' },
  rateCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  star: { marginRight: spacing.sm, marginVertical: spacing.sm },
  starText: { color: colors.warning, fontSize: 32 },
  input: {
    minHeight: 52,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  saved: { color: colors.success, fontSize: 15, fontWeight: '700' },
});
