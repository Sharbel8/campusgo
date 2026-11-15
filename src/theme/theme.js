// =============================================================
// theme.js — the single place where the app's look is defined.
// Inspired by the PadelLab dark design: near-black background,
// glassy cards with thin light borders, a bright blue accent,
// big bold titles and small UPPERCASE letter-spaced labels.
// Every screen imports from here, so changing a color here
// changes it everywhere.
// =============================================================
import { DarkTheme } from '@react-navigation/native';

export const colors = {
  background: '#080808', // page background
  surface: '#111111', // cards
  surface2: '#1C1C1C', // raised elements (icon tiles, chips)
  glass: 'rgba(255,255,255,0.055)', // inputs / secondary buttons
  glassActive: 'rgba(255,255,255,0.10)', // selected segment / pressed
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.18)',

  text: '#F5F7FB', // main text
  textMuted: '#888888', // secondary text & labels
  textFaint: 'rgba(232,237,244,0.5)', // inactive text

  accent: '#1F71F4', // bright blue: buttons, links, active tab
  brand: '#011542', // deep navy: logo tile
  brandLight: '#0B2A7A',

  success: '#22C55E', // "Open" badges, delivered
  warning: '#F59E0B', // "Preparing", low balance
  danger: '#EF4444', // errors, "Closed" badges
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { sm: 14, md: 18, lg: 28, pill: 999 };

export const typography = {
  // small uppercase label, e.g. "PLAYER LOGIN"
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  // huge hero title, e.g. "Your court is waiting."
  hero: { fontSize: 38, fontWeight: '700', letterSpacing: -1.8, color: colors.text },
  // screen title
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -1.2, color: colors.text },
  heading: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  muted: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
  caption: { fontSize: 13, color: colors.textMuted },
};

// React Navigation needs its own theme object (used for headers,
// tab bar and screen backgrounds). We start from DarkTheme and
// override the colors with ours.
export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
