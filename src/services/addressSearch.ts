import type { PlaceSuggestion } from '@/constants/data';

const GOOGLE_KEY = 'AIzaSyC6-7Vxt6ycQXeyIE3kVjus3_ZfneXv-T4';

// Giới hạn tìm kiếm quanh Đà Nẵng
const DANANG_VIEWBOX = '107.8,16.3,108.5,15.9';

// Rate limiting cho Nominatim (max 1 request/giây theo policy của OSM)
let lastNominatimRequest = 0;
const NOMINATIM_MIN_DELAY = 5000; // 5 giây giữa các request để tránh 429

// Cache cho geocoding để tránh trùng lặp
const geocodeCache = new Map<string, { coords: { latitude: number; longitude: number }, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

function parseHouseAndStreet(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d+[a-zA-Z/]*)\s+(.+)$/);
  return {
    houseNumber: match?.[1] || '',
    street: match?.[2] || trimmed,
  };
}

function cleanDisplayName(name: string) {
  return name
    .replace(/, Việt Nam$/i, '')
    .replace(/, Vietnam$/i, '')
    .trim();
}

function formatNominatimResult(item: any, inputHouse?: string): PlaceSuggestion {
  const a = item.address || {};
  const road = a.road || a.pedestrian || a.footway || item.name || '';
  const cleanRoad = road.replace(/^(Ngõ|Ngách|Kiệt|Hẻm)\s+\d+\s+/i, '').trim() || road;
  const streetLine = inputHouse
    ? `${inputHouse} ${cleanRoad}`
    : [a.house_number, road].filter(Boolean).join(' ') || item.name || cleanDisplayName(item.display_name);

  const secondary = [a.suburb || a.quarter || a.neighbourhood, a.city || a.town || 'Đà Nẵng']
    .filter(Boolean)
    .join(', ');

  const description = cleanDisplayName(
    [streetLine, a.suburb || a.quarter, a.city || a.town || 'Đà Nẵng'].filter(Boolean).join(', '),
  );

  return {
    place_id: `osm-${item.place_id}`,
    description,
    structured_formatting: {
      main_text: streetLine,
      secondary_text: secondary,
    },
  };
}

async function fetchGooglePlacesNew(text: string): Promise<PlaceSuggestion[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
    },
    body: JSON.stringify({
      input: text,
      languageCode: 'vi',
      includedRegionCodes: ['vn'],
      locationBias: {
        circle: {
          center: { latitude: 16.0544, longitude: 108.2022 },
          radius: 50000,
        },
      },
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (data?.error) return [];

  return (data?.suggestions || [])
    .filter((s: any) => s.placePrediction)
    .slice(0, 5)
    .map((s: any) => ({
      place_id: s.placePrediction.placeId,
      description: s.placePrediction.text?.text || '',
      structured_formatting: {
        main_text:
          s.placePrediction.structuredFormat?.mainText?.text ||
          s.placePrediction.text?.text ||
          '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text || '',
      },
    }));
}

async function fetchLegacyAutocomplete(text: string): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    input: text,
    key: GOOGLE_KEY,
    language: 'vi',
    components: 'country:vn',
    location: '16.0544,108.2022',
    radius: '50000',
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
  );
  const data = await res.json();
  if (data?.status !== 'OK' || !data.predictions?.length) return [];

  return data.predictions.slice(0, 5).map((p: any) => ({
    place_id: p.place_id,
    description: p.description,
    structured_formatting: {
      main_text: p.structured_formatting?.main_text || p.description,
      secondary_text: p.structured_formatting?.secondary_text || '',
    },
  }));
}

async function fetchNominatim(text: string): Promise<PlaceSuggestion[]> {
  const { houseNumber } = parseHouseAndStreet(text);
  const hasDanang = /đà nẵng|da nang/i.test(text);
  const queries = hasDanang ? [text] : [text, `${text}, Đà Nẵng`];

  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '6',
      countrycodes: 'vn',
      viewbox: DANANG_VIEWBOX,
      bounded: '1',
    });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'VanBookingApp/1.0' },
    });
    if (!res.ok) continue;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) continue;

    return data.map((item: any) => formatNominatimResult(item, houseNumber));
  }

  return [];
}

function mergeSuggestions(lists: PlaceSuggestion[][]): PlaceSuggestion[] {
  const merged: PlaceSuggestion[] = [];
  const seen = new Set<string>();

  for (const list of lists) {
    for (const item of list) {
      if (!item.description) continue;
      const key = item.description.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  return merged.slice(0, 8);
}

/** Tìm gợi ý địa chỉ — Google Places + fallback OpenStreetMap */
export async function searchAddressSuggestions(text: string): Promise<PlaceSuggestion[]> {
  const trimmed = text.trim();
  if (trimmed.length < 2) return [];

  const [googleNew, googleLegacy, osm] = await Promise.allSettled([
    fetchGooglePlacesNew(trimmed),
    fetchLegacyAutocomplete(trimmed),
    fetchNominatim(trimmed),
  ]);

  const lists: PlaceSuggestion[][] = [];
  if (googleNew.status === 'fulfilled') lists.push(googleNew.value);
  if (googleLegacy.status === 'fulfilled') lists.push(googleLegacy.value);
  if (osm.status === 'fulfilled') lists.push(osm.value);

  const merged = mergeSuggestions(lists);

  // Fallback: Nếu không có kết quả nào, tạo gợi ý từ địa chỉ đã nhập
  if (merged.length === 0 && trimmed.length >= 3) {
    console.log('[searchAddressSuggestions] No results, creating fallback suggestion');
    return [{
      place_id: `manual-${Date.now()}`,
      description: trimmed,
      structured_formatting: {
        main_text: trimmed,
        secondary_text: 'Địa chỉ tùy chỉnh',
      },
    }];
  }

  return merged;
}

/** Get place details including coordinates from place_id */
export async function getPlaceDetails(placeId: string, addressText?: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    console.log('[getPlaceDetails] Fetching for place_id:', placeId);
    
    // Use Google Places API (v1)
    if (placeId.startsWith('osm-')) {
      // OpenStreetMap place - skip, fall back to address string
      console.log('[getPlaceDetails] OSM place detected, skipping');
      return null;
    }

    if (placeId.startsWith('manual-')) {
      // Manual entry - geocode the address text
      console.log('[getPlaceDetails] Manual entry detected, geocoding address');
      if (addressText) {
        return await geocodeAddressFallback(addressText);
      }
      return null;
    }

    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
      },
    });

    if (!response.ok) {
      console.warn('[getPlaceDetails] HTTP error:', response.status, '- using fallback');
      // Fallback to geocoding the address text if available
      if (addressText) {
        console.log('[getPlaceDetails] Falling back to geocoding address text');
        return await geocodeAddressFallback(addressText);
      }
      return null;
    }

    const data = await response.json();
    const lat = data?.location?.latitude;
    const lng = data?.location?.longitude;

    if (lat && lng) {
      console.log('[getPlaceDetails] ✓ Got coords:', lat, lng);
      return { latitude: lat, longitude: lng };
    } else {
      console.error('[getPlaceDetails] No location in response');
      // Fallback to geocoding the address text if available
      if (addressText) {
        console.log('[getPlaceDetails] Falling back to geocoding address text');
        return await geocodeAddressFallback(addressText);
      }
      return null;
    }
  } catch (e: any) {
    console.error('[getPlaceDetails] ✗ Error:', e.message);
    // Fallback to geocoding the address text if available
    if (addressText) {
      console.log('[getPlaceDetails] Falling back to geocoding address text');
      return await geocodeAddressFallback(addressText);
    }
    return null;
  }
}

/** Fallback: Geocode address text using Nominatim (OpenStreetMap) */
export async function geocodeAddressFallback(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const normalizedAddress = address.trim().toLowerCase();
    
    // Check cache trước
    const cached = geocodeCache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[geocodeAddressFallback] Using cached result');
      return cached.coords;
    }

    console.log('[geocodeAddressFallback] Geocoding:', address);
    
    // Thử BigDataCloud trước (miễn phí, không cần key)
    try {
      const bdcResponse = await fetch(
        `https://api.bigdatacloud.net/data/address-geocode?key=FREE&localityLanguage=vi&address=${encodeURIComponent(address)}`
      );
      if (bdcResponse.ok) {
        const bdcData = await bdcResponse.json();
        if (bdcData && bdcData.latitude && bdcData.longitude) {
          const coords = { latitude: bdcData.latitude, longitude: bdcData.longitude };
          geocodeCache.set(normalizedAddress, { coords, timestamp: Date.now() });
          console.log('[geocodeAddressFallback] ✓ Got coords from BigDataCloud:', coords);
          return coords;
        }
      }
    } catch (bdcError) {
      console.warn('[geocodeAddressFallback] BigDataCloud failed:', bdcError);
    }
    
    // Fallback: Nominatim với rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastNominatimRequest;
    if (timeSinceLastRequest < NOMINATIM_MIN_DELAY) {
      const delay = NOMINATIM_MIN_DELAY - timeSinceLastRequest;
      console.log(`[geocodeAddressFallback] Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    lastNominatimRequest = Date.now();
    
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
      countrycodes: 'vn',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'VanBookingApp/1.0' },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[geocodeAddressFallback] Rate limited (429), returning null to avoid spam');
        return null;
      }
      console.error('[geocodeAddressFallback] HTTP error:', response.status);
      return null;
    }

    let data;
    try {
      const text = await response.text();
      // Check if response is HTML (error page) instead of JSON
      if (text.trim().startsWith('<')) {
        console.error('[geocodeAddressFallback] Received HTML instead of JSON');
        return null;
      }
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[geocodeAddressFallback] JSON parse error:', parseError);
      return null;
    }
    
    if (!Array.isArray(data) || data.length === 0) {
      console.error('[geocodeAddressFallback] No results');
      return null;
    }

    const { lat, lon } = data[0];
    const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    
    // Cache kết quả
    geocodeCache.set(normalizedAddress, { coords, timestamp: Date.now() });
    
    console.log('[geocodeAddressFallback] ✓ Got coords:', lat, lon);
    return coords;
  } catch (e: any) {
    console.error('[geocodeAddressFallback] ✗ Error:', e.message);
    return null;
  }
}

/** Fallback cuối cùng: Trả về tọa độ mặc định của Đà Nẵng khi tất cả geocoding thất bại */
export function getDefaultDaNangCoords(): { latitude: number; longitude: number } {
  return {
    latitude: 16.0544,
    longitude: 108.2022,
  };
}
