import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { RESTAURANTS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';

import { useCart } from '@/store/CartContext';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const restaurant = RESTAURANTS.find(r => r.id === id) || RESTAURANTS[0];
  
  const { items, addItem, updateQuantity: updateGlobalQuantity, totalAmount, totalItems } = useCart();
  const [isLiked, setIsRead] = useState(false);

  const getQuantity = (itemId: string) => {
    return items.find(item => item.id === itemId)?.quantity || 0;
  };

  const handleUpdateQuantity = (item: any, delta: number) => {
    const existingItem = items.find(i => i.id === item.id);
    if (existingItem) {
      updateGlobalQuantity(item.id, delta);
    } else if (delta > 0) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        type: 'food',
        shopName: restaurant.name
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ... rest of hero section ... */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          />
          <SafeAreaView style={styles.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.roundBtn}>
                <Ionicons name="share-social" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roundBtn, { marginLeft: 12 }]} onPress={() => setIsRead(!isLiked)}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? COLORS.error : COLORS.text} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoCard}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <View style={styles.tagRow}>
            {restaurant.tags.map((tag, i) => (
              <Text key={i} style={styles.tagText}>{tag}{i < restaurant.tags.length - 1 ? ' • ' : ''}</Text>
            ))}
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FACC15" />
              <Text style={styles.statValue}>{restaurant.rating}</Text>
              <Text style={styles.statLabel}>(500+)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.statValue}>{restaurant.time}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Ionicons name="location" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statValue}>{restaurant.distance}</Text>
            </View>
          </View>

          <View style={styles.promoBox}>
            <Ionicons name="bag-handle" size={16} color={COLORS.accent} />
            <Text style={styles.promoText}>Giảm 20k cho đơn từ 150k • Nhập mã: VANFOOD</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Thực đơn</Text>
          {restaurant.menu.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                <View style={styles.quantityContainer}>
                  {getQuantity(item.id) > 0 ? (
                    <>
                      <TouchableOpacity 
                        style={styles.qtyBtn} 
                        onPress={() => handleUpdateQuantity(item, -1)}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{getQuantity(item.id)}</Text>
                    </>
                  ) : null}
                  <TouchableOpacity 
                    style={[styles.qtyBtn, styles.addBtn]} 
                    onPress={() => handleUpdateQuantity(item, 1)}
                  >
                    <Ionicons name="add" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <SafeAreaView style={styles.cartFloating}>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <View style={styles.cartLeft}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
              <View>
                <Text style={styles.cartTotalText}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.cartSubText}>Chưa bao gồm phí giao hàng</Text>
              </View>
            </View>
            <View style={styles.cartRight}>
              <Text style={styles.checkoutText}>Xem giỏ hàng</Text>
              <Ionicons name="bag-handle" size={20} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  heroContainer: {
    height: 280,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  heroActions: {
    flexDirection: 'row',
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  infoCard: {
    marginTop: -30,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  promoText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
  },
  qtyText: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cartFloating: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    ...SHADOW.lg,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: COLORS.white,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartTotalText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  cartRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
