import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Image, Dimensions, StatusBar, Platform, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Phone, MessageSquare, ShieldAlert, Navigation } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import MapView, { Marker, Polyline } from '@/components/Map';

const { width, height } = Dimensions.get('window');

// Dữ liệu mô phỏng cho màn hình Tracking
const MOCK_TRIP = {
  id: '3',
  driverName: 'Trần Quang Hưng',
  driverRating: 4.9,
  driverPlate: '43A - 123.45',
  carModel: 'Ford Transit 16 Chỗ (Bạc)',
  status: 'Tài xế đang đến',
  eta: '5 phút',
  distance: '1.2 km',
  pickup: 'Ga Đà Nẵng',
  dropoff: 'Bà Nà Hills',
  driverAvatar: 'https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-crossed-chest_176420-18743.jpg',
};

export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Tọa độ giả lập
  const [driverCoord, setDriverCoord] = useState({ latitude: 16.0664, longitude: 108.2144 }); // Ga Đà Nẵng
  const dropoffCoord = { latitude: 15.9951, longitude: 107.9961 }; // Bà Nà Hills

  const handleCallDriver = () => {
    // Gọi điện thoại thông thường (fallback)
    const phoneNumber = '0987654321'; 
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Lỗi', 'Thiết bị của bạn không hỗ trợ gọi điện trực tiếp hoặc bạn đang dùng Web.');
    });
  };

  const handleMessageDriver = () => {
    const zaloPhoneNumber = '0987654321'; // Thay số điện thoại thực tế đã đăng ký Zalo
    // URL chuẩn để mở khung chat với số điện thoại trong ứng dụng Zalo
    const zaloUrl = `https://zalo.me/${zaloPhoneNumber}`;

    Linking.openURL(zaloUrl).catch(() => {
      Alert.alert(
        'Không mở được Zalo',
        'Có vẻ ứng dụng Zalo chưa được cài đặt trên thiết bị của bạn hoặc không thể mở đường dẫn này.'
      );
    });
  };

  const handleSOS = () => {
    if (Platform.OS === 'web') {
      window.alert('CẢNH BÁO KHẨN CẤP: Đã gửi tín hiệu vị trí của bạn đến trung tâm hỗ trợ.');
      return;
    }
    Alert.alert(
      "Khẩn cấp (SOS)",
      "Bạn đang gặp sự cố và cần hỗ trợ khẩn cấp? Hệ thống sẽ ghi nhận vị trí của bạn.",
      [
        { text: "Hủy bỏ", style: "cancel" },
        { 
          text: "Gọi Cảnh sát (113)", 
          style: "destructive",
          onPress: () => Linking.openURL('tel:113').catch(console.error)
        }
      ]
    );
  };

  // Hiệu ứng xe di chuyển giả lập (đơn giản)
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverCoord(prev => ({
        latitude: prev.latitude - 0.0001,
        longitude: prev.longitude - 0.0002
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Bản đồ Map (Nền sau) */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 16.0664,
          longitude: 108.2144,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={driverCoord}>
          <View style={styles.carMarker}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5555/5555313.png' }} 
              style={{ width: 30, height: 30, transform: [{ rotate: '-45deg' }] }} 
            />
          </View>
        </Marker>
        <Marker coordinate={dropoffCoord}>
          <View style={styles.destMarker}>
            <View style={styles.destInner} />
          </View>
        </Marker>
        <Polyline 
          coordinates={[driverCoord, dropoffCoord]}
          strokeColor={COLORS.primary}
          strokeWidth={4}
          lineDashPattern={[0]}
        />
      </MapView>

      {/* Header Back Button */}
      <SafeAreaView style={styles.headerSafe} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/explore');
          }
        }} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerStatusBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.headerStatusText}>Theo dõi trực tiếp</Text>
        </View>
      </SafeAreaView>

      {/* Bottom Information Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        {/* Status Info */}
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.statusTitle}>{MOCK_TRIP.status}</Text>
            <View style={styles.etaRow}>
              <Text style={styles.etaText}>{MOCK_TRIP.eta}</Text>
              <Text style={styles.distanceText}> • {MOCK_TRIP.distance}</Text>
            </View>
          </View>
          <View style={styles.navIconBox}>
            <Navigation size={24} color="#FFF" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Driver Info */}
        <View style={styles.driverRow}>
          <Image source={{ uri: MOCK_TRIP.driverAvatar }} style={styles.avatar} />
          <View style={styles.driverInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.driverName}>{MOCK_TRIP.driverName}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {MOCK_TRIP.driverRating}</Text>
              </View>
            </View>
            <Text style={styles.carModel}>{MOCK_TRIP.carModel}</Text>
            <View style={styles.plateBadge}>
              <Text style={styles.plateText}>{MOCK_TRIP.driverPlate}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver} activeOpacity={0.8}>
            <Phone size={20} color="#FFF" />
            <Text style={styles.callText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.msgBtn} onPress={handleMessageDriver} activeOpacity={0.7}>
            <MessageSquare size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosBtn} onPress={handleSOS} activeOpacity={0.7}>
            <ShieldAlert size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        {/* Route Info */}
        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.routeText} numberOfLines={1}>{MOCK_TRIP.pickup}</Text>
          </View>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.routeText} numberOfLines={1}>{MOCK_TRIP.dropoff}</Text>
          </View>
          <View style={styles.routeLine} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E2E8F0' },
  map: { ...StyleSheet.absoluteFillObject },
  
  headerSafe: { 
    position: 'absolute', top: 0, left: 0, right: 0, 
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50,
    zIndex: 99
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...SHADOW.md },
  headerStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, ...SHADOW.sm, gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  headerStatusText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  carMarker: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...SHADOW.lg, borderWidth: 2, borderColor: COLORS.primary },
  destMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.2)', alignItems: 'center', justifyContent: 'center' },
  destInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFF' },
  
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, ...SHADOW.lg },
  dragHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 },
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  etaRow: { flexDirection: 'row', alignItems: 'center' },
  etaText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  distanceText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  navIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 18, marginRight: 15, backgroundColor: '#F1F5F9' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  ratingBadge: { backgroundColor: '#FEF9C3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 11, fontWeight: '800', color: '#A16207' },
  carModel: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 6 },
  plateBadge: { alignSelf: 'flex-start', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  plateText: { fontSize: 13, fontWeight: '800', color: '#0F172A', letterSpacing: 1 },
  
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  callBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOW.sm },
  callText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  msgBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
  sosBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' },

  routeContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20, position: 'relative' },
  routeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, zIndex: 2 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, borderWidth: 3, borderColor: '#FFF', ...SHADOW.sm },
  routeText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },
  routeLine: { position: 'absolute', left: 21.5, top: 30, bottom: 30, width: 2, backgroundColor: '#E2E8F0', zIndex: 1, borderRadius: 1 }
});