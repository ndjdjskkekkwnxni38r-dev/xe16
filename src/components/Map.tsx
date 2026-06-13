import { Platform } from 'react-native';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  if (Platform.OS === 'web') {
    // Web: @teovilla/react-native-web-maps
    const mod = require('@teovilla/react-native-web-maps');
    MapView = mod.default || mod.MapView || mod;
    Marker = mod.Marker;
    Polyline = mod.Polyline;
    PROVIDER_GOOGLE = 'google'; // Web doesn't use provider constant
  } else {
    // Native: react-native-maps
    const mod = require('react-native-maps');
    MapView = mod.default || mod.MapView || mod;
    Marker = mod.Marker;
    Polyline = mod.Polyline;
    PROVIDER_GOOGLE = mod.PROVIDER_GOOGLE;
  }
} catch (e) {
  console.error('[Map.tsx] Error loading maps:', e);
  // Fallback: don't crash, just have null components
}

export { Marker, Polyline, PROVIDER_GOOGLE };
export default MapView;

