import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_DRAWER_HEIGHT = 100; // collapsed height
const MAX_DRAWER_HEIGHT = SCREEN_HEIGHT * 0.7; // expanded height
const INITIAL_DRAWER_HEIGHT = MIN_DRAWER_HEIGHT;

interface BottomDrawerProps {
  children: React.ReactNode;
  title?: string;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ children, title }) => {
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? 'dark' : 'light'];
  
  const drawerHeight = useRef(new Animated.Value(INITIAL_DRAWER_HEIGHT)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Calculate new height based on drag
        const newHeight = INITIAL_DRAWER_HEIGHT - gestureState.dy;
        // Clamp between min and max
        const clampedHeight = Math.max(MIN_DRAWER_HEIGHT, Math.min(MAX_DRAWER_HEIGHT, newHeight));
        drawerHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentHeight = (drawerHeight as any).__getValue();
        const velocity = gestureState.vy;
        
        // Determine target height based on velocity and current position
        let targetHeight;
        if (Math.abs(velocity) > 0.5) {
          // Fast swipe - snap based on direction
          targetHeight = velocity > 0 ? MIN_DRAWER_HEIGHT : MAX_DRAWER_HEIGHT;
        } else {
          // Slow drag - snap based on midpoint
          const midpoint = (MIN_DRAWER_HEIGHT + MAX_DRAWER_HEIGHT) / 2;
          targetHeight = currentHeight > midpoint ? MAX_DRAWER_HEIGHT : MIN_DRAWER_HEIGHT;
        }
        
        setIsExpanded(targetHeight === MAX_DRAWER_HEIGHT);
        
        Animated.spring(drawerHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          damping: 15,
          stiffness: 150,
        }).start();
      },
    })
  ).current;

  const toggleDrawer = () => {
    const targetHeight = isExpanded ? MIN_DRAWER_HEIGHT : MAX_DRAWER_HEIGHT;
    setIsExpanded(!isExpanded);
    Animated.spring(drawerHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      damping: 15,
      stiffness: 150,
    }).start();
  };

  const drawerStyle = {
    height: drawerHeight,
    transform: [{ translateY: 0 }],
  };

  return (
    <Animated.View style={[styles.drawer, drawerStyle, { backgroundColor: theme.background }]}>
      {/* Drag Handle */}
      <View style={styles.handleContainer} {...panResponder.panHandlers}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.handleButton}>
          <View style={[styles.handle, { backgroundColor: theme.icon }]} />
          {title && (
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          )}
          <Ionicons 
            name={isExpanded ? 'chevron-down' : 'chevron-up'} 
            size={20} 
            color={theme.icon} 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden',
  },
  handleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  handleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default BottomDrawer;