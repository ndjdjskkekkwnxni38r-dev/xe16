import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ToastProvider, useToast } from '@/components/Toast';
import { CartProvider } from '@/store/CartContext';
import { UserProvider } from '@/store/UserContext';
import { NotificationProvider, useNotifications } from '@/store/NotificationContext';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let messaging: any = null;
if (Platform.OS !== 'web') {
  try { messaging = require('@react-native-firebase/messaging').default; } catch {}
}

if (messaging) {
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('FCM background:', remoteMessage.notification?.title);
  });
}

function FirebaseListener() {
  const { addNotification } = useNotifications();
  const { showToast } = useToast();
  const listenerSet = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!messaging || listenerSet.current) return;
    listenerSet.current = true;

    messaging().onMessage(async (remoteMessage: any) => {
      console.log('FCM foreground:', remoteMessage.notification?.title);
      const title = remoteMessage.notification?.title || 'Thông báo';
      const body = remoteMessage.notification?.body || '';
      addNotification({ title, body, data: remoteMessage.data });
      showToast({ message: `${title}\n${body}`, type: 'info' });

      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: remoteMessage.data, sound: true },
        trigger: null,
      });
    });
  }, []);

  useEffect(() => {
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      if (data?.screen) {
        router.push(data.screen);
      }
    });
    return () => responseSub.remove();
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
        <Text style={styles.logo}>VanBooking</Text>
        <Text style={styles.subtitle}>Đang tải...</Text>
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
              <Stack.Screen name="rate" />
              <Stack.Screen name="rate-booking" />
              <Stack.Screen name="chat" />
            </Stack>
          </NotificationProvider>
        </CartProvider>
      </UserProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F97316',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 10,
  },
});
