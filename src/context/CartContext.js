// =============================================================
// CartContext — the cart, shared by every screen.
//
// A "Context" lets many screens read and change the same data
// without passing props through every screen in between:
//   - CartProvider wraps the whole app (in App.js) and holds the cart.
//   - Any screen calls useCart() to read it or change it.
//
// The cart is saved with AsyncStorage under the key 'cart', so it
// is still there after the app is closed and opened again.
//
// One cart item looks like this:
//   {
//     key: 'p10|Large|Oat milk',  // product + chosen options
//     productId: 'p10',
//     storeId: 'coffee',
//     name: 'Cappuccino',
//     category: 'Hot drinks',
//     size: 'Large',               // null when the product has no sizes
//     extras: ['Oat milk'],
//     unitPrice: 3.4,              // price of ONE with its options
//     quantity: 2,
//   }
// =============================================================
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // true once the saved cart has been read from the phone
  const [loaded, setLoaded] = useState(false);

  // 1) When the app opens, read the saved cart once.
  useEffect(() => {
    AsyncStorage.getItem('cart').then((value) => {
      if (value !== null) {
        setItems(JSON.parse(value));
      }
      setLoaded(true);
    });
  }, []);

  // 2) Every time the cart changes, save it again.
  // We wait for "loaded" so the empty starting cart doesn't
  // overwrite the saved one before it has been read.
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  // The one-store rule: every item comes from the same store,
  // so the store of the first item is the store of the cart.
  const cartStoreId = items.length > 0 ? items[0].storeId : null;

  // Total number of pieces (for the badge) and the subtotal.
  let itemCount = 0;
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    itemCount += items[i].quantity;
    subtotal += items[i].unitPrice * items[i].quantity;
  }

  // Add an item. If the same product with the same options is
  // already in the cart, only its quantity goes up.
  // We pass a function to setItems so we always start from the
  // latest cart (important when clearCart() runs just before).
  function addItem(newItem) {
    setItems((oldItems) => {
      const result = [];
      let found = false;
      for (let i = 0; i < oldItems.length; i++) {
        if (oldItems[i].key === newItem.key) {
          result.push({ ...oldItems[i], quantity: oldItems[i].quantity + newItem.quantity });
          found = true;
        } else {
          result.push(oldItems[i]);
        }
      }
      if (!found) {
        result.push(newItem);
      }
      return result;
    });
  }

  // +1 or -1 on one line of the cart. At 0 the line is removed.
  function changeQuantity(key, amount) {
    setItems((oldItems) => {
      const result = [];
      for (let i = 0; i < oldItems.length; i++) {
        if (oldItems[i].key === key) {
          const quantity = oldItems[i].quantity + amount;
          if (quantity > 0) {
            result.push({ ...oldItems[i], quantity: quantity });
          }
        } else {
          result.push(oldItems[i]);
        }
      }
      return result;
    });
  }

  function removeItem(key) {
    setItems((oldItems) => oldItems.filter((item) => item.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{ items, cartStoreId, itemCount, subtotal, addItem, changeQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Screens use this: const { items, addItem } = useCart();
export function useCart() {
  return useContext(CartContext);
}
