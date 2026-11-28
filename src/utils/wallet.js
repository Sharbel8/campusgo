// The wallet belongs to the signed-in account.
// It is stored on that account inside the 'users' list, and the
// same copy is kept on 'session' so the open screens can read it.
// A new account starts at 0. An older account with no field yet
// is treated as 0 the first time it is read.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadWallet() {
  const raw = await AsyncStorage.getItem('session');
  if (raw === null) {
    return { balance: 0, transactions: [] };
  }
  const session = JSON.parse(raw);
  const balance = typeof session.walletBalance === 'number' ? session.walletBalance : 0;
  const transactions = session.transactions ? session.transactions : [];
  return { balance: balance, transactions: transactions };
}

// Writes the new balance onto the account and onto the session.
export async function saveWallet(balance, transactions) {
  const rawSession = await AsyncStorage.getItem('session');
  if (rawSession === null) {
    return;
  }
  const session = JSON.parse(rawSession);
  session.walletBalance = balance;
  session.transactions = transactions;

  const rawUsers = await AsyncStorage.getItem('users');
  const users = rawUsers ? JSON.parse(rawUsers) : [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === session.email) {
      users[i].walletBalance = balance;
      users[i].transactions = transactions;
    }
  }

  await AsyncStorage.setItem('users', JSON.stringify(users));
  await AsyncStorage.setItem('session', JSON.stringify(session));
}
