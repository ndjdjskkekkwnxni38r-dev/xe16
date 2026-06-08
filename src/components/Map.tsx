import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { COLORS } from '@/constants/theme';

let MapView: any;
let Marker: any;

if (Platform.OS === 'web') {
  // Mock cho Web
  MapView = ({ children, style }: any) => (
    <View style={[style, styles.webMap]}>
      <Text style={styles.webMapText}>Bản đồ không hỗ trợ trên nền tảng Web</Text>
      <Text style={styles.webMapSubtext}>Vui lòng sử dụng thiết bị Android hoặc iOS để xem bản đồ thực tế.</Text>
      {children}
    </View>
  );
  Marker = () => null;
} else {
  // Sử dụng thư viện gốc cho Mobile
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export { Marker };
export default MapView;

const styles = StyleSheet.create({
  webMap: {
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webMapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
