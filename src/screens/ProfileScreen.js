// Screen 7b — Profile (real version in phase 8)
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
        // reset() clears the history so the user can't go "back" into the app
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
      />
    </PlaceholderScreen>
  );
}
