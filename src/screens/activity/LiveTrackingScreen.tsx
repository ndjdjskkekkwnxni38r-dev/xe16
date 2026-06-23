import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from '@/components/Map';
import { useToast } from '@/components/Toast';
import { COLORS, SHADOW, SPACING } from '@/constants/theme';
import socketService from '@/services/socket';
import agoraService from '@/services/agoraService';
import { useUser } from '@/store/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  TextInput,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  const [driver, setDriver] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState('pending');
  const [eta, setEta] = useState('--');
  const [distance, setDistance] = useState('--');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [rateRating, setRateRating] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const [rateSubmitted, setRateSubmitted] = useState(false);
  
  const [region, setRegion] = useState({
    latitude: 16.0611,
    longitude: 108.2274,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const fetchBookingDetails = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      const response = await fetch(`https://admin.datxedulich.vip/api/customer/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const resData = await response.json();
      if (response.ok && resData.data) {
        const b = resData.data;
        setBookingData(b);
        setTripStatus((b.status || '').toLowerCase());
        
        if (b.driver_info) {
          const di = b.driver_info;
          setDriver({
            name: di.name || 'Tài xế',
            phone: di.phone,
            avatar: di.avatar 
              ? (di.avatar.startsWith('http') ? di.avatar : `https://admin.datxedulich.vip/${di.avatar.replace(/^\//, '')}`)
              : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
            plate: di.vehicle_plate || '---',
            car: di.vehicle_info || 'Đang cập nhật',
            lat: di.current_lat,
            lng: di.current_lng,
            rating: '5.0',
            trips: '0',
          });
        }
      }
    } catch (error) {
      console.error('[LiveTracking] Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
    const interval = setInterval(fetchBookingDetails, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!id || !user?.id) return;
    let cleanupFn: (() => void) | undefined;

    const initSocket = async () => {
      const socket = await socketService.connect();
      if (!socket) return;
      const channelName = `private-customer.${user.id}`;
      socket.emit('subscribe', { channel: channelName });

      const userChannelId = `private-customer.${user.id}`;

      socket.offAny();
      socket.onAny((event: string, data: any) => {
        if (!event.includes(userChannelId)) return;

        console.log('[LiveTracking] Socket event:', event, data);
        const payload = Array.isArray(data) ? data[0] : data;

        if (payload?.driver_info) {
          const di = payload.driver_info;
          setDriver((prev: any) => ({
            ...prev,
            lat: di.current_lat || prev?.lat,
            lng: di.current_lng || prev?.lng,
          }));
        }

        const eventStatus = (payload?.status || '').toLowerCase();
        if (eventStatus) {
          setTripStatus(eventStatus);
        }

        fetchBookingDetails();
      });

      cleanupFn = () => {
        socket.emit('unsubscribe', { channel: channelName });
        socket.offAny();
      };
    };
    initSocket();

    return () => { cleanupFn?.(); };
  }, [id, user?.id]);

  const submitRate = async () => {
    if (rateRating === 0) return;
    setRateLoading(true);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      const body = JSON.stringify({
        rating_stars: rateRating,
        comment: rateComment.trim() || '',
      });
      console.log('[Rate] Submitting:', { url: `api/customer/bookings/${id}/rate`, body, token: token ? 'exists' : 'null' });

      const response = await fetch(`https://admin.datxedulich.vip/api/customer/bookings/${id}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body,
      });

      const resData = await response.json();
      console.log('[Rate] Response:', response.status, JSON.stringify(resData));

      if (response.ok) {
        setRateSubmitted(true);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        showToast({ message: resData.message || 'Gửi đánh giá thất bại', type: 'error' });
      }
    } catch (error) {
      console.error('[Rate] Error:', error);
      showToast({ message: 'Lỗi kết nối, vui lòng thử lại', type: 'error' });
    } finally {
      setRateLoading(false);
    }
  };

  const getStatusText = () => {
    switch (tripStatus) {
      case 'pending': return 'Đang tìm tài xế';
      case 'accepted': return 'Tài xế đã nhận chuyến';
      case 'picking': return 'Tài xế đang đến điểm đón';
      case 'delivering': return 'Đang di chuyển';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Đang cập nhật';
    }
  };

  const [driverRoute, setDriverRoute] = useState<{latitude: number; longitude: number}[]>([]);

  const fetchDriverRoute = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setDriverRoute(data.routes[0].geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        })));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (tripStatus === 'delivering' && bookingData?.pickup_lat && bookingData?.pickup_lng && bookingData?.dropoff_lat && bookingData?.dropoff_lng) {
      fetchDriverRoute(
        { latitude: parseFloat(bookingData.pickup_lat), longitude: parseFloat(bookingData.pickup_lng) },
        { latitude: parseFloat(bookingData.dropoff_lat), longitude: parseFloat(bookingData.dropoff_lng) }
      );
    } else if (driver?.lat && driver?.lng && bookingData?.pickup_lat && bookingData?.pickup_lng) {
      fetchDriverRoute(
        { latitude: parseFloat(driver.lat), longitude: parseFloat(driver.lng) },
        { latitude: parseFloat(bookingData.pickup_lat), longitude: parseFloat(bookingData.pickup_lng) }
      );
    }
  }, [tripStatus, driver?.lat, driver?.lng, bookingData?.pickup_lat, bookingData?.pickup_lng, bookingData?.dropoff_lat, bookingData?.dropoff_lng]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mapContainer}>
        <MapView 
          style={StyleSheet.absoluteFillObject} 
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region} 
          showsUserLocation
        >
            {driverRoute.length > 0 && <Polyline coordinates={driverRoute} strokeWidth={4} strokeColor={COLORS.primary} />}
            {bookingData?.pickup_lat && (
              <Marker coordinate={{ latitude: parseFloat(bookingData.pickup_lat), longitude: parseFloat(bookingData.pickup_lng) }}>
                <View style={[styles.markerContainer, { backgroundColor: COLORS.primary }]}><Ionicons name="location" size={18} color={COLORS.white} /></View>
              </Marker>
            )}
            {tripStatus === 'delivering' && bookingData?.dropoff_lat && (
              <Marker coordinate={{ latitude: parseFloat(bookingData.dropoff_lat), longitude: parseFloat(bookingData.dropoff_lng) }}>
                <View style={[styles.markerContainer, { backgroundColor: '#EF4444' }]}><Ionicons name="flag" size={18} color={COLORS.white} /></View>
              </Marker>
            )}
            {tripStatus !== 'delivering' && driver && driver.lat && (
              <Marker key={`${driver.lat}-${driver.lng}`} coordinate={{ latitude: parseFloat(driver.lat), longitude: parseFloat(driver.lng) }} rotation={90}>
                <View style={styles.carMarker}><Ionicons name="car" size={24} color={COLORS.primary} /></View>
              </Marker>
            )}
        </MapView>
      </View>

      <SafeAreaView style={styles.headerOverlay}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={COLORS.text} /></TouchableOpacity>
          <View style={styles.statusCard}><Text style={styles.statusText}>{getStatusText()}</Text></View>
        </View>
      </SafeAreaView>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
        {tripStatus === 'completed' ? (
          rateSubmitted ? (
            <View style={styles.rateSuccess}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={styles.rateSuccessTitle}>Cảm ơn bạn!</Text>
              <Text style={styles.rateSuccessSub}>Đánh giá đã được ghi nhận.</Text>
            </View>
          ) : (
            <View style={styles.rateContainer}>
              <Text style={styles.rateTitle}>Đánh giá chuyến đi</Text>
              {driver && (
                <View style={styles.rateDriverRow}>
                  <Image source={{ uri: driver.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.tripsText}>{driver.car} • {driver.plate}</Text>
                  </View>
                </View>
              )}
              <View style={styles.rateStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRateRating(star)}>
                    <Ionicons
                      name={star <= rateRating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rateRating ? '#FBBF24' : '#D1D5DB'}
                      style={{ marginHorizontal: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rateRating > 0 && (
                <Text style={styles.rateLabel}>
                  {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][rateRating]}
                </Text>
              )}
              <View style={styles.rateInputWrap}>
                <TextInput
                  style={{ fontSize: 14, color: COLORS.text, minHeight: 40 }}
                  placeholder="Nhận xét (không bắt buộc)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={rateComment}
                  onChangeText={setRateComment}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={[styles.rateSubmitBtn, rateRating === 0 && { opacity: 0.5 }]}
                onPress={submitRate}
                disabled={rateRating === 0 || rateLoading}
              >
                {rateLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.rateSubmitText}>Gửi đánh giá</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.etaBox}><Text style={styles.etaTime}>{eta}</Text><Text style={styles.etaLabel}>đến nơi</Text></View>
              <View style={styles.progressTrack}><View style={[styles.progressBar, { width: driver ? '65%' : '0%' }]} /></View>
              <View style={styles.distanceBox}><Text style={styles.distanceValue}>{distance}</Text><Text style={styles.distanceLabel}>còn lại</Text></View>
            </View>

            {driver ? (
              <View style={styles.driverCard}>
                <View style={styles.driverInfo}>
                  <Image source={{ uri: driver.avatar }} style={styles.avatar} />
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.tripsText}>{driver.car} • {driver.plate}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.driverCard, { justifyContent: 'center', paddingVertical: 30 }]}>
                <Text style={{ textAlign: 'center' }}>{tripStatus === 'cancelled' ? 'Chuyến đi đã bị hủy' : 'Đang kết nối...'}</Text>
              </View>
            )}
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.chatButton, !driver && { opacity: 0.5 }]} 
                disabled={!driver}
                onPress={() => {
                  if (driver) {
                    router.push({
                      pathname: '/chat',
                      params: {
                        id: id as string,
                        driverName: driver.name || 'Tài xế',
                      },
                    });
                  }
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Nhắn tin</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.callButton, !driver?.phone && { opacity: 0.5 }]} 
                disabled={!driver?.phone}
                onPress={() => {
                  if (driver?.phone) {
                    Linking.openURL(`tel:${driver.phone}`);
                  } else {
                    showToast({ message: 'Không tìm thấy số điện thoại', type: 'error' });
                  }
                }}
              >
                <Ionicons name="call" size={20} color={COLORS.white} />
                <Text style={styles.callButtonText}>Gọi điện</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routeItem}><View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} /><Text style={styles.routeText} numberOfLines={1}>{bookingData?.pickup_address || '...'}</Text></View>
              <View style={styles.routeItem}><View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.routeText} numberOfLines={1}>{bookingData?.dropoff_address || '...'}</Text></View>
              <View style={styles.routeLine} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOW.md },
  statusCard: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, ...SHADOW.md },
  statusText: { fontSize: 14, fontWeight: '700' },
  markerContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  carMarker: { padding: 8, backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary },
  collapseHandle: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#EEEEEE',
    borderRadius: 15,
    marginTop: -40, // Đẩy lên trên cao hơn
    marginBottom: 15,
  },
  bottomSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: SPACING.lg, paddingBottom: SPACING.xl * 2, ...SHADOW.lg, marginTop: -30, zIndex: 100 },
  driverCard: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: '#F8FAFC', borderRadius: 20 },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: SPACING.md },
  driverName: { fontSize: 16, fontWeight: '700' },
  tripsText: { color: COLORS.textSecondary },
  plateNumber: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  carModel: { fontSize: 12, color: COLORS.textSecondary },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  chatButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 18 },
  callButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 18 },
  actionButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginLeft: 8 },
  callButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white, marginLeft: 8 },
  safetyLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  safetyText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginLeft: 10 },
  routeContainer: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16, marginBottom: SPACING.lg, position: 'relative' },
  routeItem: { flexDirection: 'row', alignItems: 'center', zIndex: 2, marginVertical: 4 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  routeText: { fontSize: 14, color: COLORS.text, fontWeight: '500', flex: 1 },
  routeLine: { position: 'absolute', left: 20.5, top: 26, bottom: 26, width: 1, backgroundColor: '#E2E8F0', borderStyle: 'dashed', zIndex: 1 },
  progressContainer: { flexDirection: 'row', marginBottom: SPACING.xl },
  etaBox: { alignItems: 'center' },
  etaTime: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  etaLabel: { fontSize: 12, color: COLORS.textSecondary },
  progressTrack: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: SPACING.lg },
  progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  distanceBox: { alignItems: 'center' },
  distanceValue: { fontSize: 20, fontWeight: '900' },
  distanceLabel: { fontSize: 12, color: COLORS.textSecondary },
  rateContainer: { alignItems: 'center', paddingVertical: SPACING.md },
  rateTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  rateDriverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.md },
  rateStars: { flexDirection: 'row', marginBottom: SPACING.sm },
  rateLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.lg },
  rateInputWrap: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: SPACING.md, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: SPACING.lg },
  rateInputPlaceholder: { fontSize: 14, color: COLORS.textSecondary },
  rateSubmitBtn: { width: '100%', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  rateSubmitText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  rateSuccess: { alignItems: 'center', paddingVertical: SPACING.xl },
  rateSuccessTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.md },
  rateSuccessSub: { fontSize: 15, color: COLORS.textSecondary, marginTop: SPACING.sm },
});