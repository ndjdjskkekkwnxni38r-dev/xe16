import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  receivedAt: number;
  read: boolean;
}

const isRead = (val: any): boolean =>
  val === true || val === 1 || val === '1' || val === 'true';

const NotificationContext = createContext<any>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [localNotifications, setLocalNotifications] = useState<LocalNotification[]>([]);
  const [apiNotifications, setApiNotifications] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  const refreshApi = useCallback(async () => {
    try {
      let t: string | null = null;
      if (Platform.OS === 'web') {
        t = localStorage.getItem('access_token');
      } else {
        t = await SecureStore.getItemAsync('access_token');
      }
      if (!t) { console.log('[NotifCtx] No token'); return; }
      setApiLoading(true);
      const res = await fetch('https://admin.datxedulich.vip/api/notifications', {
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
      });
      const json = await res.json();
      const data = json?.data?.data || json?.data || [];
      console.log('[NotifCtx] refreshApi OK, count:', Array.isArray(data) ? data.length : 0);
      setApiNotifications(Array.isArray(data) ? data : []);
    } catch (e) { console.log('[NotifCtx] refreshApi error:', e); } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => { refreshApi(); }, [refreshApi]);

  const addNotification = useCallback((n: Omit<LocalNotification, 'id' | 'receivedAt' | 'read'>) => {
    setLocalNotifications(prev => {
      const recent = prev.find(
        (existing) =>
          existing.title === n.title &&
          existing.body === n.body &&
          Date.now() - existing.receivedAt < 30000
      );
      if (recent) return prev;
      return [
        {
          ...n,
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          receivedAt: Date.now(),
          read: false,
        },
        ...prev,
      ];
    });
    refreshApi();
  }, [refreshApi]);

  const markAsRead = useCallback((id: string) => {
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setApiNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, is_read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setApiNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  const localMapped: any[] = [];

  const mergedNotifications = [...localMapped, ...apiNotifications];
  const unreadCount = mergedNotifications.filter((n: any) => !isRead(n.is_read)).length;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.setBadgeCountAsync(unreadCount);
    }
  }, [unreadCount]);

  if (apiNotifications.length > 0 || localMapped.length > 0) {
    console.log('[NotifCtx] localMapped:', localMapped.length, 'api:', apiNotifications.length, 'merged:', mergedNotifications.length);
  }

  return (
    <NotificationContext.Provider value={{
      localNotifications,
      mergedNotifications,
      unreadCount,
      apiLoading,
      addNotification,
      markAsRead,
      markAllRead,
      refreshApi,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
