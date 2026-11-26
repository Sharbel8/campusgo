// App.js is the root component. It only wraps the screens:
// SafeAreaProvider keeps content out of the notch.
// NavigationContainer holds the screens we move between.
// CartProvider shares the cart with every screen (see CartContext.js).
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme/theme';
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
