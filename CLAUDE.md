# CampusGo — Antonine Campus Delivery App

University project for **Mobile Development (PROG421-EC10)**, Université Antonine.
Two students work on it; each uses Claude in their own Claude Desktop. This file is the shared context, so **keep it updated** when a phase is finished or a decision changes.

The full brief is the PDF in the parent folder: `../Mobile Development - Project - CampusGo-Campus_Delivery.pdf`.

## What the app is
A mobile-only app where students and staff order from the on-campus services (Cafeteria, Coffee Corner, Bookstore & Stationery, Printing Office). Orders are delivered to a **building + room** during a chosen **class break**. There's no real backend, payment or GPS: payments and tracking are **simulated**.

## Hard requirements from the brief (don't break these)
- **React Native + Expo**, tested on a real phone with **Expo Go** (SDK 58).
- Navigation must use **React Navigation (bottom tabs + stack)**. The template's `AGENTS.md` recommends Expo Router: **ignore that** and follow the brief.
- **Functional components + Hooks** (`useState`, `useEffect`) only.
- **Every list must use `FlatList`** (not `.map()` inside a ScrollView).
- Data (stores, products, buildings, delivery slots) comes from a **local JSON file**: at least **4 stores, 25 products, 6 buildings, 5 delivery slots**.
- **Cart, wallet and orders are saved with AsyncStorage.**
- Only use libraries that work in **Expo Go**. Install with `npx expo install <pkg>`, never plain `npm install <pkg>`.

## Business rules (from the brief)
- Login email must end with **`@ua.edu.lb`**. Sign-up asks for full name, student/staff ID, faculty, phone and password, with validation and clear error messages.
- Stores show an **Open/Closed** badge computed from their opening hours and the current time. Closed stores can't receive orders.
- The cart holds products from **one store only**. Adding from another store asks the user to empty the cart first.
- Out-of-stock products are shown but can't be added.
- Printing: **B&W $0.05/page, color $0.25/page, spiral binding +$1.50** (plus staple, single/double-sided, copies). The price table is `printPrices` in `campus.json`; staple is $0.10 and binding is paid per copy. A print job is added to the cart as ONE item (`quantity: 1`, `unitPrice` = whole job, options listed in `extras`), so the cart's +/− can't push it past 200 pages. The price updates live on every change. Pages and copies must be > 0, with **max 200 pages**.
- Delivery fee is **$0.50**, free above **$10**. **Minimum order is $2.**
- Delivery slots are class breaks (e.g. 9:45–10:00, 11:15–11:30, 12:45–13:30). A slot is disabled if it has already passed or is too close given the store's preparation time.
- Payment is **Campus Wallet** or **cash on delivery**. Wallet payment is refused if the balance is too low.
- Tracking: Received → Preparing → On the way → Delivered to Building X, Room Y. The status changes automatically with a **timer in `useEffect` with cleanup**. Cancelling is only allowed while the order is "Received". After delivery the user can rate it (1–5 stars + comment).
- History filters by store/status and has a **Reorder** button. The profile has saved delivery locations. The wallet has a simulated top-up and a transaction list.

## Design: Université Antonine blue and white
Every color, spacing, radius and text style is in **`src/theme/theme.js`**. Always import from there and never hard-code colors in screens. The palette matches the UA logo: blue `#2E589E` and white.
- Page background `#2E589E`, cards `#234880`, raised tiles `#1B3C72`, tab bar `#163566`.
- Glassy inputs and secondary buttons: `rgba(255,255,255,0.12)` with thin borders `rgba(255,255,255,0.24)`.
- Primary buttons are white with blue text. The active tab and links are white.
- Big bold titles with tight negative letter spacing (`typography.hero` / `title`).
- Small **UPPERCASE, letter-spaced** labels above titles (`typography.eyebrow`), e.g. "STORE MENU".
- Rounded corners: 14 / 18 / 28, and pills (999).
- Status colors: success `#22C55E`, warning `#F59E0B`, danger `#EF4444`.
- Reusable components live in `src/components/` (`AppButton` with `primary` / `secondary` / `ghost` variants).

## Project structure
```
App.js                      SafeAreaProvider + NavigationContainer + RootNavigator
src/theme/theme.js          design tokens + React Navigation theme
src/navigation/
  RootNavigator.js          native STACK: Welcome, MainTabs, StoreMenu, ProductDetails,
                            Checkout, OrderTracking, Wallet
  MainTabs.js               BOTTOM TABS: Home, Print, Cart, Orders, Profile
src/screens/                one file per screen
src/components/             AppButton, AppTextField, ProductImage, CartButton,
                            PlaceholderScreen (temporary)
src/data/campus.json        stores, products, buildings, delivery slots, starting wallet
src/context/CartContext.js  cart shared by all screens, saved in AsyncStorage ('cart')
                            (wallet and orders: still phase 2)
src/utils/storeHours.js     toMinutes, minutesNow, isStoreOpen (shared helpers)
```
The tabs live **inside** the root stack. Detail screens are pushed over the tab bar, and any tab can open them with `navigation.navigate('Name', params)`.

## The 8-phase plan
| # | Phase | Status |
|---|---|---|
| 1 | Setup & navigation: packages, folders, theme, tabs + stack, placeholder screens | ✅ Done |
| 2 | Context for cart/wallet/orders saved in AsyncStorage. `campus.json` is already in the project. Login already saves accounts. | 🟡 Cart done (`CartContext`); wallet + orders still to do |
| 3 | Screen 1: Welcome / Login / Sign-up with validation; logging in switches Welcome ↔ app | ✅ Done |
| 4 | Screen 2: Home: store FlatList, Open/Closed badge, search, category filter, slot + wallet banner | ✅ Done |
| 5 | Screen 3: Store menu by category, product details (options, quantity), stock, cart badge, one-store rule | ✅ Done |
| 6 | Screen 4: Printing form with live price and validation, added to the Printing Office cart | ✅ Done |
| 7 | Screen 5: Cart (+/−, fees, minimum) and Checkout (building/room, slot rules, wallet/cash) | |
| 8 | Screens 6 & 7: tracking timer, cancel, rating; history + filters + reorder; profile; wallet; then final checks and the user guide | |

Screens still marked "Coming in phase X" use `PlaceholderScreen`. Replace them with the real screen in their phase.

## How to work in this project
- The student is learning. **Explain each step** (what it does and why) and keep the code readable, with short comments on the key concepts.
- Run commands from the `MobileProject` folder:
  - Start: `npx expo start`, then scan the QR code with Expo Go. On Windows PowerShell, if `npx` is blocked by the execution policy, use `npx.cmd expo start` or Command Prompt.
  - Check a change compiles: `npx expo export --platform android --output-dir <temp folder>` (don't leave `dist/` in the project).
  - Check dependencies: `npx expo-doctor`, which should pass every check.
- After finishing a phase, update its status in the table above.
- Deliverables at the end: working app, presentation/demo, code on GitHub or as a ZIP, the JSON mock data, and a user guide.
