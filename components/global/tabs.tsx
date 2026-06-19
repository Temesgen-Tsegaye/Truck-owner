import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

type TabsProps = {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  style?: object;
};

export  function Tabs({ tabs, activeIndex, onChange, style }: TabsProps) {
  const [containerWidthState, setContainerWidthState] = useState(0);
  const containerWidth = useSharedValue(0);
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];
  const left = useDerivedValue(() => {
    const width = containerWidth.value / (tabs.length || 1);
    return withTiming(activeIndex * width, { duration: 250 });
  }, [activeIndex, tabs.length]);

  const handlePress = (index: number) => {
    onChange(index);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    left: left.value,
    width: containerWidth.value / (tabs.length || 1),
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: theme.overlay }, style]}
      onLayout={(event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidthState(width);
        containerWidth.value = width;
      }}
    >
      {containerWidthState > 0 && (
        <Animated.View
          style={[styles.activeBackground, animatedStyle]}
        />
      )}
      {tabs.map((tab, index) => {
        const isActive = activeIndex === index;
        return (
          <Pressable
            key={tab}
            onPress={() => handlePress(index)}
            style={styles.tab}
          >
            <Text style={[styles.label, { color: isActive ? theme.textOnPrimary : theme.subtext }]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}


export const AppColors = {
  // Primary brand color – main buttons, headers, active nav items
  primary: '#ff642f', 

  // Secondary brand color – secondary buttons, links, tabs
  secondary: '#9B59B6',

  // Accent color – highlights, key CTAs, notifications
  accent: '#FF6F61',

  // Background color – main app canvas
  background: '#F5F5F5',

  // Surface / Card color – panels, cards, modals
  surface: '#FFFFFF',

  // Primary text – main content, labels
  textPrimary: '#333333',

  // Secondary text – captions, secondary info
  textSecondary: '#777777',

  // Success messages / indicators – form success, completed actions
  success: '#27AE60',

  // Warning messages / indicators – caution messages, alerts
  warning: '#F39C12',

  // Error messages / indicators – errors, failed actions
  error: '#E74C3C',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: 5,
    overflow: 'hidden',
    width: '90%',
    height: 35,
    alignSelf: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: "#ff642f",
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    zIndex: 1,
  },
});




