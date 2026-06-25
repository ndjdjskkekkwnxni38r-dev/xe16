import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/theme';

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

const TOAST_CONFIG = {
  success: {
    gradient: ['#10B981', '#059669', '#047857'] as const,
    icon: 'checkmark-circle' as const,
    glow: '#10B981',
    label: 'Thành công',
  },
  error: {
    gradient: ['#EF4444', '#DC2626', '#B91C1C'] as const,
    icon: 'alert-circle' as const,
    glow: '#EF4444',
    label: 'Lỗi',
  },
  info: {
    gradient: ['#3B82F6', '#2563EB', '#1D4ED8'] as const,
    icon: 'notifications' as const,
    glow: '#3B82F6',
    label: 'Thông báo',
  },
};

function ToastPulse({ color }: { color: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 800, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 0.8]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.5]) }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ id: number; message: string; type: ToastType } | null>(null);
  const [progress, setProgress] = useState(1);
  const timeoutRef = useRef<any>(null);
  const progressRef = useRef<any>(null);

  const showToast = useCallback(({ message, type = 'info', duration = 4000 }: ToastOptions) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    const id = Date.now();
    setToast({ id, message, type });
    setProgress(1);

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.max(0, 1 - elapsed / duration));
    }, 30);

    timeoutRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setToast(null);
    }, duration);
  }, []);

  const config = toast ? TOAST_CONFIG[toast.type] : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && config && (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.springify().damping(14)}
          exiting={FadeOutUp.duration(250)}
          style={styles.toastWrapper}
        >
          <View style={styles.glowContainer}>
            <ToastPulse color={config.glow} />
          </View>

          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toastContainer}
          >
            <View style={styles.topRow}>
              <View style={styles.iconWrap}>
                <Ionicons name={config.icon} size={22} color="#FFF" />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.toastLabel}>{config.label}</Text>
                <Text style={styles.toastText} numberOfLines={3}>{toast.message}</Text>
              </View>
              <View style={styles.notchWrap}>
                <Ionicons name="chatbubble-ellipses" size={16} color="rgba(255,255,255,0.3)" />
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </LinearGradient>
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
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 42,
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  glowContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  toastContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  toastLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 20,
  },
  notchWrap: {
    marginLeft: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },
});
