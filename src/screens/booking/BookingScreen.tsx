import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { useCart } from '@/store/CartContext';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Search, X, ChevronRight, Ticket } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [destination, setDestination] = useState((params.destination as string) || '');
  const [vehicleOptions, setVehicleOptions] = useState<any[]>([]);
  
  const pickup = "Cầu Rồng, Hải Châu, Đà Nẵng"; 
  const appliedPromo = params.promoCode as string;

  // Gọi API lấy giá khi destination thay đổi
  const fetchPricing = async (dest: string) => {
    if (dest.length < 3) return;
    setPricingLoading(true);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      const response = await fetch('https://admin.datxedulich.vip/api/customer/drivers/nearby', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ pickup_location: pickup, destination_location: dest }),
      });
      const data = await response.json();
      
      // Giả định response trả về danh sách xe hoặc đối tượng chứa danh sách xe
      const vehicles = data.vehicles || data.data || data; 
      
      if (response.ok && Array.isArray(vehicles)) {
        setVehicleOptions(vehicles);
        if (vehicles.length > 0) setSelectedType(vehicles[0].id);
      }
    } catch (error) {
      console.error('Fetch Pricing Error:', error);
    } finally {
      setPricingLoading(false);
    }
  };

  // Debounce việc gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destination) fetchPricing(destination);
    }, 500);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleConfirmRide = async () => {
    if (!destination) {
      showToast({ message: 'Vui lòng nhập điểm đến', type: 'error' });
      return;
    }

    const selectedVan = vehicleOptions.find(v => v.id === selectedType);
    if (!selectedVan) {
      showToast({ message: 'Vui lòng chọn loại xe', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      if (!token) {
        showToast({ message: 'Vui lòng đăng nhập để đặt xe', type: 'error' });
        router.replace('/send-otp');
        return;
      }

      const response = await fetch('https://admin.datxedulich.vip/api/customer/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          pickup_location: pickup,
          destination_location: destination,
          vehicle_type: selectedType,
          total_price: selectedVan.price,
          promo_code: appliedPromo || null,
          payment_method: 'cash',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({ message: 'Đặt xe thành công! Tài xế đang đến.', type: 'success' });
        setTimeout(() => router.replace('/history'), 1500);
      } else {
        showToast({ message: data.message || 'Đặt xe thất bại', type: 'error' });
      }
    } catch (error) {
      showToast({ message: 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <WebView
          originWhitelist={['*']}
          source={{ 
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>body { margin: 0; padding: 0; } #map { height: 100vh; width: 100vw; }</style>
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                </head>
                <body>
                  <div id="map"></div>
                  <script>
                    var map = L.map('map').setView([16.047079, 108.206230], 15);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(map);
                    L.marker([16.047079, 108.206230]).addTo(map).bindPopup('Điểm đón');
                  </script>
                </body>
              </html>
            ` 
          }}
          style={{ flex: 1 }}
        />
      </View>
      {/* Modern Integrated Header */}
      <View style={styles.topHeaderArea}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={styles.backAction} 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
            >
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Xác nhận hành trình</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.journeyWrapper}>
            <View style={styles.pathIconBox}>
              <View style={styles.dotStart} />
              <View style={styles.dashedLine} />
              <View style={styles.dotEnd} />
            </View>
            
            <View style={styles.inputsBox}>
              <TouchableOpacity style={styles.inputRow}>
                <Text style={styles.labelSmall}>ĐÓN TẠI</Text>
                <Text style={styles.textMain} numberOfLines={1}>{pickup}</Text>
              </TouchableOpacity>
              
              <View style={styles.thinDivider} />
              
              <View style={styles.inputRow}>
                <Text style={styles.labelSmall}>ĐẾN ĐÂU?</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.fieldMain}
                    placeholder="Nhập điểm đến của bạn"
                    value={destination}
                    onChangeText={setDestination}
                    autoFocus={!destination}
                    placeholderTextColor="#9E9E9E"
                  />
                  {destination ? (
                    <TouchableOpacity onPress={() => setDestination('')} style={styles.clearBtn}>
                      <X size={16} color="#757575" />
                    </TouchableOpacity>
                  ) : (
                    <Search size={18} color={COLORS.primary} strokeWidth={2.5} />
                  )}
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandleBox}>
          <View style={styles.dragHandle} />
        </View>
        
        <View style={styles.sheetTitleArea}>
          <Text style={styles.sheetTitleText}>Dịch vụ xe 16 chỗ</Text>
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>2 sẵn có</Text>
          </View>
        </View>
        
        <ScrollView style={styles.carScrollList} showsVerticalScrollIndicator={false}>
          {vehicleOptions && vehicleOptions.length > 0 ? (
            vehicleOptions.map((type, index) => {
              const isActive = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id || index}
                  onPress={() => setSelectedType(type.id)}
                  style={[styles.carCard, isActive && styles.carCardActive]}
                >
                  <View style={[styles.carIconBox, isActive && styles.carIconBoxActive]}>
                    <Text style={styles.carEmojiText}>🚐</Text>
                  </View>
                  <View style={styles.carDetails}>
                    <View style={styles.carTopRow}>
                      <Text style={styles.carNameText}>{type.name || 'Xe 16 chỗ'}</Text>
                      <Text style={styles.carPriceText}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(type.price || 0)}
                      </Text>
                    </View>
                    <Text style={styles.carDescText}>Sẵn sàng đón bạn sau 5 phút</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#757575' }}>Không có xe nào khả dụng</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomFooter}>
          <View style={styles.quickOptions}>
            <TouchableOpacity style={styles.methodBtn}>
              <View style={styles.cashIcon}>
                <Text style={styles.cashIconText}>$</Text>
              </View>
              <Text style={styles.methodLabel}>Tiền mặt</Text>
              <ChevronRight size={14} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.promoBtn, appliedPromo && styles.promoBtnActive]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Ticket size={18} color={appliedPromo ? COLORS.primary : "#757575"} />
              <Text style={[styles.promoLabel, appliedPromo && styles.promoLabelActive]}>
                {appliedPromo ? appliedPromo : 'Ưu đãi'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtn, loading && styles.disabledBtn]}
            onPress={handleConfirmRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmBtnText}>Xác nhận đặt xe</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  map: {
    width: width,
    height: height,
  },
  pickupMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 177, 79, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  topHeaderArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOW.md,
    shadowOpacity: 0.08,
    zIndex: 100,
  },
  safeArea: {
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
    marginTop: Platform.OS === 'android' ? 35 : 0,
  },
  backAction: {
    padding: 4,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  journeyWrapper: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  pathIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    marginRight: 16,
  },
  dotStart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  dotEnd: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  dashedLine: {
    width: 1,
    height: 35,
    backgroundColor: '#EEEEEE',
    marginVertical: 4,
  },
  inputsBox: {
    flex: 1,
  },
  inputRow: {
    paddingVertical: 2,
  },
  labelSmall: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '800',
    marginBottom: 4,
  },
  textMain: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  thinDivider: {
    height: 1,
    backgroundColor: '#F8F8F8',
    marginVertical: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldMain: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...SHADOW.lg,
    shadowOpacity: 0.2,
    zIndex: 100,
  },
  dragHandleBox: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#EBEBEB',
    borderRadius: 2,
  },
  sheetTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  serviceBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  serviceBadgeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  carScrollList: {
    maxHeight: 220,
    paddingHorizontal: 16,
  },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  carCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  carIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  carIconBoxActive: {
    backgroundColor: COLORS.primary + '15',
  },
  carEmojiText: {
    fontSize: 26,
  },
  carDetails: {
    flex: 1,
  },
  carTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  carNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  carPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  carDescText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  bottomFooter: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  quickOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  cashIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cashIconText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
  },
  promoBtnActive: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  promoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#757575',
    marginLeft: 6,
  },
  promoLabelActive: {
    color: COLORS.primary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
});
