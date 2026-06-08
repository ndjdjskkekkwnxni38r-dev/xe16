import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useToast } from '@/components/Toast';

const { width } = Dimensions.get('window');

const INSURANCE_TYPES = [
  { id: '1', name: 'Du lịch', icon: 'airplane', color: '#0EA5E9', desc: 'Bảo vệ bạn trên mọi hành trình' },
  { id: '2', name: 'Sức khỏe', icon: 'heart', color: '#F43F5E', desc: 'Chăm sóc y tế toàn diện' },
  { id: '3', name: 'Xe cộ', icon: 'car', color: '#F59E0B', desc: 'An tâm trên mọi nẻo đường' },
  { id: '4', name: 'Nhà cửa', icon: 'home', color: '#8B5CF6', desc: 'Bảo vệ tổ ấm của gia đình' },
];

import FloatingCart from "@/components/FloatingCart";

export default function InsuranceScreen() {
  const { showToast } = useToast();

  const handleHelp = () => {
    showToast({
      message: "Bạn cần hỗ trợ? Liên hệ Hotline 1900 6789 để được tư vấn miễn phí 24/7.",
      type: 'info',
      duration: 5000
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bảo hiểm VanBooking</Text>
            <TouchableOpacity style={styles.infoBtn} onPress={handleHelp}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.white} />
            <Text style={styles.heroTitle}>Bảo vệ toàn diện cho cuộc sống của bạn</Text>
            <Text style={styles.heroSubtitle}>Tin cậy - Minh bạch - Nhanh chóng</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Insurance Types Grid */}
        <View style={styles.typesGrid}>
          {INSURANCE_TYPES.map((type, index) => (
            <Animated.View key={type.id} entering={FadeInDown.delay(index * 100)} style={styles.typeWrapper}>
              <TouchableOpacity 
                style={styles.typeCard}
                onPress={() => router.push(`/insurance/${type.id}`)}
              >
                <View style={[styles.typeIconBg, { backgroundColor: type.color + '15' }]}>
                  <Ionicons name={type.icon as any} size={28} color={type.color} />
                </View>
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeDesc} numberOfLines={2}>{type.desc}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={styles.typeChevron} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Featured Package */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gói bảo hiểm nổi bật</Text>
        </View>

        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={() => router.push('/insurance/1')}
        >
          <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.featuredGradient}>
            <View style={styles.featuredInfo}>
              <View style={styles.hotBadge}><Text style={styles.hotText}>PHỔ BIẾN NHẤT</Text></View>
              <Text style={styles.featuredTitle}>Bảo hiểm Du lịch Quốc tế</Text>
              <Text style={styles.featuredPrice}>Chỉ từ 25.000đ/ngày</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.benefitText}>Hỗ trợ y tế 24/7</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.benefitText}>Bồi thường trễ chuyến</Text>
                </View>
              </View>
            </View>
            <Ionicons name="shield-checkmark" size={80} color="#10B981" style={[styles.bgShield, { opacity: 0.2 }]} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Why Choose Us */}
        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>Tại sao chọn chúng tôi?</Text>
          <View style={styles.whyList}>
            {[
              { title: 'Thủ tục 100% Online', desc: 'Mua và nhận hợp đồng ngay trong 5 phút' },
              { title: 'Bồi thường siêu tốc', desc: 'Xử lý yêu cầu hoàn toàn qua ứng dụng' },
              { title: 'Đối tác uy tín', desc: 'Liên kết với PVI, Bảo Việt, Liberty...' },
            ].map((item, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.whyItem}
                onPress={() => router.push(`/insurance/article/${i}`)}
              >
                <View style={styles.whyIconBg}><Ionicons name="star" size={16} color={COLORS.primary} /></View>
                <View style={styles.whyContent}>
                  <Text style={styles.whyItemTitle}>{item.title}</Text>
                  <Text style={styles.whyItemDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <FloatingCart />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  infoBtn: { padding: 8 },
  heroContent: { paddingHorizontal: 25, marginTop: 25, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.white, textAlign: 'center', marginTop: 15 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  scrollContent: { paddingBottom: 40 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, marginTop: -20 },
  typeWrapper: { width: '50%', padding: 10 },
  typeCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, ...SHADOW.sm, height: 160 },
  typeIconBg: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  typeName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  typeDesc: { fontSize: 11, color: '#64748B', marginTop: 4, lineHeight: 16 },
  typeChevron: { position: 'absolute', bottom: 20, right: 20 },
  sectionHeader: { paddingHorizontal: 25, marginTop: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  featuredCard: { marginHorizontal: 20, borderRadius: 25, overflow: 'hidden', ...SHADOW.md },
  featuredGradient: { padding: 25, flexDirection: 'row', justifyContent: 'space-between' },
  featuredInfo: { flex: 1 },
  hotBadge: { backgroundColor: '#059669', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  hotText: { color: COLORS.white, fontSize: 9, fontWeight: '900' },
  featuredTitle: { fontSize: 18, fontWeight: '900', color: '#064E3B' },
  featuredPrice: { fontSize: 14, color: '#059669', fontWeight: '700', marginTop: 5 },
  benefitsList: { marginTop: 15, gap: 8 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitText: { fontSize: 12, color: '#065F46', fontWeight: '600' },
  bgShield: { position: 'absolute', right: -10, bottom: -10 },
  whySection: { paddingHorizontal: 25, marginTop: 35 },
  whyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  whyList: { gap: 20 },
  whyItem: { flexDirection: 'row', gap: 15 },
  whyIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
  whyContent: { flex: 1 },
  whyItemTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  whyItemDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
});
