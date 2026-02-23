import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="edit" options={{ title: 'Edit Profile', headerShown: true }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
        </Stack>
    );
}