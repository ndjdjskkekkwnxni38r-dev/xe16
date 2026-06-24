import { Platform, Alert } from 'react-native';

let messaging: any = null;

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
  } catch (e) {
    console.warn('Firebase messaging not available:', e);
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!messaging) return null;

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Notification permission denied');
      return null;
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function sendTokenToBackend(token: string): Promise<void> {
  try {
    const SecureStore = require('expo-secure-store');
    const authToken = await SecureStore.getItemAsync('access_token');
    if (!authToken) return;

    await fetch('https://admin.datxedulich.vip/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcm_token: token }),
    });
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
}
