import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VanBooking',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F97316',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '72ea2de1-7e02-4960-8950-28bc27e6f0b2',
    });

    const pushToken = tokenData.data;
    console.log('[Notifications] Push token:', pushToken);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'VanBooking',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    return pushToken;
  } catch (e) {
    console.log('[Notifications] Register error:', e);
    return null;
  }
}

export async function sendTokenToBackend(token: string): Promise<void> {
  try {
    let accessToken = null;
    if (Platform.OS === 'web') {
      accessToken = localStorage.getItem('access_token');
    } else {
      accessToken = await SecureStore.getItemAsync('access_token');
    }
    if (!accessToken) return;

    const res = await fetch('https://admin.datxedulich.vip/api/auth/update-fcm-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ fcm_token: token }),
    });
    const json = await res.json();
    console.log('[Notifications] Send token response:', json);
  } catch (e) {
    console.log('[Notifications] Send token error:', e);
  }
}

export function addNotificationListeners(
  onReceived: (notification: Notifications.Notification) => void,
  onTapped: (notification: Notifications.Notification) => void,
): { sub1: Notifications.Subscription; sub2: Notifications.Subscription } {
  const sub1 = Notifications.addNotificationReceivedListener(onReceived);
  const sub2 = Notifications.addNotificationResponseReceivedListener(onTapped);
  return { sub1, sub2 };
}

export function removeNotificationListeners(listeners: { sub1: Notifications.Subscription; sub2: Notifications.Subscription }) {
  listeners.sub1.remove();
  listeners.sub2.remove();
}
