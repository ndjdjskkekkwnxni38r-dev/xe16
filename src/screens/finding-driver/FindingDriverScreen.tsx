import { COLORS, SHADOW } from '@/constants/theme';
import socketService from '@/services/socket';
import { useUser } from '@/store/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing,
  Platform,
  SafeAreaView, StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View,
} from 'react-native';

type StatusMessage = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
};

const STATUS_MESSAGES: Record<string, StatusMessage> = {
  searching: {
    title: 'Đang tìm tài xế...',
    subtitle: 'Chúng tôi đang kết nối bạn với tài xế gần nhất.',
    icon: 'radar-outline',
    color: COLORS.primary,
    bgColor: '#FFF7ED',
  },
  pending: {
    title: 'Đang tìm tài xế',
    subtitle: 'Yêu cầu của bạn đang được xử lý.',
    icon: 'time-outline',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  accepted: {
    title: 'Tài xế đã nhận!',
    subtitle: 'Tài xế đang trên đường đến đón bạn.',
    icon: 'checkmark-circle',
    color: '#16A34A',
    bgColor: '#DCFCE7',
  },
  picking: {
    title: 'Tài xế đang đến',
    subtitle: 'Tài xế đang di chuyển đến vị trí của bạn.',
    icon: 'car-outline',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
  },
  delivering: {
    title: 'Đang giao hàng',
    subtitle: 'Hàng hóa đang được vận chuyển.',
    icon: 'navigate-outline',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  completed: {
    title: 'Hoàn thành!',
    subtitle: 'Đơn hàng đã được giao thành công.',
    icon: 'checkmark-done-circle',
    color: '#16A34A',
    bgColor: '#DCFCE7',
  },
  cancelled: {
    title: 'Đã hủy',
    subtitle: 'Đơn hàng đã bị hủy.',
    icon: 'close-circle-outline',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  timeout: {
    title: 'Hết thời gian tìm',
    subtitle: 'Không tìm được tài xế phù hợp. Vui lòng thử lại.',
    icon: 'hourglass-outline',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  error: {
    title: 'Đã xảy ra lỗi',
    subtitle: 'Có lỗi xảy ra. Vui lòng thử lại.',
    icon: 'alert-circle-outline',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
};

export default function FindingDriverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderType?: string;
    pickup?: string;
    dropoff?: string;
    vehicle?: string;
    price?: string;
  }>();
  const { user } = useUser();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [status, setStatus] = useState<string>('searching');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(STATUS_MESSAGES.searching);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [rotateAnim, pulseAnim]);

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
            setTimeout(() => router.replace('/(tabs)'), 2000);
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

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const isSearching = status === 'searching' || status === 'pending';
  const isFinished = status === 'timeout' || status === 'cancelled' || status === 'error';
  const isActive = status === 'accepted' || status === 'picking' || status === 'delivering' || status === 'completed';

  const vehicleLabel = params.vehicle === 'bike' ? 'Xe máy' : params.vehicle === 'car' ? 'Ô tô' : 'Xe tải';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={[COLORS.primary, '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tìm tài xế</Text>
            <View style={styles.backBtn} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        {/* Animated Icon */}
        <View style={styles.animSection}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], backgroundColor: statusMessage.bgColor }]} />
          <View style={[styles.iconCircle, { backgroundColor: statusMessage.bgColor }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name={statusMessage.icon} size={56} color={statusMessage.color} />
            </Animated.View>
          </View>
        </View>

        <Text style={[styles.statusTitle, { color: statusMessage.color }]}>{statusMessage.title}</Text>
        <Text style={styles.statusSubtitle}>{statusMessage.subtitle}</Text>

        {/* Order Info Card */}
        {(params.pickup || params.dropoff) && (
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <View style={[styles.orderDot, { backgroundColor: '#16A34A' }]} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderLabel}>Lấy hàng</Text>
                <Text style={styles.orderText} numberOfLines={1}>{params.pickup}</Text>
              </View>
            </View>
            <View style={styles.orderLine} />
            <View style={styles.orderRow}>
              <View style={[styles.orderDot, { backgroundColor: COLORS.primary }]} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderLabel}>Giao hàng</Text>
                <Text style={styles.orderText} numberOfLines={1}>{params.dropoff}</Text>
              </View>
            </View>
            <View style={styles.orderDivider} />
            <View style={styles.orderMeta}>
              <View style={styles.orderMetaItem}>
                <Ionicons name="car" size={14} color="#94A3B8" />
                <Text style={styles.orderMetaText}>{vehicleLabel}</Text>
              </View>
              {params.price && (
                <Text style={styles.orderPrice}>{Number(params.price).toLocaleString('vi-VN')}đ</Text>
              )}
            </View>
          </View>
        )}

        {/* Progress dots */}
        {isSearching && (
          <View style={styles.progressDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[styles.progressDot, { backgroundColor: statusMessage.color, opacity: pulseAnim }]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomSection}>
        {isFinished ? (
          <View style={styles.actionRow}>
            {(status === 'timeout' || status === 'error') && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setStatus('searching');
                  setStatusMessage(STATUS_MESSAGES.searching);
                }}
              >
                <LinearGradient
                  colors={[COLORS.primary, '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.retryGradient}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.retryText}>Thử lại</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.backHomeText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        ) : isActive ? (
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="home" size={18} color={COLORS.primary} />
            <Text style={[styles.backHomeText, { color: COLORS.primary }]}>Về trang chủ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.cancelText}>Hủy yêu cầu</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOW.lg,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  /* Animated icon */
  animSection: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  pulseRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.4,
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center',
  },

  statusTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  statusSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  /* Order Card */
  orderCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginTop: 28,
    width: '100%', ...SHADOW.sm, borderWidth: 1, borderColor: '#F1F5F9',
  },
  orderRow: { flexDirection: 'row', alignItems: 'center' },
  orderDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  orderInfo: { flex: 1 },
  orderLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  orderText: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  orderLine: {
    width: 1, height: 16, backgroundColor: '#CBD5E1', marginLeft: 4.5, marginVertical: 4,
    borderStyle: 'dashed', borderWidth: 0.5,
  },
  orderDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderMetaText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  orderPrice: { fontSize: 17, fontWeight: '900', color: COLORS.primary },

  /* Progress dots */
  progressDots: { flexDirection: 'row', gap: 8, marginTop: 24 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },

  /* Bottom */
  bottomSection: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 36 : 50 },
  actionRow: { gap: 12, alignItems: 'center' },
  retryBtn: { borderRadius: 14, overflow: 'hidden', width: '100%' },
  retryGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14,
  },
  retryText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  backHomeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14, backgroundColor: '#F1F5F9', width: '100%',
  },
  backHomeText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 52, width: '100%',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
