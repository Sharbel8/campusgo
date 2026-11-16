// Screen 2 — Home / Campus Stores.
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import campus from '../data/campus.json';
import { colors, spacing, radius, typography } from '../theme/theme';

// "07:30" -> 7 * 60 + 30 = 450. Easier to compare than clock text.
function toMinutes(hhmm) {
  const parts = hhmm.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function minutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Open only when the current time is inside the store's hours.
function isStoreOpen(store) {
  const now = minutesNow();
  return now >= toMinutes(store.opens) && now < toMinutes(store.closes);
}

// The next break that has not finished yet. null if the day is over.
function nextSlot(slots) {
  const now = minutesNow();
  for (let i = 0; i < slots.length; i++) {
    if (toMinutes(slots[i].end) > now) {
      return slots[i];
    }
  }
  return null;
}

// ['All', 'Food', 'Coffee', ...] built from the stores, without duplicates.
function categoryNames(stores) {
  const names = ['All'];
  for (let i = 0; i < stores.length; i++) {
    if (names.indexOf(stores[i].category) === -1) {
      names.push(stores[i].category);
    }
  }
  return names;
}

function matchingStores(stores, category, search) {
  const word = search.trim().toLowerCase();
  const result = [];
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    const categoryOk = category === 'All' || store.category === category;
    const nameOk = word === '' || store.name.toLowerCase().indexOf(word) !== -1;
    if (categoryOk && nameOk) {
      result.push(store);
    }
  }
  return result;
}

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

// Each store id points to its logo file.
const LOGOS = {
  cafeteria: require('../../assets/store-ua-caff.jpg'),
  coffee: require('../../assets/store-ua-brew.jpg'),
  bookstore: require('../../assets/store-ua-reads.jpg'),
  printing: require('../../assets/store-ua-copy.jpg'),
};

function StoreCard(props) {
  const store = props.store;
  const open = isStoreOpen(store);

  return (
    <Pressable
      onPress={() => props.onPress(store)}
      style={[styles.card, !open && styles.cardClosed]}
    >
      <Image source={LOGOS[store.id]} style={styles.logo} />
      <View style={styles.cardBody}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeMeta}>
          {store.category} · {store.prepMinutes} min
        </Text>
        <Text style={styles.storeHours}>
          {store.opens}–{store.closes}
        </Text>
      </View>
      <View style={[styles.badge, open ? styles.badgeOpen : styles.badgeClosed]}>
        <Text style={styles.badgeText}>{open ? 'Open' : 'Closed'}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [balance, setBalance] = useState(campus.walletBalance);

  const categories = categoryNames(campus.stores);
  const stores = matchingStores(campus.stores, category, search);
  const slot = nextSlot(campus.slots);

  // The starting balance is in campus.json. If the wallet screen
  // has saved a newer one on the phone, show that instead.
  useEffect(() => {
    AsyncStorage.getItem('walletBalance').then((value) => {
      if (value !== null) {
        setBalance(Number(value));
      }
    });
  }, []);

  function openStore(store) {
    // A closed store is shown, but it cannot take an order.
    if (!isStoreOpen(store)) {
      return;
    }
    navigation.navigate('StoreMenu', { storeName: store.name, storeId: store.id });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreCard store={item} onPress={openStore} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={typography.eyebrow}>Campus services</Text>
            <Text style={typography.title}>Stores</Text>

            <View style={styles.banner}>
              <View style={styles.bannerHalf}>
                <Text style={styles.bannerLabel}>NEXT SLOT</Text>
                <Text style={styles.bannerValue}>{slot ? slot.label : 'No more today'}</Text>
              </View>
              <View style={styles.bannerHalf}>
                <Text style={styles.bannerLabel}>WALLET</Text>
                <Text style={styles.bannerValue}>{money(balance)}</Text>
              </View>
            </View>

            <TextInput
              style={styles.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Search stores"
              placeholderTextColor={colors.textFaint}
            />

            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={[styles.chip, category === item && styles.chipOn]}
                >
                  <Text style={[styles.chipText, category === item && styles.chipTextOn]}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No store matches that search.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  bannerHalf: { flex: 1, padding: spacing.md },
  bannerLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  bannerValue: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  search: {
    height: 48,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  chips: { paddingBottom: spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextOn: { color: colors.onAccent },
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
  cardClosed: { opacity: 0.55 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    backgroundColor: colors.surface2,
  },
  cardBody: { flex: 1 },
  storeName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  storeMeta: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  storeHours: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  badgeOpen: { backgroundColor: colors.success },
  badgeClosed: { backgroundColor: colors.danger },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: 15, marginTop: spacing.md },
});
