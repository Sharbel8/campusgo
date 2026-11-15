// Screen 6 — Order Tracking (real version in phase 8)
import PlaceholderScreen from '../components/PlaceholderScreen';

export default function OrderTrackingScreen({ route }) {
  const { orderId } = route.params;

  return (
    <PlaceholderScreen
      icon="bicycle-outline"
      eyebrow={`Order ${orderId}`}
      title="Tracking"
      subtitle="Received → Preparing → On the way → Delivered, with courier and ETA."
      phase={8}
    />
  );
}
