import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Image,
  SafeAreaView, Dimensions, Platform, StatusBar, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const HOTEL_TYPES = [
  { id: '1', name: 'Luxury', icon: 'star' },
  { id: '2', name: 'Resort', icon: 'umbrella' },
  { id: '3', name: 'Khách sạn', icon: 'bed' },
  { id: '4', name: 'Villa', icon: 'home' },
];

const ALL_HOTELS = [
  { id: 'l1', typeId: '1', name: 'InterContinental Sun Peninsula', price: '12.200.000', rating: 4.9, reviews: 2150, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000', loc: 'Sơn Trà, Đà Nẵng' },
  { id: 'l2', typeId: '1', name: 'Amanoi Resort Ninh Thuan', price: '25.500.000', rating: 5.0, reviews: 840, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000', loc: 'Vĩnh Hy, Ninh Thuận' },
  { id: 'l3', typeId: '1', name: 'Regent Phu Quoc Luxury', price: '15.800.000', rating: 4.9, reviews: 620, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1000', loc: 'Bãi Trường, Phú Quốc' },
  { id: 'r1', typeId: '2', name: 'Shilla Monogram Quangnam', price: '4.200.000', rating: 4.9, reviews: 540, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1000', loc: 'Điện Bàn, Quảng Nam' },
  { id: 'r2', typeId: '2', name: 'Vinpearl Resort & Spa', price: '3.800.000', rating: 4.7, reviews: 2800, img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000', loc: 'Ngũ Hành Sơn, Đà Nẵng' },
  { id: 'r3', typeId: '2', name: 'Pullman Danang Beach Resort', price: '3.500.000', rating: 4.8, reviews: 1950, img: 'https://images.unsplash.com/photo-1561501900-3701fa6a0f64?q=80&w=1000', loc: 'Bắc Mỹ An, Đà Nẵng' },
  { id: 'h1', typeId: '3', name: 'Novotel Premier Han River', price: '2.850.000', rating: 4.8, reviews: 1250, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000', loc: 'Hải Châu, Đà Nẵng' },
  { id: 'h2', typeId: '3', name: 'Hilton Da Nang City', price: '2.600.000', rating: 4.7, reviews: 980, img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000', loc: 'Bạch Đằng, Đà Nẵng' },
  { id: 'h3', typeId: '3', name: 'Muong Thanh Luxury', price: '1.800.000', rating: 4.6, reviews: 4200, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000', loc: 'Mỹ Khê, Đà Nẵng' },
  { id: 'v1', typeId: '4', name: 'Furama Villas Danang', price: '8.500.000', rating: 4.7, reviews: 320, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000', loc: 'Ngũ Hành Sơn, Đà Nẵng' },
  { id: 'v2', typeId: '4', name: 'Premier Village Da Nang', price: '10.500.000', rating: 4.8, reviews: 450, img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000', loc: 'Mỹ An, Đà Nẵng' },
  { id: 'v3', typeId: '4', name: 'The Ocean Villas Resort', price: '7.800.000', rating: 4.6, reviews: 890, img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000', loc: 'Hòa Hải, Đà Nẵng' },
];

const DATES_DATA = [
  { label: 'Thứ 2, 12/04', value: '12/04' },
  { label: 'Thứ 3, 13/04', value: '13/04' },
  { label: 'Thứ 4, 14/04', value: '14/04' },
  { label: 'Thứ 5, 15/04', value: '15/04' },
  { label: 'Thứ 6, 16/04', value: '16/04' },
  { label: 'Thứ 7, 17/04', value: '17/04' },
  { label: 'Chủ nhật, 18/04', value: '18/04' },
];

export default function HotelScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('1');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [checkIn, setCheckIn] = useState(DATES_DATA[3]);
  const [checkOut, setCheckOut] = useState(DATES_DATA[5]);

  const filteredHotels = useMemo(() => ALL_HOTELS.filter(h => h.typeId === selectedType), [selectedType]);
  const currentLabel = HOTEL_TYPES.find(t => t.id === selectedType)?.name || 'Khách sạn';

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
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="bed" size={18} color="#fff" />
              <Text style={styles.headerTitle}>Tìm khách sạn</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Card on Header */}
          <View style={styles.searchCard}>
            <TouchableOpacity style={styles.searchRow}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.searchLabel}>ĐIỂM ĐẾN</Text>
                <Text style={styles.searchValue}>Đà Nẵng, Việt Nam</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.searchDivider} />

            <View style={styles.searchGrid}>
              <TouchableOpacity style={styles.searchGridItem} onPress={() => setShowDateModal(true)}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <View>
                  <Text style={styles.searchLabel}>THỜI GIAN</Text>
                  <Text style={styles.searchValue}>{checkIn.value} - {checkOut.value}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.searchDividerV} />
              <TouchableOpacity style={styles.searchGridItem} onPress={() => setShowGuestModal(true)}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
                <View>
                  <Text style={styles.searchLabel}>SỐ KHÁCH</Text>
                  <Text style={styles.searchValue}>{guests.adults} NL, {guests.children} TE</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchBtn}
              >
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.searchBtnText}>Tìm kiếm ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {HOTEL_TYPES.map((type) => {
            const isActive = selectedType === type.id;
            return (
              <TouchableOpacity key={type.id} activeOpacity={0.7} onPress={() => setSelectedType(type.id)}>
                <LinearGradient
                  colors={isActive ? [COLORS.primary, '#0284C7'] : ['#F8FAFC', '#F1F5F9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Ionicons name={type.icon as any} size={16} color={isActive ? '#fff' : '#64748B'} />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{type.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{currentLabel} nổi bật</Text>
            <Text style={styles.sectionCount}>{filteredHotels.length} kết quả</Text>
          </View>
        </View>

        {/* Hotel List */}
        {filteredHotels.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={styles.hotelCard}
            onPress={() => router.push(`/hotel/${item.id}`)}
          >
            <Image source={{ uri: item.img }} style={styles.cardImg} />
            <View style={styles.cardOverlay}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FACC15" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location" size={12} color="#64748B" />
                <Text style={styles.locText}>{item.loc}</Text>
                <Text style={styles.reviewDot}>•</Text>
                <Text style={styles.reviewText}>{item.reviews} đánh giá</Text>
              </View>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceValue}>{item.price}đ</Text>
                  <Text style={styles.priceUnit}>/đêm</Text>
                </View>
                <TouchableOpacity style={styles.viewBtn} onPress={() => router.push(`/hotel/${item.id}`)}>
                  <LinearGradient
                    colors={[COLORS.primary, '#0284C7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.viewBtnInner}
                  >
                    <Text style={styles.viewBtnText}>Xem phòng</Text>
                    <Ionicons name="chevron-forward" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Modal */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowDateModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày nghỉ</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <View style={styles.dateGrid}>
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>Nhận phòng</Text>
                {DATES_DATA.map((d) => (
                  <TouchableOpacity
                    key={`in-${d.value}`}
                    style={[styles.dateItem, checkIn.value === d.value && styles.dateItemActive]}
                    onPress={() => setCheckIn(d)}
                  >
                    <Text style={[styles.dateItemText, checkIn.value === d.value && styles.dateItemTextActive]}>
                      {d.label}
                    </Text>
                    {checkIn.value === d.value && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>Trả phòng</Text>
                {DATES_DATA.map((d) => (
                  <TouchableOpacity
                    key={`out-${d.value}`}
                    style={[styles.dateItem, checkOut.value === d.value && styles.dateItemActive]}
                    onPress={() => setCheckOut(d)}
                  >
                    <Text style={[styles.dateItemText, checkOut.value === d.value && styles.dateItemTextActive]}>
                      {d.label}
                    </Text>
                    {checkOut.value === d.value && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowDateModal(false)}>
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Guest Modal */}
      <Modal visible={showGuestModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowGuestModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Số lượng khách</Text>
              <TouchableOpacity onPress={() => setShowGuestModal(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <View style={styles.counterRow}>
              <View>
                <Text style={styles.counterName}>Người lớn</Text>
                <Text style={styles.counterDesc}>Từ 12 tuổi trở lên</Text>
              </View>
              <View style={styles.counterActions}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}>
                  <Ionicons name="remove" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{guests.adults}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(p => ({ ...p, adults: p.adults + 1 }))}>
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.counterRow}>
              <View>
                <Text style={styles.counterName}>Trẻ em</Text>
                <Text style={styles.counterDesc}>Dưới 12 tuổi</Text>
              </View>
              <View style={styles.counterActions}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(p => ({ ...p, children: Math.max(0, p.children - 1) }))}>
                  <Ionicons name="remove" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{guests.children}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(p => ({ ...p, children: p.children + 1 }))}>
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowGuestModal(false)}>
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Áp dụng</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  filterBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  // Search Card
  searchCard: {
    backgroundColor: '#fff', marginHorizontal: 20, marginTop: 12,
    borderRadius: 20, padding: 18, ...SHADOW.md,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  searchLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 2 },
  searchValue: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  searchDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  searchDividerV: { width: 1, height: 28, backgroundColor: '#F1F5F9', marginHorizontal: 12 },
  searchGrid: { flexDirection: 'row', alignItems: 'center' },
  searchGridItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBtn: {
    height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginTop: 18, flexDirection: 'row', gap: 8,
  },
  searchBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  // Chips
  chipScroll: { paddingHorizontal: 20, paddingVertical: 18, gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, gap: 6, borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { borderColor: 'rgba(255,255,255,0.4)' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#fff' },
  // Section
  sectionHeader: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  sectionCount: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  // Hotel Card
  hotelCard: {
    backgroundColor: '#fff', borderRadius: 22, marginBottom: 18, marginHorizontal: 20,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', ...SHADOW.md,
  },
  cardImg: { width: '100%', height: 200 },
  cardOverlay: {
    position: 'absolute', top: 12, right: 12,
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4,
  },
  ratingText: { fontSize: 13, fontWeight: '800', color: '#FACC15' },
  cardInfo: { padding: 18 },
  hotelName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  locText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginLeft: 4 },
  reviewDot: { fontSize: 12, color: '#CBD5E1', marginHorizontal: 6 },
  reviewText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  priceUnit: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  viewBtn: { borderRadius: 12, overflow: 'hidden' },
  viewBtnInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 4 },
  viewBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25,
    padding: 25, maxHeight: height * 0.8,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  dateGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dateCol: { flex: 1, paddingHorizontal: 4 },
  dateColLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '800', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' },
  dateItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 10, borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: '#F1F5F9',
  },
  dateItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateItemText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  dateItemTextActive: { color: '#fff' },
  counterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22,
  },
  counterName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  counterDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  counterActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5,
    borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  counterValue: { fontSize: 18, fontWeight: '800', color: '#0F172A', minWidth: 20, textAlign: 'center' },
  modalBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
