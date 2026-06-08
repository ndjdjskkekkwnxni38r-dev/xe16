import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useToast } from '@/components/Toast';
import { useCart } from '@/store/CartContext';

const { width } = Dimensions.get('window');

const ROOM_TYPES = [
  { id: 'r1', name: 'Phòng Standard (1 Giường đôi)', price: 1200000, img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000', size: '25m²', view: 'Hướng phố' },
  { id: 'r2', name: 'Phòng Deluxe (Hướng biển)', price: 1850000, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000', size: '35m²', view: 'Hướng biển' },
  { id: 'r3', name: 'Phòng Suite cao cấp', price: 2500000, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1000', size: '55m²', view: 'Toàn cảnh biển' },
];

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('r1');

  const hotel = {
    name: 'InterContinental Danang Sun Peninsula',
    loc: 'Sơn Trà, Đà Nẵng',
    rating: 4.9,
    reviews: 2150,
    desc: 'Tọa lạc tại bán đảo Sơn Trà, InterContinental Danang Sun Peninsula Resort là một kiệt tác kiến trúc được thiết kế bởi kiến trúc sư lừng danh Bill Bensley. Khu nghỉ dưỡng mang đến trải nghiệm đẳng cấp thế giới với dịch vụ tinh tế và không gian hòa quyện cùng thiên nhiên hoang sơ. Tại đây, quý khách có thể tận hưởng bãi biển biệt lập kéo dài 700m, hệ thống nhà hàng đạt sao Michelin và spa trị liệu cao cấp. Mỗi phòng nghỉ đều là một tác phẩm nghệ thuật, mang đến sự riêng tư tuyệt đối và tầm nhìn khoáng đạt ra biển Đông.',
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000'
  };

  const selectedRoom = useMemo(() => ROOM_TYPES.find(r => r.id === selectedRoomId), [selectedRoomId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/hotel');
    }
  };

  const handleSelectRoom = (roomId: string, roomName: string) => {
    setSelectedRoomId(roomId);
    showToast({
      type: 'info',
      message: `Đã chọn: ${roomName}`
    });
  };

  const handleBooking = () => {
    if (selectedRoom) {
      addItem({
        id: `hotel_${id}_${selectedRoomId}`,
        name: `${hotel.name} - ${selectedRoom.name}`,
        price: selectedRoom.price,
        image: selectedRoom.img,
        type: 'hotel',
        shopName: hotel.loc
      });

      showToast({
        type: 'success',
        message: `Đã thêm phòng vào giỏ hàng!`
      });

      router.push('/cart');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* HERO IMAGE */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: hotel.img }} style={styles.heroImg} />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.2)']} style={StyleSheet.absoluteFill} />
          
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={handleBack} style={styles.circleBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}><Ionicons name="share-social" size={20} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.circleBtn} activeOpacity={0.7}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? COLORS.error : "#FFF"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* INFO CONTENT */}
        <View style={styles.contentCard}>
          <View style={styles.topRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>LUXURY RESORT</Text></View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#FACC15" />
              <Text style={styles.ratingText}>{hotel.rating} ({hotel.reviews} đánh giá)</Text>
            </View>
          </View>

          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.locText}>{hotel.loc}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Tiện nghi nổi bật</Text>
          <View style={styles.amenitiesGrid}>
            <View style={styles.amenityItem}><Ionicons name="wifi" size={20} color="#64748B" /><Text style={styles.amenityText}>Free Wifi</Text></View>
            <View style={styles.amenityItem}><Ionicons name="restaurant" size={20} color="#64748B" /><Text style={styles.amenityText}>Nhà hàng</Text></View>
            <View style={styles.amenityItem}><Ionicons name="car" size={20} color="#64748B" /><Text style={styles.amenityText}>Đỗ xe</Text></View>
            <View style={styles.amenityItem}><Ionicons name="cafe" size={20} color="#64748B" /><Text style={styles.amenityText}>Bar</Text></View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descText} numberOfLines={isExpanded ? undefined : 3}>
            {hotel.desc}
          </Text>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.readMore}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Chọn loại phòng</Text>
          {ROOM_TYPES.map((room, index) => (
            <Animated.View key={room.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity 
                style={[styles.roomCard, selectedRoomId === room.id && styles.roomCardSelected]}
                onPress={() => handleSelectRoom(room.id, room.name)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: room.img }} style={styles.roomImg} />
                <View style={styles.roomInfo}>
                  <View style={styles.roomHeaderRow}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    {selectedRoomId === room.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                  </View>
                  <View style={styles.roomSpecs}>
                    <Text style={styles.roomSpecText}>{room.size} • {room.view}</Text>
                  </View>
                  <View style={styles.roomFooter}>
                    <Text style={styles.roomPrice}>{room.price.toLocaleString()}đ<Text style={styles.unitSmall}>/đêm</Text></Text>
                    <View style={[styles.selectBtn, selectedRoomId === room.id && styles.selectBtnActive]}>
                      <Text style={[styles.selectBtnText, selectedRoomId === room.id && styles.selectBtnTextActive]}>
                        {selectedRoomId === room.id ? 'Đã chọn' : 'Chọn'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPrice}>{selectedRoom?.price.toLocaleString()}đ<Text style={styles.footerUnit}>/đêm</Text></Text>
        </View>
        <TouchableOpacity style={styles.bookNowAction} onPress={handleBooking}>
          <Text style={styles.bookNowText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  imageContainer: { height: 300, width: '100%' },
  heroImg: { width: '100%', height: '100%' },
  headerOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    zIndex: 100
  },
  rightActions: { flexDirection: 'row', gap: 12 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  contentCard: { flex: 1, backgroundColor: '#FFF', marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badge: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  hotelName: { fontSize: 24, fontWeight: '900', color: '#1E293B', lineHeight: 30 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  locText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  amenitiesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  amenityItem: { alignItems: 'center', gap: 8 },
  amenityText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  descText: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  readMore: { color: COLORS.primary, fontWeight: '700', marginTop: 8 },
  roomCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 20, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  roomCardSelected: { borderColor: COLORS.primary, backgroundColor: '#F0F9FF' },
  roomImg: { width: 100, height: 100, borderRadius: 15 },
  roomInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  roomHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: 15, fontWeight: '800', color: '#1E293B', flex: 1 },
  roomSpecs: { marginTop: 4 },
  roomSpecText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  roomFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  roomPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  unitSmall: { fontSize: 10, color: '#94A3B8' },
  selectBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  selectBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectBtnText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  selectBtnTextActive: { color: '#FFF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 30 : 10 },
  footerLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  footerPrice: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  footerUnit: { fontSize: 13, color: '#94A3B8' },
  bookNowAction: { backgroundColor: COLORS.primary, paddingHorizontal: 35, paddingVertical: 15, borderRadius: 15, ...SHADOW.md },
  bookNowText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
