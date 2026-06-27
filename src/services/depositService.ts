import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = 'https://admin.datxedulich.vip/api';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('access_token');
  }
  return SecureStore.getItemAsync('access_token');
}

export interface DepositCreateResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number | string;
    amount: number;
    description: string;
    qr_code_url?: string;
    status: string;
    bank_info?: {
      bin?: string;
      account_no?: string;
      account_name?: string;
      bank_name?: string;
    };
    created_at?: string;
    expires_at?: string;
  };
}

export interface DepositHistoryItem {
  id: number | string;
  amount: number;
  status: string;
  description?: string;
  created_at?: string;
  qr_code_url?: string;
  bank_info?: {
    bin?: string;
    account_no?: string;
    account_name?: string;
    bank_name?: string;
  };
}

export interface DepositStatusResponse {
  success: boolean;
  data?: {
    id: number | string;
    amount: number;
    status: string; // pending, success, failed
  };
}

export const depositService = {
  async createDeposit(amount: number): Promise<DepositCreateResponse> {
    const token = await getToken();
    const response = await fetch(`${API_BASE}/deposit/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    return response.json();
  },

  async checkStatus(depositId: number | string): Promise<DepositStatusResponse> {
    const token = await getToken();
    const response = await fetch(`${API_BASE}/deposit/${depositId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  async getHistory(): Promise<{ success: boolean; data?: DepositHistoryItem[] }> {
    const token = await getToken();
    const response = await fetch(`${API_BASE}/deposit/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return response.json();
  },
};
