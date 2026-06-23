import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import socketService from '@/services/socket';
import { useUser } from '@/store/UserContext';

type StatusMessage = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const STATUS_MESSAGES: Record<string, StatusMessage> = {
  searching: {
    title: 'Đang tìm tài xế...',
    subtitle: 'Chúng tôi đang kết nối bạn với tài xế gần nhất.',
    icon: 'sync-outline',
    color: COLORS.primary,
  },
  pending: {
    title: 'Đang tìm tài xế',
    subtitle: 'Yêu cầu của bạn đang được xử lý.',
    icon: 'sync-outline',
    color: COLORS.primary,
  },
  accepted: {
    title: 'Tài xế đã nhận chuyến',
    subtitle: 'Tài xế đang trên đường đến đón bạn.',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
  },
  picking: {
    title: 'Tài xế đang đến điểm đón',
    subtitle: 'Tài xế đang di chuyển đến vị trí của bạn.',
    icon: 'car-outline',
    color: '#10B981',
  },
  delivering: {
    title: 'Đang di chuyển',
    subtitle: 'Bạn đang trên đường đến đích.',
    icon: 'navigate-outline',
    color: COLORS.primary,
  },
  completed: {
    title: 'Hoàn thành',
    subtitle: 'Chuyến đi đã kết thúc. Cảm ơn bạn!',
    icon: 'checkmark-done-outline',
    color: '#10B981',
  },
  cancelled: {
    title: 'Đã hủy',
    subtitle: 'Chuyến đi đã bị hủy.',
    icon: 'close-circle-outline',
    color: '#EF4444',
  },
  timeout: {
    title: 'Hết thời gian tìm',
    subtitle: 'Không tìm được tài xế phù hợp. Vui lòng thử lại.',
    icon: 'time-outline',
    color: '#F59E0B',
  },
  error: {
    title: 'Đã xảy ra lỗi',
    subtitle: 'Có lỗi xảy ra. Vui lòng thử lại.',
    icon: 'alert-circle-outline',
    color: '#EF4444',
  },
};

export default function FindingDriverScreen() {
  const router = useRouter();
  const { user } = useUser();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState<string>('searching');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(STATUS_MESSAGES.searching);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  useEffect(() => {
    if (!user?.id) return;

    let cleanupFn: (() => void) | undefined;

    const setupSocket = async () => {
      const socket = await socketService.connect();
      if (!socket) return;

      const channelName = `private-customer.${user.id}`;
      socket.emit('subscribe', { channel: channelName });

      const userChannelId = `private-customer.${user.id}`;

      socket.offAny();
      socket.onAny((event: string, data: any) => {
        if (!event.includes(userChannelId)) return;

        const payload = Array.isArray(data) ? data[0] : data;
        const eventStatus = payload?.status?.toLowerCase();
        const eventMessage = payload?.message;

        if (event.includes('booking-search-timeout')) {
          const mapped = 'timeout';
          setStatus(mapped);
          setStatusMessage({
            ...STATUS_MESSAGES[mapped],
            subtitle: eventMessage || STATUS_MESSAGES[mapped].subtitle,
          });
          return;
        }

        if (eventStatus && STATUS_MESSAGES[eventStatus]) {
          setStatus(eventStatus);
          setStatusMessage({
            ...STATUS_MESSAGES[eventStatus],
            subtitle: eventMessage || STATUS_MESSAGES[eventStatus].subtitle,
          });

          if (eventStatus === 'accepted' || eventStatus === 'picking') {
            setTimeout(() => router.replace('/(tabs)'), 1500);
          }
        }
      });

      cleanupFn = () => {
        socket.emit('unsubscribe', { channel: channelName });
        socket.offAny();
      };
    };

    setupSocket();

    return () => {
      cleanupFn?.();
    };
  }, [user?.id]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isSearching = status === 'searching' || status === 'pending';
  const isFinished = status === 'timeout' || status === 'cancelled' || status === 'error';
  const isActive = status === 'accepted' || status === 'picking' || status === 'delivering' || status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.loaderContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name={statusMessage.icon}
              size={80}
              color={statusMessage.color}
            />
          </Animated.View>
          <View style={[styles.innerDot, { backgroundColor: statusMessage.color }]} />
        </View>

        <Text style={[styles.title, { color: statusMessage.color }]}>
          {statusMessage.title}
        </Text>
        <Text style={styles.subtitle}>{statusMessage.subtitle}</Text>
      </View>

      {isFinished ? (
        <View style={styles.bottomActions}>
          {status === 'timeout' || status === 'error' ? (
            <>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setStatus('searching');
                  setStatusMessage(STATUS_MESSAGES.searching);
                }}
              >
                <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Quay lại</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Quay lại</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isActive ? (
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.cancelText}>Về trang chủ</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          <Text style={styles.cancelText}>Hủy yêu cầu</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  innerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tripPreview: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    width: '100%',
  },
  previewText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  bottomActions: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  retryText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
