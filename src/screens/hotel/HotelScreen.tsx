import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, Platform, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { useToast } from '@/components/Toast';

const { width, height } = Dimensions.get('window');

const HomeIcon = ({ size, color }: any) => <Ionicons name="shield-checkmark" size={size} color={color} />;

const HOTEL_TYPES = [
  { id: '1', name: 'Luxury', icon: (props: any) => <MaterialCommunityIcons name="crown" {...props} /> },
  { id: '2', name: 'Resort', icon: (props: any) => <Ionicons name="star" {...props} /> },
  { id: '3', name: 'Khách sạn', icon: (props: any) => <Ionicons name="compass" {...props} /> },
  { id: '4', name: 'Villa', icon: (props: any) => <Ionicons name="home" {...props} /> },
];

const ALL_HOTELS = [
  // LUXURY (typeId: '1')
  { id: 'l1', typeId: '1', name: 'InterContinental Sun Peninsula', price: '12.200.000', rating: 4.9, reviews: 2150, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000', loc: 'Sơn Trà, Đà Nẵng' },
  { id: 'l2', typeId: '1', name: 'Amanoi Resort Ninh Thuan', price: '25.500.000', rating: 5.0, reviews: 840, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000', loc: 'Vĩnh Hy, Ninh Thuận' },
  { id: 'l3', typeId: '1', name: 'Regent Phu Quoc Luxury', price: '15.800.000', rating: 4.9, reviews: 620, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1000', loc: 'Bãi Trường, Phú Quốc' },
  { id: 'l4', typeId: '1', name: 'Six Senses Ninh Van Bay', price: '18.900.000', rating: 4.8, reviews: 1100, img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000', loc: 'Ninh Hòa, Nha Trang' },
  { id: 'l5', typeId: '1', name: 'Park Hyatt Saigon City', price: '9.500.000', rating: 4.9, reviews: 3400, img: 'https://images.unsplash.com/photo-1551882547-ff43c59fe4cf?q=80&w=1000', loc: 'Quận 1, TP. HCM' },

  // RESORT (typeId: '2')
  { id: 'r1', typeId: '2', name: 'Shilla Monogram Quangnam', price: '4.200.000', rating: 4.9, reviews: 540, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?q=80&w=1000', loc: 'Điện Bàn, Quảng Nam' },
  { id: 'r2', typeId: '2', name: 'Vinpearl Resort & Spa Da Nang', price: '3.800.000', rating: 4.7, reviews: 2800, img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000', loc: 'Ngũ Hành Sơn, Đà Nẵng' },
  { id: 'r3', typeId: '2', name: 'Pullman Danang Beach Resort', price: '3.500.000', rating: 4.8, reviews: 1950, img: 'https://images.unsplash.com/photo-1561501900-3701fa6a0f64?q=80&w=1000', loc: 'Bắc Mỹ An, Đà Nẵng' },
  { id: 'r4', typeId: '2', name: 'Naman Retreat Pure Design', price: '5.200.000', rating: 4.7, reviews: 1100, img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1000', loc: 'Hòa Hải, Đà Nẵng' },
  { id: 'r5', typeId: '2', name: 'The Anam Cam Ranh Resort', price: '4.900.000', rating: 4.9, reviews: 1350, img: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=1000', loc: 'Cam Lâm, Khánh Hòa' },

  // HOTEL (typeId: '3')
  { id: 'h1', typeId: '3', name: 'Novotel Premier Han River', price: '2.850.000', rating: 4.8, reviews: 1250, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000', loc: 'Hải Châu, Đà Nẵng' },
  { id: 'h2', typeId: '3', name: 'Hilton Da Nang City', price: '2.600.000', rating: 4.7, reviews: 980, img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000', loc: 'Bạch Đằng, Đà Nẵng' },
  { id: 'h3', typeId: '3', name: 'Muong Thanh Luxury Da Nang', price: '1.800.000', rating: 4.6, reviews: 4200, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000', loc: 'Mỹ Khê, Đà Nẵng' },
  { id: 'h4', typeId: '3', name: 'Haian Beach Hotel & Spa', price: '1.950.000', rating: 4.7, reviews: 1560, img: 'https://images.unsplash.com/photo-1551882547-ff43c59fe4cf?q=80&w=1000', loc: 'Võ Nguyên Giáp, Đà Nẵng' },
  { id: 'h5', typeId: '3', name: 'Diamond Bay Hotel City', price: '1.550.000', rating: 4.5, reviews: 890, img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1000', loc: 'Quang Trung, Nha Trang' },

  // VILLA (typeId: '4')
  { id: 'v1', typeId: '4', name: 'Furama Villas Danang Resort', price: '8.500.000', rating: 4.7, reviews: 320, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000', loc: 'Ngũ Hành Sơn, Đà Nẵng' },
  { id: 'v2', typeId: '4', name: 'Premier Village Da Nang Villa', price: '10.500.000', rating: 4.8, reviews: 450, img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000', loc: 'Mỹ An, Đà Nẵng' },
  { id: 'v3', typeId: '4', name: 'The Ocean Villas Resort', price: '7.800.000', rating: 4.6, reviews: 890, img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000', loc: 'Hòa Hải, Đà Nẵng' },
  { id: 'v4', typeId: '4', name: 'Fusion Resort Beach Villa', price: '9.200.000', rating: 4.9, reviews: 210, img: 'https://images.unsplash.com/photo-1512918766674-ed62b979ad14?q=80&w=1000', loc: 'Cam Ranh, Khánh Hòa' },
  { id: 'v5', typeId: '4', name: 'Vinpearl Discovery Beach Villa', price: '11.500.000', rating: 4.7, reviews: 1200, img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000', loc: 'Hòn Tre, Nha Trang' },
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
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState('1');
  const [isSearching, setIsSearching] = useState(false);
  
  // Interaction States
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [checkIn, setCheckIn] = useState(DATES_DATA[3]); // 15/04
  const [checkOut, setCheckOut] = useState(DATES_DATA[5]); // 17/04

  const filteredHotels = useMemo(() => {
    return ALL_HOTELS.filter(h => h.typeId === selectedType);
  }, [selectedType]);

  const currentTypeLabel = useMemo(() => {
    return HOTEL_TYPES.find(t => t.id === selectedType)?.name || 'Khách sạn';
  }, [selectedType]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      showToast({
        type: 'success',
        message: `Đã tìm thấy ${filteredHotels.length} kết quả tại Đà Nẵng từ ngày ${checkIn.value} đến ${checkOut.value}.`
      });
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* FIXED HEADER */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerTitleCenter}>
            <Text style={styles.headerTitle}>Tìm khách sạn</Text>
            <Text style={styles.headerSubTitle}>Đà Nẵng, Việt Nam</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BANNER */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000' }} style={styles.bannerImg} />
          <LinearGradient colors={['transparent', 'rgba(248, 250, 252, 1)']} style={styles.bannerGradient} />
        </View>

        {/* SEARCH CARD */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.searchCard}>
          <TouchableOpacity style={styles.searchInputRow} activeOpacity={0.7}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <View style={styles.searchLabelGroup}>
              <Text style={styles.searchLabel}>ĐIỂM ĐẾN</Text>
              <Text style={styles.searchValue}>Đà Nẵng, Việt Nam</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.searchDivider} />

          <View style={styles.searchGrid}>
            <TouchableOpacity 
              style={styles.searchGridItem} 
              onPress={() => setShowDateModal(true)}
            >
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <View style={styles.searchLabelGroup}>
                <Text style={styles.searchLabel}>THỜI GIAN</Text>
                <Text style={styles.searchValue}>{checkIn.value} - {checkOut.value}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />

            <TouchableOpacity 
              style={styles.searchGridItem}
              onPress={() => setShowGuestModal(true)}
            >
              <Ionicons name="people" size={20} color={COLORS.primary} />
              <View style={styles.searchLabelGroup}>
                <Text style={styles.searchLabel}>SỐ KHÁCH</Text>
                <Text style={styles.searchValue}>{guests.adults} NL, {guests.children} TE</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.mainSearchAction} 
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.mainSearchText}>Tìm kiếm ngay</Text>}
          </TouchableOpacity>
        </Animated.View>

        {/* CATEGORY CHIPS */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {HOTEL_TYPES.map((type) => (
              <TouchableOpacity 
                key={type.id} 
                style={[styles.chip, selectedType === type.id && styles.chipActive]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={[styles.chipText, selectedType === type.id && styles.chipTextActive]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{currentTypeLabel} nổi bật</Text>
          <View style={styles.countBadge}><Text style={styles.countText}>{filteredHotels.length} kết quả</Text></View>
        </View>

        {/* LISTING */}
        <View style={styles.listContainer}>
          {filteredHotels.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity 
                style={styles.hotelCard} 
                activeOpacity={0.9} 
                onPress={() => router.push(`/hotel/${item.id}`)}
              >
                <Image source={{ uri: item.img }} style={styles.cardImg} />
                <TouchableOpacity style={styles.favBtn}><Ionicons name="heart" size={20} color={COLORS.white} /></TouchableOpacity>
                <View style={styles.cardInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color="#FACC15" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.locRow}>
                    <Ionicons name="location" size={12} color="#64748B" />
                    <Text style={styles.locText}>{item.loc}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.reviewsText}>{item.reviews} đánh giá</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceValue}>{item.price}đ</Text>
                        <Text style={styles.priceUnit}>/đêm</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewBtn}
                      onPress={() => router.push(`/hotel/${item.id}`)}
                    >
                      <Text style={styles.viewBtnText}>Xem phòng</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* DATE SELECTION MODAL */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowDateModal(false)} />
          <Animated.View entering={SlideInDown} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày nghỉ</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}><Ionicons name="close" size={24} color="#1E293B" /></TouchableOpacity>
            </View>
            <View style={styles.dateSelectionGrid}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnLabel}>Ngày nhận phòng</Text>
                {DATES_DATA.map((d) => (
                  <TouchableOpacity 
                    key={`in-${d.value}`} 
                    style={[styles.dateItem, checkIn.value === d.value && styles.dateItemActive]} 
                    onPress={() => setCheckIn(d)}
                  >
                    <Text style={[styles.dateItemText, checkIn.value === d.value && styles.dateItemTextActive]}>{d.label}</Text>
                    {checkIn.value === d.value && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnLabel}>Ngày trả phòng</Text>
                {DATES_DATA.map((d) => (
                  <TouchableOpacity 
                    key={`out-${d.value}`} 
                    style={[styles.dateItem, checkOut.value === d.value && styles.dateItemActive]} 
                    onPress={() => setCheckOut(d)}
                  >
                    <Text style={[styles.dateItemText, checkOut.value === d.value && styles.dateItemTextActive]}>{d.label}</Text>
                    {checkOut.value === d.value && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowDateModal(false)}>
              <Text style={styles.applyBtnText}>Xác nhận</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* GUEST SELECTION MODAL */}
      <Modal visible={showGuestModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowGuestModal(false)} />
          <Animated.View entering={SlideInDown} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Số lượng khách</Text>
              <TouchableOpacity onPress={() => setShowGuestModal(false)}><Ionicons name="close" size={24} color="#1E293B" /></TouchableOpacity>
            </View>
            <View style={styles.counterRow}>
              <View><Text style={styles.counterName}>Người lớn</Text><Text style={styles.counterDesc}>Từ 12 tuổi trở lên</Text></View>
              <View style={styles.counterActions}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}><Ionicons name="remove" size={18} color={COLORS.primary} /></TouchableOpacity>
                <Text style={styles.counterValue}>{guests.adults}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}><Ionicons name="add" size={18} color={COLORS.primary} /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.counterRow}>
              <View><Text style={styles.counterName}>Trẻ em</Text><Text style={styles.counterDesc}>Dưới 12 tuổi</Text></View>
              <View style={styles.counterActions}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}><Ionicons name="remove" size={18} color={COLORS.primary} /></TouchableOpacity>
                <Text style={styles.counterValue}>{guests.children}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}><Ionicons name="add" size={18} color={COLORS.primary} /></TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowGuestModal(false)}><Text style={styles.applyBtnText}>Áp dụng</Text></TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerSafe: { backgroundColor: '#FFFFFF', ...SHADOW.sm, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitleCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  headerSubTitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  filterBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F9FF', borderRadius: 12 },
  scrollContent: { paddingBottom: 20 },
  bannerContainer: { height: 200, width: '100%' },
  bannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  searchCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: -60, borderRadius: 20, padding: 20, ...SHADOW.md, borderWidth: 1, borderColor: '#F1F5F9' },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 5 },
  searchLabelGroup: { flex: 1 },
  searchLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  searchValue: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 3 },
  searchDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  searchGrid: { flexDirection: 'row', alignItems: 'center' },
  searchGridItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  verticalDivider: { width: 1, height: 30, backgroundColor: '#F1F5F9', marginHorizontal: 10 },
  mainSearchAction: { backgroundColor: COLORS.primary, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  mainSearchText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  categoryContainer: { marginTop: 25 },
  categoryScroll: { paddingHorizontal: 20 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 35, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  countBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  listContainer: { paddingHorizontal: 20 },
  hotelCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 25, overflow: 'hidden', ...SHADOW.sm, borderWidth: 1, borderColor: '#F1F5F9' },
  cardImg: { width: '100%', height: 220, resizeMode: 'cover' },
  favBtn: { position: 'absolute', top: 15, right: 15, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 18 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hotelName: { fontSize: 18, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 10 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 },
  reviewsText: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  priceValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  priceUnit: { fontSize: 12, color: '#64748B', paddingBottom: 3 },
  viewBtn: { backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  viewBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: height * 0.8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  dateSelectionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dateColumn: { flex: 1, paddingHorizontal: 5 },
  dateColumnLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  dateItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  dateItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateItemText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  dateItemTextActive: { color: '#FFFFFF' },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  counterName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  counterDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  counterActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: 18, fontWeight: '800', color: '#1E293B', minWidth: 20, textAlign: 'center' },
  applyBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10, ...SHADOW.md },
  applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});