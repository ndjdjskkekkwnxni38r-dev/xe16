import { Platform } from 'react-native';

let MapView, Marker, Polyline, PROVIDER_GOOGLE;

try {
  if (Platform.OS === 'web') {
    const WebMaps = require('@teovilla/react-native-web-maps');
    MapView = WebMaps.MapView || WebMaps.default || WebMaps;
    Marker = WebMaps.Marker;
    Polyline = WebMaps.Polyline;
  } else {
    // Forcefully require react-native-maps and check exports
    const NativeMaps = require('react-native-maps');
    
    // Most robust way to access MapView in react-native-maps
    MapView = NativeMaps.default || NativeMaps.MapView || NativeMaps;
    
    Marker = NativeMaps.Marker;
    Polyline = NativeMaps.Polyline;
    PROVIDER_GOOGLE = NativeMaps.PROVIDER_GOOGLE;
  }
} catch (e) {
  console.error('Failed to load map components', e);
}

// Ensure exports are not undefined
export { Marker, Polyline, PROVIDER_GOOGLE };
export default MapView;
