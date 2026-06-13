import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from '@/components/Map';
import { useToast } from '@/components/Toast';
import { POPULAR_DESTINATIONS, type PlaceSuggestion } from '@/constants/data';
import { COLORS, SHADOW } from '@/constants/theme';
import { geocodeAddressFallback, getPlaceDetails, searchAddressSuggestions } from '@/services/addressSearch';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, ChevronRight, Search, Ticket, X } from 'lucide-react-native';
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

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [destination, setDestination] = useState((params.destination as string) || '');
  const [vehicleOptions, setVehicleOptions] = useState<any[]>([]);

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

  const appliedPromo = params.promoCode as string;

  const GOOGLE_KEY = "AIzaSyC6-7Vxt6ycQXeyIE3kVjus3_ZfneXv-T4";
  const matchingPopular = destination
    ? POPULAR_DESTINATIONS.filter(
        (item) =>
          item.structured_formatting.main_text.toLowerCase().includes(destination.toLowerCase()) ||
          item.description.toLowerCase().includes(destination.toLowerCase())
      )
    : [];

    const selectPickup = useCallback(async (address: string, placeId?: string) => {
    console.log('[selectPickup] Called with address:', address, 'placeId:', placeId);
    setPickup(address);
    setPickupSuggestions([]);
    setPickupFocused(false);

    try {
      // Get coordinates from place_id
      let coords = null;
      if (placeId) {
        coords = await getPlaceDetails(placeId, address);
      }
      
      if (!coords) {
        console.log('[selectPickup] No coords from place details, trying fallback geocoding');
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}&language=vi`
          );
          const data = await res.json();
          if (data?.status === 'OK' && data.results?.length > 0) {
            coords = {
              latitude: data.results[0].geometry.location.lat,
              longitude: data.results[0].geometry.location.lng,
            };
          } else {
            // Use geocodeAddressFallback with rate limiting and error handling
            coords = await geocodeAddressFallback(address);
          }
        } catch (fallbackError) {
          console.error('[selectPickup] Fallback geocoding error:', fallbackError);
          // Last resort: use geocodeAddressFallback
          coords = await geocodeAddressFallback(address);
        }
      }
      
      if (!coords) {
        console.error('[selectPickup] Cannot get coordinates, using default Đà Nẵng location');
        coords = getDefaultDaNangCoords();
        showToast({ 
          message: 'Không tìm thấy địa chính xác. Sử dụng vị trí mặc định tại Đà Nẵng.', 
          type: 'error' 
        });
      }
      
      console.log('[selectPickup] Got coords:', coords);
      setPickupCoords(coords);

      const nextRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
      setMapRegion(nextRegion);
    } catch (e) {
      console.error('[selectPickup] Error:', e);
    }
  }, []);

    const selectDestination = useCallback(async (address: string, placeId?: string) => {
    console.log('[selectDestination] Called with address:', address, 'placeId:', placeId);
    setDestination(address);
    setDestSuggestions([]);
    setDestFocused(false);
    destInputRef.current?.blur();
    Keyboard.dismiss();

    try {
      // Try to get coordinates from place_id first, fallback to geocoding
      let coords = null;
      if (placeId) {
        coords = await getPlaceDetails(placeId, address);
      }
      
      // If no placeId or Places API failed, try fallback
      if (!coords) {
        console.log('[selectDestination] No coords from place details, trying fallback geocoding');
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}&language=vi`
          );
          const data = await res.json();
          if (data?.status === 'OK' && data.results?.length > 0) {
            coords = {
              latitude: data.results[0].geometry.location.lat,
              longitude: data.results[0].geometry.location.lng,
            };
          } else {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
              { headers: { 'User-Agent': 'VanBookingApp/1.0' } }
            );
            const nomText = await nomRes.text();
            // Check if response is HTML instead of JSON
            if (nomText.trim().startsWith('<')) {
              console.warn('[selectDestination] Nominatim returned HTML, using geocodeAddressFallback');
              coords = await geocodeAddressFallback(address);
            } else {
              try {
                const nomData = JSON.parse(nomText);
                if (nomData && nomData.length > 0) {
                  coords = {
                    latitude: parseFloat(nomData[0].lat),
                    longitude: parseFloat(nomData[0].lon),
                  };
                }
              } catch (parseError) {
                console.warn('[selectDestination] JSON parse error, using geocodeAddressFallback');
                coords = await geocodeAddressFallback(address);
              }
            }
          }
        } catch (fallbackError) {
          console.error('[selectDestination] Fallback geocoding error:', fallbackError);
          // Last resort: use geocodeAddressFallback
          coords = await geocodeAddressFallback(address);
        }
      }
      
      if (!coords) {
        console.error('[selectDestination] Cannot get coordinates, using default Đà Nẵng location');
        coords = getDefaultDaNangCoords();
        showToast({ 
          message: 'Không tìm thấy địa chính xác. Sử dụng vị trí mặc định tại Đà Nẵng.', 
          type: 'error' 
        });
      }
      
      console.log('[selectDestination] Got coords:', coords);
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
        console.log('[selectDestination] Calling fetchRoute with pickupCoords:', pickupCoords);
        fetchRoute(pickupCoords, coords);
      } else {
        console.log('[selectDestination] No pickupCoords, skipping fetchRoute');
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

  const decodePolyline = (encoded: string) => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let result = 0;
      let shift = 0;
      let byte = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      result = 0;
      shift = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const fetchRoute = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) => {
    try {
      console.log('[fetchRoute] Start with origin:', origin, 'destination:', destination);
      
      // Thử Google Directions API trước
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_KEY}&language=vi&mode=driving`,
        );
        const data = await response.json();
        console.log('[fetchRoute] Google API response status:', data?.status);
        if (data?.status === 'OK' && data.routes?.length > 0) {
          const polyline = data.routes[0].overview_polyline?.points;
          console.log('[fetchRoute] Polyline encoded:', polyline ? 'exists' : 'null', 'length:', polyline?.length);
          if (polyline) {
            const coords = decodePolyline(polyline);
            console.log('[fetchRoute] Decoded coords count:', coords.length);
            setRouteCoordinates(coords);
            if (coords.length > 0) {
              mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 120, right: 40, bottom: 240, left: 40 },
                animated: true,
              });
            }
            return;
          }
        }
      } catch (googleError) {
        console.warn('[fetchRoute] Google API failed, trying fallback:', googleError);
      }

      // Fallback 1: OpenRouteService (miễn phí, không cần key)
      try {
        console.log('[fetchRoute] Using OpenRouteService fallback');
        const orsResponse = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`,
          {
            headers: {
              'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            }
          }
        );
        const orsData = await orsResponse.json();
        console.log('[fetchRoute] OpenRouteService response status:', orsResponse.status);
        
        if (orsData.features && orsData.features.length > 0) {
          const geometry = orsData.features[0].geometry;
          if (geometry && geometry.coordinates) {
            const coords = geometry.coordinates.map((coord: number[]) => ({
              latitude: coord[1],
              longitude: coord[0]
            }));
            console.log('[fetchRoute] OpenRouteService coords count:', coords.length);
            setRouteCoordinates(coords);
            if (coords.length > 0) {
              mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 120, right: 40, bottom: 240, left: 40 },
                animated: true,
              });
            }
            return;
          }
        }
      } catch (orsError) {
        console.warn('[fetchRoute] OpenRouteService failed, trying OSRM:', orsError);
      }

      // Fallback 2: OSRM (Open Source Routing Machine) - miễn phí, không cần key
      console.log('[fetchRoute] Using OSRM fallback');
      const osrmResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
      );
      const osrmData = await osrmResponse.json();
      console.log('[fetchRoute] OSRM response status:', osrmResponse.status);
      
      if (osrmData.code === 'Ok' && osrmData.routes && osrmData.routes.length > 0) {
        const geometry = osrmData.routes[0].geometry;
        if (geometry && geometry.coordinates) {
          // OSRM trả về [lon, lat], cần chuyển sang [lat, lon]
          const coords = geometry.coordinates.map((coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
          console.log('[fetchRoute] OSRM coords count:', coords.length);
          setRouteCoordinates(coords);
          if (coords.length > 0) {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 120, right: 40, bottom: 240, left: 40 },
              animated: true,
            });
          }
        }
      } else {
        console.error('[fetchRoute] All routing services failed');
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

      // --- Hàm fetch Google Maps Geocoding API ---
      const fetchGoogle = async (): Promise<string> => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}&language=vi&result_type=street_address|premise`,
          { signal: ctrl.signal }
        );
        clearTimeout(t);
        const data = await res.json();
        if (data?.status === 'OK' && data.results?.length > 0) {
          // Ưu tiên kết quả có street_address hoặc premise (chứa số nhà)
          const best = data.results.find((r: any) =>
            r.types?.some((type: string) => ['street_address','premise','subpremise'].includes(type))
          ) || data.results[0];
          return best.formatted_address
            .replace(/, Việt Nam$/, '')
            .replace(/, Vietnam$/, '')
            .trim();
        }
        return '';
      };

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

      // --- Chạy song song tất cả ---
      const [googleRes, nominatimRes, overpassRes] = await Promise.allSettled([
        fetchGoogle(),
        fetchNominatim(),
        fetchOverpass(),
      ]);

      const googleAddr    = googleRes.status    === 'fulfilled' ? googleRes.value    : '';
      const nominatimAddr = nominatimRes.status === 'fulfilled' ? nominatimRes.value : '';
      const overpassAddr  = overpassRes.status  === 'fulfilled' ? overpassRes.value  : '';

      console.log('DEBUG Google:', googleAddr);
      console.log('DEBUG Nominatim:', nominatimAddr);
      console.log('DEBUG Overpass:', overpassAddr);

      // Hàm kiểm tra xem địa chỉ có chứa số nhà không (bắt đầu bằng số)
      const hasHouseNumber = (addr: string) => /^\d/.test(addr.trim());

      // Ưu tiên: Overpass (chứa số nhà cụ thể) > Google > Nominatim
      let formattedAddress =
        (hasHouseNumber(overpassAddr)  ? overpassAddr  : '') ||
        (hasHouseNumber(googleAddr)    ? googleAddr    : '') ||
        (hasHouseNumber(nominatimAddr) ? nominatimAddr : '') ||
        overpassAddr || googleAddr || nominatimAddr;

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
    } catch (error) {
      console.error('Location Error:', error);
      showToast({ message: 'Không thể lấy vị trí', type: 'error' });
      setPickup("Cầu Rồng, Hải Châu, Đà Nẵng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
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
                  style={[styles.carCard, isActive && styles.carCardActive]}>
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
    zIndex: 999,
    overflow: 'visible',
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderRadius: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'visible',
    zIndex: 200,
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
    fontSize: 15,
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


