import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Platform, StatusBar, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingCart from '@/components/FloatingCart';

const { width } = Dimensions.get('window');

const INSURANCE_TYPES = [
  { id: '1', name: 'Du lịch', icon: 'airplane', color: '#0EA5E9', bg: '#EFF6FF', desc: 'Bảo vệ trên mọi hành trình' },
  { id: '2', name: 'Sức khỏe', icon: 'heart', color: '#F43F5E', bg: '#FFF1F2', desc: 'Chăm sóc y tế toàn diện' },
  { id: '3', name: 'Xe cộ', icon: 'car', color: '#F59E0B', bg: '#FFFBEB', desc: 'An tâm trên mọi nẻo đường' },
  { id: '4', name: 'Nhà cửa', icon: 'home', color: '#8B5CF6', bg: '#F5F3FF', desc: 'Bảo vệ tổ ấm gia đình' },
];

const WHY_US = [
  { title: '100% Online', desc: 'Mua và nhận hợp đồng trong 5 phút', icon: 'globe' },
  { title: 'Bồi thường siêu tốc', desc: 'Xử lý yêu cầu qua ứng dụng', icon: 'flash' },
  { title: 'Đối tác uy tín', desc: 'PVI, Bảo Việt, Liberty...', icon: 'shield-checkmark' },
];

export default function InsuranceScreen() {
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bảo hiểm</Text>
            <View style={styles.backBtn} />
          </View>

        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Bảo vệ toàn diện cho cuộc sống</Text>
          <Text style={styles.heroSub}>Tin cậy • Minh bạch • Nhanh chóng</Text>
        </View>

        {/* Insurance Types Grid */}
        <View style={styles.typesGrid}>
          {INSURANCE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              activeOpacity={0.8}
              style={styles.typeCard}
              onPress={() => router.push(`/insurance/${type.id}`)}
            >
              <View style={[styles.typeIconWrap, { backgroundColor: type.bg }]}>
                <Ionicons name={type.icon as any} size={26} color={type.color} />
              </View>
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeDesc} numberOfLines={2}>{type.desc}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={styles.typeChevron} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Package */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gói nổi bật</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem thêm</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/insurance/1')}>
          <LinearGradient
            colors={['#ECFDF5', '#D1FAE5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredInfo}>
              <View style={styles.hotBadge}>
                <Ionicons name="flame" size={12} color="#fff" />
                <Text style={styles.hotText}>PHỔ BIẾN</Text>
              </View>
              <Text style={styles.featuredTitle}>Bảo hiểm Du lịch Quốc tế</Text>
              <Text style={styles.featuredPrice}>Chỉ từ 25.000đ/ngày</Text>
              <View style={styles.benefitsRow}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.benefitText}>Y tế 24/7</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.benefitText}>Bồi thường trễ chuyến</Text>
                </View>
              </View>
            </View>
            <Ionicons name="shield-checkmark" size={72} color="#10B981" style={{ opacity: 0.2 }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Why Choose Us */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tại sao chọn chúng tôi?</Text>
        </View>

        <View style={styles.whyList}>
          {WHY_US.map((item, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              style={styles.whyCard}
              onPress={() => router.push(`/insurance/article/${i}`)}
            >
              <View style={styles.whyIconWrap}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.whyContent}>
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingCart />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOW.lg,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroContent: { alignItems: 'center', paddingHorizontal: 24, marginTop: 16, marginBottom: 8 },
  heroIconWrap: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#FFF7ED',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center', lineHeight: 26 },
  heroSub: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 4 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  // Types Grid
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeCard: {
    width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#F1F5F9', ...SHADOW.sm, minHeight: 160,
  },
  typeIconWrap: {
    width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  typeName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  typeDesc: { fontSize: 11, color: '#64748B', lineHeight: 16, fontWeight: '500' },
  typeChevron: { position: 'absolute', bottom: 18, right: 18 },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  // Featured
  featuredCard: {
    borderRadius: 22, padding: 22, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', overflow: 'hidden', ...SHADOW.md,
  },
  featuredInfo: { flex: 1 },
  hotBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669',
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4, marginBottom: 12,
  },
  hotText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  featuredTitle: { fontSize: 17, fontWeight: '900', color: '#064E3B', marginBottom: 4 },
  featuredPrice: { fontSize: 14, color: '#059669', fontWeight: '700', marginBottom: 12 },
  benefitsRow: { gap: 8 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitText: { fontSize: 12, color: '#065F46', fontWeight: '600' },
  // Why Us
  whyList: { gap: 10 },
  whyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', ...SHADOW.sm,
  },
  whyIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF7ED',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  whyContent: { flex: 1 },
  whyTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  whyDesc: { fontSize: 12, color: '#64748B', fontWeight: '500' },
});
