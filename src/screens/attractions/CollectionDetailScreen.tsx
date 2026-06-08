import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { DANANG_SPOTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ArrowLeft, MapPin, Star, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Giả lập dữ liệu bộ sưu tập (Trong thực tế sẽ lấy từ API hoặc data.ts)
const COLLECTIONS_DATA: Record<string, any> = {
  'c1': { name: 'Đà Nẵng về đêm', desc: 'Khám phá vẻ đẹp lung linh của thành phố ánh sáng khi mặt trời lặn.', img: 'https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000' },
  'c2': { name: 'Tour Bà Nà Hills', desc: 'Trọn bộ bí kíp chinh phục đỉnh Núi Chúa và Cầu Vàng.', img: 'https://cdn3.ivivu.com/2024/08/ba-na-hill-iVIVU1-e1724662224847.png' },
  'c3': { name: 'Khám phá Sơn Trà', desc: 'Hành trình tìm về thiên nhiên hoang sơ và chùa Linh Ứng đại thụ.', img: 'https://statics.vinpearl.com/ban-dao-son-tra-7_1629274214.jpg' },
  'c4': { name: 'Ẩm thực Phố Cổ', desc: 'Thưởng thức những món ăn truyền thống nức tiếng tại Hội An.', img: 'https://bcp.cdnchinhphu.vn/334894974524682240/2025/9/18/cdhoian5-17581621538711341831070.jpeg' },
  'c5': { name: 'Vẻ đẹp Ngũ Hành', desc: 'Khám phá hệ thống hang động và chùa chiền kỳ vĩ.', img: 'https://statics.vinpearl.com/ngu-hanh-son-da-nang-1_1629452077.jpg' },
};

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const collection = COLLECTIONS_DATA[id as string];

  if (!collection) return null;

  // Lấy ngẫu nhiên vài địa điểm để hiển thị trong bộ sưu tập
  const spots = DANANG_SPOTS.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Header */}
        <View style={styles.headerContainer}>
          <Image source={{ uri: collection.img }} style={styles.headerImg} />
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.headerOverlay} />
          
          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} 
              style={styles.backBtn}
            >
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.headerContent}>
            <Text style={styles.colTitle}>{collection.name}</Text>
            <Text style={styles.colDesc}>{collection.desc}</Text>
            <View style={styles.colInfo}>
              <Text style={styles.colCount}>{spots.length} địa điểm được đề xuất</Text>
            </View>
          </View>
        </View>

        {/* List of Spots */}
        <View style={styles.content}>
          {spots.map((spot, index) => (
            <Animated.View key={spot.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity 
                style={styles.spotCard}
                onPress={() => router.push(`/discover/${spot.id}`)}
              >
                <Image source={{ uri: spot.image }} style={styles.spotImg} />
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
                  <View style={styles.locRow}>
                    <MapPin size={12} color="#94A3B8" />
                    <Text style={styles.locText} numberOfLines={1}>{spot.location}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{spot.price}</Text>
                    <View style={styles.ratingRow}>
                      <Star size={12} color="#FACC15" fill="#FACC15" />
                      <Text style={styles.ratingText}>4.9</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.goBtn}>
                  <ChevronRight size={20} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: { width: width, height: 300, justifyContent: 'flex-end' },
  headerImg: { ...StyleSheet.absoluteFillObject },
  headerOverlay: { ...StyleSheet.absoluteFillObject },
  navBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', marginTop: Platform.OS === 'android' ? 40 : 0 },
  headerContent: { padding: 24, paddingBottom: 30 },
  colTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: 8 },
  colDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 12 },
  colInfo: { flexDirection: 'row', alignItems: 'center' },
  colCount: { color: COLORS.white, fontWeight: '700', fontSize: 12, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  
  content: { padding: 20, marginTop: -20, backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  spotCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 20, padding: 12, marginBottom: 16, alignItems: 'center', ...SHADOW.sm },
  spotImg: { width: 80, height: 80, borderRadius: 15 },
  spotInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  spotName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locText: { fontSize: 12, color: '#64748B', flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  price: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  goBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
});
