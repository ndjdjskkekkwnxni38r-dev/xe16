import type { PlaceSuggestion } from '@/constants/data';

// Giới hạn tìm kiếm quanh Đà Nẵng
const DANANG_VIEWBOX = '107.8,16.3,108.5,15.9';

// Rate limiting cho Nominatim
let lastNominatimRequest = 0;
const NOMINATIM_MIN_DELAY = 5000;

// Cache cho geocoding
const geocodeCache = new Map<string, { coords: { latitude: number; longitude: number }, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

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

/** Tìm gợi ý địa chỉ — OpenStreetMap */
export async function searchAddressSuggestions(text: string): Promise<PlaceSuggestion[]> {
  const trimmed = text.trim();
  if (trimmed.length < 2) return [];

  const osm = await fetchNominatim(trimmed);

  const merged = osm;

  // Fallback: Nếu không có kết quả nào, tạo gợi ý từ địa chỉ đã nhập
  if (merged.length === 0 && trimmed.length >= 3) {
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
    
    // Geocode the address text
    if (addressText) {
      console.log('[getPlaceDetails] Geocoding address text');
      return await geocodeAddressFallback(addressText);
    }
    return null;
  } catch (e: any) {
    console.error('[getPlaceDetails] ✗ Error:', e.message);
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
      return null;
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const { lat, lon } = data[0];
    const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    
    // Cache kết quả
    geocodeCache.set(normalizedAddress, { coords, timestamp: Date.now() });
    
    return coords;
  } catch (e: any) {
    console.error('[geocodeAddressFallback] ✗ Error:', e.message);
    return null;
  }
}

/** Fallback cuối cùng: Trả về tọa độ mặc định của Đà Nẵng */
export function getDefaultDaNangCoords(): { latitude: number; longitude: number } {
  return {
    latitude: 16.0544,
    longitude: 108.2022,
  };
}
