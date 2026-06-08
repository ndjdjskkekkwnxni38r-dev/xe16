import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { FOOD_CATEGORIES, RESTAURANTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingCart from "@/components/FloatingCart";

const { width } = Dimensions.get('window');

const RestaurantCard = ({ item }: { item: typeof RESTAURANTS[0] }) => (
  <TouchableOpacity 
    style={styles.restaurantCard}
    onPress={() => router.push(`/food/${item.id}`)}
    activeOpacity={0.9}
  >
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)']}
        style={styles.imageOverlay}
      />
      {item.isPromo && (
        <View style={styles.premiumPromoBadge}>
          <Ionicons name="flame" size={12} color={COLORS.white} />
          <Text style={styles.premiumPromoText}>{item.promoText}</Text>
        </View>
      )}
      <View style={styles.timeBadge}>
        <Ionicons name="time-outline" size={12} color={COLORS.text} />
        <Text style={styles.timeBadgeText}>{item.time}</Text>
      </View>
    </View>

    <View style={styles.restaurantInfo}>
      <View style={styles.restaurantHeader}>
        <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FACC15" />
          <Text style={styles.ratingValue}>{item.rating}</Text>
          <Text style={styles.reviewsCount}>({item.reviews || 0})</Text>
        </View>
      </View>
      
      <View style={styles.tagRow}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.metaText}>{item.distance} • Hải Châu</Text>
        </View>
        <View style={styles.freeShipBadge}>
          <Text style={styles.freeShipText}>Freeship</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function FoodScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter(restaurant => {
      const matchesCategory = selectedCategoryId === 'all' || restaurant.categoryId === selectedCategoryId;
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           restaurant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ngon..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Address & Welcome */}
        <View style={styles.welcomeSection}>
          <View style={styles.addressBox}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.addressText} numberOfLines={1}>255 Hùng Vương, Đà Nẵng</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.welcomeTitle}>Hôm nay bạn muốn ăn gì?</Text>
        </View>

        {/* Categories Bar */}
        <View style={styles.categoriesWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {FOOD_CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryItem}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.categoryIconBg, 
                  selectedCategoryId === cat.id && styles.categoryIconBgActive
                ]}>
                  <Image source={{ uri: cat.image }} style={styles.categoryIcon} />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategoryId === cat.id && styles.categoryNameActive
                ]}>
                  {cat.name}
                </Text>
                {selectedCategoryId === cat.id && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                {selectedCategoryId === 'all' ? 'Dành cho bạn' : FOOD_CATEGORIES.find(c => c.id === selectedCategoryId)?.name}
              </Text>
              <Text style={styles.listSubtitle}>Top cửa hàng uy tín & chất lượng</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredRestaurants.length}</Text>
            </View>
          </View>
          
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((item) => (
              <RestaurantCard key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }} 
                style={styles.emptyImage} 
              />
              <Text style={styles.emptyText}>Rất tiếc, chưa tìm thấy kết quả phù hợp</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setSelectedCategoryId('all')}>
                <Text style={styles.resetBtnText}>Xem tất cả quán ăn</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <FloatingCart />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
    zIndex: 999,
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.text,
    marginHorizontal: 6,
    fontWeight: '600',
    maxWidth: 200,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  categoriesWrapper: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
    width: 64,
  },
  categoryIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOW.sm,
  },
  categoryIconBgActive: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    width: 36,
    height: 36,
  },
  categoryName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  restaurantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 24,
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  premiumPromoBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    ...SHADOW.sm,
  },
  premiumPromoText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 4,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 11,
    color: '#B45309',
    marginLeft: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 6,
    fontWeight: '500',
  },
  freeShipBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeShipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  resetBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    ...SHADOW.sm,
  },
  resetBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
