import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SOCKET_URL = 'wss://admin.datxedulich.vip';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    if (this.socket?.connected) return this.socket;

    let token = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('access_token');
    } else {
      token = await SecureStore.getItemAsync('access_token');
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: {
        token: token ? `Bearer ${token}` : null,
      },
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server:', SOCKET_URL);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    return this.socket;
  }
// ... rest of the file
  getSocket() {
    return this.socket;
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
