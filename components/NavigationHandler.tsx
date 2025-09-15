import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function NavigationHandler() {
  const router = useRouter();
  const segments = useSegments();
  const { user, token } = useAuthStore();
  
  // Handle navigation based on the auth state
  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!inAuthScreen && !isSignedIn) {
      router.replace("/(auth)");
    }
    if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments]);

  return null; // This component doesn't render anything
}