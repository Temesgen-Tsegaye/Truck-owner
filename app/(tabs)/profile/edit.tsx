import { Tabs } from "@/components/global/tabs";
import { NameForm } from "@/components/profile/profile";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { TruckOwnerForm } from "@/components/profile/TruckOwner";
import { PhoneForm } from "@/components/profile/phone";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export default function EditProfile() {
  const [activeIndex, setActiveIndex] = useState(0);
  const queryClient = useQueryClient();
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }, [queryClient]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={{ paddingTop: 20 }}>
          <Tabs
            tabs={["Profile", "Truck Owner", "Phone"]}
            activeIndex={activeIndex}
            onChange={setActiveIndex}
          />
          {activeIndex === 0 && (
            <Animated.View
              key="base"
              entering={FadeIn}
              exiting={FadeOut}
              style={{ paddingHorizontal: 20, marginTop: 16 }}
            >
              <NameForm  />
            </Animated.View>
          )}
          {activeIndex === 1 && (
            <Animated.View
              key="truck-owner"
              entering={FadeIn}
              exiting={FadeOut}
              style={{ paddingHorizontal: 20, marginTop: 16 }}
            >
              <TruckOwnerForm  />
            </Animated.View>
          )}
          {activeIndex === 2 && (
            <Animated.View key="phone" entering={FadeIn} exiting={FadeOut}>
              <PhoneForm  />
            </Animated.View>
          )}
      </View>
    </View>
  );
}
