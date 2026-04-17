import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ 
        headerStyle: { backgroundColor: '#161412' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
     }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[roomId]" options={{ headerShown: false }} />
    </Stack>
  );
}
