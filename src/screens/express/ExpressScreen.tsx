import { useToast } from '@/components/Toast';
import { POPULAR_DESTINATIONS, type PlaceSuggestion } from '@/constants/data';
import { COLORS, SHADOW } from '@/constants/theme';
import { geocodeByText, searchAddressSuggestions } from '@/services/addressSearch';
import { deliveryService, type VehicleQuote } from '@/services/deliveryService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const formatMoney = (val: number) => Math.round(val).toLocaleString('vi-VN');

export default function ExpressScreen() {
  console.log('[ExpressScreen] Component rendered');
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState('economy');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageType, setPackageType] = useState('');
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [pickup, setPickup] = useState('255 Hùng Vương, Đà Nẵng');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [pickupFocused, setPickupFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [destSuggestionsLoading, setDestSuggestionsLoading] = useState(false);

  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [vehicleQuotes, setVehicleQuotes] = useState<VehicleQuote[]>([]);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  const destInputRef = useRef<TextInput>(null);
  const destFetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  const matchingPopular = destination
    ? POPULAR_DESTINATIONS.filter(
        (item) =>
          item.structured_formatting.main_text.toLowerCase().includes(destination.toLowerCase()) ||
          item.description.toLowerCase().includes(destination.toLowerCase())
      )
    : [];

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const result = await geocodeByText(address);
    if (result) {
      return { lat: result.latitude, lng: result.longitude };
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const { latitude, longitude } = loc.coords;
        setPickupCoords({ lat: latitude, lng: longitude });

        const fetchNominatim = async (): Promise<string> => {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 3000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=vi`,
            { headers: { 'User-Agent': 'VanBookingApp/2.0' }, signal: ctrl.signal }
          );
          clearTimeout(t);
          const text = await res.text();
          if (text.startsWith('<')) return '';
          const data = JSON.parse(text);
          if (data?.address) {
            const a = data.address;
            const houseNo = a.house_number || '';
            const road = a.road || a.pedestrian || a.footway || '';
            const quarter = a.quarter || a.suburb || a.neighbourhood || '';
            const district = a.city_district || a.county || '';
            const city = a.city || a.town || a.village || '';
            return [[houseNo, road].filter(Boolean).join(' '), quarter, district, city].filter(Boolean).join(', ');
          }
          return '';
        };

        const fetchOverpass = async (): Promise<string> => {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 5000);
          const query = `[out:json][timeout:5];(node(around:80,${latitude},${longitude})["addr:housenumber"]["addr:street"];way(around:80,${latitude},${longitude})["addr:housenumber"]["addr:street"];);out center 1;`;
          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
            signal: ctrl.signal,
          });
          clearTimeout(t);
          const text = await res.text();
          if (text.startsWith('<')) return '';
          const data = JSON.parse(text);
          if (data?.elements?.length > 0) {
            const tags = data.elements[0].tags || {};
            return [[tags['addr:housenumber'] || '', tags['addr:street'] || ''].filter(Boolean).join(' '), tags['addr:suburb'] || tags['addr:quarter'] || '', tags['addr:district'] || '', tags['addr:city'] || ''].filter(Boolean).join(', ');
          }
          return '';
        };

        const hasHouseNumber = (addr: string) => /^\d/.test(addr.trim());

        const [nominatimRes, overpassRes] = await Promise.allSettled([fetchNominatim(), fetchOverpass()]);
        const nominatimAddr = nominatimRes.status === 'fulfilled' ? nominatimRes.value : '';
        const overpassAddr = overpassRes.status === 'fulfilled' ? overpassRes.value : '';

        let formattedAddress =
          (hasHouseNumber(overpassAddr) ? overpassAddr : '') ||
          (hasHouseNumber(nominatimAddr) ? nominatimAddr : '') ||
          overpassAddr || nominatimAddr;

        if (!formattedAddress) {
          try {
            const expoAddr = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (expoAddr.length > 0) {
              const a = expoAddr[0];
              formattedAddress = [[a.streetNumber, a.street].filter(Boolean).join(' '), a.district, a.city].filter(Boolean).join(', ');
            }
          } catch (_) {}
        }

        if (formattedAddress) {
          setPickup(formattedAddress);
        }
      } catch (e) {
        console.log('Location error:', e);
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let token = null;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('access_token');
        } else {
          token = await SecureStore.getItemAsync('access_token');
        }
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        };

        const payRes = await fetch('https://admin.datxedulich.vip/api/customer/payments', { headers });
        const payData = await payRes.json();
        if (payRes.ok && payData.data) {
          setPaymentMethods(payData.data);
          if (payData.data.length > 0) setSelectedPayment(payData.data[0]);
        }

        const promoRes = await fetch('https://admin.datxedulich.vip/api/customer/promotions/applicable', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        const promoData = await promoRes.json();
        if (promoRes.ok && promoData.data) {
          setPromotions(promoData.data);
        }
      } catch (e) {
        console.error('[ExpressScreen] Failed to fetch payments/promos:', e);
      }
    })();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = loc.coords;
      setPickupCoords({ lat: latitude, lng: longitude });

      const fetchNominatim = async (): Promise<string> => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=vi`,
          { headers: { 'User-Agent': 'VanBookingApp/2.0' }, signal: ctrl.signal }
        );
        clearTimeout(t);
        const text = await res.text();
        if (text.startsWith('<')) return '';
        const data = JSON.parse(text);
        if (data?.address) {
          const a = data.address;
          return [[a.house_number || '', a.road || a.pedestrian || ''].filter(Boolean).join(' '), a.quarter || a.suburb || '', a.city_district || a.county || '', a.city || a.town || ''].filter(Boolean).join(', ');
        }
        return '';
      };

      const fetchOverpass = async (): Promise<string> => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const query = `[out:json][timeout:5];(node(around:80,${latitude},${longitude})["addr:housenumber"]["addr:street"];way(around:80,${latitude},${longitude})["addr:housenumber"]["addr:street"];);out center 1;`;
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal: ctrl.signal,
        });
        clearTimeout(t);
        const text = await res.text();
        if (text.startsWith('<')) return '';
        const data = JSON.parse(text);
        if (data?.elements?.length > 0) {
          const tags = data.elements[0].tags || {};
          return [[tags['addr:housenumber'] || '', tags['addr:street'] || ''].filter(Boolean).join(' '), tags['addr:suburb'] || tags['addr:quarter'] || '', tags['addr:district'] || '', tags['addr:city'] || ''].filter(Boolean).join(', ');
        }
        return '';
      };

      const hasHouseNumber = (addr: string) => /^\d/.test(addr.trim());
      const [nominatimRes, overpassRes] = await Promise.allSettled([fetchNominatim(), fetchOverpass()]);
      const nominatimAddr = nominatimRes.status === 'fulfilled' ? nominatimRes.value : '';
      const overpassAddr = overpassRes.status === 'fulfilled' ? overpassRes.value : '';
      let formattedAddress =
        (hasHouseNumber(overpassAddr) ? overpassAddr : '') ||
        (hasHouseNumber(nominatimAddr) ? nominatimAddr : '') ||
        overpassAddr || nominatimAddr;

      if (!formattedAddress) {
        try {
          const expoAddr = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (expoAddr.length > 0) {
            const a = expoAddr[0];
            formattedAddress = [[a.streetNumber, a.street].filter(Boolean).join(' '), a.district, a.city].filter(Boolean).join(', ');
          }
        } catch (_) {}
      }

      if (formattedAddress) setPickup(formattedAddress);
    } catch (e) {
      console.log('Refresh location error:', e);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchPlaceSuggestions = async (
    text: string,
    setter: (v: PlaceSuggestion[]) => void,
    onLoading?: (loading: boolean) => void,
  ) => {
    if (text.trim().length < 2) {
      setter([]);
      onLoading?.(false);
      return;
    }
    onLoading?.(true);
    try {
      const results = await searchAddressSuggestions(text);
      setter(results);
    } catch (e) {
      setter([]);
    } finally {
      onLoading?.(false);
    }
  };

  const handleDestinationChange = (text: string) => {
    setDestination(text);
    if (destFetchTimer.current) clearTimeout(destFetchTimer.current);
    if (!text.trim()) {
      setDestSuggestions([]);
      setDestSuggestionsLoading(false);
      return;
    }
    destFetchTimer.current = setTimeout(() => {
      fetchPlaceSuggestions(text, setDestSuggestions, setDestSuggestionsLoading);
    }, 300);
  };

  const handleDestinationSubmit = () => {
    setTimeout(() => setDestFocused(false), 200);
    if (destination.trim().length >= 3) {
      setDestination(destination);
      fetchNearbyDrivers(pickup, destination);
    }
  };

  const fetchNearbyDrivers = useCallback(async (pickupAddr: string, dropoffAddr: string, dropoffCoordsParam?: { lat: number; lng: number } | null) => {
    console.log('[ExpressScreen] fetchNearbyDrivers called', { pickupAddr, dropoffAddr, pickupCoords, dropoffCoordsParam });
    if (!pickupAddr.trim() || !dropoffAddr.trim()) {
      console.log('[ExpressScreen] fetchNearbyDrivers skipped - empty address');
      return;
    }
    let lat = pickupCoords?.lat;
    let lng = pickupCoords?.lng;
    if (!lat || !lng) {
      console.log('[ExpressScreen] pickupCoords missing, trying to get location first...');
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        setPickupCoords({ lat, lng });
      } catch (e) {
        console.error('[ExpressScreen] Cannot get location:', e);
        showToast({ message: 'Không thể lấy vị trí hiện tại. Vui lòng bật GPS.', type: 'error' });
        return;
      }
    }
    setNearbyLoading(true);
    try {
      let dLat = dropoffCoordsParam?.lat || dropoffCoords?.lat;
      let dLng = dropoffCoordsParam?.lng || dropoffCoords?.lng;
      if (!dLat || !dLng) {
        console.log('[ExpressScreen] Geocoding dropoff address:', dropoffAddr);
        const coords = await geocodeAddress(dropoffAddr);
        if (coords) {
          dLat = coords.lat;
          dLng = coords.lng;
          setDropoffCoords(coords);
          console.log('[ExpressScreen] Dropoff coords:', coords);
        } else {
          console.warn('[ExpressScreen] Could not geocode dropoff address');
        }
      }
      console.log('[ExpressScreen] Calling deliveryService.findNearby...');
      const res = await deliveryService.findNearby({
        pickup_address: pickupAddr,
        dropoff_address: dropoffAddr,
        pickup_lat: lat,
        pickup_lng: lng,
        dropoff_lat: dLat,
        dropoff_lng: dLng,
        service_type: 'delivery',
        delivery_type: deliveryType,
      });
      console.log('[ExpressScreen] API response:', JSON.stringify(res, null, 2));
      if (res.success && res.data) {
        console.log('[ExpressScreen] Setting vehicleQuotes:', res.data.length, 'vehicles');
        console.log('[ExpressScreen] Vehicle IDs:', res.data.map(v => v.vehicle_type_id));
        setVehicleQuotes(res.data);
        setQuoteId(res.quote_id || null);
        const availableVehicles = res.data.filter(v => v.is_available);
        if (availableVehicles.length > 0 && !availableVehicles.find(v => v.vehicle_type_id === selectedVehicle)) {
          console.log('[ExpressScreen] Auto-selecting first available vehicle:', availableVehicles[0].vehicle_type_id);
          setSelectedVehicle(availableVehicles[0].vehicle_type_id);
        }
      } else {
        console.log('[ExpressScreen] No data in response, clearing vehicleQuotes');
        setVehicleQuotes([]);
        setQuoteId(null);
      }
    } catch (e) {
      console.error('[ExpressScreen] Fetch nearby error:', e);
      setVehicleQuotes([]);
      setQuoteId(null);
    } finally {
      setNearbyLoading(false);
    }
  }, [pickupCoords, deliveryType]);

  const renderSuggestionItem = (item: PlaceSuggestion, icon: 'star' | 'location' = 'location') => (
    <TouchableOpacity
      key={item.place_id}
      style={styles.suggestionItem}
      onPress={() => {
        setDestination(item.description);
        const coords = item.lat && item.lng ? { lat: item.lat, lng: item.lng } : null;
        if (coords) {
          setDropoffCoords(coords);
          console.log('[ExpressScreen] Coords from suggestion:', coords);
        }
        setDestSuggestions([]);
        setDestFocused(false);
        Keyboard.dismiss();
        fetchNearbyDrivers(pickup, item.description, coords);
      }}
    >
      <Ionicons
        name={icon === 'star' ? 'star-outline' : 'location-outline'}
        size={14}
        color={COLORS.primary}
        style={{ marginRight: 8 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.suggestionMain} numberOfLines={1}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        {!!item.structured_formatting?.secondary_text && (
          <Text style={styles.suggestionSub} numberOfLines={1}>
            {item.structured_formatting.secondary_text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    return () => {
      if (destFetchTimer.current) clearTimeout(destFetchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (pickup.trim() && destination.trim()) {
      fetchNearbyDrivers(pickup, destination);
    }
  }, [deliveryType]);

  const handleBook = async () => {
    if (!destination) {
      return;
    }
    if (!receiverName.trim()) {
      showToast({ message: 'Vui lòng nhập tên người nhận', type: 'error' });
      return;
    }
    if (!receiverPhone.trim()) {
      showToast({ message: 'Vui lòng nhập số điện thoại người nhận', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      let dLat = dropoffCoords?.lat;
      let dLng = dropoffCoords?.lng;
      if (!dLat || !dLng) {
        const coords = await geocodeAddress(destination);
        if (coords) {
          dLat = coords.lat;
          dLng = coords.lng;
          setDropoffCoords(coords);
        }
      }
      const nearbyRes = await deliveryService.findNearby({
        pickup_address: pickup,
        dropoff_address: destination,
        pickup_lat: pickupCoords?.lat,
        pickup_lng: pickupCoords?.lng,
        dropoff_lat: dLat,
        dropoff_lng: dLng,
        service_type: 'delivery',
        delivery_type: deliveryType,
      });

      if (!nearbyRes.success || !nearbyRes.quote_id) {
        showToast({ message: nearbyRes.message || 'Không tìm được tài xế nearby', type: 'error' });
        return;
      }

      console.log('[ExpressScreen] Creating order with quote_id:', nearbyRes.quote_id, 'vehicle_type_id:', selectedVehicle, 'typeof:', typeof selectedVehicle);
      const createRes = await deliveryService.createOrder({
        quote_id: nearbyRes.quote_id,
        vehicle_type_id: selectedVehicle,
        pickup_address: pickup,
        dropoff_address: destination,
        payment_method: selectedPayment?.code || 'cash',
        promo_code: selectedPromo?.code || null,
        service_type: 'delivery',
        delivery_type: deliveryType,
        recipient_name: receiverName.trim(),
        recipient_phone: receiverPhone.trim(),
        parcel_description: packageType.trim() || null,
      });

      console.log('[ExpressScreen] Create order response:', JSON.stringify(createRes));

      if (createRes.success && (createRes.data || createRes.booking)) {
        const order = createRes.data || createRes.booking;
        router.push({
          pathname: '/finding-driver',
          params: {
            orderType: 'delivery',
            orderId: String(order.id),
            pickup: pickup,
            dropoff: destination,
            vehicle: String(selectedVehicle),
            price: String(totalPrice),
          },
        });
      } else {
        console.error('[ExpressScreen] Create order failed:', JSON.stringify(createRes));
        showToast({ message: createRes.message || 'Tạo đơn hàng thất bại', type: 'error' });
      }
    } catch (error) {
      console.error('[ExpressScreen] Book error:', error);
      showToast({ message: 'Đã xảy ra lỗi. Vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedQuote = vehicleQuotes.find(q => q.vehicle_type_id === selectedVehicle);
  const basePrice = selectedQuote?.final_price || selectedQuote?.estimated_price || 0;
  const discount = selectedQuote?.discount_amount || 0;
  const totalPrice = basePrice;

  console.log('[ExpressScreen] vehicleQuotes:', vehicleQuotes.length, 'selectedVehicle:', selectedVehicle, 'totalPrice:', totalPrice);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Giao hàng</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="information-circle-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Steps */}
          <View style={styles.stepsRow}>
            {[
              { icon: 'cube', label: 'Thông tin', active: true },
              { icon: 'car', label: 'Vận chuyển', active: false },
              { icon: 'card', label: 'Thanh toán', active: false },
            ].map((step, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.stepLine} />}
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, step.active && styles.stepDotActive]}>
                    <Ionicons name={step.icon as any} size={12} color={step.active ? '#fff' : '#94A3B8'} />
                  </View>
                  <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>{step.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
          keyboardShouldPersistTaps="always"
        >
          {/* Location Card - same as BookingScreen */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.cardSection}>
            <View style={styles.locationCard}>
              <View style={styles.pathIconBox}>
                <View style={styles.dotStart} />
                <View style={styles.dashedLine} />
                <View style={styles.dotEnd} />
              </View>

              <View style={styles.inputsBox}>
                {/* ---- Điểm lấy hàng ---- */}
                <View style={styles.locationInputRow}>
                  <Text style={styles.locationLabel}>Điểm lấy hàng</Text>
                  <View style={styles.searchRow}>
                    <TextInput
                      style={styles.fieldMain}
                      placeholder="Nhập lấy hàng của bạn"
                      value={pickup}
                      onChangeText={(t) => {
                        setPickup(t);
                        fetchPlaceSuggestions(t, setPickupSuggestions);
                      }}
                      onFocus={() => setPickupFocused(true)}
                      onBlur={() => setTimeout(() => setPickupFocused(false), 200)}
                      placeholderTextColor="#9E9E9E"
                    />
                    <TouchableOpacity onPress={getCurrentLocation} style={styles.clearBtn}>
                      <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {pickup ? (
                      <TouchableOpacity onPress={() => { setPickup(''); setPickupSuggestions([]); }} style={styles.clearBtn}>
                        <X size={16} color="#757575" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {pickupFocused && pickup && (
                    <View style={styles.suggestionBox}>
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => {
                          setPickupSuggestions([]);
                          setPickupFocused(false);
                        }}
                      >
                        <Ionicons name="pin-outline" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionMain} numberOfLines={1}>
                            Sử dụng địa chỉ đã nhập
                          </Text>
                          <Text style={styles.suggestionSub} numberOfLines={1}>
                            {pickup}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {pickupSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setPickup(item.description);
                            setPickupSuggestions([]);
                            setPickupFocused(false);
                          }}
                        >
                          <Ionicons name="location-outline" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.suggestionMain} numberOfLines={1}>
                              {item.structured_formatting?.main_text || item.description}
                            </Text>
                            <Text style={styles.suggestionSub} numberOfLines={1}>
                              {item.structured_formatting?.secondary_text || ''}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.thinDivider} />

                {/* ---- Điểm giao hàng ---- */}
                <View style={[styles.locationInputRow, destFocused && { zIndex: 1000, overflow: 'visible' }]}>
                  <Text style={styles.locationLabel}>Điểm giao hàng</Text>
                  <View style={styles.searchRow}>
                    <TextInput
                      ref={destInputRef}
                      style={styles.fieldMain}
                      placeholder="Nhập điểm giao hàng của bạn"
                      value={destination}
                      onChangeText={handleDestinationChange}
                      onFocus={() => setDestFocused(true)}
                      onBlur={handleDestinationSubmit}
                      onSubmitEditing={handleDestinationSubmit}
                      placeholderTextColor="#9E9E9E"
                    />
                    {destination ? (
                      <TouchableOpacity
                        onPress={() => { setDestination(''); setDestSuggestions([]); setDestSuggestionsLoading(false); }}
                        style={styles.clearBtn}
                      >
                        <X size={16} color="#757575" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => setDestFocused(true)} style={styles.clearBtn}>
                        <Search size={18} color={COLORS.primary} strokeWidth={2.5} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {destFocused && (
                    <View style={styles.suggestionBox}>
                      <ScrollView
                        style={styles.suggestionScroll}
          contentContainerStyle={{ paddingBottom: 160 }}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={true}
                      >
                        {!destination ? (
                          <>
                            <Text style={styles.suggestionHeader}>ĐIỂM GIAO HÀNG PHỔ BIẾN</Text>
                            {POPULAR_DESTINATIONS.map((item) => renderSuggestionItem(item, 'star'))}
                          </>
                        ) : (
                          <>
                            <TouchableOpacity
                              style={styles.suggestionItem}
                              onPress={() => {
                                const firstSuggestion = destSuggestions[0];
                                const coords = firstSuggestion?.lat && firstSuggestion?.lng
                                  ? { lat: firstSuggestion.lat, lng: firstSuggestion.lng }
                                  : null;
                                if (coords) {
                                  setDropoffCoords(coords);
                                }
                                setDestination(destination);
                                setDestSuggestions([]);
                                setDestFocused(false);
                                Keyboard.dismiss();
                                fetchNearbyDrivers(pickup, destination, coords);
                              }}
                            >
                              <Ionicons name="pin-outline" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.suggestionMain} numberOfLines={1}>
                                  Sử dụng địa chỉ đã nhập
                                </Text>
                                <Text style={styles.suggestionSub} numberOfLines={1}>
                                  {destination}
                                </Text>
                              </View>
                            </TouchableOpacity>

                            {matchingPopular.length > 0 && (
                              <>
                                <Text style={styles.suggestionHeader}>GỢI Ý PHÙ HỢP</Text>
                                {matchingPopular.map((item) => renderSuggestionItem(item, 'star'))}
                              </>
                            )}

                            {destSuggestionsLoading && (
                              <View style={styles.suggestionLoading}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                                <Text style={styles.suggestionLoadingText}>Đang tìm địa chỉ...</Text>
                              </View>
                            )}

                            {destSuggestions.length > 0 && (
                              <>
                                <Text style={styles.suggestionHeader}>ĐỊA CHỈ TÌM KIẾM</Text>
                                {destSuggestions.map((item) => renderSuggestionItem(item, 'location'))}
                              </>
                            )}

                            {!destSuggestionsLoading &&
                              destSuggestions.length === 0 &&
                              destination.trim().length >= 2 && (
                                <Text style={styles.suggestionEmpty}>
                                  Không tìm thấy gợi ý — bạn có thể dùng địa chỉ đã nhập ở trên
                                </Text>
                              )}
                          </>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Vehicle Selection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phương tiện</Text>
            {nearbyLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
          <View style={styles.vehicleList}>
            {vehicleQuotes.filter(q => q.is_available).length > 0 ? (
              vehicleQuotes.filter(q => q.is_available).map((q) => {
                const isActive = selectedVehicle === q.vehicle_type_id;
                return (
                  <TouchableOpacity
                    key={q.vehicle_type_id}
                    activeOpacity={0.7}
                    disabled={!q.is_available}
                    style={[
                      styles.vehicleCard,
                      isActive && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
                      !q.is_available && { opacity: 0.5 },
                    ]}
                    onPress={() => setSelectedVehicle(q.vehicle_type_id)}
                  >
                    <View style={[styles.vehicleIconWrap, { backgroundColor: COLORS.primary + '15' }]}>
                      <Ionicons name="car" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={[styles.vehicleName, isActive && { color: COLORS.primary }]}>{q.name}</Text>
                      <Text style={styles.vehicleDesc}>{q.description}</Text>
                      {q.is_available ? (
                        <View style={styles.nearbyBadge}>
                          <View style={[styles.nearbyDot, { backgroundColor: '#16A34A' }]} />
                          <Text style={styles.nearbyText}>
                            {q.eta_minutes != null ? `~${q.eta_minutes} phút` : 'Sẵn sàng'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.nearbyBadge}>
                          <View style={[styles.nearbyDot, { backgroundColor: '#EF4444' }]} />
                          <Text style={[styles.nearbyText, { color: '#EF4444' }]}>Không khả dụng</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.vehicleRight}>
                      {q.discount_amount > 0 && (
                        <Text style={styles.oldPrice}>{formatMoney(q.estimated_price)}đ</Text>
                      )}
                      <Text style={styles.vehiclePriceValue}>{formatMoney(q.final_price)}đ</Text>
                    </View>
                    {isActive && (
                      <View style={[styles.checkCircle, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '500' }}>
                  {nearbyLoading ? 'Đang tải danh sách phương tiện...' : 'Chọn địa điểm để xem phương tiện'}
                </Text>
              </View>
            )}
          </View>

          {/* Package Info */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          </View>
          <View style={styles.formCard}>
            <View style={styles.formInputRow}>
              <View style={[styles.formInputIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Tên người nhận"
                placeholderTextColor="#94A3B8"
                value={receiverName}
                onChangeText={setReceiverName}
              />
            </View>
            <View style={styles.formDivider} />
            <View style={styles.formInputRow}>
              <View style={[styles.formInputIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="call" size={16} color="#16A34A" />
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Số điện thoại"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
              />
            </View>
            <View style={styles.formDivider} />
            <View style={styles.formInputRow}>
              <View style={[styles.formInputIcon, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="cube" size={16} color="#7C3AED" />
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Loại hàng hóa (Đồ ăn, Quần áo...)"
                placeholderTextColor="#94A3B8"
                value={packageType}
                onChangeText={setPackageType}
              />
            </View>
          </View>

          {/* Delivery Speed */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tốc độ giao</Text>
          </View>
          <View style={styles.speedRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.speedCard, deliveryType === 'express' && styles.speedCardActive]}
              onPress={() => setDeliveryType('express')}
            >
              {deliveryType === 'express' && (
                <View style={styles.speedCheckBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <View style={[styles.speedIconWrap, deliveryType === 'express' && styles.speedIconWrapActive]}>
                <Ionicons name="flash" size={22} color={deliveryType === 'express' ? '#fff' : COLORS.primary} />
              </View>
              <Text style={[styles.speedLabel, deliveryType === 'express' && styles.speedLabelActive]}>Siêu tốc</Text>
              <Text style={[styles.speedDesc, deliveryType === 'express' && styles.speedDescActive]}>Nhận ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.speedCard, deliveryType === 'economy' && styles.speedCardActive]}
              onPress={() => setDeliveryType('economy')}
            >
              {deliveryType === 'economy' && (
                <View style={styles.speedCheckBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <View style={[styles.speedIconWrap, deliveryType === 'economy' && styles.speedIconWrapActive]}>
                <Ionicons name="time" size={22} color={deliveryType === 'economy' ? '#fff' : COLORS.primary} />
              </View>
              <Text style={[styles.speedLabel, deliveryType === 'economy' && styles.speedLabelActive]}>Tiết kiệm</Text>
              <Text style={[styles.speedDesc, deliveryType === 'economy' && styles.speedDescActive]}>2-4 giờ</Text>
            </TouchableOpacity>
          </View>

          {/* Security */}
          <View style={styles.securityBanner}>
            <Ionicons name="shield-checkmark" size={18} color="#16A34A" />
            <Text style={styles.securityText}>Đơn hàng được bảo hiểm 100%</Text>
          </View>
        </ScrollView>

      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
          <View style={styles.footerInner}>
            <View style={styles.priceSection}>
              <View>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <View style={styles.priceRow}>
                  {discount > 0 && <Text style={styles.oldPrice}>{formatMoney(selectedQuote?.estimated_price || 0)}đ</Text>}
                  <Text style={styles.totalPrice}>{formatMoney(totalPrice)}đ</Text>
                </View>
              </View>
            </View>

            <View style={styles.quickOptionsRow}>
              <TouchableOpacity
                style={styles.paymentPill}
                onPress={() => setIsPaymentModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.pillIconBox, { backgroundColor: '#FFF' }]}>
                  <Ionicons
                    name={selectedPayment?.code === 'wallet' ? 'wallet' : 'card'}
                    size={16}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.pillLabel} numberOfLines={1}>
                  {selectedPayment?.name || 'Tiền mặt'}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.promoPill, selectedPromo && styles.promoPillActive]}
                onPress={() => setIsPromoModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="gift"
                  size={16}
                  color={selectedPromo ? '#fff' : COLORS.primary}
                />
                <Text style={[styles.pillLabel, selectedPromo && { color: '#fff' }]} numberOfLines={1}>
                  {selectedPromo ? selectedPromo.code : 'Ưu đãi'}
                </Text>
                <View style={styles.promoDot} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.bookBtn, loading && { opacity: 0.6 }]}
              onPress={handleBook}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.bookBtnText}>Xác nhận & Tìm tài xế</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
      </View>

      {/* Promotion Selection Modal */}
      <Modal
        visible={isPromoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPromoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn mã giảm giá</Text>
              <TouchableOpacity onPress={() => setIsPromoModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {promotions.length > 0 ? promotions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.selectionItem, selectedPromo?.id === item.id && styles.selectionItemActive]}
                  onPress={() => {
                    setSelectedPromo(item);
                    setIsPromoModalVisible(false);
                  }}
                >
                  <View style={styles.promoIconBox}>
                    <Ionicons name="ticket" size={24} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.selectionName}>{item.name || item.code}</Text>
                    <Text style={styles.selectionDesc}>{item.description || `Giảm giá cho chuyến đi của bạn`}</Text>
                  </View>
                  {selectedPromo?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )) : (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="receipt-outline" size={48} color="#E0E0E0" />
                  <Text style={{ marginTop: 10, color: '#9E9E9E' }}>Không có mã giảm giá khả dụng</Text>
                </View>
              )}
              {selectedPromo && (
                <TouchableOpacity
                  style={{ marginTop: 10, alignItems: 'center', padding: 10 }}
                  onPress={() => {
                    setSelectedPromo(null);
                    setIsPromoModalVisible(false);
                  }}
                >
                  <Text style={{ color: COLORS.error, fontWeight: '600' }}>Bỏ chọn mã giảm giá</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Selection Modal */}
      <Modal visible={isPaymentModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentMethods.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.selectionItem, selectedPayment?.id === item.id && styles.selectionItemActive]}
                  onPress={() => {
                    setSelectedPayment(item);
                    setIsPaymentModalVisible(false);
                  }}
                >
                  <Ionicons
                    name={item.code === 'wallet' ? 'wallet-outline' : 'cash-outline'}
                    size={24}
                    color={selectedPayment?.id === item.id ? COLORS.primary : COLORS.text}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.selectionName, selectedPayment?.id === item.id && { color: COLORS.primary }]}>
                      {item.name}
                    </Text>
                    <Text style={styles.selectionDesc}>{item.description || 'Thanh toán khi hoàn thành chuyến đi'}</Text>
                  </View>
                  {selectedPayment?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Header */
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  /* Steps */
  stepsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, marginTop: 8,
  },
  stepItem: { alignItems: 'center' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  stepDotActive: { backgroundColor: '#fff' },
  stepLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  stepLabelActive: { color: '#fff', fontWeight: '800' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 12, marginBottom: 16 },

  /* Card Section */
  cardSection: { paddingHorizontal: 20, marginTop: 20 },

  /* Location Card - same as BookingScreen journeyWrapper */
  locationCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderRadius: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'visible',
    zIndex: 200,
    ...SHADOW.sm,
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
  locationInputRow: {
    paddingVertical: 2,
    zIndex: 100,
    overflow: 'visible',
  },
  locationLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '800',
    marginBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldMain: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  thinDivider: {
    height: 1,
    backgroundColor: '#F8F8F8',
    marginVertical: 10,
  },
  suggestionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 4,
    position: 'relative',
    height: 300,
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
  },
  suggestionScroll: {
    flex: 1,
  },
  suggestionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E9E9E',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionMain: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 1,
  },
  suggestionSub: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '400',
  },
  suggestionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  suggestionLoadingText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  suggestionEmpty: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontStyle: 'italic',
  },

  /* Section */
  sectionHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },

  /* Vehicle */
  vehicleList: { paddingHorizontal: 20, gap: 10 },
  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#F1F5F9', ...SHADOW.sm,
  },
  vehicleIconWrap: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  vehicleInfo: { flex: 1, marginLeft: 12 },
  vehicleName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  vehicleDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  nearbyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nearbyText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },
  vehicleRight: { alignItems: 'flex-end', marginRight: 12 },
  vehiclePrice: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  vehiclePriceValue: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },

  /* Form */
  formCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    marginHorizontal: 20, ...SHADOW.sm,
  },
  formInputRow: { flexDirection: 'row', alignItems: 'center' },
  formInputIcon: {
    width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  formInput: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '600' },
  formDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  /* Speed */
  speedRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 60 },
  speedCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18,
    alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9', ...SHADOW.sm,
    position: 'relative',
  },
  speedCardActive: { borderColor: COLORS.primary, backgroundColor: '#FFF7ED', ...SHADOW.md },
  speedCheckBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  speedIconWrap: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF7ED',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  speedIconWrapActive: { backgroundColor: COLORS.primary },
  speedLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  speedLabelActive: { color: COLORS.primary },
  speedDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  speedDescActive: { color: COLORS.primary, fontWeight: '600' },

  /* Security */
  securityBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#DCFCE7', paddingVertical: 10, marginHorizontal: 20,
    borderRadius: 12, marginTop: 24, gap: 8,
  },
  securityText: { fontSize: 12, color: '#166534', fontWeight: '700' },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...SHADOW.lg,
    shadowOpacity: 0.1,
    paddingBottom: Platform.OS === 'ios' ? 25 : 60,
  },
  footerInner: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  oldPrice: {
    fontSize: 14, color: '#94A3B8', textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  totalLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  totalPrice: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  quickOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 12,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 100,
    flex: 1.2,
    height: 48,
  },
  promoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    borderRadius: 100,
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  promoPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    marginRight: 4,
  },
  promoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  bookBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: { fontSize: 16, fontWeight: '900', color: '#fff', marginRight: 8 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 45 : 35,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F9FAFB',
    backgroundColor: '#F9FAFB',
  },
  selectionItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  selectionName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  selectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* Promo Modal */
  promoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

});
