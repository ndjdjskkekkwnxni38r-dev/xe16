import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// Mock data for tracking
const TRACKING_DATA = {
  driver: {
    name: 'Nguyễn Văn Hùng',
    rating: 4.9,
    trips: 1250,
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop',
    car: 'Toyota Alphard Luxury',
    plate: '51G-123.45',
  },
  status: 'Đang di chuyển',
  eta: '12 phút',
  distance: '4.5 km',
  location: {
    latitude: 16.0611,
    longitude: 108.2274,
  },
  destination: {
    latitude: 16.075,
    longitude: 108.235,
    address: 'Sân bay Đà Nẵng',
  },
  pickup: {
    latitude: 16.055,
    longitude: 108.220,
    address: '227 Nguyễn Văn Cừ, Quận 5',
  }
};

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [region, setRegion] = useState({
    latitude: 16.0611,
    longitude: 108.2274,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Map Implementation */}
      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' ? (
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation
          >
            {/* Pickup Marker */}
            <Marker coordinate={TRACKING_DATA.pickup}>
              <View style={[styles.markerContainer, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="location" size={18} color={COLORS.white} />
              </View>
            </Marker>

            {/* Destination Marker */}
            <Marker coordinate={TRACKING_DATA.destination}>
              <View style={[styles.markerContainer, { backgroundColor: COLORS.accent }]}>
                <Ionicons name="flag" size={18} color={COLORS.white} />
              </View>
            </Marker>

            {/* Car Marker (Current Location) */}
            <Marker coordinate={TRACKING_DATA.location} rotation={90}>
              <View style={styles.carMarker}>
                <Ionicons name="car" size={24} color={COLORS.primary} />
              </View>
            </Marker>
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
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{TRACKING_DATA.status}</Text>
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
            <Text style={styles.etaTime}>{TRACKING_DATA.eta}</Text>
            <Text style={styles.etaLabel}>đến nơi</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressBar} />
          </View>
          <View style={styles.distanceBox}>
            <Text style={styles.distanceValue}>{TRACKING_DATA.distance}</Text>
            <Text style={styles.distanceLabel}>còn lại</Text>
          </View>
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <Image 
              source={{ uri: TRACKING_DATA.driver.avatar }} 
              style={styles.avatar} 
            />
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{TRACKING_DATA.driver.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{TRACKING_DATA.driver.rating}</Text>
                <Text style={styles.tripsText}> • {TRACKING_DATA.driver.trips} chuyến</Text>
              </View>
            </View>
          </View>
          <View style={styles.carInfo}>
            <Text style={styles.plateNumber}>{TRACKING_DATA.driver.plate}</Text>
            <Text style={styles.carModel}>{TRACKING_DATA.driver.car}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.callButtonText}>Gọi điện</Text>
          </TouchableOpacity>
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
});
