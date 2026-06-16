import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface UserInfo {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  balance: number;
  point: number;
}

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  fetchUserInfo: () => Promise<void>;
  logout: () => Promise<void>;
  deductBalance: (amount: number) => boolean;
  addBalance: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = useCallback(async () => {
    setLoading(true);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      if (!token) return;

      const response = await fetch('https://admin.datxedulich.vip/api/user/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Kiểm tra nếu dữ liệu trả về nằm trong trường 'data'
        const userData = data.data || data;
        
        setUser({
          id: userData.id,
          name: userData.name || userData.full_name || userData.displayName || 'Khách',
          phone: userData.phone || '',
          email: userData.email,
          avatar: userData.avatar || userData.photoURL,
          balance: Number(userData.balance) || 0,
          point: Number(userData.point) || 0,
        });
      }
    } catch (error) {
      console.error('Fetch User Info Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('access_token');
      } else {
        await SecureStore.deleteItemAsync('access_token');
      }
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  }, []);

  const deductBalance = useCallback((amount: number) => {
    if (user && user.balance >= amount) {
      setUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
      return true;
    }
    return false;
  }, [user]);

  const addBalance = useCallback((amount: number) => {
    setUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    fetchUserInfo,
    logout,
    deductBalance,
    addBalance
  }), [user, loading, fetchUserInfo, logout, deductBalance, addBalance]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
