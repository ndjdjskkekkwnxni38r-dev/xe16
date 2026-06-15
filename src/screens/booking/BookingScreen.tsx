import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from '@/components/Map';
import { useToast } from '@/components/Toast';
import { POPULAR_DESTINATIONS, type PlaceSuggestion } from '@/constants/data';
import { COLORS, SHADOW } from '@/constants/theme';
import { geocodeAddressFallback, getPlaceDetails, searchAddressSuggestions } from '@/services/addressSearch';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      
      setDestinationCoords(coords);

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

      const body = {
        pickup_lat: pickupCoords.latitude,
        pickup_lng: pickupCoords.longitude,
        dropoff_lat: destinationCoords.latitude,
        dropoff_lng: destinationCoords.longitude,
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
      
      console.log('[fetchPricing] API Response:', data);
      
      // Map API response format to expected format
      const apiVehicles = data.vehicles || data.data || data;
      
      if (response.ok && Array.isArray(apiVehicles) && apiVehicles.length > 0) {
        // Map API fields to expected format
        const mappedVehicles = apiVehicles.map((v: any) => ({
          id: v.vehicle_type_id?.toString() || v.id?.toString(),
          quote_id: v.quote_id, // Capture quote_id from API
          name: v.name,
          price: v.final_price || v.price || v.estimated_price,
          description: v.description,
          is_available: v.is_available,
          eta_minutes: v.eta_minutes || 5, // Default to 5 if missing
          icon_url: v.icon_url,
        }))
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

  // Gọi API lấy giá khi destinationCoords hoặc pickupCoords thay đổi
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered. State check:');
    console.log(' - destinationCoords:', destinationCoords);
    console.log(' - pickupCoords:', pickupCoords);
    
    if (destinationCoords && pickupCoords) {
      console.log('[DEBUG] Both coords present, calling fetchPricing.');
      fetchPricing(destination);
    } else {
      console.log('[DEBUG] Missing coords, skipping fetchPricing.');
    }
  }, [destinationCoords, pickupCoords]);

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
          quote_id: selectedVan.quote_id, // Add quote_id here
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
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS !== 'web' ? PROVIDER_GOOGLE : undefined}
          region={mapRegion}
          showsUserLocation
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
              <View style={[styles.inputRow, destFocused && styles.inputRowFocused]}>
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
                    <Search size={18} color={COLORS.primary} strokeWidth={2.5} />
                  )}
                </View>

                {destFocused && (
                  <View style={styles.suggestionBox}>
                    <ScrollView
                      style={styles.suggestionScroll}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
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
        
        <ScrollView style={styles.carScrollList} showsVerticalScrollIndicator={false}>
          {vehicleOptions && vehicleOptions.length > 0 ? (
            vehicleOptions.map((type, index) => {
              const isActive = selectedType === type.id;
              console.log('[VehicleCard] Rendering:', type.name, 'Active:', isActive);
              return (
                <TouchableOpacity
                  key={type.id || index}
                  onPress={() => setSelectedType(type.id)}
                  style={[styles.carCard, isActive && styles.carCardActive]}>
                  
                  {/* Selection Indicator */}
                  <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
                    {isActive && <View style={styles.radioInner} />}
                  </View>

                  {/* Vehicle Icon */}
                  <View style={styles.carIconBox}>
                    <Text style={styles.carEmojiText}>🚐</Text>
                  </View>
                  
                  {/* Vehicle Info */}
                  <View style={styles.carDetails}>
                    <Text style={styles.carNameText}>{type.name || 'Xe 16 chỗ'}</Text>
                    <Text style={styles.carDescText}>Đến nơi sau 5 phút</Text>
                  </View>

                  {/* Price */}
                  <View style={styles.carPriceBox}>
                    <Text style={styles.carPriceText}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(type.price || 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#757575' }}>Không có xe nào khả dụng</Text>
              <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 4 }}>vehicleOptions: {JSON.stringify(vehicleOptions)}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomFooter}>
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
    maxHeight: 220,
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
    zIndex: 999,
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
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 6 : 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: Platform.OS === 'ios' ? 4 : 2,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  carCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  carIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  carIconBoxActive: {
    backgroundColor: COLORS.primary + '15',
  },
  carEmojiText: {
    fontSize: 16,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  carDetails: {
    flex: 1,
  },
  carPriceBox: {
    marginLeft: 8,
  },
  carTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  carNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  carPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  carDescText: {
    fontSize: 9,
    color: '#757575',
    fontWeight: '500',
  },
  bottomFooter: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  quickOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
  },
  cashIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  cashIconText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  methodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 90,
  },
  promoBtnActive: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  promoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginLeft: 6,
  },
  promoLabelActive: {
    color: COLORS.primary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});


