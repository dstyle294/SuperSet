// app/index.tsx
import { router, useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function IndexScreen() {

  const { user, token, isLoading, checkAuth, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);


  // Use useFocusEffect to ensure navigation happens when screen is focused
  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );




  useEffect(() => {
    // Add a small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);



  useEffect(() => {
    if (isReady && !isLoading && isInitialized) {
      // Use requestAnimationFrame to ensure navigation happens after render
      requestAnimationFrame(() => {
        if (user && token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)');
        }
      });
    }
  }, [isReady, isLoading, user, token, isInitialized ]);


  // Show loading screen while checking auth
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}