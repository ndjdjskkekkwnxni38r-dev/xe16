import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ id: number; message: string; type: ToastType } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const id = Date.now();
    setToast({ id, message, type });

    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View 
          key={toast.id}
          entering={FadeInUp.springify()}
          exiting={FadeOutUp.duration(200)}
          style={[styles.toastContainer, styles[toast.type]]}
        >
          <View style={styles.iconContainer}>
            {toast.type === 'success' && <Ionicons name="checkmark-circle" size={20} color="#059669" />}
            {toast.type === 'error' && <Ionicons name="alert-circle" size={20} color="#E11D48" />}
            {toast.type === 'info' && <Ionicons name="information-circle" size={20} color="#0EA5E9" />}
          </View>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    ...SHADOW.md,
    borderWidth: 1,
  },
  success: {
    borderColor: '#D1FAE5',
    backgroundColor: '#ECFDF5',
  },
  error: {
    borderColor: '#FFE4E6',
    backgroundColor: '#FFF1F2',
  },
  info: {
    borderColor: '#E0F2FE',
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    marginRight: 12,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
});
