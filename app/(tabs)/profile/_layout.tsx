import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
    const router = useRouter();

    const ModernBackButton = () => (
        <Pressable 
            onPress={() => router.back()} 
            style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(28, 24, 21, 0.85)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
                marginLeft: 10,
            }}
        >
            <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
    );

    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: '#161412' },
            headerTintColor: '#fff',
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
