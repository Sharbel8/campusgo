// Screen 5a — Cart (real version in phase 7)
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

export default function CartScreen({ navigation }) {
  return (
    <PlaceholderScreen
      withTopInset
      icon="bag-handle-outline"
      eyebrow="Your order"
      title="Cart"
      subtitle="Items with + / − controls, subtotal, delivery fee and total."
      phase={7}
    >
      <AppButton title="Go to checkout" onPress={() => navigation.navigate('Checkout')} />
    </PlaceholderScreen>
  );
}
