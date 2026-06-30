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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    icon: 'help-circle',
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
    subtitle: 'Đơn hàng đã được hủy thành công.',
    icon: 'close-circle',
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
  timeout: {
    title: 'Hết thời gian tìm',
    subtitle: 'Không tìm được tài xế phù hợp trong khu vực của bạn.',
    icon: 'hourglass',
    color: '#D97706',
    bgColor: '#FFFBEB',
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
  const insets = useSafeAreaInsets();
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
  const flipAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (status === 'timeout') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flipAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(flipAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [status, flipAnim]);

  const flip = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

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

      <View style={styles.contentWrapper}>
        <View style={styles.body}>
          {/* Animated Icon */}
          <View style={styles.animSection}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], backgroundColor: statusMessage.bgColor }]} />
            <View style={[styles.iconCircle, { backgroundColor: statusMessage.bgColor }]}>              
               <Animated.View style={{ transform: [{ rotateX: flip }] }}>
                <Ionicons name={statusMessage.icon} size={48} color={statusMessage.color} />
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

        {/* Bottom Actions - fixed at bottom */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 40 }]}>
          {status === 'timeout' ? (
            <View style={styles.timeoutContainer}>
              {/* <View style={styles.timeoutIconWrapper}>
                <View style={styles.timeoutIconCircle}>
                  <Animated.View style={{ transform: [{ rotateX: flip }] }}>
                    <Ionicons name="hourglass" size={32} color="#D97706" />
                  </Animated.View>
                </View>
              </View> */}
              <TouchableOpacity style={styles.retryBtnFull} onPress={() => router.replace('/express')}>
                <LinearGradient
                  colors={[COLORS.primary, '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.retryGradientFull}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.retryTextFull}>Thử lại ngay</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backHomeBtnTimeout} onPress={() => router.replace('/(tabs)')}>
                <Ionicons name="home" size={18} color={COLORS.primary} />
                <Text style={styles.backHomeTextTimeout}>Về trang chủ</Text>
              </TouchableOpacity>
            </View>
          ) : isFinished ? (
            <View style={styles.actionRow}>
              {status === 'error' && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    router.replace({
                      pathname: '/express',
                    });
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
          ) : status === 'cancelled' ? (
            <View style={styles.cancelledContainer}>
              <View style={styles.cancelledIconWrapper}>
                <View style={styles.cancelledIconCircle}>
                  <Ionicons name="close-circle" size={32} color="#DC2626" />
                </View>
              </View>
              <TouchableOpacity style={styles.newOrderBtn} onPress={() => router.replace('/express')}>
                <LinearGradient
                  colors={[COLORS.primary, '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.newOrderGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.newOrderText}>Tạo đơn mới</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backHomeBtnCancelled} onPress={() => router.replace('/(tabs)')}>
                <Ionicons name="home" size={18} color={COLORS.primary} />
                <Text style={styles.backHomeTextCancelled}>Về trang chủ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.cancelText}>Hủy yêu cầu</Text>
            </TouchableOpacity>
          )}
        </View>
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

  /* Layout fix: wrapper holds body (flex:1) + bottomSection (fixed) */
  contentWrapper: { flex: 1, flexDirection: 'column' },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 140, /* space for bottomSection */
  },

  animSection: { alignItems: 'center', marginBottom: 28 },
  pulseRing: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    opacity: 0.15,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FED7AA',
  },

  statusTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginTop: 20, 
    marginBottom: 8, 
    textAlign: 'center',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statusSubtitle: { 
    fontSize: 14, 
    color: '#64748B', 
    textAlign: 'center', 
    lineHeight: 20, 
    fontWeight: '400',
    paddingHorizontal: 16,
  },

  orderCard: {
    width: '100%', marginTop: 24, backgroundColor: '#fff', borderRadius: 20,
    padding: 18, ...SHADOW.sm, borderWidth: 1, borderColor: '#E8E8E8',
  },
  orderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  orderDot: { width: 10, height: 10, borderRadius: 5, marginTop: 2, marginRight: 12, flexShrink: 0 },
  orderLine: {
    width: 1, height: 22, backgroundColor: '#E8E8E8',
    marginLeft: 4, marginVertical: 4,
  },
  orderInfo: { flex: 1 },
  orderLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  orderText: { fontSize: 14, color: '#0F172A', fontWeight: '600', marginTop: 2, lineHeight: 20 },
  orderDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  orderMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderMetaText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  orderPrice: { fontSize: 17, fontWeight: '900', color: COLORS.primary },

  progressDots: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 32 },
  progressDot: { width: 10, height: 10, borderRadius: 5 },

  /* Bottom section fixed at bottom */
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...SHADOW.lg,
    shadowOpacity: 0.1,
    zIndex: 100,
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  retryBtn: {
    flex: 1, height: 54, borderRadius: 16, overflow: 'hidden',
  },
  retryGradient: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  retryText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  backHomeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 16,
    backgroundColor: '#FFF7ED', borderWidth: 1.5, borderColor: COLORS.primary,
  },
  backHomeText: { fontSize: 16, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.3 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 56, width: '100%', borderRadius: 16,
    backgroundColor: '#FFF1F2', borderWidth: 1.5, borderColor: '#FECDD3',
  },
  cancelText: { fontSize: 16, fontWeight: '700', color: '#E11D48', letterSpacing: 0.3 },
  
  /* Timeout State Styles */
  timeoutContainer: {
    alignItems: 'center',
    gap: 12,
  },
  timeoutIconWrapper: {
    marginBottom: 4,
  },
  timeoutIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  retryBtnFull: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryGradientFull: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryTextFull: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  backHomeBtnTimeout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  backHomeTextTimeout: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  /* Cancelled State Styles */
  cancelledContainer: {
    alignItems: 'center',
    gap: 12,
  },
  cancelledIconWrapper: {
    marginBottom: 4,
  },
  cancelledIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  newOrderBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  newOrderGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newOrderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  backHomeBtnCancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  backHomeTextCancelled: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
});