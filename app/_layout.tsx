import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SafeScreen from '../components/SafeScreen'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import NavigationHandler from '../components/NavigationHandler';

export default function RootLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
        <NavigationHandler />
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}