// =============================================================
// MainTabs — the bottom tab bar the user sees after logging in.
// 5 tabs: Home, Print, Cart, Orders, Profile.
// =============================================================
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useCart } from '../context/CartContext';

import HomeScreen from '../screens/HomeScreen';
import PrintingScreen from '../screens/PrintingScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Icon for each tab: [icon when selected, icon when not selected]
const TAB_ICONS = {
  Home: ['storefront', 'storefront-outline'],
  Print: ['print', 'print-outline'],
  Cart: ['bag-handle', 'bag-handle-outline'],
  Orders: ['receipt', 'receipt-outline'],
  Profile: ['person', 'person-outline'],
};

export default function MainTabs() {
  // number of items in the cart, shown as a badge on the Cart tab
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      // screenOptions can be a function: it receives the current route,
      // so each tab can get its own icon.
      screenOptions={({ route }) => ({
        headerShown: false, // our screens draw their own big titles
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Print" component={PrintingScreen} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          // undefined = no badge when the cart is empty
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.onAccent },
        }}
      />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
