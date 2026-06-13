import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Dimensions, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { PROMOTIONS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const VEHICLE_TYPES = [
  { id: 'bike', name: 'Xe máy', icon: 'bicycle', iconSet: Ionicons, desc: 'Giao nhanh, kiện hàng nhỏ', price: 15000, color: '#0EA5E9' },
  { id: 'car', name: 'Ô tô', icon: 'car', iconSet: Ionicons, desc: 'Hàng dễ vỡ, kiện vừa', price: 45000, color: '#8B5CF6' },
  { id: 'truck', name: 'Xe tải', icon: 'truck', iconSet: MaterialCommunityIcons, desc: 'Hàng cồng kềnh, kiện lớn', price: 120000, color: '#F59E0B' },
];

const LOCATIONS = [
  { id: '1', name: 'Sân bay Quốc tế Đà Nẵng', address: 'Duy Tân, Hòa Thuận Tây, Hải Châu', icon: 'airplane', iconSet: Ionicons },
  { id: '2', name: 'Lotte Mart Đà Nẵng', address: '6 Nại Nam, Hòa Cường Bắc, Hải Châu', icon: 'bag', iconSet: Ionicons },
  { id: '3', name: 'Cầu Rồng Đà Nẵng', address: 'An Hải Tây, Sơn Trà, Đà Nẵng', icon: 'location', iconSet: Ionicons },
  { id: '4', name: 'Indochina Riverside Mall', address: '74 Bạch Đằng, Hải Châu 1', icon: 'bag', iconSet: Ionicons },
  { id: '5', name: 'Ga Đà Nẵng', address: '791 Hải Phòng, Tam Thuận, Thanh Khê', icon: 'location', iconSet: Ionicons },
  { id: '6', name: 'Biển Mỹ Khê', address: 'Võ Nguyên Giáp, Phước Mỹ, Sơn Trà', icon: 'location', iconSet: Ionicons },
];

export default function ExpressScreen() {
  const [selectedVehicle, setSelectedVehicle] = useState('bike');
  const [deliveryType, setDeliveryType] = useState('instant');
  const [receiverName, setReceiverName] = useState('');
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<typeof PROMOTIONS[0] | null>(null);

  // Location State
  const [pickupLocation, setPickupLocation] = useState('255 Hùng Vương, Đà Nẵng');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [pickingType, setPickingType] = useState<'pickup' | 'dropoff'>('pickup');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: typeof LOCATIONS[0]) => {
    if (pickingType === 'pickup') {
      setPickupLocation(loc.name);
    } else {
      setDropoffLocation(loc.name);
    }
    setIsLocationModalVisible(false);
    setSearchQuery('');
  };

  const basePrice = VEHICLE_TYPES.find(v => v.id === selectedVehicle)?.price || 0;
  const discount = selectedPromo ? 15000 : 0; 
  const totalPrice = Math.max(0, basePrice - discount);
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giao hàng Express</Text>
          <TouchableOpacity style={styles.infoBtn}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Progress Steps */}
          <View style={styles.stepContainer}>
            <View style={styles.stepItemActive}>
              <View style={styles.stepCircleActive}><Ionicons name="cube" size={14} color={COLORS.white} /></View>
              <Text style={styles.stepTextActive}>Thông tin</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}><MaterialCommunityIcons name="truck-delivery" size={14} color={COLORS.textSecondary} /></View>
              <Text style={styles.stepText}>Vận chuyển</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}><Ionicons name="card-outline" size={14} color={COLORS.textSecondary} /></View>
              <Text style={styles.stepText}>Thanh toán</Text>
            </View>
          </View>

          {/* Location Selection */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.locationSection}>
            <View style={styles.locationCard}>
              <View style={styles.locationLine} />
              
              <TouchableOpacity 
                style={styles.locationItem}
                onPress={() => {
                  setPickingType('pickup');
                  setIsLocationModalVisible(true);
                }}
              >
                <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Điểm nhận hàng</Text>
                  <Text style={styles.locationText} numberOfLines={1}>{pickupLocation}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.locationItem}
                onPress={() => {
                  setPickingType('dropoff');
                  setIsLocationModalVisible(true);
                }}
              >
                <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Điểm giao hàng</Text>
                  <Text style={dropoffLocation ? styles.locationText : styles.locationPlaceholder} numberOfLines={1}>
                    {dropoffLocation || 'Bạn muốn giao đến đâu?'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Vehicle Selection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phương tiện vận chuyển</Text>
          </View>
          
          <View style={styles.vehicleWrapper}>
            {VEHICLE_TYPES.map((type) => (
              <TouchableOpacity 
                key={type.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === type.id && { borderColor: type.color, backgroundColor: type.color + '08' }
                ]}
                onPress={() => setSelectedVehicle(type.id)}
              >
                <View style={[styles.vehicleIconBg, { backgroundColor: type.color + '15' }]}>
                  <type.iconSet name={type.icon as any} size={24} color={type.color} />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleName, selectedVehicle === type.id && { color: type.color }]}>{type.name}</Text>
                  <Text style={styles.vehicleDesc}>{type.desc}</Text>
                </View>
                <View style={styles.vehiclePrice}>
                  <Text style={styles.priceLabel}>Chỉ từ</Text>
                  <Text style={styles.priceValue}>{type.price.toLocaleString()}đ</Text>
                </View>
                {selectedVehicle === type.id && (
                  <View style={[styles.selectedCircle, { backgroundColor: type.color }]}>
                    <View style={styles.whiteDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Package Details */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          </View>
          
          <Animated.View entering={FadeInDown.delay(200)} style={styles.formCard}>
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}><Ionicons name="person-outline" size={18} color={COLORS.textSecondary} /></View>
              <TextInput 
                style={styles.input} 
                placeholder="Tên người nhận" 
                value={receiverName}
                onChangeText={setReceiverName}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}><Ionicons name="phone-portrait-outline" size={18} color={COLORS.textSecondary} /></View>
              <TextInput style={styles.input} placeholder="Số điện thoại người nhận" keyboardType="phone-pad" />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}><Ionicons name="cube-outline" size={18} color={COLORS.textSecondary} /></View>
              <TextInput style={styles.input} placeholder="Loại hàng hóa (vd: Đồ ăn, Quần áo...)" />
            </View>
          </Animated.View>

          {/* Delivery Options */}
          <View style={styles.deliveryOptions}>
            <TouchableOpacity 
              style={[styles.optionCard, deliveryType === 'instant' && styles.optionCardActive]}
              onPress={() => setDeliveryType('instant')}
            >
              <Ionicons name="flash" size={20} color={deliveryType === 'instant' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.optionLabel, deliveryType === 'instant' && styles.optionLabelActive]}>Giao siêu tốc</Text>
              <Text style={styles.optionDesc}>Nhận hàng ngay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionCard, deliveryType === 'standard' && styles.optionCardActive]}
              onPress={() => setDeliveryType('standard')}
            >
              <Ionicons name="time-outline" size={20} color={deliveryType === 'standard' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.optionLabel, deliveryType === 'standard' && styles.optionLabelActive]}>Giao tiết kiệm</Text>
              <Text style={styles.optionDesc}>Trong 2-4 giờ</Text>
            </TouchableOpacity>
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            <Text style={styles.securityText}>Đơn hàng của bạn được bảo hiểm 100%</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Payment Section */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.footerInner}
        >
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <View style={styles.priceRow}>
                {selectedPromo && <Text style={styles.oldPrice}>{basePrice.toLocaleString()}đ</Text>}
                <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}đ</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.promoBtn, selectedPromo && styles.promoBtnSelected]} 
              onPress={() => setIsPromoModalVisible(true)}
            >
              <Ionicons name="pricetag-outline" size={16} color={selectedPromo ? COLORS.white : COLORS.primary} />
              <Text style={[styles.promoBtnText, selectedPromo && styles.promoBtnTextSelected]}>
                {selectedPromo ? selectedPromo.code : 'Chọn ưu đãi'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.bookBtn}
            onPress={() => router.push('/finding-driver')}
          >
            <LinearGradient
              colors={[COLORS.primary, '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookBtnGradient}
            >
              <Text style={styles.bookBtnText}>Xác nhận & Tìm tài xế</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Location Modal */}
      <Modal
        visible={isLocationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickingType === 'pickup' ? 'Chọn điểm nhận hàng' : 'Chọn điểm giao hàng'}
              </Text>
              <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Tìm kiếm địa chỉ..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <ScrollView style={styles.locationList}>
              <Text style={styles.listSectionTitle}>Địa điểm phổ biến</Text>
              {filteredLocations.map((loc) => (
                <TouchableOpacity 
                  key={loc.id} 
                  style={styles.locationItemRow}
                  onPress={() => handleSelectLocation(loc)}
                >
                  <View style={styles.locIconCircle}>
                    <loc.iconSet name={loc.icon as any} size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.locInfoText}>
                    <Text style={styles.locName}>{loc.name}</Text>
                    <Text style={styles.locAddress} numberOfLines={1}>{loc.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Promotion Modal */}
      <Modal
        visible={isPromoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPromoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => setIsPromoModalVisible(false)} 
          />
          <Animated.View entering={SlideInDown} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ưu đãi dành cho bạn</Text>
              <TouchableOpacity onPress={() => setIsPromoModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.promoList}>
              {PROMOTIONS.filter(p => p.type === 'Di chuyển' || p.type === 'Giao hàng').map((promo) => (
                <TouchableOpacity 
                  key={promo.id} 
                  style={[
                    styles.promoItem,
                    selectedPromo?.id === promo.id && styles.promoItemSelected
                  ]}
                  onPress={() => {
                    setSelectedPromo(selectedPromo?.id === promo.id ? null : promo);
                    setIsPromoModalVisible(false);
                  }}
                >
                  <View style={styles.promoImgContainer}>
                    <Image source={{ uri: promo.image }} style={styles.promoImg} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.3)']}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                  <View style={styles.promoInfo}>
                    <Text style={styles.promoItemTitle} numberOfLines={1}>{promo.title}</Text>
                    <Text style={styles.promoItemSubtitle} numberOfLines={1}>{promo.subtitle}</Text>
                    <View style={styles.promoItemFooter}>
                      <Text style={styles.promoExpiry}>{promo.expiry}</Text>
                      <View style={styles.promoCodeBadge}>
                        <Text style={styles.promoCodeText}>{promo.code}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[
                    styles.promoCheck,
                    selectedPromo?.id === promo.id && styles.promoCheckActive
                  ]}>
                    {selectedPromo?.id === promo.id && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyBtn}
              onPress={() => setIsPromoModalVisible(false)}
            >
              <Text style={styles.applyBtnText}>Xong</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  infoBtn: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    paddingHorizontal: 30,
  },
  stepItemActive: {
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...SHADOW.sm,
  },
  stepText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stepTextActive: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '800',
  },
  stepDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
    marginTop: -15,
  },
  locationSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  locationLine: {
    position: 'absolute',
    top: 45,
    left: 28,
    bottom: 45,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
    zIndex: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 15,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleWrapper: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOW.sm,
  },
  vehicleIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  vehicleDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  vehiclePrice: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  priceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 25,
    ...SHADOW.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  deliveryOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 25,
  },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOW.sm,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  optionLabelActive: {
    color: COLORS.primary,
  },
  optionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    ...SHADOW.lg,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
  },
  footerInner: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 8,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  promoBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  promoBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
    marginLeft: 6,
  },
  promoBtnTextSelected: {
    color: COLORS.white,
  },
  bookBtn: {
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bookBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.7,
    padding: 20,
  },
  locationModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.9,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  locationList: {
    flex: 1,
  },
  listSectionTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  locationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  locInfoText: {
    flex: 1,
  },
  locName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  locAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  promoList: {
    flex: 1,
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    ...SHADOW.sm,
  },
  promoItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  promoImgContainer: {
    width: 70,
    height: 70,
    borderRadius: 15,
    overflow: 'hidden',
  },
  promoImg: {
    width: '100%',
    height: '100%',
  },
  promoInfo: {
    flex: 1,
    marginLeft: 15,
  },
  promoItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  promoItemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  promoItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  promoExpiry: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: '700',
  },
  promoCodeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoCodeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },
  promoCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCheckActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    ...SHADOW.md,
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 5,
  },
});
