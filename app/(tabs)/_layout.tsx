import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, Pressable } from "react-native";
import { Switch } from "react-native-paper";
import { useAppTheme } from "@/context/theme-context";

/**
 * Custom chat tab button that ensures clicking the chat tab always navigates
 * to the chat list (index) even when currently viewing a chat room.
 */
function ChatTabBarButton(props: any) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = () => {
    console.log("ChatTabBarButton pressed", pathname);
    // If we're already in a chat room (pathname contains /chat/ followed by an ID)
    if (/\/chat\/[^/]+/.test(pathname)) {
      console.log("Navigating to chat index");
      router.replace("/(tabs)/chat");
    } else {
      props.onPress?.();
    }
  };

  return (
    <Pressable {...props} onPress={handlePress}>
      {props.children}
    </Pressable>
  );
}

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const { isDarkMode, toggleTheme } = useAppTheme();

  return (
    <Tabs
      backBehavior="firstRoute"
      screenOptions={{
        tabBarActiveTintColor: Colors[isDarkMode ? "dark" : "light"].tint,
        headerShown: true,
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 15,
            }}
          >
            <Ionicons
              name={isDarkMode ? "moon" : "sunny"}
              size={18}
              color={Colors[isDarkMode ? "dark" : "light"].text}
              style={{ marginRight: 8 }}
            />
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Loads",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cube' : 'cube-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shipments"
        options={{
          title: "Shipments",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'archive' : 'archive-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="truck-owners"
        options={{
          title: "My Trucks",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'car' : 'car-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarButton: ChatTabBarButton,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
