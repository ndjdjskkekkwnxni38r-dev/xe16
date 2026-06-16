import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from '@/components/Map';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import socketService from '@/services/socket';
import { useToast } from '@/components/Toast';
import { useUser } from '@/store/UserContext';

const { width, height } = Dimensions.get('window');

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useUser();
  
  const [driver, setDriver] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState('finding_driver');
  const [eta, setEta] = useState('--');
  const [distance, setDistance] = useState('--');
  const [loading, setLoading] = useState(true);
  
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
      console.log('[LiveTracking] Fetch Booking Data:', resData);

      if (response.ok && resData.data) {
        const b = resData.data;
        setBookingData(b);
        console.log('[LiveTracking] Booking status:', b.status);
        
        // Cập nhật trạng thái từ API
        if (['accepted', 'driving', 'driver_found', 'arrived'].includes(b.status)) {
          setTripStatus(b.status === 'driver_found' ? 'accepted' : b.status);
          
          if (b.driver) {
            // Mapping chi tiết thông tin tài xế từ API Laravel
            setDriver({
              id: b.driver.id,
              name: b.driver.full_name || b.driver.name || 'Tài xế',
              avatar: b.driver.avatar_url || b.driver.photo_url || b.driver.avatar,
              phone: b.driver.phone || b.driver.phone_number,
              rating: b.driver.rating || '5.0',
              trips: b.driver.trips_count || b.driver.total_trips || '0',
              plate: b.driver.vehicle_plate || b.driver.plate_number || b.driver.plate || '---',
              car: b.driver.vehicle_name || b.driver.car_model || b.driver.car || 'Đang cập nhật',
              lat: b.driver.latitude || b.driver.lat,
              lng: b.driver.longitude || b.driver.lng,
            });
          }
        } else {
          setTripStatus('finding_driver');
        }

        // Update map region if coordinates exist
        if (b.pickup_lat && b.pickup_lng) {
          setRegion(prev => ({
            ...prev,
            latitude: parseFloat(b.pickup_lat),
            longitude: parseFloat(b.pickup_lng),
          }));
        }
      }
    } catch (error) {
      console.error('[LiveTracking] Fetch Details Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!id || !user?.id) return;

    const socket = socketService.connect();
    
    const channelName = `private-customer.${user.id}`;
    socket.emit('subscribe', { channel: channelName });
    console.log('[LiveTracking] Subscribed to channel:', channelName);

    const eventName = `laravel_database_${channelName}:booking-accept`;
    const eventVariations = [
      eventName,
      `laravel_database_${channelName}:booking_accepted`,
      `${channelName}:booking-accept`,
      'booking_accepted',
      'booking-accept'
    ];

    eventVariations.forEach(ev => {
      socket.on(ev, (data) => {
        console.log(`[LiveTracking] Event Received (${ev}):`, data);
        const driverData = data.driver || data.data?.driver || data;
        if (driverData) {
          setDriver(driverData);
          setTripStatus('accepted');
          showToast({ message: 'Tài xế đã chấp nhận chuyến đi!', type: 'success' });
        }
      });
    });

    socket.on('booking_updated', (data) => {
      console.log('[LiveTracking] Booking Updated:', data);
      if (data.status === 'accepted' || data.status === 'driving' || data.status === 'driver_found') {
        setTripStatus(data.status);
      }
      if (data.driver) {
        setDriver(data.driver);
      }
      if (data.eta) setEta(data.eta);
      if (data.distance) setDistance(data.distance);
    });

    return () => {
      eventVariations.forEach(ev => socket.off(ev));
      socket.off('booking_updated');
    };
  }, [id, user?.id]);

  const getStatusText = () => {
    switch (tripStatus) {
      case 'finding_driver': return 'Đang tìm tài xế...';
      case 'accepted': return 'Tài xế đang đến';
      case 'arrived': return 'Tài xế đã đến';
      case 'driving': return 'Đang trong chuyến đi';
      case 'completed': return 'Chuyến đi đã hoàn thành';
      default: return 'Đang cập nhật';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Map Implementation */}
      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' ? (
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation
          >
            {/* Pickup Marker */}
            {bookingData?.pickup_lat && (
              <Marker coordinate={{ latitude: parseFloat(bookingData.pickup_lat), longitude: parseFloat(bookingData.pickup_lng) }}>
                <View style={[styles.markerContainer, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="location" size={18} color={COLORS.white} />
                </View>
              </Marker>
            )}

            {/* Destination Marker */}
            {bookingData?.dropoff_lat && (
              <Marker coordinate={{ latitude: parseFloat(bookingData.dropoff_lat), longitude: parseFloat(bookingData.dropoff_lng) }}>
                <View style={[styles.markerContainer, { backgroundColor: COLORS.accent }]}>
                  <Ionicons name="flag" size={18} color={COLORS.white} />
                </View>
              </Marker>
            )}

            {/* Driver Marker */}
            {driver && driver.lat && (
              <Marker coordinate={{ latitude: parseFloat(driver.lat), longitude: parseFloat(driver.lng) }} rotation={90}>
                <View style={styles.carMarker}>
                  <Ionicons name="car" size={24} color={COLORS.primary} />
                </View>
              </Marker>
            )}
          </MapView>
        ) : (
          <View style={styles.webMapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={COLORS.border} />
            <Text style={styles.webMapText}>Bản đồ theo dõi trực tiếp</Text>
            <Text style={styles.webMapSubtext}>Vui lòng xem trên thiết bị di động</Text>
          </View>
        )}
      </View>

      {/* Header Overlay */}
      <SafeAreaView style={styles.headerOverlay}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.statusCard}>
            {tripStatus === 'finding_driver' ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 8 }} />
            ) : (
              <View style={styles.statusDot} />
            )}
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Info Sheet */}
      <View style={styles.bottomSheet}>
        {/* Progress Bar Area */}
        <View style={styles.progressContainer}>
          <View style={styles.etaBox}>
            <Text style={styles.etaTime}>{eta}</Text>
            <Text style={styles.etaLabel}>đến nơi</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: driver ? '65%' : '0%' }]} />
          </View>
          <View style={styles.distanceBox}>
            <Text style={styles.distanceValue}>{distance}</Text>
            <Text style={styles.distanceLabel}>còn lại</Text>
          </View>
        </View>

        {/* Driver Card */}
        {driver ? (
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <Image 
                source={{ uri: driver.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d' }} 
                style={styles.avatar} 
              />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driver.name || 'Tài xế'}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{driver.rating || '5.0'}</Text>
                  <Text style={styles.tripsText}> • {driver.trips || '0'} chuyến</Text>
                </View>
              </View>
            </View>
            <View style={styles.carInfo}>
              <Text style={styles.plateNumber}>{driver.plate || '---'}</Text>
              <Text style={styles.carModel}>{driver.car || 'Đang cập nhật'}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.driverCard, { justifyContent: 'center', paddingVertical: 30 }]}>
            <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>
              Đang kết nối với tài xế...
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.chatButton, !driver && { opacity: 0.5 }]}
            disabled={!driver}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.callButton, !driver && { opacity: 0.5 }]}
            disabled={!driver}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.callButtonText}>Gọi điện</Text>
          </TouchableOpacity>
        </View>
        
        {/* Route Info */}
        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.routeText} numberOfLines={1}>{bookingData?.pickup_address || 'Đang lấy địa chỉ đón...'}</Text>
          </View>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.routeText} numberOfLines={1}>{bookingData?.dropoff_address || 'Đang lấy địa chỉ đến...'}</Text>
          </View>
          <View style={styles.routeLine} />
        </View>

        {/* Safety & More */}
        <TouchableOpacity style={styles.safetyLink}>
          <Ionicons name="shield-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.safetyText}>Trung tâm an toàn & Chia sẻ chuyến đi</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  webMapSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    ...SHADOW.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOW.sm,
  },
  carMarker: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOW.sm,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    ...SHADOW.lg,
    shadowOpacity: 0.2,
    marginTop: -30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  etaBox: {
    alignItems: 'center',
  },
  etaTime: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  etaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
  },
  progressBar: {
    width: '65%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  distanceBox: {
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  distanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  driverCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    borderRadius: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: SPACING.md,
  },
  driverDetails: {
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  tripsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  carInfo: {
    alignItems: 'flex-end',
  },
  plateNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  carModel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 18,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 18,
    ...SHADOW.sm,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
  safetyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  safetyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Route Info Styles
  routeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    marginVertical: 4,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  routeLine: {
    position: 'absolute',
    left: 20.5,
    top: 26,
    bottom: 26,
    width: 1,
    backgroundColor: '#E2E8F0',
    borderStyle: 'dashed',
    zIndex: 1,
  },
});
