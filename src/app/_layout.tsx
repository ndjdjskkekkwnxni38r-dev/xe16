import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ToastProvider } from '@/components/Toast';
import { CartProvider } from '@/store/CartContext';
import { UserProvider } from '@/store/UserContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let t = null;
      if (Platform.OS === 'web') {
        t = localStorage.getItem('access_token');
      } else {
        const SecureStore = require('expo-secure-store');
        t = await SecureStore.getItemAsync('access_token');
      }
      setToken(t);
      await SplashScreen.hideAsync();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready && !token) {
      router.replace('/send-otp');
    }
  }, [ready, token]);

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <ToastProvider>
        <UserProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="send-otp" />
              <Stack.Screen name="verify-otp" />
            </Stack>
          </CartProvider>
        </UserProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <UserProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="send-otp" />
            <Stack.Screen name="verify-otp" />
          </Stack>
        </CartProvider>
      </UserProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF0000' },
  text: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
});
