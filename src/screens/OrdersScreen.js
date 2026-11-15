// Screen 7a — Orders History (real version in phase 8)
import PlaceholderScreen from '../components/PlaceholderScreen';
import AppButton from '../components/AppButton';

export default function OrdersScreen({ navigation }) {
  return (
    <PlaceholderScreen
      withTopInset
      icon="receipt-outline"
      eyebrow="History"
      title="Orders"
      subtitle="Previous orders with filters by store and status, plus Reorder."
      phase={8}
    >
      <AppButton
        title="Track an order"
        variant="secondary"
        onPress={() => navigation.navigate('OrderTracking', { orderId: 'DEMO-001' })}
      />
    </PlaceholderScreen>
  );
}
