import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SafeScreen from '../components/SafeScreen'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth when app starts
    const initialize = async () => {
      await initializeAuth();
      // Hide splash screen after auth is initialized
      SplashScreen.hideAsync();
    };

    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}