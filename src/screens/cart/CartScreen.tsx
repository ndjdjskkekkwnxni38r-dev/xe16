import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { useCart, CartItem } from '@/store/CartContext';
import { useUser } from '@/store/UserContext';
import { useToast } from '@/components/Toast';
import Animated, { FadeInRight, FadeOutLeft, Layout, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const { balance, deductBalance } = useUser();
  const { showToast } = useToast();

  const handleCheckout = () => {
    if (balance < totalAmount) {
      showToast({
        message: `Số dư không đủ! Cần thêm ${(totalAmount - balance).toLocaleString()}đ`,
        type: 'error',
        duration: 3000
      });
      return;
    }

    // Process payment from account balance
    const success = deductBalance(totalAmount);
    if (success) {
      showToast({
        message: "Thanh toán thành công từ số dư tài khoản!",
        type: 'success',
        duration: 3000
      });
      clearCart();
      router.replace('/(tabs)');
    } else {
      showToast({
        message: "Có lỗi xảy ra trong quá trình thanh toán.",
        type: 'error'
      });
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Giỏ hàng</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
        
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.emptyContent}>
            <View style={styles.emptyIconWrapper}>
              <LinearGradient
                colors={['#F1F5F9', '#E2E8F0']}
                style={styles.emptyIconBg}
              >
                <Ionicons name="bag-handle-outline" size={80} color="#94A3B8" />
              </LinearGradient>
              <View style={styles.emptyBadge}>
                <Text style={styles.emptyBadgeText}>0</Text>
              </View>
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptySubtitle}>
              Có vẻ như bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng của mình.
            </Text>
            <TouchableOpacity 
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreBtnGradient}
              >
                <Text style={styles.exploreBtnText}>Tiếp tục mua sắm</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>Giỏ hàng</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{items.length}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color="#F43F5E" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.shippingNotice}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={18} color={COLORS.primary} />
          <Text style={styles.shippingText}>
            Bạn đã được <Text style={styles.highlightText}>Miễn phí vận chuyển</Text> cho đơn hàng này!
          </Text>
        </View>

        {items.map((item, index) => (
          <Animated.View 
            key={item.id} 
            layout={Layout.springify()}
            entering={FadeInRight.delay(index * 100)} 
            exiting={FadeOutLeft}
            style={styles.cartItem}
          >
            <View style={styles.itemMain}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.itemImg} />
                <View style={styles.itemTypeTag}>
                  <Text style={styles.itemTypeText}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.itemInfo}>
                <View>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  {item.shopName && (
                    <View style={styles.shopRow}>
                      <Ionicons name="bag-handle-outline" size={12} color="#94A3B8" />
                      <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.itemActions}>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.id, -1)}
                      style={styles.qtyAction}
                    >
                      <Ionicons name="remove" size={14} color={item.quantity > 1 ? COLORS.text : '#CBD5E1'} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.id, 1)}
                      style={styles.qtyAction}
                    >
                      <Ionicons name="add" size={14} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => removeItem(item.id)}
              style={styles.removeItemBtn}
            >
              <Ionicons name="trash-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Promo Code Section */}
        <TouchableOpacity style={styles.promoSection}>
          <View style={styles.promoLeft}>
            <View style={styles.promoIconBg}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.promoTitle}>Mã giảm giá</Text>
              <Text style={styles.promoSubtitle}>Sử dụng mã để tiết kiệm hơn</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionHeader}>Chi tiết thanh toán</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.freeText}>Miễn phí</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>- 0đ</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
          <Text style={styles.guaranteeText}>Giao dịch được bảo mật và an toàn</Text>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={styles.footerGradient}
          pointerEvents="none"
        />
        <View style={styles.footerContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPriceLabel}>Tổng cộng</Text>
            <Text style={styles.totalPriceValue}>{formatPrice(totalAmount)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <LinearGradient
              colors={[COLORS.primary, '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutText}>Thanh toán</Text>
              <View style={styles.checkoutIcon}>
                <Ionicons name="card-outline" size={18} color={COLORS.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9',
    ...SHADOW.sm,
    zIndex: 10
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    height: Platform.OS === 'ios' ? 60 : 70
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: '#F8FAFC',
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  titleWrapper: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  itemCountBadge: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10, 
    marginLeft: 8 
  },
  itemCountText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  clearBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: '#FFF1F2',
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  scrollContent: { padding: 20, paddingBottom: 140 },
  shippingNotice: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F9FF', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0F2FE'
  },
  shippingText: { fontSize: 13, color: '#0369A1', marginLeft: 8, fontWeight: '500' },
  highlightText: { fontWeight: '800', color: COLORS.primary },
  cartItem: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 16, 
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  itemMain: { flexDirection: 'row' },
  imageWrapper: { position: 'relative' },
  itemImg: { width: 90, height: 90, borderRadius: 20, backgroundColor: '#F8FAFC' },
  itemTypeTag: { 
    position: 'absolute', 
    top: -5, 
    left: -5, 
    backgroundColor: '#0F172A', 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 8,
    ...SHADOW.sm
  },
  itemTypeText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  itemInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 2 },
  itemName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  shopName: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  itemActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 17, fontWeight: '900', color: COLORS.primary },
  qtyControl: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  qtyAction: { 
    width: 28, 
    height: 28, 
    borderRadius: 8, 
    backgroundColor: '#FFF', 
    alignItems: 'center', 
    justifyContent: 'center',
    ...SHADOW.xs
  },
  qtyValue: { marginHorizontal: 12, fontSize: 15, fontWeight: '800', color: '#0F172A' },
  removeItemBtn: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    backgroundColor: '#F8FAFC',
    alignItems: 'center', 
    justifyContent: 'center'
  },
  promoSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 24,
    ...SHADOW.sm
  },
  promoLeft: { flexDirection: 'row', alignItems: 'center' },
  promoIconBg: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: '#F0F9FF', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12
  },
  promoTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  promoSubtitle: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  summarySection: { backgroundColor: '#FFF', borderRadius: 28, padding: 20, ...SHADOW.md },
  sectionHeader: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginBottom: 16 },
  summaryContent: { gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  summaryValue: { fontSize: 15, color: '#1E293B', fontWeight: '800' },
  freeText: { fontSize: 14, color: '#10B981', fontWeight: '800' },
  discountValue: { fontSize: 14, color: '#F43F5E', fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  totalLabel: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  totalValue: { fontSize: 22, fontWeight: '950', color: COLORS.primary },
  guaranteeBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 20 
  },
  guaranteeText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContent: { alignItems: 'center', width: '100%', paddingHorizontal: 40 },
  emptyIconWrapper: { position: 'relative', marginBottom: 30 },
  emptyIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  emptyBadge: { 
    position: 'absolute', 
    top: 20, 
    right: 20, 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F9FAFB'
  },
  emptyBadgeText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  emptyTitle: { fontSize: 24, fontWeight: '950', color: '#0F172A', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  exploreBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', ...SHADOW.lg },
  exploreBtnGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 18, 
    gap: 10 
  },
  exploreBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFF', 
    paddingHorizontal: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, 
    paddingTop: 20, 
    ...SHADOW.lg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32
  },
  footerGradient: { 
    position: 'absolute', 
    top: -40, 
    left: 0, 
    right: 0, 
    height: 40 
  },
  footerContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  priceContainer: { flex: 1 },
  totalPriceLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  totalPriceValue: { fontSize: 24, fontWeight: '950', color: COLORS.primary, letterSpacing: -0.5 },
  checkoutButton: { flex: 1.2, borderRadius: 20, overflow: 'hidden', ...SHADOW.md },
  checkoutGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 20,
    gap: 12 
  },
  checkoutText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  checkoutIcon: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});
