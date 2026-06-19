import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ 
        headerShadowVisible: false,
     }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[roomId]" options={{ headerShown: false }} />
    </Stack>
  );
}
