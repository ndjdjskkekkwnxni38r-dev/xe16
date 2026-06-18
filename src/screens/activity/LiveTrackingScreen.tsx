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
  PermissionsAndroid
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
  const [tripStatus, setTripStatus] = useState('finding_driver');
  const [eta, setEta] = useState('--');
  const [distance, setDistance] = useState('--');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
        setTripStatus(b.status);
        
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
    const initSocket = async () => {
      const socket = await socketService.connect();
      const channelName = `private-customer.${user.id}`;
      socket.emit('subscribe', { channel: channelName });

      socket.on('booking_updated', (data) => {
        if (data.driver_info) {
          const di = data.driver_info;
          setDriver(prev => ({
            ...prev,
            lat: di.current_lat || prev?.lat,
            lng: di.current_lng || prev?.lng,
          }));
        }
        if (['accepted', 'driving', 'driver_found', 'arrived', 'cancelled', 'completed'].includes(data.status)) {
          setTripStatus(data.status);
        }
        fetchBookingDetails();
      });
    };
    initSocket();
  }, [id, user?.id]);

  const getStatusText = () => {
    switch (tripStatus) {
      case 'finding_driver': return 'Đang tìm tài xế...';
      case 'accepted': return 'Tài xế đang đến';
      case 'arrived': return 'Tài xế đã đến';
      case 'driving': return 'Đang trong chuyến đi';
      case 'completed': return 'Chuyến đi đã hoàn thành';
      case 'cancelled': return 'Chuyến đi đã bị hủy';
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
    if (driver?.lat && driver?.lng && bookingData?.pickup_lat && bookingData?.pickup_lng) {
      fetchDriverRoute(
        { latitude: parseFloat(driver.lat), longitude: parseFloat(driver.lng) },
        { latitude: parseFloat(bookingData.pickup_lat), longitude: parseFloat(bookingData.pickup_lng) }
      );
    }
  }, [driver?.lat, driver?.lng, bookingData?.pickup_lat, bookingData?.pickup_lng]);

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
            {driver && driver.lat && (
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

      <View style={[styles.bottomSheet, isCollapsed && { height: 60 }, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <TouchableOpacity style={styles.collapseHandle} onPress={() => setIsCollapsed(!isCollapsed)}>
          <Ionicons name={isCollapsed ? "reorder-three" : "reorder-three"} size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        
        {!isCollapsed && (
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
                style={[styles.chatButton, !driver?.phone && { opacity: 0.5 }]} 
                disabled={!driver?.phone}
                onPress={() => driver?.phone && Linking.openURL(`sms:${driver.phone}`)}
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
});