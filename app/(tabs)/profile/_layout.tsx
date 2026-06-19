import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/theme-context";
import { Colors } from "@/constants/theme";

export default function Layout() {
    const router = useRouter();
    const { isDarkMode } = useAppTheme();
    const theme = Colors[isDarkMode ? "dark" : "light"];

    const ModernBackButton = () => (
        <Pressable 
            onPress={() => router.back()} 
            style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderWidth: 1,
                borderColor: theme.border,
                marginLeft: 10,
            }}
        >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
    );

    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            headerLeft: ({ canGoBack }) => canGoBack ? <ModernBackButton /> : null,
        }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="edit" options={{ 
                title: 'Edit Profile', 
                headerShown: true,
                headerTitleAlign: 'left',
                headerTitleContainerStyle: {
                    paddingLeft: 10
                }
            }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
        </Stack>
    );
}
