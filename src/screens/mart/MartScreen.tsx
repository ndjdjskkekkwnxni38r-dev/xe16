import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Dimensions, Platform, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { MART_CATEGORIES, STORES, PROMOTIONS, TRENDING_PRODUCTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { useCart } from '@/store/CartContext';
import { useToast } from '@/components/Toast';

const { width } = Dimensions.get('window');

const PromoBanner = () => (
  <View style={styles.promoContainer}>
    <ScrollView 
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.promoScroll}
    >
      {PROMOTIONS.slice(0, 3).map((promo, index) => (
        <TouchableOpacity key={promo.id} activeOpacity={0.95}>
          <LinearGradient
            colors={[promo.color, promo.color + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoCard}
          >
            <View style={styles.promoInfo}>
              <View style={styles.promoTag}>
                <Text style={styles.promoTagText}>{promo.type}</Text>
              </View>
              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
              <View style={styles.promoCodeBox}>
                <Text style={styles.promoCodeLabel}>CODE: </Text>
                <Text style={styles.promoCodeValue}>{promo.code}</Text>
              </View>
            </View>
            <Image source={{ uri: promo.image }} style={styles.promoImage} />
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const StoreCard = ({ item, index }: { item: typeof STORES[0], index: number }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={styles.storeCardWrapper}
    >
      <TouchableOpacity 
        style={styles.storeCard}
        onPress={() => router.push(`/mart/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.storeImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />
          
          <TouchableOpacity 
            style={styles.favoriteBtn}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? COLORS.error : COLORS.white} />
          </TouchableOpacity>

          {item.isPromo && (
            <View style={styles.premiumPromoBadge}>
              <Ionicons name="flash" size={12} color={COLORS.white} />
              <Text style={styles.premiumPromoText}>{item.promoText}</Text>
            </View>
          )}
          
          <View style={styles.storeMetaOverlay}>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color={COLORS.white} />
              <Text style={styles.timeBadgeText}>{item.time}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FACC15" />
              <Text style={styles.ratingValue}>{item.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.storeInfo}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.distanceBox}>
              <Ionicons name="location" size={12} color={COLORS.primary} />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          </View>
          
          <View style={styles.tagRow}>
            {item.tags.map((tag, i) => (
              <View key={i} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerRow}>
            <View style={styles.priceLevel}>
              <Text style={styles.priceLabel}>Giá từ: </Text>
              <Text style={styles.priceValue}>25k - 250k</Text>
            </View>
            <View style={styles.deliveryBadge}>
              <Ionicons name="bag-handle-outline" size={12} color={COLORS.success} />
              <Text style={styles.deliveryText}>Free Delivery</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

import FloatingCart from "@/components/FloatingCart";

export default function MartScreen() {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  const handleAddToCart = (product: typeof TRENDING_PRODUCTS[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'mart',
      shopName: product.storeName
    });
    showToast({
      message: `Đã thêm ${product.name} vào giỏ hàng`,
      type: 'success',
      duration: 2000
    });
  };

  const filteredStores = useMemo(() => {
    return STORES.filter(store => {
      const matchesCategory = selectedCategoryId === 'all' || store.categoryId === selectedCategoryId;
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           store.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery]);


  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -5],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <RNAnimated.View style={[
        styles.stickyHeader,
        { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }
      ]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.stickySearch}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <Text style={styles.stickySearchText}>Tìm kiếm tại {MART_CATEGORIES.find(c => c.id === selectedCategoryId)?.name}</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="filter" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </RNAnimated.View>

      <RNAnimated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ... rest of content ... */}
        <LinearGradient
          colors={[COLORS.primary, '#38BDF8', '#F0F9FF']}
          style={styles.heroSection}
        >
          <View style={styles.topHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.blurButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addressContainer}>
              <Ionicons name="location" size={16} color={COLORS.white} />
              <Text style={styles.topAddressText} numberOfLines={1}>255 Hùng Vương, Đà Nẵng</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.blurButton} onPress={() => router.push('/cart')}>
              <Ionicons name="bag-handle" size={24} color={COLORS.white} />
              <View style={styles.cartBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Đi chợ tiện lợi</Text>
            <Text style={styles.heroSubtitle}>Giao hàng siêu tốc trong 30 phút</Text>
            
            <View style={styles.mainSearchBox}>
              <Ionicons name="search" size={22} color={COLORS.textSecondary} />
              <TextInput
                style={styles.mainSearchInput}
                placeholder="Tìm trái cây, rau củ, thịt tươi..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.searchFilterBtn}>
                <Ionicons name="filter" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Categories Grid/Carousel */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục hàng hóa</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Tất cả</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {MART_CATEGORIES.map((cat, index) => (
              <Animated.View 
                key={cat.id}
                entering={FadeInRight.delay(index * 100)}
              >
                <TouchableOpacity 
                  style={styles.categoryCard}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.categoryIconContainer,
                    selectedCategoryId === cat.id && styles.categoryIconActive
                  ]}>
                    <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                    {selectedCategoryId === cat.id && (
                      <LinearGradient
                        colors={['rgba(14, 165, 233, 0.2)', 'rgba(14, 165, 233, 0.4)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                  </View>
                  <Text style={[
                    styles.categoryLabel,
                    selectedCategoryId === cat.id && styles.categoryLabelActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Promotion Section */}
        <PromoBanner />

        {/* Flash Sale / Trending */}
        <View style={styles.trendingSection}>
          <View style={styles.trendingHeader}>
            <View style={styles.trendingTitleGroup}>
              <Ionicons name="flame" size={20} color={COLORS.accent} />
              <Text style={styles.trendingTitle}>Mua nhiều nhất</Text>
            </View>
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>02 : 15 : 45</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            {TRENDING_PRODUCTS.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.trendingItem}
                onPress={() => router.push(`/mart/product/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.trendingImg} />
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.trendingPrice}>{item.price.toLocaleString()}đ</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addSmallBtn}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.addSmallBtnText}>+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                {selectedCategoryId === 'all' ? 'Cửa hàng gần bạn' : MART_CATEGORIES.find(c => c.id === selectedCategoryId)?.name}
              </Text>
              <View style={styles.listMeta}>
                <Ionicons name="star" size={14} color="#FACC15" />
                <Text style={styles.listSubtitle}>Top đánh giá 4.5* trở lên</Text>
              </View>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Mới nhất</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
            </View>
          </View>
          
          {filteredStores.length > 0 ? (
            filteredStores.map((item, index) => (
              <StoreCard key={item.id} item={item} index={index} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }} 
                style={styles.emptyImage} 
              />
              <Text style={styles.emptyText}>Rất tiếc, chưa tìm thấy cửa hàng</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setSelectedCategoryId('all')}>
                <Text style={styles.resetBtnText}>Xem tất cả cửa hàng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </RNAnimated.ScrollView>
      <FloatingCart />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    zIndex: 100,
    ...SHADOW.md,
  },
  stickySearch: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginHorizontal: 15,
  },
  stickySearchText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
  },
  topAddressText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 5,
    maxWidth: 150,
  },
  cartBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  heroContent: {
    paddingHorizontal: 25,
    marginTop: 30,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    fontWeight: '500',
  },
  mainSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: 25,
    borderRadius: 20,
    paddingLeft: 20,
    height: 60,
    ...SHADOW.lg,
  },
  mainSearchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  searchFilterBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionWrapper: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginRight: 4,
  },
  categoriesScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  categoryIconActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  categoryImage: {
    width: 44,
    height: 44,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  promoContainer: {
    marginTop: 30,
  },
  promoScroll: {
    paddingHorizontal: 20,
  },
  promoCard: {
    width: width - 40,
    height: 160,
    borderRadius: 28,
    flexDirection: 'row',
    padding: 20,
    marginRight: 15,
    overflow: 'hidden',
  },
  promoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  promoTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  promoTagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  promoCodeLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  promoCodeValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  promoImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    transform: [{ rotate: '15deg' }, { translateY: 20 }],
  },
  trendingSection: {
    marginTop: 35,
    backgroundColor: '#FFF1F2',
    paddingVertical: 25,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trendingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E11D48',
    marginLeft: 10,
  },
  timerBox: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  trendingScroll: {
    paddingLeft: 20,
  },
  trendingItem: {
    width: 150,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginRight: 15,
    ...SHADOW.sm,
  },
  trendingImg: {
    width: '100%',
    height: 110,
    borderRadius: 15,
    marginBottom: 10,
  },
  trendingInfo: {
    gap: 4,
  },
  trendingName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  trendingPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addSmallBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSmallBtnText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 35,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  listSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 5,
    fontWeight: '500',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginRight: 4,
  },
  storeCardWrapper: {
    marginBottom: 25,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    ...SHADOW.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumPromoBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    ...SHADOW.sm,
  },
  premiumPromoText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  storeMetaOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 4,
  },
  storeInfo: {
    padding: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tagText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLevel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  resetBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    ...SHADOW.md,
  },
  resetBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
