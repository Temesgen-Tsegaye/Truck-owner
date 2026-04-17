import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold 
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import { SessionProvider, useSession, isValidToken } from '@/context/auth-context';
import { SplashScreenController } from '@/components/splash';
import { ThemeProvider } from '@/context/theme-context';

SplashScreen.preventAutoHideAsync();

export default function Root() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <SplashScreenController />
          <RootLayoutNav />
          <Toast />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const isValidSession = session && isValidToken(session);

    if (!isValidSession && inTabsGroup) {
      setTimeout(() => router.replace('/(auth)'), 0);
    } else if (isValidSession && segments[0] === '(auth)') {
      setTimeout(() => router.replace('/(tabs)'), 0);
    }
  }, [session, segments, isLoading, rootNavigationState?.key]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

  
