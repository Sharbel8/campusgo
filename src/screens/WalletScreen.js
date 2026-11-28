// Screen 7 — Campus Wallet.
// The balance and the transaction list are fields on the signed-in
// account. Nothing here charges a real card. The top-up is simulated.
import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadWallet, saveWallet } from '../utils/wallet';
import { colors, spacing, radius, typography } from '../theme/theme';

const TOP_UPS = [5, 10, 20];

function money(amount) {
  return '$' + Number(amount).toFixed(2);
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

function TransactionRow(props) {
  const entry = props.entry;
  const plus = entry.amount >= 0;
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.label}>{entry.label}</Text>
        <Text style={styles.when}>{when(entry.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, plus ? styles.plus : styles.minus]}>
        {plus ? '+' : '−'}
        {money(Math.abs(entry.amount))}
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadWallet().then((wallet) => {
      setBalance(wallet.balance);
      setTransactions(wallet.transactions);
    });
  }, []);

  async function topUp(amount) {
    const next = Math.round((balance + amount) * 100) / 100;
    const entry = {
      id: 'T-' + String(Date.now()),
      type: 'topup',
      label: 'Top-up',
      amount: amount,
      createdAt: new Date().toISOString(),
    };
    const nextList = [entry].concat(transactions);
    await saveWallet(next, nextList);
    setBalance(next);
    setTransactions(nextList);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TransactionRow entry={item} />}
        ListHeaderComponent={
          <View>
            <Text style={typography.eyebrow}>Campus wallet</Text>
            <Text style={typography.title}>{money(balance)}</Text>
            <Text style={styles.hint}>Simulated money. A top-up does not charge a real card.</Text>
            <FlatList
              horizontal
              data={TOP_UPS}
              keyExtractor={(item) => String(item)}
              contentContainerStyle={styles.topUps}
              renderItem={({ item }) => (
                <Pressable onPress={() => topUp(item)} style={styles.topUp}>
                  <Text style={styles.topUpText}>+{money(item)}</Text>
                </Pressable>
              )}
            />
            <Text style={styles.section}>Transactions</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hint: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm },
  topUps: { marginTop: spacing.lg },
  topUp: {
    height: 52,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpText: { color: colors.onAccent, fontSize: 16, fontWeight: '700' },
  section: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontSize: 15 },
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
  cardBody: { flex: 1, marginRight: spacing.md },
  label: { color: colors.text, fontSize: 16, fontWeight: '700' },
  when: { color: colors.textFaint, fontSize: 13, marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '700' },
  plus: { color: colors.success },
  minus: { color: colors.danger },
});
