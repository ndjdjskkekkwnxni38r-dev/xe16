import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { DANANG_SPOTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCart } from '@/store/CartContext';
import { useToast } from '@/components/Toast';

const { width } = Dimensions.get('window');

import { ArrowLeft, Zap, Tag, Star } from 'lucide-react-native';
const FLASH_SALE_SPOTS = DANANG_SPOTS.slice(0, 6).map(spot => ({
  ...spot,
  originalPrice: (parseInt(spot.price.replace(/\D/g, '')) * 1.5).toLocaleString('vi-VN') + 'đ',
  discount: 'Giảm 35%'
}));

export default function FlashSaleScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  const handleBuyNow = (spot: typeof FLASH_SALE_SPOTS[0]) => {
    addItem({
      id: spot.id,
      name: spot.name,
      price: parseInt(spot.price.replace(/\D/g, '')),
      image: spot.image,
      type: 'attraction',
      shopName: 'Flash Sale Vé tham quan'
    });
    
    showToast({
      message: `Đã thêm vé ${spot.name} vào giỏ hàng`,
      type: 'success'
    });

    router.push('/cart');
  };

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Hero */}
        <View style={styles.heroContainer}>
          <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.heroGradient}>
            <SafeAreaView>
              <View style={styles.navBar}>
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
                <Text style={styles.headerTitle}>Flash Sale Đặc Biệt</Text>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.heroContent}>
                <View style={styles.zapCircle}>
                  <Zap size={40} color="#FACC15" fill="#FACC15" />
                </View>
                <Text style={styles.heroTitle}>GIỜ VÀNG GIÁ SỐC</Text>
                <Text style={styles.heroSubtitle}>Cơ hội săn vé tham quan rẻ nhất trong ngày</Text>
                
                <View style={styles.timerContainer}>
                  <View style={styles.timeBox}><Text style={styles.timeText}>{formatTime(timeLeft.hours)}</Text></View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeBox}><Text style={styles.timeText}>{formatTime(timeLeft.minutes)}</Text></View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeBox}><Text style={styles.timeText}>{formatTime(timeLeft.seconds)}</Text></View>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Tag size={16} color="#E11D48" />
          <Text style={styles.infoBannerText}>Mỗi khách hàng chỉ được mua tối đa 2 vé/địa điểm</Text>
        </View>

        {/* Product List */}
        <View style={styles.listContainer}>
          {FLASH_SALE_SPOTS.map((spot, index) => (
            <Animated.View key={spot.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push(`/discover/${spot.id}`)}
              >
                <View style={styles.imgContainer}>
                  <Image source={{ uri: spot.image }} style={styles.img} />
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{spot.discount}</Text>
                  </View>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{spot.name}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#FACC15" fill="#FACC15" />
                    <Text style={styles.ratingText}>4.9 | 2k+ khách</Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '70%' }]} />
                    </View>
                    <Text style={styles.progressText}>Đã bán 70%</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.originalPrice}>{spot.originalPrice}</Text>
                      <Text style={styles.salePrice}>{spot.price}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.buyBtn}
                      onPress={() => handleBuyNow(spot)}
                    >
                      <Text style={styles.buyBtnText}>Mua ngay</Text>
                    </TouchableOpacity>
                  </View>
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
  container: { flex: 1, backgroundColor: '#FFF' },
  heroContainer: { height: 320, overflow: 'hidden' },
  heroGradient: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  heroContent: { alignItems: 'center', marginTop: 20 },
  zapCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5, fontWeight: '600' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 25 },
  timeBox: { backgroundColor: '#FFF', width: 45, height: 45, borderRadius: 10, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  timeText: { fontSize: 20, fontWeight: '900', color: '#E11D48' },
  timeSeparator: { color: '#FFF', fontSize: 20, fontWeight: '900', marginHorizontal: 8 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF1F2', paddingVertical: 12, paddingHorizontal: 20 },
  infoBannerText: { fontSize: 12, color: '#E11D48', fontWeight: '700' },
  listContainer: { padding: 20 },
  card: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', ...SHADOW.md, borderWidth: 1, borderColor: '#F1F5F9' },
  imgContainer: { width: 120, height: 150 },
  img: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: '#FACC15', paddingHorizontal: 8, paddingVertical: 4, borderBottomRightRadius: 15 },
  discountText: { fontSize: 10, fontWeight: '900', color: '#991B1B' },
  info: { flex: 1, padding: 15, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  progressContainer: { marginTop: 10 },
  progressBar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#E11D48' },
  progressText: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 5 },
  originalPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '600' },
  salePrice: { fontSize: 18, fontWeight: '900', color: '#E11D48' },
  buyBtn: { backgroundColor: '#E11D48', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  buyBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
});
