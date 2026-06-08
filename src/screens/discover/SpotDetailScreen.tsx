import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar, Platform, Linking, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { DANANG_SPOTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';

import { useCart } from '@/store/CartContext';

const { width } = Dimensions.get('window');

const AMENITIES = [
  { icon: 'wifi', label: 'Wifi miễn phí' },
  { icon: 'car', label: 'Chỗ đỗ xe' },
  { icon: 'camera', label: 'Chụp ảnh' },
  { icon: 'restaurant', label: 'Ăn uống' },
];

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const spot = DANANG_SPOTS.find((s) => s.id === id);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!spot) return null;

  const images = spot.images || [spot.image];

  const handleAddToCart = () => {
    addItem({
      id: spot.id,
      name: spot.name,
      price: parseInt(spot.price.replace(/\D/g, '')),
      image: spot.image,
      type: 'attraction',
      shopName: 'Vé tham quan'
    });
    showToast({
      message: `Đã thêm vé ${spot.name} vào giỏ hàng`,
      type: 'success',
      duration: 2000
    });
  };

  const handlePurchase = () => {
    addItem({
      id: spot.id,
      name: spot.name,
      price: parseInt(spot.price.replace(/\D/g, '')),
      image: spot.image,
      type: 'attraction',
      shopName: 'Vé tham quan'
    });

    showToast({
      message: `Đã thêm vé ${spot.name} vào giỏ hàng`,
      type: 'success',
      duration: 2000
    });

    router.push('/cart');
  };

  const handleViewOnMap = () => {
    const latLng = `${spot.lat},${spot.lng}`;
    const label = spot.name;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        showToast({
          message: "Không thể mở ứng dụng bản đồ",
          type: 'error'
        });
      });
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeImageIndex) {
      setActiveImageIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Fixed Header Buttons */}
      <View style={styles.headerActions} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.actionCircle} 
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.actionCircle} activeOpacity={0.7}>
            <Ionicons name="share-social" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCircle} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Banner Slide Show Section */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.headerImage} />
            ))}
          </ScrollView>
          
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.headerOverlay} />
          
          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  activeImageIndex === index && styles.activeDot
                ]} 
              />
            ))}
          </View>

          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{activeImageIndex + 1}/{images.length} Ảnh</Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.dragHandle} />
          
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.primary} />
                <Text style={styles.locationText}>{spot.location}</Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FACC15" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>

          <View style={styles.quickInfoRow}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="ticket-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Giá vé</Text>
              <Text style={styles.infoValue}>{spot.price}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="time-outline" size={20} color="#22C55E" />
              </View>
              <Text style={styles.infoLabel}>Mở cửa</Text>
              <Text style={styles.infoValue}>08:00 - 18:00</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.infoLabel}>Đánh giá</Text>
              <Text style={styles.infoValue}>2.5k+</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích</Text>
            <View style={styles.amenitiesGrid}>
              {AMENITIES.map((item, index) => (
                <View key={index} style={styles.amenityItem}>
                  <View style={styles.amenityIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color="#64748B" />
                  </View>
                  <Text style={styles.amenityLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <Text style={styles.articleContent}>{spot.content}</Text>
          </View>

          <TouchableOpacity 
            style={styles.mapPreview} 
            activeOpacity={0.9}
            onPress={handleViewOnMap}
          >
            <Image 
              source={{ uri: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+FF0000(${spot.lng},${spot.lat})/${spot.lng},${spot.lat},13/400x150?access_token=pk.eyJ1IjoiZGVtbyIsImEiOiJjbDFyeH...` }} 
              style={styles.mapImage} 
            />
            <View style={styles.mapOverlay}>
              <View style={styles.mapButton}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={styles.mapButtonText}>Xem trên bản đồ</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <View style={styles.bottomNavContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng cộng</Text>
            <Text style={styles.priceValue}>{spot.price}</Text>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={handlePurchase}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Mua vé ngay</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  imageContainer: { width: width, height: 400, backgroundColor: '#000' },
  headerImage: { width: width, height: 400, resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  headerActions: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 40, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    zIndex: 999,
    elevation: 10,
  },
  actionCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    ...SHADOW.md 
  },
  paginationDots: { 
    position: 'absolute', 
    bottom: 50, 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 6 
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  activeDot: { width: 20, backgroundColor: COLORS.white },
  imageBadge: { position: 'absolute', bottom: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  imageBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  contentCard: { flex: 1, backgroundColor: COLORS.white, marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  spotName: { fontSize: 24, fontWeight: '900', color: '#1E293B', flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF9C3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#854D0E' },
  quickInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  infoItem: { flex: 1, alignItems: 'center' },
  infoIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityItem: { width: (width - 72) / 4, alignItems: 'center' },
  amenityIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  amenityLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  articleContent: { fontSize: 15, color: '#475569', lineHeight: 24, fontWeight: '500' },
  mapPreview: { height: 160, borderRadius: 20, overflow: 'hidden', marginTop: 10 },
  mapImage: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  mapButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, ...SHADOW.md },
  mapButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', ...SHADOW.lg, zIndex: 100 },
  bottomNavContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  priceContainer: { gap: 2 },
  priceLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  priceValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  buttonGroup: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0F2FE' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 24, borderRadius: 16, height: 56, ...SHADOW.md },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
