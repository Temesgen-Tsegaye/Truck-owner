import { Tabs, useRouter, usePathname } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Pressable, Platform, StyleSheet } from "react-native";
import { useAppTheme } from "@/context/theme-context";
import { Colors } from "@/constants/theme";

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

function TabIcon({ focused, iconName, colors }: { focused: boolean; iconName: any; colors: typeof Colors.light }) {
  if (focused) {
    return (
      <View style={[styles.activeIconContainer, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <Feather name={iconName} size={20} color={colors.textOnPrimary} />
      </View>
    );
  }
  return <Feather name={iconName} size={22} color={colors.tabIconDefault} />;
}

export default function AppLayout() {
  const { isDarkMode } = useAppTheme();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Tabs
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.border }],
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
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Loads",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="home" colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="shipments"
        options={{
          title: "Shipments",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="credit-card" colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{
          title: "Vehicles",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <View style={[styles.activeIconContainer, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                <MaterialCommunityIcons name="truck" size={20} color={colors.textOnPrimary} />
              </View>
            ) : (
              <MaterialCommunityIcons name="truck-outline" size={22} color={colors.tabIconDefault} />
            ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="message-circle" colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="user" colors={colors} />,
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
    borderTopWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
});
