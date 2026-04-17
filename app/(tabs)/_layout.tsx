import { Tabs, useRouter, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="message-circle" />,
        }}
      />
      <Tabs.Screen
        name="truck-owners"
        options={{
          href: null,
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
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: '#23201d', // Dark tab bar matching the aesthetics
    borderRadius: 35,
    borderTopWidth: 0,
    paddingBottom: 0, // Prevent default safe-area padding from pushing icons up
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
