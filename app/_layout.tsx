import { Stack, useRouter, useSegments } from 'expo-router';
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { SessionProvider, useSession, isValidToken } from '@/context/auth-context';
import { SplashScreenController } from '@/components/splash';
import { ThemeProvider } from '@/context/theme-context';
import { SocketProvider } from '@/context/socket-context';

export default function Root() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SocketProvider>
          <ThemeProvider>
            <SplashScreenController />
            <RootLayoutNav />
            <Toast />
          </ThemeProvider>
        </SocketProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const isValidSession = session && isValidToken(session);

    if (!isValidSession && inTabsGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/(auth)');
    } else if (isValidSession && segments[0] === '(auth)') {
      // Redirect away from the login page if authenticated
      router.replace('/(tabs)');
    }
  }, [session, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

  
