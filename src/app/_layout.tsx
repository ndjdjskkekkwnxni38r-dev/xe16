import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastProvider } from '@/components/Toast';
import { CartProvider } from '@/store/CartContext';
import { UserProvider } from '@/store/UserContext';
import { COLORS } from '@/constants/theme';
import { registerForPushNotifications, sendTokenToBackend, addNotificationListeners, removeNotificationListeners } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let token = null;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('access_token');
        } else {
          token = await SecureStore.getItemAsync('access_token');
        }
        setAuthToken(token);

        if (token && Platform.OS !== 'web') {
          const pushToken = await registerForPushNotifications();
          if (pushToken) {
            await sendTokenToBackend(pushToken);
          }
        }
      } catch {
        setAuthToken(null);
      }
      await SplashScreen.hideAsync();
      setChecked(true);
    })();
  }, []);

  if (!checked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const startRoute = authToken ? '(tabs)' : 'send-otp';

  return (
    <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(500)}>
      <ToastProvider>
        <UserProvider>
          <CartProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack
                initialRouteName={startRoute}
                screenOptions={{
                  headerShown: false,
                  animation: 'fade_from_bottom',
                  contentStyle: { backgroundColor: '#F8FAFC' }
                }}
              >
                <Stack.Screen name="send-otp" options={{ animation: 'none' }} />
                <Stack.Screen name="verify-otp" options={{ animation: 'none' }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="food" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="wallet" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="rate-booking" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="chat" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_right' }} />
              </Stack>
            </ThemeProvider>
          </CartProvider>
        </UserProvider>
      </ToastProvider>
    </Animated.View>
  );
}
