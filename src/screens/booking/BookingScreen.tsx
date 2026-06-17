import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from '@/components/Map';
import { useToast } from '@/components/Toast';
import { POPULAR_DESTINATIONS, type PlaceSuggestion } from '@/constants/data';
import { POPULAR_LOCATIONS } from '@/constants/locations';
import { COLORS, SHADOW } from '@/constants/theme';
import { geocodeAddressFallback, getPlaceDetails, searchAddressSuggestions } from '@/services/addressSearch';
import socketService from '@/services/socket';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const DEFAULT_REGION = {
  latitude: 16.047079,
  longitude: 108.206230,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const getDefaultDaNangCoords = () => ({
  latitude: 16.047079,
  longitude: 108.206230,
});

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [destination, setDestination] = useState((params.destination as string) || '');
  const [vehicleOptions, setVehicleOptions] = useState<any[] | null>(null);

  // --- Payments and Promotions State ---
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);

  // Hàm tính giá sau khi áp dụng mã giảm giá
  const getFinalPrice = (basePrice: number) => {
    if (!selectedPromo) return basePrice;
    
    // Giả sử promo.value là số tiền giảm hoặc %
    // Bạn cần điều chỉnh logic này dựa trên cấu trúc API thật của bạn
    const discountValue = parseFloat(selectedPromo.value || 0);
    if (selectedPromo.type === 'percentage') {
      return basePrice * (1 - discountValue / 100);
    } else {
      return Math.max(0, basePrice - discountValue);
    }
  };

  // Tính giá của xe đang chọn
  const activeVehicle = vehicleOptions?.find(v => v.id === selectedType);
  const finalDisplayPrice = activeVehicle ? getFinalPrice(activeVehicle.price) : 0;

  const fetchPaymentsAndPromos = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      // Fetch Payment Methods
      const payRes = await fetch('https://admin.datxedulich.vip/api/customer/payments', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const payText = await payRes.text();
      
      try {
        const payData = JSON.parse(payText);
        if (payRes.ok && payData.data) {
          setPaymentMethods(payData.data);
          if (payData.data.length > 0) setSelectedPayment(payData.data[0]);
        } else {
          console.warn('[BookingScreen] Payments API returned error:', payData);
        }
      } catch (e) {
        console.error('[BookingScreen] Payments Raw Response (Non-JSON):', payText.substring(0, 200));
      }

      // Fetch Applicable Promotions
      const promoRes = await fetch('https://admin.datxedulich.vip/api/customer/promotions/applicable', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Thêm body rỗng cho POST
      });
      const promoText = await promoRes.text();
      console.log('[BookingScreen] Promotions Response Status:', promoRes.status);

      try {
        const promoData = JSON.parse(promoText);
        if (promoRes.ok && promoData.data) {
          setPromotions(promoData.data);
        } else {
          console.warn('[BookingScreen] Promotions API error:', promoRes.status, promoData);
        }
      } catch (e) {
        console.error('[BookingScreen] Failed to parse promotions JSON:', e);
      }
    } catch (error) {
      console.error('[BookingScreen] Error fetching payments/promos:', error);
    }
  };

  useEffect(() => {
    fetchPaymentsAndPromos();
  }, []);

  console.log('[BookingScreen] Initial vehicleOptions:', vehicleOptions);

  // Log whenever vehicleOptions changes
  useEffect(() => {
    console.log('[BookingScreen] vehicleOptions changed:', vehicleOptions);
  }, [vehicleOptions]);

  const [pickup, setPickup] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions]     = useState<any[]>([]);
  const [pickupFocused, setPickupFocused]         = useState(false);
  const [destFocused, setDestFocused]             = useState(false);
  const [destSuggestionsLoading, setDestSuggestionsLoading] = useState(false);

  const destInputRef = useRef<TextInput>(null);
  const destFetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<any>(null);

  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  // Log whenever coordinates change
  useEffect(() => {
    console.log('[BookingScreen] pickupCoords:', pickupCoords);
    console.log('[BookingScreen] destinationCoords:', destinationCoords);
  }, [pickupCoords, destinationCoords]);

  const appliedPromo = params.promoCode as string;

  const matchingPopular = destination
    ? POPULAR_DESTINATIONS.filter(
        (item) =>
          item.structured_formatting.main_text.toLowerCase().includes(destination.toLowerCase()) ||
          item.description.toLowerCase().includes(destination.toLowerCase())
      )
    : [];

    const selectPickup = useCallback(async (address: string, placeId?: string) => {
    console.log('[selectPickup] Called with address:', address);
    setPickup(address);
    setPickupSuggestions([]);
    setPickupFocused(false);

    try {
      // Dùng Nominatim để lấy tọa độ từ địa chỉ
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'VanBookingApp/1.0' } }
      );
      const data = await res.json();
      let coords = null;
      if (data && data.length > 0) {
        coords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      
      if (!coords) {
        coords = await geocodeAddressFallback(address);
      }
      
      if (!coords) {
        coords = getDefaultDaNangCoords();
      }
      
      setPickupCoords(coords);
      setMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      });
    } catch (e) {
      console.error('[selectPickup] Error:', e);
    }
  }, []);

    const selectDestination = useCallback(async (address: string, placeId?: string) => {
    console.log('[selectDestination] Called with address:', address);
    setDestination(address);
    setDestSuggestions([]);
    setDestFocused(false);
    destInputRef.current?.blur();
    Keyboard.dismiss();

    try {
      const normalizedAddress = address.toLowerCase();
      let coords = null;

      // Kiểm tra danh sách địa điểm nổi tiếng trước
      for (const key in POPULAR_LOCATIONS) {
        if (normalizedAddress.includes(key)) {
          coords = POPULAR_LOCATIONS[key];
          console.log('[selectDestination] Found in POPULAR_LOCATIONS:', key, coords);
          break;
        }
      }

      // Nếu không tìm thấy trong danh sách, dùng geocoding
      if (!coords) {
        // Dùng Nominatim để lấy tọa độ từ địa chỉ
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'VanBookingApp/1.0' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          coords = {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          };
          console.log('[selectDestination] Nominatim result:', coords);
        }
      }
      
      if (!coords) {
        coords = await geocodeAddressFallback(address);
        console.log('[selectDestination] Fallback result:', coords);
      }
      
      if (!coords) {
        coords = getDefaultDaNangCoords();
        console.log('[selectDestination] Default result:', coords);
      }
      
      setDestinationCoords(coords);
      console.log('[selectDestination] Final setDestinationCoords:', coords);

      const nextRegion = pickupCoords
        ? {
            latitude: (pickupCoords.latitude + coords.latitude) / 2,
            longitude: (pickupCoords.longitude + coords.longitude) / 2,
            latitudeDelta: Math.max(0.02, Math.abs(pickupCoords.latitude - coords.latitude) * 2.5),
            longitudeDelta: Math.max(0.02, Math.abs(pickupCoords.longitude - coords.longitude) * 2.5),
          }
        : {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          };

      setMapRegion(nextRegion);

      if (pickupCoords) {
        fetchRoute(pickupCoords, coords);
      }
    } catch (e) {
      console.error('[selectDestination] Error:', e);
    }
  }, [pickupCoords]);

  const renderDestSuggestionItem = (item: PlaceSuggestion, icon: 'star' | 'location' = 'location') => (
    <TouchableOpacity
      key={item.place_id}
      style={styles.suggestionItem}
      onPress={() => selectDestination(item.description, item.place_id)}
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

  const fetchRoute = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) => {
    try {
      console.log('[fetchRoute] Using OSRM fallback');
      const osrmResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
      );
      const osrmData = await osrmResponse.json();
      
      if (osrmData.code === 'Ok' && osrmData.routes && osrmData.routes.length > 0) {
        const geometry = osrmData.routes[0].geometry;
        if (geometry && geometry.coordinates) {
          const coords = geometry.coordinates.map((coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
          setRouteCoordinates(coords);
          if (coords.length > 0) {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 120, right: 40, bottom: 240, left: 40 },
              animated: true,
            });
          }
        }
      }
    } catch (e) {
      console.error('[fetchRoute] error:', e);
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
      console.error('fetchPlaceSuggestions error:', e);
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
      selectDestination(destination);
    }
  };

  const getCurrentLocation = async () => {
    console.log('DEBUG: 1. getCurrentLocation triggered!');
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast({ message: 'Cần quyền truy cập vị trí', type: 'error' });
        setLoading(false);
        return;
      }

      // Lấy tọa độ GPS với độ chính xác cao nhất
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = location.coords;
      setPickupCoords({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      });

      // ============================================================
      // Chạy SONG SONG 3 API cùng lúc, lấy kết quả nhanh nhất
      // có chứa số nhà + tên đường
      // ============================================================
      const GOOGLE_KEY = "AIzaSyC6-7Vxt6ycQXeyIE3kVjus3_ZfneXv-T4"; // <= ĐÂY LÀ CHỖ CẦN KIỂM TRA

      // --- Hàm fetch OSM Nominatim ---
      const fetchNominatim = async (): Promise<string> => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=vi`,
          { headers: { 'User-Agent': 'VanBookingApp/1.0' }, signal: ctrl.signal }
        );
        clearTimeout(t);
        const data = await res.json();
        if (data?.address) {
          const a = data.address;
          const houseNo = a.house_number || '';
          const road    = a.road || a.pedestrian || a.footway || a.path || '';
          const quarter = a.quarter || a.suburb || a.neighbourhood || '';
          const district= a.city_district || a.county || '';
          const city    = a.city || a.town || a.village || '';
          const streetLine = [houseNo, road].filter(Boolean).join(' ');
          return [streetLine, quarter, district, city].filter(Boolean).join(', ');
        }
        return '';
      };

      // --- Hàm truy vấn Overpass API — tìm node/building gần nhất có số nhà ---
      const fetchOverpass = async (): Promise<string> => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const query = `
          [out:json][timeout:5];
          (
            node(around:80,${latitude},${longitude})["addr:housenumber"]["addr:street"];
            way(around:80,${latitude},${longitude})["addr:housenumber"]["addr:street"];
          );
          out center 1;
        `;
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal: ctrl.signal,
        });
        clearTimeout(t);
        const data = await res.json();
        if (data?.elements?.length > 0) {
          const el = data.elements[0];
          const tags = el.tags || {};
          const houseNo = tags['addr:housenumber'] || '';
          const street  = tags['addr:street'] || '';
          const ward    = tags['addr:suburb'] || tags['addr:quarter'] || '';
          const district= tags['addr:district'] || tags['addr:county'] || '';
          const city    = tags['addr:city'] || '';
          const streetLine = [houseNo, street].filter(Boolean).join(' ');
          return [streetLine, ward, district, city].filter(Boolean).join(', ');
        }
        return '';
      };

      // --- Chạy song song ---
      const [nominatimRes, overpassRes] = await Promise.allSettled([
        fetchNominatim(),
        fetchOverpass(),
      ]);

      const nominatimAddr = nominatimRes.status === 'fulfilled' ? nominatimRes.value : '';
      const overpassAddr  = overpassRes.status  === 'fulfilled' ? overpassRes.value  : '';

      console.log('DEBUG Nominatim:', nominatimAddr);
      console.log('DEBUG Overpass:', overpassAddr);

      // Hàm kiểm tra xem địa chỉ có chứa số nhà không (bắt đầu bằng số)
      const hasHouseNumber = (addr: string) => /^\d/.test(addr.trim());

      // Ưu tiên: Overpass (chứa số nhà cụ thể) > Nominatim
      let formattedAddress =
        (hasHouseNumber(overpassAddr)  ? overpassAddr  : '') ||
        (hasHouseNumber(nominatimAddr) ? nominatimAddr : '') ||
        overpassAddr || nominatimAddr;

      // Fallback cuối: Expo native geocoder
      if (!formattedAddress) {
        try {
          const expoAddr = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (expoAddr.length > 0) {
            const a = expoAddr[0];
            const streetLine = [a.streetNumber, a.street].filter(Boolean).join(' ');
            formattedAddress = [streetLine, a.district, a.city].filter(Boolean).join(', ');
          }
        } catch (_) {}
      }

      if (formattedAddress) {
        setPickup(formattedAddress);
        console.log('DEBUG Final pickup:', formattedAddress);
      } else {
        showToast({ message: 'Không tìm thấy địa chỉ', type: 'error' });
        setPickup("Cầu Rồng, Hải Châu, Đà Nẵng");
      }
      console.log('DEBUG: pickupCoords set to:', { latitude, longitude });
    } catch (error) {
      console.error('Location Error:', error);
      showToast({ message: 'Không thể lấy vị trí', type: 'error' });
      setPickup("Cầu Rồng, Hải Châu, Đà Nẵng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeBooking = async () => {
      // 1. Lấy vị trí đón
      await getCurrentLocation();
      
      // 2. Nếu có điểm đến trong params, giải mã nó
      let destCoords = null;
      if (params.destination) {
        console.log('[initializeBooking] Destination param found, geocoding:', params.destination);
        destCoords = await selectDestination(params.destination as string);
      }
      
      // 3. Sau khi đảm bảo đã có đủ cả 2 tọa độ (đón + đến), gọi API lấy giá
      // Lưu ý: selectDestination cập nhật state destinationCoords bất đồng bộ,
      // nên chúng ta có thể cần đợi một chút hoặc sử dụng kết quả trả về.
      // Ở đây, tôi sẽ gọi fetchPricing trực tiếp với các giá trị hiện có.
      // Vì `pickupCoords` được set trong `getCurrentLocation` (await), 
      // và `destinationCoords` được set trong `selectDestination` (await).
      
      console.log('[initializeBooking] Finished initialization.');
    };
    initializeBooking();
  }, []);

  // Tự focus ô "ĐẾN ĐÂU?" để hiện gợi ý ngay khi vào màn hình
  useEffect(() => {
    const timer = setTimeout(() => {
      destInputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (destFetchTimer.current) clearTimeout(destFetchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      fetchRoute(pickupCoords, destinationCoords);
    }
  }, [pickupCoords, destinationCoords]);

  // Gọi API lấy giá khi destination thay đổi
  const fetchPricing = async (dest: string) => {
    // if (dest.length < 3) return; // Removed this constraint to ensure API call happens
    setPricingLoading(true);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      // API requires coordinates, not addresses
      if (!pickupCoords || !destinationCoords) {
        console.warn('[fetchPricing] Missing coordinates, skipping API call');
        setVehicleOptions([]);
        return;
      }

      console.log('[fetchPricing] Using coordinates:', {
        pickup: pickupCoords,
        destination: destinationCoords
      });

      const body = {
        pickup_lat: pickupCoords.latitude,
        pickup_lng: pickupCoords.longitude,
        dropoff_lat: destinationCoords.latitude,
        dropoff_lng: destinationCoords.longitude,
        promo_code: selectedPromo?.code || null,
      };
      console.log('[fetchPricing] Sending Body:', body);

      const response = await fetch('https://admin.datxedulich.vip/api/customer/drivers/nearby', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      
      console.log('[fetchPricing] FULL API Response:', JSON.stringify(data, null, 2));
      
      // Map API response format to expected format
      const apiVehicles = data.data || [];
      const rootQuoteId = data.quote_id; 
      
      if (response.ok && Array.isArray(apiVehicles) && apiVehicles.length > 0) {
        // Map API fields to expected format
        const mappedVehicles = apiVehicles.map((v: any) => {
          return {
            id: v.vehicle_type_id?.toString(),
            quote_id: rootQuoteId, // Assign root quote_id to each vehicle
            name: v.name,
            price: v.final_price || v.price || v.estimated_price,
            description: v.description,
            is_available: v.is_available,
            eta_minutes: v.eta_minutes || 5, 
            icon_url: v.icon_url,
          };
        })
        .filter((v: any) => v.is_available !== false) // Filter out unavailable vehicles
        .sort((a: any, b: any) => a.eta_minutes - b.eta_minutes); // Sort by ETA (nearest first)
        
        console.log('[fetchPricing] Mapped & Sorted vehicles:', mappedVehicles);
        
        if (mappedVehicles.length > 0) {
          setVehicleOptions(mappedVehicles);
          setSelectedType(mappedVehicles[0].id);
        } else {
          console.warn('[fetchPricing] No available vehicles after filtering');
          setVehicleOptions([]);
        }
      } else {
        console.warn('[fetchPricing] API không trả về xe, response:', response.status, 'data:', data);
        setVehicleOptions([]);
      }
    } catch (error) {
      console.error('[fetchPricing] API Error:', error);
      setVehicleOptions([]);
    } finally {
      setPricingLoading(false);
    }
  };

  // Gọi API lấy giá khi destinationCoords, pickupCoords hoặc selectedPromo thay đổi
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered. State check:');
    console.log(' - destinationCoords:', destinationCoords);
    console.log(' - pickupCoords:', pickupCoords);
    console.log(' - selectedPromo:', selectedPromo);
    
    if (destinationCoords && pickupCoords) {
      console.log('[DEBUG] Both coords present, calling fetchPricing.');
      fetchPricing(destination);
    } else {
      console.log('[DEBUG] Missing coords, skipping fetchPricing.');
    }
  }, [destinationCoords, pickupCoords, selectedPromo]);

  // Dọn dẹp socket khi component unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleConfirmRide = async () => {
    console.log('[handleConfirmRide] Starting...');
    console.log('[handleConfirmRide] Current pickup:', pickup);
    console.log('[handleConfirmRide] Current destination:', destination);

    if (!pickup) {
        console.log('[handleConfirmRide] Error: Pickup address missing');
        showToast({ message: 'Vui lòng nhập điểm đón', type: 'error' });
        return;
    }

    if (!destination) {
      console.log('[handleConfirmRide] Error: Destination missing');
      showToast({ message: 'Vui lòng nhập điểm đến', type: 'error' });
      return;
    }

    console.log('[handleConfirmRide] selectedType:', selectedType);
    console.log('[handleConfirmRide] vehicleOptions:', vehicleOptions);
    const selectedVan = vehicleOptions?.find(v => v.id === selectedType);
    
    if (!selectedVan) {
      console.log('[handleConfirmRide] Error: Van not found or not selected');
      showToast({ message: 'Vui lòng chọn loại xe', type: 'error' });
      return;
    }

    console.log('[handleConfirmRide] Selected Van:', selectedVan);
    setLoading(true);
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      if (!token) {
        console.log('[handleConfirmRide] Error: Token missing');
        showToast({ message: 'Vui lòng đăng nhập để đặt xe', type: 'error' });
        router.replace('/send-otp');
        return;
      }

      const bodyData = {
        pickup_address: pickup,
        dropoff_address: destination,
        vehicle_type_id: selectedType,
        quote_id: selectedVan.quote_id,
        total_price: getFinalPrice(selectedVan.price),
        promo_code: selectedPromo?.code || appliedPromo || null,
        payment_method: selectedPayment?.code || 'cash',
      };
      console.log('[handleConfirmRide] Sending Booking Body:', bodyData);

      const response = await fetch('https://admin.datxedulich.vip/api/customer/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      console.log('[handleConfirmRide] Booking API Response:', response.status, data);

      if (response.ok) {
        console.log('[handleConfirmRide] SUCCESS response data:', JSON.stringify(data, null, 2));

        // Attempt to find booking ID in every possible field mentioned or common in Laravel
        const bookingId = 
          data.data?.id || 
          data.id || 
          data.booking_id || 
          data.data?.booking_id ||
          data.booking?.id ||
          data.data?.booking?.id ||
          (typeof data.data === 'number' ? data.data : null) ||
          (typeof data.id === 'number' ? data.id : null);
        
        console.log('[handleConfirmRide] Final extracted bookingId:', bookingId);
        
        if (bookingId) {
          showToast({ message: 'Đang tìm tài xế cho bạn...', type: 'success' });
          
          // Use absolute path for reliable redirection
          const targetPath = `/activity/tracking/${bookingId}`;
          console.log('[handleConfirmRide] Redirecting to:', targetPath);
          
          // Small delay to let the toast show and ensure state is stable
          setTimeout(() => {
            router.replace(targetPath as any);
          }, 500);
        } else {
          // If we reach here, it means response was 200 OK but we couldn't find an ID
          console.error('[handleConfirmRide] SUCCESS but NO ID. Response:', data);
          showToast({ 
            message: 'Đặt xe thành công! Không tìm thấy mã đơn, đang chuyển đến lịch sử.', 
            type: 'info' 
          });
          setTimeout(() => router.replace('/history'), 2000);
        }
      } else {
        showToast({ message: data.message || 'Đặt xe thất bại', type: 'error' });
      }
    } catch (error) {
      console.error('[handleConfirmRide] Catch error:', error);
      showToast({ message: 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS !== 'web' ? PROVIDER_GOOGLE : undefined}
          region={mapRegion}
          showsUserLocation
          scrollEnabled={!destFocused}
          zoomEnabled={!destFocused}
        >
          {pickupCoords && (
            <Marker coordinate={pickupCoords} />
          )}
          {destinationCoords && (
            <Marker coordinate={destinationCoords} />
          )}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={COLORS.primary}
            />
          )}
        </MapView>
        {destFocused && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 500, backgroundColor: 'transparent' }]} />
        )}
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
              {/* ---- ĐÓN TẠI ---- */}
              <View style={styles.inputRow}>
                <Text style={styles.labelSmall}>ĐÓN TẠI</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.fieldMain}
                    placeholder="Nhập số nhà, tên đường..."
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
                {/* Dropdown gợi ý địa chỉ đón */}
                {pickupFocused && pickup && (
                  <View style={styles.suggestionBox}>
                    {/* Sử dụng địa chỉ đã nhập */}
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => {
                        setPickup(pickup);
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
                          selectPickup(item.description, item.place_id);
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

              {/* ---- ĐẾN ĐÂU? ---- */}
              <View style={[styles.inputRow, destFocused && styles.inputRowFocused, { zIndex: 9999, overflow: 'visible' }]}>
                <Text style={styles.labelSmall}>ĐẾN ĐÂU?</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    ref={destInputRef}
                    style={styles.fieldMain}
                    placeholder="Nhập điểm đến của bạn"
                    value={destination}
                    onChangeText={handleDestinationChange}
                    onFocus={() => setDestFocused(true)}
                    onBlur={handleDestinationSubmit}
                    onSubmitEditing={handleDestinationSubmit}
                    placeholderTextColor="#9E9E9E"
                  />
                  {destination ? (
                    <TouchableOpacity
                      onPress={() => {
                        setDestination('');
                        setDestSuggestions([]);
                        setDestSuggestionsLoading(false);
                      }}
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
                      contentContainerStyle={{ paddingBottom: 20 }}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="always"
                      showsVerticalScrollIndicator={true}
                    >
                      {!destination ? (
                        <>
                          <Text style={styles.suggestionHeader}>ĐIỂM ĐẾN PHỔ BIẾN</Text>
                          {POPULAR_DESTINATIONS.map((item) => renderDestSuggestionItem(item, 'star'))}
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => selectDestination(destination)}
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
                              {matchingPopular.map((item) => renderDestSuggestionItem(item, 'star'))}
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
                              {destSuggestions.map((item) => renderDestSuggestionItem(item, 'location'))}
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
            </SafeAreaView>
            </View>

            <View style={styles.bottomSheet}>
        <View style={styles.dragHandleBox}>
          <View style={styles.dragHandle} />
        </View>
        
        <ScrollView 
          style={styles.carScrollList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {selectedType ? (
            // View thu gọn khi đã chọn xe
            <TouchableOpacity 
              style={[styles.vCard, styles.vCardActive]}
              onPress={() => setSelectedType(null)}
            >
              <View style={styles.vImageContainer}>
                  <Ionicons name="car-outline" size={30} color={COLORS.primary} />
              </View>
              <View style={styles.vInfoContainer}>
                <Text style={[styles.vNameText, styles.textPrimary]}>
                  {vehicleOptions?.find(v => v.id === selectedType)?.name || 'Xe đã chọn'}
                </Text>
                <Text style={styles.vDescText}>Nhấn để thay đổi loại xe</Text>
              </View>
              <View style={styles.vPriceContainer}>
                <Text style={[styles.vPriceText, styles.textPrimary]}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(getFinalPrice(vehicleOptions?.find(v => v.id === selectedType)?.price || 0))}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            // Danh sách đầy đủ khi chưa chọn xe
            vehicleOptions && vehicleOptions.length > 0 ? (
              vehicleOptions.map((type, index) => {
                const isActive = selectedType === type.id;
                
                const iconPath = type.icon_url;
                let finalIconUrl = null;
                
                if (iconPath) {
                  if (iconPath.startsWith('http')) {
                    finalIconUrl = iconPath;
                  } else {
                    const clean = iconPath.replace(/^\//, '');
                    finalIconUrl = `https://admin.datxedulich.vip/${clean}`;
                  }
                }

                return (
                  <TouchableOpacity
                    key={type.id || index}
                    onPress={() => setSelectedType(type.id)}
                    style={[styles.vCard, isActive && styles.vCardActive]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.vImageContainer}>
                        {finalIconUrl ? (
                          <Image 
                            source={{ uri: finalIconUrl }} 
                            style={styles.vImage} 
                            resizeMode="contain" 
                          />
                        ) : (
                          <View style={styles.vNoImageBox}>
                            <Ionicons name="bus-outline" size={30} color={isActive ? COLORS.primary : "#94A3B8"} />
                          </View>
                        )}
                    </View>
                    
                    <View style={styles.vInfoContainer}>
                      <View style={styles.vNameRow}>
                        <Text style={[styles.vNameText, isActive && styles.textPrimary]} numberOfLines={1}>
                          {type.name || 'Loại xe'}
                        </Text>
                        {index === 0 && (
                          <View style={styles.vBadge}>
                            <Text style={styles.vBadgeText}>TỐT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.vDescText} numberOfLines={1}>
                          {type.description || 'Chỗ ngồi thoải mái'}
                      </Text>
                      <View style={styles.vEtaRow}>
                          <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                          <Text style={styles.vEtaText}>{type.eta_minutes || 5} phút</Text>
                      </View>
                    </View>

                    <View style={styles.vPriceContainer}>
                      <Text style={[styles.vPriceText, isActive && styles.textPrimary]}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(getFinalPrice(type.price || 0))}
                      </Text>
                      {selectedPromo && (
                        <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: 'bold' }}>
                          Đã giảm giá
                        </Text>
                      )}
                      <View style={[styles.vRadio, isActive && styles.vRadioActive]} />
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyCarState}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.emptyCarText}>{vehicleOptions === null ? 'Đang tìm xe gần bạn...' : 'Không tìm thấy xe phù hợp'}</Text>
              </View>
            )
          )}
        </ScrollView>

        <View style={styles.bottomFooterPremium}>
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
                color={selectedPromo ? COLORS.white : COLORS.primary} 
              />
              <Text style={[styles.pillLabel, selectedPromo && styles.textWhite]} numberOfLines={1}>
                {selectedPromo ? selectedPromo.code : 'Ưu đãi'}
              </Text>
              <View style={styles.promoDot} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtnPremium, loading && styles.disabledBtn]}
            onPress={handleConfirmRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.confirmBtnContent}>
                <Text style={styles.confirmBtnTextPremium}>ĐẶT XE NGAY</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Selection Modal */}
      <Modal
        visible={isPaymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}>
                <X size={24} color={COLORS.text} />
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
                <X size={24} color={COLORS.text} />
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
    // backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOW.md,
    shadowOpacity: 0.08,
    zIndex: 999,
    overflow: 'visible',
  },
  safeArea: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 50 : 44,
    marginTop: Platform.OS === 'android' ? 30 : 0,
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
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderRadius: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'visible',
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    zIndex: 100,
    overflow: 'visible',
  },
  inputRowFocused: {
    zIndex: 1000,
  },
  suggestionScroll: {
    flex: 1,
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
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
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
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === 'android' ? 15 : 4,
    minHeight: 250,
    maxHeight: 500,
    ...SHADOW.lg,
    shadowOpacity: 0.2,
    zIndex: 100,
  },
  dragHandleBox: {
    height: 8,
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
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  sheetTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  serviceBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  serviceBadgeText: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  carScrollList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // --- New Styles for Vehicle List ---
  vCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F5F5F5',
    ...SHADOW.sm,
  },
  vCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
    borderWidth: 2,
  },
  vImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vImage: {
    width: '80%',
    height: '80%',
  },
  vNoImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  vNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  vBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  vBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '900',
  },
  vDescText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  vEtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vEtaText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  vPriceContainer: {
    width: 90, // Cố định chiều rộng
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  vPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  vRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  vRadioActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  emptyCarState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyCarText: {
    marginTop: 16,
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomFooterPremium: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 30 : 10,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...SHADOW.lg,
    shadowOpacity: 0.1,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  textWhite: {
    color: COLORS.white,
  },
  confirmBtnPremium: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  confirmBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmBtnTextPremium: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  // --- Modal Selection Styles ---
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
  promoIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


