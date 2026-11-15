// Screen 3a — Store Menu (real version in phase 5)
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

// route.params holds the data sent by navigation.navigate('StoreMenu', {...})
export default function StoreMenuScreen({ navigation, route }) {
  const { storeName } = route.params;

  return (
    <PlaceholderScreen
      icon="restaurant-outline"
      eyebrow="Store menu"
      title={storeName}
      subtitle="Products grouped by category, with images, prices and stock."
      phase={5}
    >
      <AppButton
        title="Open a product"
        onPress={() => navigation.navigate('ProductDetails', { productName: 'Chicken Sandwich' })}
      />
    </PlaceholderScreen>
  );
}
