// Helpers for opening hours, shared by any screen that needs them.
// (Home has its own copy of these for now; it can import them
// from here later.)

// "07:30" -> 7 * 60 + 30 = 450. Easier to compare than clock text.
export function toMinutes(hhmm) {
  const parts = hhmm.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

export function minutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Open only when the current time is inside the store's hours.
export function isStoreOpen(store) {
  const now = minutesNow();
  return now >= toMinutes(store.opens) && now < toMinutes(store.closes);
}
