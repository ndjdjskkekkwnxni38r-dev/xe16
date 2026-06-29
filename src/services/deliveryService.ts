import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = 'https://admin.datxedulich.vip/api';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem('access_token');
  return SecureStore.getItemAsync('access_token');
}

export interface VehicleQuote {
  vehicle_type_id: number;
  name: string;
  description: string;
  icon_url: string;
  is_available: boolean;
  eta_minutes: number | null;
  estimated_price: number;
  discount_amount: number;
  final_price: number;
}

export interface DeliveryNearbyResponse {
  success: boolean;
  message?: string;
  quote_id?: string;
  data?: VehicleQuote[];
}

export interface DeliveryOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number | string;
    status: string;
    pickup_address?: string;
    dropoff_address?: string;
    vehicle_type?: string;
    price?: number;
  };
  booking?: {
    id: number | string;
    booking_code?: string;
    status: string;
    pickup_address?: string;
    dropoff_address?: string;
    final_price?: number;
  };
}

export const deliveryService = {
  async findNearby(params: {
    pickup_address: string;
    dropoff_address: string;
    pickup_lat?: number;
    pickup_lng?: number;
    dropoff_lat?: number;
    dropoff_lng?: number;
    service_type?: string;
    delivery_type?: string;
  }): Promise<DeliveryNearbyResponse> {
    console.log('[deliveryService] findNearby called with:', JSON.stringify(params));
    const token = await getToken();
    console.log('[deliveryService] Token:', token ? 'EXISTS' : 'NULL');
    const { service_type, ...bodyParams } = params;
    const queryParams = service_type ? `?service_type=${encodeURIComponent(service_type)}` : '';
    const url = `${API_BASE}/customer/delivery/nearby${queryParams}`;
    console.log('[deliveryService] POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ ...bodyParams, service_type }),
    });
    console.log('[deliveryService] Response status:', response.status, response.statusText);
    const text = await response.text();
    console.log('[deliveryService] Response body (first 1000):', text.substring(0, 1000));
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('[deliveryService] Failed to parse JSON:', e);
      return { success: false, message: 'Invalid JSON response' };
    }
  },

  async createOrder(params: {
    quote_id: string;
    vehicle_type_id: number;
    pickup_address: string;
    dropoff_address: string;
    payment_method?: string;
    promo_code?: string | null;
    service_type?: string;
    delivery_type?: string;
    recipient_name?: string;
    recipient_phone?: string;
    parcel_description?: string;
  }): Promise<DeliveryOrderResponse> {
    console.log('[deliveryService] createOrder called with:', JSON.stringify(params));
    const token = await getToken();
    const url = `${API_BASE}/customer/delivery/create`;
    console.log('[deliveryService] POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });
    console.log('[deliveryService] createOrder status:', response.status, response.statusText);
    const text = await response.text();
    console.log('[deliveryService] createOrder body:', text.substring(0, 1000));
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('[deliveryService] Failed to parse JSON:', e);
      return { success: false, message: 'Invalid JSON response' };
    }
  },
};
