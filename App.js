// =============================================================
// App.js — the root of the app. It only "wraps" things:
//  - SafeAreaProvider: lets screens avoid the notch / home bar
//  - NavigationContainer: holds the navigation state
//  - RootNavigator: our stack (which contains the tabs)
// =============================================================
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      {/* "light" = white clock/battery icons on our dark background */}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
