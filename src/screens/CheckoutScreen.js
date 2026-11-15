// Screen 5b — Checkout (real version in phase 7)
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

export default function CheckoutScreen({ navigation }) {
  return (
    <PlaceholderScreen
      icon="card-outline"
      eyebrow="Checkout"
      title="Delivery & payment"
      subtitle="Building + room, class-break slot, wallet or cash, then confirmation."
      phase={7}
    >
      <AppButton
        title="Place order (demo)"
        // replace() so that "back" from tracking doesn't return to checkout
        onPress={() => navigation.replace('OrderTracking', { orderId: 'DEMO-001' })}
      />
    </PlaceholderScreen>
  );
}
