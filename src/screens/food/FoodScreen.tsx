import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, SafeAreaView, TextInput, Dimensions, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { FOOD_CATEGORIES, RESTAURANTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingCart from '@/components/FloatingCart';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const RestaurantCard = ({ item }: { item: typeof RESTAURANTS[0] }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => router.push(`/food/${item.id}`)}
    style={styles.card}
  >
    {/* Image */}
    <View style={styles.cardImageWrap}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.cardGradient}
      />
      {item.isPromo && (
        <View style={styles.promoBadge}>
          <Ionicons name="flame" size={12} color="#fff" />
          <Text style={styles.promoText}>{item.promoText}</Text>
        </View>
      )}
      <View style={styles.timeBadge}>
        <Ionicons name="time-outline" size={12} color="#fff" />
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={12} color="#FACC15" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </View>

    {/* Info */}
    <View style={styles.cardBody}>
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>

      <View style={styles.tagRow}>
        {item.tags.slice(0, 3).map((tag, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.metaText}>{item.distance}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.reviews} đánh giá</Text>
        </View>
        {item.isPromo && item.promoText?.toLowerCase().includes('freeship') && (
          <View style={styles.freeShipBadge}>
            <Text style={styles.freeShipText}>Freeship</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function FoodScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter((r) => {
      const matchCat = selectedCategoryId === 'all' || r.categoryId === selectedCategoryId;
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategoryId, searchQuery]);

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="restaurant" size={18} color="#fff" />
              <Text style={styles.headerTitle}>Đồ ăn</Text>
            </View>
            <TouchableOpacity style={styles.cartBtn}>
              <Ionicons name="cart-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm quán ngon..."
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

          {/* Address */}
          <TouchableOpacity style={styles.addressRow}>
            <Ionicons name="location" size={14} color="#fff" />
            <Text style={styles.addressText} numberOfLines={1}>255 Hùng Vương, Đà Nẵng</Text>
            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {FOOD_CATEGORIES.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.7}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <LinearGradient
                  colors={isActive ? [COLORS.primary, '#0284C7'] : ['#F8FAFC', '#F1F5F9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.catChip, isActive && styles.catChipActive]}
                >
                  <Image source={{ uri: cat.image }} style={styles.catIcon} />
                  <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
                    {cat.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>
              {selectedCategoryId === 'all'
                ? 'Gợi ý cho bạn'
                : FOOD_CATEGORIES.find((c) => c.id === selectedCategoryId)?.name}
            </Text>
            <Text style={styles.listCount}>{filteredRestaurants.length} quán</Text>
          </View>
        </View>

        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((item) => (
            <RestaurantCard key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy quán</Text>
            <Text style={styles.emptyDesc}>Thử tìm với từ khóa khác nhé</Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { setSelectedCategoryId('all'); setSearchQuery(''); }}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetBtnInner}
              >
                <Text style={styles.resetBtnText}>Xem tất cả</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingCart />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Header
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOW.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 8,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    ...SHADOW.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    marginLeft: 10,
  },
  // Address
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  addressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginHorizontal: 6,
  },
  // Categories
  categoriesWrap: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...SHADOW.sm,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  catChipActive: {
    borderColor: 'rgba(255,255,255,0.4)',
  },
  catIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  catLabelActive: {
    color: '#fff',
  },
  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  listCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOW.md,
  },
  cardImageWrap: {
    width: '100%',
    height: 170,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  promoText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  cardBody: {
    padding: 16,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  metaDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  freeShipBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeShipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  resetBtn: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  resetBtnInner: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
