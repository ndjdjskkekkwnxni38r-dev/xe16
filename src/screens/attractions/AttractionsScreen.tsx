import FloatingCart from '@/components/FloatingCart';
import { DANANG_SPOTS } from '@/constants/data';
import { COLORS, SHADOW } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions, Image, Modal, Platform, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid' },
  { id: 'popular', name: 'Phổ biến', icon: 'flame' },
  { id: 'nature', name: 'Thiên nhiên', icon: 'leaf' },
  { id: 'food', name: 'Ẩm thực', icon: 'restaurant' },
];

const COLLECTIONS = [
  { id: 'c1', name: 'Đà Nẵng về đêm', count: 12, img: 'https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000' },
  { id: 'c2', name: 'Tour Bà Nà Hills', count: 8, img: 'https://cdn3.ivivu.com/2024/08/ba-na-hill-iVIVU1-e1724662224847.png' },
  { id: 'c3', name: 'Khám phá Sơn Trà', count: 6, img: 'https://statics.vinpearl.com/ban-dao-son-tra-7_1629274214.jpg' },
  { id: 'c4', name: 'Ẩm thực Phố Cổ', count: 15, img: 'https://bcp.cdnchinhphu.vn/334894974524682240/2025/9/18/cdhoian5-17581621538711341831070.jpeg' },
  { id: 'c5', name: 'Vẻ đẹp Ngũ Hành', count: 5, img: 'https://statics.vinpearl.com/ngu-hanh-son-da-nang-1_1629452077.jpg' },
];

export default function AttractionsScreen() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const filteredSpots = useMemo(() => {
    let spots = selectedCat === 'all'
      ? [...DANANG_SPOTS]
      : DANANG_SPOTS.filter((s) => s.categoryId === selectedCat);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      spots = spots.filter(
        (s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      spots.sort((a, b) => (parseInt(a.price.replace(/\D/g, '')) || 0) - (parseInt(b.price.replace(/\D/g, '')) || 0));
    } else if (sortBy === 'price_desc') {
      spots.sort((a, b) => (parseInt(b.price.replace(/\D/g, '')) || 0) - (parseInt(a.price.replace(/\D/g, '')) || 0));
    }

    return spots;
  }, [selectedCat, searchQuery, sortBy]);

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
              <Ionicons name="compass" size={18} color="#fff" />
              <Text style={styles.headerTitle}>Tham quan</Text>
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/(tabs)/explore')}>
              <Ionicons name="map" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </LinearGradient>

      <View style={styles.searchWrapOuter}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm hoạt động, địa điểm..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Flash Sale */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/attractions/flash-sale')}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.flashCard}
          >
            <View style={styles.flashLeft}>
              <View style={styles.flashIconWrap}>
                <Ionicons name="flash" size={20} color="#FACC15" />
              </View>
              <View>
                <Text style={styles.flashTitle}>Flash Sale Vé Tham Quan</Text>
                <Text style={styles.flashTime}>Kết thúc sau: 02:45:12</Text>
              </View>
            </View>
            <View style={styles.flashArrow}>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            return (
              <TouchableOpacity key={cat.id} activeOpacity={0.7} onPress={() => setSelectedCat(cat.id)}>
                <LinearGradient
                  colors={isActive ? [COLORS.primary, '#0284C7'] : ['#F8FAFC', '#F1F5F9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.catChip, isActive && styles.catChipActive]}
                >
                  <Ionicons name={cat.icon as any} size={16} color={isActive ? '#fff' : COLORS.primary} />
                  <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>{cat.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Collections */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bộ sưu tập</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem thêm</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colScroll}>
          {COLLECTIONS.map((col) => (
            <TouchableOpacity key={col.id} activeOpacity={0.85} style={styles.colCard} onPress={() => router.push(`/collection/${col.id}`)}>
              <Image source={{ uri: col.img }} style={styles.colImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.colOverlay}>
                <Text style={styles.colName}>{col.name}</Text>
                <Text style={styles.colCount}>{col.count} địa điểm</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Spots List */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Hoạt động tại Đà Nẵng</Text>
            <Text style={styles.sectionSub}>Gợi ý dựa trên xu hướng du lịch</Text>
          </View>
          <TouchableOpacity style={styles.filterChip} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="filter" size={14} color={COLORS.primary} />
            <Text style={styles.filterChipText}>Lọc</Text>
          </TouchableOpacity>
        </View>

        {filteredSpots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            activeOpacity={0.9}
            style={styles.spotCard}
            onPress={() => router.push(`/discover/${spot.id}`)}
          >
            <View style={styles.spotImgWrap}>
              <Image source={{ uri: spot.image }} style={styles.spotImg} />
              <View style={styles.spotBadge}>
                <Text style={styles.spotBadgeText}>PHỔ BIẾN</Text>
              </View>
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
              <View style={styles.spotLocRow}>
                <Ionicons name="location" size={11} color="#94A3B8" />
                <Text style={styles.spotLoc} numberOfLines={1}>{spot.location}</Text>
              </View>
              <View style={styles.spotMeta}>
                <View style={styles.spotRating}>
                  <Ionicons name="star" size={12} color="#FACC15" />
                  <Text style={styles.spotRatingText}>4.9</Text>
                </View>
                <Text style={styles.spotDot}>•</Text>
                <Text style={styles.spotSold}>2k+ đã đặt</Text>
              </View>
              <View style={styles.spotFooter}>
                <Text style={styles.spotPrice}>{spot.price}</Text>
                <TouchableOpacity style={styles.spotBtn}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredSpots.length === 0 && (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search-outline" size={40} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy</Text>
            <Text style={styles.emptyDesc}>Thử từ khóa khác nhé</Text>
            <TouchableOpacity onPress={() => { setSelectedCat('all'); setSearchQuery(''); }}>
              <LinearGradient colors={[COLORS.primary, '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Xem tất cả</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingCart />

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc & Sắp xếp</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>

            {[
              { key: 'popular', icon: 'flame', label: 'Phổ biến nhất' },
              { key: 'price_asc', icon: 'trending-up', label: 'Giá tăng dần' },
              { key: 'price_desc', icon: 'trending-down', label: 'Giá giảm dần' },
            ].map((opt) => {
              const isActive = sortBy === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.filterOpt, isActive && styles.filterOptActive]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <View style={styles.filterOptLeft}>
                    <Ionicons name={opt.icon as any} size={18} color={isActive ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.filterOptText, isActive && styles.filterOptTextActive]}>{opt.label}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity activeOpacity={0.8} onPress={() => setFilterModalVisible(false)}>
              <LinearGradient colors={[COLORS.primary, '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalBtn}>
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
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  mapBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  searchWrapOuter: { paddingHorizontal: 20, marginTop: -22, marginBottom: 8 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, height: 48, borderRadius: 14, ...SHADOW.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '600', marginLeft: 10 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  // Flash Sale
  flashCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 18, marginBottom: 20, ...SHADOW.md,
  },
  flashLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  flashIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  flashTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  flashTime: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', marginTop: 2 },
  flashArrow: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  // Categories
  catScroll: { paddingVertical: 16, gap: 10 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, gap: 6, borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { borderColor: 'rgba(255,255,255,0.4)' },
  catLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  catLabelActive: { color: '#fff' },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  sectionSub: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  filterChipText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  // Collections
  colScroll: { gap: 14, marginBottom: 24 },
  colCard: { width: 150, height: 200, borderRadius: 18, overflow: 'hidden' },
  colImg: { width: '100%', height: '100%' },
  colOverlay: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 14,
  },
  colName: { color: '#fff', fontSize: 14, fontWeight: '800' },
  colCount: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  // Spot Card
  spotCard: {
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', ...SHADOW.sm,
  },
  spotImgWrap: { width: '100%', height: 180 },
  spotImg: { width: '100%', height: '100%' },
  spotBadge: {
    position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  spotBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  spotInfo: { padding: 16 },
  spotName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  spotLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  spotLoc: { fontSize: 12, color: '#64748B', fontWeight: '500', flex: 1 },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  spotRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  spotRatingText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  spotDot: { fontSize: 12, color: '#CBD5E1' },
  spotSold: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  spotFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  spotPrice: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  spotBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 50 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 16 },
  resetBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  resetBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.5)' },
  modalBg: { ...StyleSheet.absoluteFillObject },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  modalClose: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  filterSectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  filterOpt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: '#F1F5F9', backgroundColor: '#F8FAFC',
  },
  filterOptActive: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  filterOptLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterOptText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  filterOptTextActive: { color: COLORS.primary, fontWeight: '800' },
  modalBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
