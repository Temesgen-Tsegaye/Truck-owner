/**
 * Unified light/dark color palette for the Flowera ecosystem.
 * All semantic color tokens are defined here and used via
 * useAppTheme() / useThemeColor() throughout the app.
 */

import { Platform } from 'react-native';

const primaryLight = '#E04A1A';  // Brand orange — WCAG AA on white (~4.5:1)
const primaryDark  = '#F15A2B';  // Brand orange — slightly brighter for dark
const tintLight    = '#0F766E';  // Teal accent
const tintDark     = '#2DD4BF';  // Vibrant teal for dark

export const Colors = {
  light: {
    // ── Core ──────────────────────────────
    text:            '#09090B',  // Zinc-950
    background:      '#FAFAFA',  // Zinc-50
    card:            '#FFFFFF',  // White
    border:          '#E4E4E7',  // Zinc-200
    subtext:         '#52525B',  // Zinc-600
    icon:            '#71717A',  // Zinc-500
    error:           '#EF4444',  // Red

    // ── Brand / Accent ────────────────────
    primary:         primaryLight,
    primaryLight:    'rgba(224, 74, 26, 0.12)',  // Tinted bg for icons / chips
    tint:            tintLight,
    secondary:       '#F59E0B',  // Amber

    // ── Tab Bar ───────────────────────────
    tabBar:          '#FFFFFF',
    tabIconDefault:  '#A1A1AA',  // Zinc-400
    tabIconSelected: primaryLight,

    // ── Input / Surface ───────────────────
    inputBackground: '#F4F4F5',  // Zinc-100

    // ── Chat ──────────────────────────────
    messageSelf:     primaryLight,
    messageOther:    '#F4F4F5',  // Zinc-100
    textOnPrimary:   '#FFFFFF',

    // ── Status ────────────────────────────
    statusPending:   '#F59E0B',
    statusTransit:   '#3B82F6',
    statusDelivered: '#10B981',
    statusCancelled: '#EF4444',
    statusPendingBg: '#FEF3C7',
    statusTransitBg: '#DBEAFE',
    statusDeliveredBg:'#D1FAE5',
    statusCancelledBg:'#FEE2E2',

    // ── Misc ──────────────────────────────
    overlay:         'rgba(0,0,0,0.04)',
    notification:    '#EF4444',
  },

  dark: {
    // ── Core ──────────────────────────────
    text:            '#FAFAFA',  // Zinc-50
    background:      '#09090B',  // Zinc-950
    card:            '#18181B',  // Zinc-900
    border:          '#27272A',  // Zinc-800
    subtext:         '#A1A1AA',  // Zinc-400
    icon:            '#A1A1AA',  // Zinc-400
    error:           '#F87171',  // Lighter red

    // ── Brand / Accent ────────────────────
    primary:         primaryDark,
    primaryLight:    'rgba(241, 90, 43, 0.15)',
    tint:            tintDark,
    secondary:       '#FBBF24',

    // ── Tab Bar ───────────────────────────
    tabBar:          '#18181B',
    tabIconDefault:  '#52525B',  // Zinc-600
    tabIconSelected: primaryDark,

    // ── Input / Surface ───────────────────
    inputBackground: '#1C1C1E',

    // ── Chat ──────────────────────────────
    messageSelf:     primaryDark,
    messageOther:    '#27272A',  // Zinc-800
    textOnPrimary:   '#FFFFFF',

    // ── Status ────────────────────────────
    statusPending:   '#F59E0B',
    statusTransit:   '#3B82F6',
    statusDelivered: '#10B981',
    statusCancelled: '#EF4444',
    statusPendingBg: 'rgba(245, 158, 11, 0.15)',
    statusTransitBg: 'rgba(59, 130, 246, 0.15)',
    statusDeliveredBg:'rgba(16, 185, 129, 0.15)',
    statusCancelledBg:'rgba(239, 68, 68, 0.15)',

    // ── Misc ──────────────────────────────
    overlay:         'rgba(255,255,255,0.04)',
    notification:    '#F87171',
  },
} as const;

export const Fonts = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semiBold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};
