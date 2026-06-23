import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastProvider } from '@/components/Toast';
import { CartProvider } from '@/store/CartContext';
import { UserProvider } from '@/store/UserContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    setAppIsReady(true);
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 500);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(500)}>
      <ToastProvider>
        <UserProvider>
          <CartProvider>
            <RootLayoutNav />
          </CartProvider>
        </UserProvider>
      </ToastProvider>
    </Animated.View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade_from_bottom', // Chuyển cảnh kiểu chuyên nghiệp
          contentStyle: { backgroundColor: '#F8FAFC' }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="food" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="wallet" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="send-otp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="verify-otp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="rate-booking" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ThemeProvider>
  );
}
