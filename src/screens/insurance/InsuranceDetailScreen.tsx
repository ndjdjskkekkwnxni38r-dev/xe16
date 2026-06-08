import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOW, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';
import { useCart } from '@/store/CartContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const INSURANCE_DATA: Record<string, any> = {
  '1': { 
    name: 'Bảo hiểm Du lịch', 
    title: 'An tâm khám phá thế giới',
    price: '25.000đ', 
    color: '#0EA5E9', 
    banner: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000',
    benefits: ['Bồi thường trễ chuyến bay', 'Chi phí y tế nước ngoài lên đến 2 tỷ', 'Hỗ trợ thất lạc hành lý', 'Cứu hộ khẩn cấp 24/7']
  },
  '2': { 
    name: 'Bảo hiểm Sức khỏe', 
    title: 'Chăm sóc sức khỏe toàn diện',
    price: '150.000đ', 
    color: '#F43F5E', 
    banner: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1000',
    benefits: ['Chi trả viện phí tại tất cả bệnh viện', 'Bảo lãnh viện phí 24/7', 'Khám sức khỏe định kỳ', 'Hỗ trợ phẫu thuật & điều trị nội trú']
  },
  '3': { 
    name: 'Bảo hiểm Xe cộ', 
    title: 'Bảo vệ xế yêu của bạn',
    price: '45.000đ', 
    color: '#F59E0B', 
    banner: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000',
    benefits: ['Bồi thường va chạm, cháy nổ', 'Hỗ trợ cẩu xe miễn phí', 'Sửa chữa tại gara chính hãng', 'Bảo hiểm mất cắp bộ phận']
  },
  '4': { 
    name: 'Bảo hiểm Nhà cửa', 
    title: 'Bảo vệ tổ ấm gia đình',
    price: '80.000đ', 
    color: '#8B5CF6', 
    banner: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000',
    benefits: ['Bồi thường thiệt hại do hỏa hoạn', 'Bảo hiểm tài sản bên trong nhà', 'Hỗ trợ chi phí thuê nhà tạm', 'Bồi thường hư hại do thiên tai']
  }
};

export default function InsuranceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const data = INSURANCE_DATA[id as string] || INSURANCE_DATA['1'];

  const handleAddToCart = () => {
    addItem({
      id: `ins-${id}`,
      name: data.name,
      price: parseInt(data.price.replace(/\D/g, '')),
      image: data.banner,
      type: 'insurance',
      shopName: 'Bảo hiểm'
    });
    showToast({
      message: `Đã thêm ${data.name} vào giỏ hàng`,
      type: 'success',
      duration: 2000
    });
  };

  const handleBuy = () => {
    addItem({
      id: `ins-${id}`,
      name: data.name,
      price: parseInt(data.price.replace(/\D/g, '')),
      image: data.banner,
      type: 'insurance',
      shopName: 'Bảo hiểm'
    });
    
    showToast({
      message: `Đã thêm ${data.name} vào giỏ hàng`,
      type: 'success',
      duration: 2000
    });

    router.push('/cart');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: data.banner }} style={styles.bannerImg} />
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']} style={styles.bannerOverlay} />
          
          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.bannerContent}>
            <View style={[styles.tag, { backgroundColor: data.color }]}>
              <Text style={styles.tagText}>GÓI ƯU ĐÃI</Text>
            </View>
            <Text style={styles.bannerTitle}>{data.title}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Phí bảo hiểm từ</Text>
              <Text style={styles.priceValue}>{data.price}<Text style={styles.priceUnit}>/tháng</Text></Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.callText}>Tư vấn</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quyền lợi bảo hiểm</Text>
            <View style={styles.benefitsGrid}>
              {data.benefits.map((benefit: string, index: number) => (
                <Animated.View 
                  key={index} 
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.benefitItem}
                >
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin gói</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color="#64748B" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoItemTitle}>Đối tượng bảo hiểm</Text>
                  <Text style={styles.infoItemValue}>Công dân Việt Nam từ 18 - 65 tuổi</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Ionicons name="document-text" size={20} color="#64748B" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoItemTitle}>Thời hạn bảo hiểm</Text>
                  <Text style={styles.infoItemValue}>12 tháng kể từ ngày ký</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.protectionNotice}>
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={styles.noticeText}>Hợp đồng có hiệu lực ngay sau khi thanh toán thành công.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomNav}>
        <SafeAreaView style={styles.bottomNavContent}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng phí</Text>
            <Text style={styles.totalValue}>{data.price}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cartBtnAction} onPress={handleAddToCart}>
              <Ionicons name="cart" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
              <Text style={styles.buyBtnText}>Mua ngay</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  bannerContainer: { width: width, height: 350, justifyContent: 'flex-end' },
  bannerImg: { ...StyleSheet.absoluteFillObject },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  navBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', marginTop: Platform.OS === 'android' ? 40 : 0 },
  bannerContent: { padding: 24, paddingBottom: 40 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  bannerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', lineHeight: 36 },
  
  content: { padding: 20, marginTop: -30, backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  priceCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, padding: 20, alignItems: 'center', justifyContent: 'space-between', ...SHADOW.md, marginTop: -40, marginBottom: 30 },
  priceLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  priceValue: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginTop: 4 },
  priceUnit: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  callText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  benefitsGrid: { gap: 12 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#059669' },
  checkIcon: { marginTop: 2 },
  benefitText: { fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 20 },
  
  infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, gap: 15 },
  infoItem: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  infoTextContainer: { flex: 1 },
  infoItemTitle: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  infoItemValue: { fontSize: 14, color: '#1E293B', fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  
  protectionNotice: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF7ED', padding: 15, borderRadius: 16, marginBottom: 20 },
  noticeText: { fontSize: 12, color: '#9A3412', fontWeight: '700', flex: 1 },
  
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 15, ...SHADOW.lg, borderTopWidth: 1, borderTopColor: '#F1F5F9', zIndex: 100 },
  bottomNavContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalContainer: { gap: 2 },
  totalLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  actionRow: { flexDirection: 'row', gap: 12 },
  cartBtnAction: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0F2FE' },
  buyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 16, ...SHADOW.md },
  buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
