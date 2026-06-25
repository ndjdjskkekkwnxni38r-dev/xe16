import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ToastProvider, useToast } from '@/components/Toast';
import { CartProvider } from '@/store/CartContext';
import { UserProvider } from '@/store/UserContext';
import { NotificationProvider, useNotifications } from '@/store/NotificationContext';

SplashScreen.preventAutoHideAsync();

let messaging: any = null;
if (Platform.OS !== 'web') {
  try { messaging = require('@react-native-firebase/messaging').default; } catch {}
}

function FirebaseListener() {
  const { addNotification } = useNotifications();
  const { showToast } = useToast();
  const listenerSet = useRef(false);

  useEffect(() => {
    if (!messaging || listenerSet.current) return;
    listenerSet.current = true;

    messaging().onMessage(async (remoteMessage: any) => {
      console.log('FCM foreground:', remoteMessage.notification?.title);
      const title = remoteMessage.notification?.title || 'Thông báo';
      const body = remoteMessage.notification?.body || '';
      addNotification({ title, body, data: remoteMessage.data });
      showToast({ message: `${title}\n${body}`, type: 'info' });
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('FCM background:', remoteMessage);
    });
  }, []);

  return null;
}

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
            <NotificationProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="send-otp" />
                <Stack.Screen name="verify-otp" />
              </Stack>
            </NotificationProvider>
          </CartProvider>
        </UserProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <UserProvider>
        <CartProvider>
          <NotificationProvider>
            <FirebaseListener />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="send-otp" />
              <Stack.Screen name="verify-otp" />
            </Stack>
          </NotificationProvider>
        </CartProvider>
      </UserProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF0000' },
  text: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
});
