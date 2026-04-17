/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0F766E'; // Modern Teal
const tintColorDark = '#2DD4BF';  // Vibrant Teal for Dark Mode

export const Colors = {
  light: {
    text: '#09090B', // Zinc-950
    background: '#FAFAFA', // Zinc-50
    card: '#FFFFFF', // Pure white
    tint: tintColorLight,
    secondary: '#F59E0B', // Amber
    icon: '#71717A', // Zinc-500
    tabIconDefault: '#A1A1AA', // Zinc-400
    tabIconSelected: tintColorLight,
    border: '#E4E4E7', // Zinc-200
    subtext: '#52525B', // Zinc-600
    error: '#EF4444',
  },
  dark: {
    text: '#FAFAFA', // Zinc-50
    background: '#09090B', // Zinc-950
    card: '#18181B', // Zinc-900
    tint: tintColorDark,
    secondary: '#FBBF24', 
    icon: '#A1A1AA', 
    tabIconDefault: '#52525B', // Zinc-600
    tabIconSelected: tintColorDark,
    border: '#27272A', // Zinc-800
    subtext: '#A1A1AA', // Zinc-400
    error: '#F87171',
  },
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};
