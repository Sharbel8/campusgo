// Screen 7b — Profile (real version in phase 8)
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

export default function ProfileScreen({ navigation }) {
  return (
    <PlaceholderScreen
      withTopInset
      icon="person-outline"
      eyebrow="Account"
      title="Profile"
      subtitle="Name, ID, faculty and saved delivery locations."
      phase={8}
    >
      <AppButton title="Open wallet" onPress={() => navigation.navigate('Wallet')} />
      <AppButton
        title="Sign out"
        variant="ghost"
        // Remove the saved login, then go back to the welcome screen.
        onPress={() => {
          AsyncStorage.removeItem('session').then(() => {
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          });
        }}
      />
    </PlaceholderScreen>
  );
}
