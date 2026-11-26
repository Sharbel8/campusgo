// Screen 7 — Profile.
// The signed-in account is the 'session' saved at login. Delivery
// spots are a separate list ('locations'): ones you add here, and
// ones checkout remembers after an order.
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import campus from '../data/campus.json';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, typography } from '../theme/theme';

function findBuilding(id) {
  for (let i = 0; i < campus.buildings.length; i++) {
    if (campus.buildings[i].id === id) {
      return campus.buildings[i];
    }
  }
  return null;
}

function LocationRow(props) {
  const place = props.place;
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.placeName}>{place.buildingName}</Text>
        <Text style={styles.placeRoom}>Room {place.room}</Text>
      </View>
      <Pressable onPress={() => props.onRemove(place.id)}>
        <Text style={styles.remove}>Remove</Text>
      </Pressable>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [buildingId, setBuildingId] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    function load() {
      AsyncStorage.getItem('session').then((value) => {
        setUser(value ? JSON.parse(value) : null);
      });
      AsyncStorage.getItem('locations').then((value) => {
        setLocations(value ? JSON.parse(value) : []);
      });
    }
    load();
    return navigation.addListener('focus', load);
  }, [navigation]);

  function saveLocations(next) {
    setLocations(next);
    AsyncStorage.setItem('locations', JSON.stringify(next));
  }

  function addLocation() {
    const building = findBuilding(buildingId);
    const cleanRoom = room.trim();
    if (building === null) {
      setError('Choose a building.');
      return;
    }
    if (cleanRoom === '') {
      setError('Enter the room number.');
      return;
    }
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].buildingId === building.id && locations[i].room === cleanRoom) {
        setError('That location is already saved.');
        return;
      }
    }
    const next = [
      {
        id: 'L-' + String(Date.now()),
        buildingId: building.id,
        buildingName: building.name,
        room: cleanRoom,
      },
    ].concat(locations);
    saveLocations(next);
    setRoom('');
    setError('');
  }

  function removeLocation(id) {
    const next = [];
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].id !== id) {
        next.push(locations[i]);
      }
    }
    saveLocations(next);
  }

  function signOut() {
    AsyncStorage.removeItem('session').then(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    });
  }

  const header = (
    <View>
      <Text style={typography.eyebrow}>Account</Text>
      <Text style={typography.title}>{user ? user.fullName : 'Profile'}</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>STUDENT / STAFF ID</Text>
        <Text style={styles.value}>{user ? user.studentId : '—'}</Text>
        <Text style={styles.label}>FACULTY</Text>
        <Text style={styles.value}>{user ? user.faculty : '—'}</Text>
        <Text style={styles.label}>EMAIL</Text>
        <Text style={styles.value}>{user ? user.email : '—'}</Text>
        <Text style={styles.label}>PHONE</Text>
        <Text style={styles.value}>{user && user.phone ? user.phone : '—'}</Text>
      </View>

      <AppButton title="Open wallet" onPress={() => navigation.navigate('Wallet')} />

      <Text style={styles.section}>Saved delivery locations</Text>
      <Text style={styles.hint}>A place you use at checkout is saved here too.</Text>

      <FlatList
        horizontal
        data={campus.buildings}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setBuildingId(item.id)}
            style={[styles.chip, buildingId === item.id && styles.chipOn]}
          >
            <Text style={[styles.chipText, buildingId === item.id && styles.chipTextOn]}>{item.name}</Text>
          </Pressable>
        )}
      />
      <TextInput
        style={styles.input}
        value={room}
        onChangeText={setRoom}
        placeholder="Room number"
        placeholderTextColor={colors.textFaint}
      />
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <AppButton title="Save location" variant="secondary" onPress={addLocation} />
      <Text style={styles.section}>Your places</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={({ item }) => <LocationRow place={item} onRemove={removeLocation} />}
        ListEmptyComponent={<Text style={styles.empty}>No saved locations yet.</Text>}
        ListFooterComponent={
          <AppButton title="Sign out" variant="ghost" onPress={signOut} style={styles.signOut} />
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  value: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 4 },
  section: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: spacing.lg },
  hint: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: spacing.md },
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
  input: {
    height: 52,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  error: { color: colors.danger, fontSize: 14, marginBottom: spacing.sm },
  empty: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm },
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
  cardBody: { flex: 1 },
  placeName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  placeRoom: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  remove: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  signOut: { marginTop: spacing.lg },
});
