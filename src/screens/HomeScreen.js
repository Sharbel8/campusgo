// Screen 2 — Home / Campus Stores (real version in phase 4)
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

export default function HomeScreen({ navigation }) {
  return (
    <PlaceholderScreen
      withTopInset
      icon="storefront-outline"
      eyebrow="Campus services"
      title="Home"
      subtitle="All campus stores with Open/Closed badges, search, filters and the wallet banner."
      phase={4}
    >
      {/* Tabs live inside the root stack, so navigate() can reach stack screens */}
      <AppButton
        title="Open Cafeteria menu"
        onPress={() => navigation.navigate('StoreMenu', { storeName: 'Cafeteria' })}
      />
    </PlaceholderScreen>
  );
}
