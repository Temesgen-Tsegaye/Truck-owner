import { Tabs, useRouter, usePathname } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Pressable, Platform, StyleSheet } from "react-native";

/**
 * Custom tab button that keeps all tab buttons sized and centered consistently.
 * The chat tab also always routes back to the chat list from a room detail screen.
 */
function TabBarButton(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const routeName = props.accessibilityState?.routeNames?.[props.accessibilityState?.index] ?? props.route?.name;

  const handlePress = () => {
    if (routeName === "chat" && /\/chat\/[^/]+/.test(pathname)) {
      router.replace("/(tabs)/chat");
    } else {
      props.onPress?.();
    }
  };

  return (
    <Pressable {...props} style={[props.style, styles.tabButton]} onPress={handlePress}>
      {props.children}
    </Pressable>
  );
}

const TabIcon = ({ focused, iconName }: { focused: boolean, iconName: any }) => {
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <Feather name={iconName} size={20} color="#fff" />
      </View>
    );
  }
  return (
    <Feather name={iconName} size={22} color="#8c8c8c" />
  );
};

export default function AppLayout() {
  return (
    <Tabs
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarStyle: styles.tabBar,
        tabBarIconStyle: styles.tabIcon,
        tabBarItemStyle: {
          flex: 1,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 0,
          paddingVertical: 0,
          marginVertical: 0,
        },
        tabBarActiveTintColor: '#f15a2b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Loads",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="home" />,
        }}
      />
      <Tabs.Screen
        name="shipments"
        options={{
          title: "Shipments",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="credit-card" />,
        }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{
          title: "Vehicles",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <View style={styles.activeIconContainer}>
                <MaterialCommunityIcons name="truck" size={20} color="#fff" />
              </View>
            ) : (
              <MaterialCommunityIcons name="truck-outline" size={22} color="#8c8c8c" />
            ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="message-circle" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="user" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  tabBar: {
    height: 70,
    backgroundColor: '#23201d',
    borderTopWidth: 0,
    paddingBottom: 0,
  },
  tabIcon: {
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'center',
  },
  activeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f15a2b', // Orange active circle!
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f15a2b',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  }
});
