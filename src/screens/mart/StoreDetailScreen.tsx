import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, Animated, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { STORES } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedReanimated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolate } from 'react-native-reanimated';

import { useCart } from '@/store/CartContext';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 320;

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const store = STORES.find(s => s.id === id);
  const { items, addItem, updateQuantity: updateGlobalQuantity, totalAmount, totalItems } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!store) return <View style={styles.container}><Text>Cửa hàng không tồn tại</Text></View>;

  const getQuantity = (productId: string) => {
    return items.find(item => item.id === productId)?.quantity || 0;
  };

  const handleUpdateCart = (product: any, delta: number) => {
    const existingItem = items.find(i => i.id === product.id);
    if (existingItem) {
      updateGlobalQuantity(product.id, delta);
    } else if (delta > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        type: 'mart',
        shopName: store.name
      });
    }
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT / 2, 0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Sticky Header Top */}
      <Animated.View style={[styles.stickyHeader, { opacity: stickyHeaderOpacity }]}>
        <SafeAreaView style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnSmall}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.stickyTitle} numberOfLines={1}>{store.name}</Text>
          <TouchableOpacity style={styles.backBtnSmall}>
            <Ionicons name="search" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Parallax Header Image */}
        <Animated.View style={[
          styles.headerImageContainer, 
          { transform: [{ translateY: headerTranslateY }, { scale: headerScale }] }
        ]}>
          <Image source={{ uri: store.image }} style={styles.headerImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />
        </Animated.View>

        {/* Back and Actions Overlay (Only visible at top) */}
        <Animated.View style={[styles.headerActionsOverlay, { opacity: headerOpacity }]}>
          <SafeAreaView style={styles.headerActionsRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.blurCircleBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerRightActions}>
              <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.blurCircleBtn}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? COLORS.error : COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.blurCircleBtn, { marginLeft: 12 }]}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Store Info Card (Floating) */}
        <View style={styles.infoCardWrapper}>
          <AnimatedReanimated.View 
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.storeCard}
          >
            <View style={styles.storeMainInfo}>
              <View style={styles.promoBadgeSmall}>
                <Ionicons name="flash" size={10} color={COLORS.white} />
                <Text style={styles.promoBadgeTextSmall}>GIẢM GIÁ ĐẾN 20%</Text>
              </View>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={14} color="#FACC15" />
                  <Text style={styles.ratingValue}>{store.rating}</Text>
                </View>
                <Text style={styles.reviewsCount}>({store.reviews}+ đánh giá)</Text>
                <View style={styles.dot} />
                <Text style={styles.deliveryInfo}>Siêu thị / Thực phẩm</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{store.time}</Text>
                <Text style={styles.statLabel}>Thời gian</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="location-outline" size={18} color={COLORS.success} />
                </View>
                <Text style={styles.statValue}>{store.distance}</Text>
                <Text style={styles.statLabel}>Khoảng cách</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="bag-handle-outline" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>Freeship</Text>
                <Text style={styles.statLabel}>Đơn từ 50k</Text>
              </View>
            </View>
          </AnimatedReanimated.View>
        </View>

        {/* Product Menu */}
        <View style={styles.menuSection}>
          <View style={styles.menuHeader}>
            <View>
              <Text style={styles.menuTitle}>Sản phẩm hot</Text>
              <Text style={styles.menuSubtitle}>Được người mua đánh giá cao nhất</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {store.menu.map((product, index) => (
            <AnimatedReanimated.View 
              key={product.id}
              entering={FadeInDown.delay(400 + index * 100).duration(500)}
            >
              <TouchableOpacity style={styles.productCard} activeOpacity={0.7}>
                <View style={styles.productInfo}>
                  <View style={styles.productHeaderRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    {product.isBestSeller && (
                      <View style={styles.hotBadge}>
                        <Ionicons name="flame" size={10} color={COLORS.white} />
                        <Text style={styles.hotText}>HOT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.productDesc} numberOfLines={2}>{product.desc}</Text>
                  <View style={styles.productFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.productPrice}>{product.price.toLocaleString()}đ</Text>
                      <Text style={styles.oldPrice}>{(product.price * 1.2).toLocaleString()}đ</Text>
                    </View>
                    
                    <View style={styles.addControl}>
                      {getQuantity(product.id) > 0 ? (
                        <View style={styles.qtyBox}>
                          <TouchableOpacity onPress={() => handleUpdateCart(product, -1)} style={styles.qtyActionBtn}>
                            <Ionicons name="remove" size={14} color={COLORS.primary} />
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{getQuantity(product.id)}</Text>
                          <TouchableOpacity onPress={() => handleUpdateCart(product, 1)} style={styles.qtyActionBtn}>
                            <Ionicons name="add" size={14} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          onPress={() => handleUpdateCart(product, 1)} 
                          style={styles.addButton}
                        >
                          <Ionicons name="add" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.productImgContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImg} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              </TouchableOpacity>
            </AnimatedReanimated.View>
          ))}
        </View>

        <View style={{ height: 150 }} />
      </Animated.ScrollView>

      {/* Modern Floating Cart Bar */}
      {totalItems > 0 && (
        <AnimatedReanimated.View 
          entering={FadeInDown.springify()}
          style={styles.cartBarFloating}
        >
          <LinearGradient
            colors={[COLORS.primary, '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cartGradient}
          >
            <View style={styles.cartLeft}>
              <View style={styles.cartIconCircle}>
                <Ionicons name="cart" size={22} color={COLORS.white} />
                <View style={styles.badgeAbsolute}>
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              </View>
              <View style={styles.cartPriceBox}>
                <Text style={styles.cartPriceValue}>{totalAmount.toLocaleString()}đ</Text>
                <Text style={styles.cartPriceLabel}>Giao hàng nhanh</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.checkoutAction}
              onPress={() => router.push('/cart')}
            >
              <Text style={styles.checkoutActionText}>Giỏ hàng</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </AnimatedReanimated.View>
      )}
    </View>
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
    zIndex: 1000,
    ...SHADOW.md,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerImageContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActionsOverlay: {
    height: 100,
    zIndex: 10,
  },
  headerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  blurCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
  },
  infoCardWrapper: {
    marginTop: HEADER_HEIGHT - 120,
    paddingHorizontal: 20,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 24,
    ...SHADOW.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  storeMainInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  promoBadgeSmall: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  promoBadgeTextSmall: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
  },
  storeName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  deliveryInfo: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 35,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    paddingRight: 12,
  },
  productHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  hotBadge: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  hotText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 2,
  },
  productDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 15,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    gap: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  oldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addControl: {
    height: 40,
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  qtyActionBtn: {
    padding: 8,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  productImgContainer: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  cartBarFloating: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  cartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    ...SHADOW.lg,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAbsolute: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0369A1',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  cartPriceBox: {
    marginLeft: 15,
  },
  cartPriceValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.white,
  },
  cartPriceLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 1,
  },
  checkoutAction: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
  },
  checkoutActionText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 15,
    marginRight: 6,
  },
});
