import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { TRENDING_PRODUCTS, STORES } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';
import { useCart } from '@/store/CartContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem, items, updateQuantity } = useCart();
  
  const product = TRENDING_PRODUCTS.find((p) => p.id === id);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const cartItem = items.find(i => i.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
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

  const handleUpdateQty = (delta: number) => {
    updateQuantity(product.id, delta);
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewShop = () => {
    const store = STORES.find(s => s.name.toLowerCase().includes(product.storeName.toLowerCase()));
    if (store) {
      router.push(`/mart/${store.id}`);
    } else {
      showToast({ message: "Không tìm thấy cửa hàng này", type: 'info' });
    }
  };

  const handleViewReviews = () => {
    showToast({ message: "Tính năng xem tất cả đánh giá đang được cập nhật", type: 'info' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Buttons */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionCircle} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.actionCircle}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCircle} 
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? COLORS.error : COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Product Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={styles.headerOverlay} />
        </View>

        <View style={styles.contentCard}>
          <View style={styles.dragHandle} />
          
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Sản phẩm bán chạy</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>Còn hàng</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{product.price.toLocaleString()}đ</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FACC15" />
              <Text style={styles.ratingText}>4.8 (1.2k+ đánh giá)</Text>
            </View>
          </View>

          <View style={styles.shopInfoCard}>
            <View style={styles.shopIconContainer}>
              <Ionicons name="bag-handle-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.shopDetails}>
              <Text style={styles.shopLabel}>Cung cấp bởi</Text>
              <Text style={styles.shopName}>{product.storeName}</Text>
            </View>
            <TouchableOpacity style={styles.viewShopBtn} onPress={handleViewShop}>
              <Text style={styles.viewShopText}>Xem shop</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.guaranteeRow}>
            <View style={styles.guaranteeItem}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
              <Text style={styles.guaranteeText}>100% Chính hãng</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="flash" size={18} color="#F59E0B" />
              <Text style={styles.guaranteeText}>Giao nhanh 30p</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
            <Text style={styles.descriptionText}>
              Sản phẩm tươi ngon được tuyển chọn kỹ lưỡng mỗi ngày. Đảm bảo vệ sinh an toàn thực phẩm và giữ trọn vẹn hương vị tự nhiên. Rất phù hợp cho bữa ăn dinh dưỡng của gia đình bạn.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
              <TouchableOpacity onPress={handleViewReviews}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            {/* Mock Review */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatarMock}><Text style={styles.avatarText}>A</Text></View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewerName}>An Nguyễn</Text>
                  <View style={styles.reviewStars}>
                    {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={10} color="#FACC15" />)}
                  </View>
                </View>
                <Text style={styles.reviewDate}>2 ngày trước</Text>
              </View>
              <Text style={styles.reviewContent}>Sản phẩm rất tươi, đóng gói cẩn thận. Giao hàng cực nhanh luôn, ủng hộ shop dài dài!</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity 
              style={[styles.qtyBtn, quantity === 0 && styles.qtyBtnDisabled]} 
              onPress={() => handleUpdateQty(-1)}
              disabled={quantity === 0}
            >
              <Ionicons name="remove" size={20} color={quantity === 0 ? '#CBD5E1' : COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={quantity === 0 ? handleAddToCart : () => handleUpdateQty(1)}
            >
              <Ionicons name="add" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.buyBtn}
            onPress={quantity === 0 ? handleAddToCart : () => router.push('/cart')}
          >
            <LinearGradient
              colors={[COLORS.primary, '#0284C7']}
              style={styles.buyBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyBtnText}>
                {quantity === 0 ? 'Thêm vào giỏ' : 'Xem giỏ hàng'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerActions: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 40, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    zIndex: 10,
    elevation: 5
  },
  actionCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    ...SHADOW.md 
  },
  imageContainer: { width: width, height: 350, backgroundColor: '#F1F5F9' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  contentCard: { 
    flex: 1, 
    backgroundColor: COLORS.white, 
    marginTop: -30, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24,
    ...SHADOW.lg
  },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  categoryBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  categoryText: { color: COLORS.primary, fontSize: 12, fontWeight: '800' },
  stockBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  stockText: { color: COLORS.success, fontSize: 12, fontWeight: '800' },
  productName: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  priceText: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  shopInfoCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  shopIconContainer: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  shopDetails: { flex: 1, marginLeft: 12 },
  shopLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  shopName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  viewShopBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewShopText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  guaranteeRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  guaranteeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guaranteeText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  descriptionText: { fontSize: 15, color: '#475569', lineHeight: 24, fontWeight: '500' },
  viewAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  reviewCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarMock: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: '#64748B' },
  reviewInfo: { flex: 1, marginLeft: 12 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 12, color: '#94A3B8' },
  reviewContent: { fontSize: 14, color: '#475569', lineHeight: 20 },
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: COLORS.white, 
    paddingHorizontal: 20, 
    paddingVertical: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9',
    ...SHADOW.lg,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20
  },
  bottomBarContent: { flexDirection: 'row', gap: 15 },
  qtyContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 18, 
    paddingHorizontal: 5 
  },
  qtyBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled: { opacity: 0.5 },
  qtyText: { fontSize: 18, fontWeight: '800', color: '#1E293B', minWidth: 30, textAlign: 'center' },
  buyBtn: { flex: 1 },
  buyBtnGradient: { height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buyBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' }
});
