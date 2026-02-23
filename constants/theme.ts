/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#380964'; // Updated Primary Purple
const tintColorDark = '#9B59B6'; // Lighter Purple for Dark Mode

export const Colors = {
  light: {
    text: '#1F2937', // Gray-800
    background: '#FFFFFF',
    tint: tintColorLight,
    secondary: '#F59E0B', // Amber
    icon: '#6B7280', // Gray-500
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB', // Gray-200
    subtext: '#4B5563', // Gray-600
    error: '#EF4444',
  },
  dark: {
    text: '#F9FAFB', // Gray-50
    background: '#111827', // Gray-900
    tint: tintColorDark,
    secondary: '#FBBF24', // Amber-400
    icon: '#9CA3AF', // Gray-400
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    border: '#374151', // Gray-700
    subtext: '#9CA3AF', // Gray-400
    error: '#F87171',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
