import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, Platform, StatusBar, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FLIGHT_TYPES = [
  { id: 'one-way', label: 'Một chiều', icon: 'arrow-forward' },
  { id: 'round-trip', label: 'Khứ hồi', icon: 'swap-horizontal' },
  { id: 'multi-city', label: 'Nhiều chặng', icon: 'layers' },
];

const PROMOS = [
  { id: 1, title: 'Giảm 20% vé khứ hồi', desc: 'Áp dụng nội địa', color: '#0EA5E9', icon: 'airplane' },
  { id: 2, title: 'Bay combo tiết kiệm', desc: 'Vé + khách sạn', color: '#F43F5E', icon: 'bed' },
];

export default function FlightScreen() {
  const router = useRouter();
  const [flightType, setFlightType] = useState('round-trip');

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
            <Text style={styles.headerTitle}>Đặt vé máy bay</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Flight Type Tabs */}
        <View style={styles.typeTabs}>
          {FLIGHT_TYPES.map((type) => {
            const isActive = flightType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                activeOpacity={0.7}
                onPress={() => setFlightType(type.id)}
              >
                <LinearGradient
                  colors={isActive ? [COLORS.primary, '#0284C7'] : ['#F8FAFC', '#F1F5F9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.typeTab, isActive && styles.typeTabActive]}
                >
                  <Ionicons name={type.icon as any} size={16} color={isActive ? '#fff' : '#64748B'} />
                  <Text style={[styles.typeTabText, isActive && styles.typeTabTextActive]}>
                    {type.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search Form */}
        <View style={styles.formCard}>
          {/* From */}
          <TouchableOpacity style={styles.formRow}>
            <View style={[styles.formIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="airplane" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.formContent}>
              <Text style={styles.formLabel}>ĐIỂM ĐI</Text>
              <Text style={styles.formValue}>Đà Nẵng (DAD)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Swap */}
          <View style={styles.swapWrap}>
            <TouchableOpacity style={styles.swapBtn}>
              <Ionicons name="swap-vertical" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* To */}
          <TouchableOpacity style={styles.formRow}>
            <View style={[styles.formIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="location" size={20} color="#F97316" />
            </View>
            <View style={styles.formContent}>
              <Text style={styles.formLabel}>ĐIỂM ĐẾN</Text>
              <Text style={styles.formValue}>Hồ Chí Minh (SGN)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.formDivider} />

          {/* Dates */}
          <TouchableOpacity style={styles.formRow}>
            <View style={[styles.formIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="calendar" size={20} color="#16A34A" />
            </View>
            <View style={styles.formContent}>
              <Text style={styles.formLabel}>NGÀY ĐI</Text>
              <Text style={styles.formValue}>26 Th6, 2026</Text>
            </View>
            {flightType === 'round-trip' && (
              <>
                <View style={styles.formDividerV} />
                <View style={[styles.formIcon, { backgroundColor: '#FDF2F8' }]}>
                  <Ionicons name="calendar" size={20} color="#DB2777" />
                </View>
                <View style={styles.formContent}>
                  <Text style={styles.formLabel}>NGÀY VỀ</Text>
                  <Text style={styles.formValue}>01 Th7, 2026</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.formDivider} />

          {/* Passengers */}
          <TouchableOpacity style={styles.formRow}>
            <View style={[styles.formIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="people" size={20} color="#7C3AED" />
            </View>
            <View style={styles.formContent}>
              <Text style={styles.formLabel}>HÀNH KHÁCH</Text>
              <Text style={styles.formValue}>1 Người lớn, 0 Trẻ em</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchBtn}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchBtnText}>Tìm chuyến bay</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Promos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ưu đãi đặc biệt</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
          {PROMOS.map((promo) => (
            <TouchableOpacity key={promo.id} activeOpacity={0.8}>
              <LinearGradient
                colors={[promo.color, promo.color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoCard}
              >
                <View style={styles.promoIconWrap}>
                  <Ionicons name={promo.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoDesc}>{promo.desc}</Text>
                <View style={styles.promoArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Routes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chuyến bay phổ biến</Text>
        </View>

        {[
          { from: 'DAD', to: 'SGN', fromCity: 'Đà Nẵng', toCity: 'HCM', price: '1.200.000', time: '1h 20m' },
          { from: 'DAD', to: 'HAN', fromCity: 'Đà Nẵng', toCity: 'Hà Nội', price: '1.500.000', time: '1h 30m' },
          { from: 'SGN', to: 'DAD', fromCity: 'HCM', toCity: 'Đà Nẵng', price: '1.150.000', time: '1h 20m' },
        ].map((route, i) => (
          <TouchableOpacity key={i} style={styles.routeCard} activeOpacity={0.8}>
            <View style={styles.routeLeft}>
              <View style={styles.routeCodeWrap}>
                <Text style={styles.routeCode}>{route.from}</Text>
                <Ionicons name="airplane" size={16} color={COLORS.primary} style={{ marginHorizontal: 8 }} />
                <Text style={styles.routeCode}>{route.to}</Text>
              </View>
              <Text style={styles.routeCity}>{route.fromCity} → {route.toCity}</Text>
            </View>
            <View style={styles.routeRight}>
              <Text style={styles.routePrice}>{route.price}đ</Text>
              <Text style={styles.routeTime}>{route.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingBottom: 24,
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  // Type Tabs
  typeTabs: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeTab: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent', gap: 6,
  },
  typeTabActive: { borderColor: 'rgba(255,255,255,0.4)' },
  typeTabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  typeTabTextActive: { color: '#fff' },
  // Form
  formCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', ...SHADOW.sm,
  },
  formRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  formIcon: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  formContent: { flex: 1 },
  formLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 2 },
  formValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  formDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  formDividerV: { width: 1, height: 24, backgroundColor: '#F1F5F9', marginHorizontal: 10 },
  swapWrap: { alignItems: 'flex-end', marginVertical: 4 },
  swapBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#BFDBFE',
  },
  // Search
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16, marginBottom: 28, gap: 8, ...SHADOW.md,
  },
  searchBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  // Promos
  promoScroll: { gap: 14, marginBottom: 28 },
  promoCard: {
    width: width * 0.55, padding: 18, borderRadius: 20,
    justifyContent: 'space-between', minHeight: 150,
  },
  promoIconWrap: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  promoTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  promoDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  promoArrow: {
    alignSelf: 'flex-end', width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  // Routes
  routeCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#F1F5F9', ...SHADOW.sm,
  },
  routeLeft: {},
  routeCodeWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  routeCode: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  routeCity: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  routeRight: { alignItems: 'flex-end' },
  routePrice: { fontSize: 17, fontWeight: '800', color: COLORS.primary, marginBottom: 2 },
  routeTime: { fontSize: 12, color: '#64748B', fontWeight: '600' },
});
