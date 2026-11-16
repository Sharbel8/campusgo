// =============================================================
// RootNavigator — the main STACK of the app.
//
//   Welcome            (login, no header)
//   MainTabs           (the 5 bottom tabs, no header)
//   StoreMenu          ┐
//   ProductDetails     │ detail screens pushed ON TOP of the tabs,
//   Checkout           │ with a back arrow, and the tab bar hidden
//   OrderTracking      │
//   Wallet             ┘
//
// Putting the tabs INSIDE a stack is the pattern recommended by
// React Navigation: detail screens cover the tab bar, and any
// tab can open any detail screen with navigation.navigate().
// =============================================================
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/theme';
import CartButton from '../components/CartButton';

import MainTabs from './MainTabs';
import WelcomeScreen from '../screens/WelcomeScreen';
import StoreMenuScreen from '../screens/StoreMenuScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // useEffect runs this once when the app opens (the [] at the end).
  // If a session was saved on the phone, we skip the login screen.
  useEffect(() => {
    AsyncStorage.getItem('session').then((value) => {
      if (value !== null) {
        setHasSession(true);
      }
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Stack.Navigator
      initialRouteName={hasSession ? 'MainTabs' : 'Welcome'}
      screenOptions={{
        // header look shared by every stack screen
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text, // back arrow + title color
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false, // no line under the header
        headerBackButtonDisplayMode: 'minimal', // just the arrow, no "Back" text
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

      {/* the title can use the params sent with navigate() */}
      <Stack.Screen
        name="StoreMenu"
        component={StoreMenuScreen}
        options={({ route }) => ({
          title: route.params.storeName,
          headerRight: () => <CartButton />, // cart badge (the tab bar is hidden here)
        })}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: '', headerRight: () => <CartButton /> }}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track order' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
    </Stack.Navigator>
  );
}
