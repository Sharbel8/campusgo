// Screen 3b — Product Details (real version in phase 5)
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

export default function ProductDetailsScreen({ navigation, route }) {
  const { productName } = route.params;

  return (
    <PlaceholderScreen
      icon="fast-food-outline"
      eyebrow="Product"
      title={productName}
      subtitle="Options (size, extras), quantity selector and Add to cart."
      phase={5}
    >
      <AppButton title="Back to menu" variant="secondary" onPress={() => navigation.goBack()} />
    </PlaceholderScreen>
  );
}
