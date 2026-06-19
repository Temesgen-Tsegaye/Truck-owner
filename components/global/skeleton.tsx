import React, { useEffect } from 'react';
import { StyleSheet, Animated, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import { useAppTheme } from '@/context/theme-context';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height, borderRadius = 4, style }: SkeletonProps) {
  const opacity = React.useRef(new Animated.Value(0.3)).current;
  const { isDarkMode } = useAppTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
          backgroundColor: isDarkMode ? '#27272A' : '#E1E9EE',
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {},
});
