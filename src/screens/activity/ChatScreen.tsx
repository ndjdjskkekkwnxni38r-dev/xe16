import { COLORS } from '@/constants/theme';
import socketService from '@/services/socket';
import { useUser } from '@/store/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatMessage {
  id: string;
  sender_id: number;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id: bookingId, driverName } = useLocalSearchParams<{ id: string; driverName?: string }>();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);

  const fetchMessages = useCallback(async () => {
    try {
      const token = Platform.OS === 'web'
        ? localStorage.getItem('access_token')
        : await SecureStore.getItemAsync('access_token');
      const response = await fetch(
        `https://admin.datxedulich.vip/api/chat/history/${bookingId}`,
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }
      );
      const text = await response.text();
      if (response.ok && text.startsWith('{')) {
        const data = JSON.parse(text);
        if (data.data) setMessages(data.data);
      }
    } catch (error) {
      console.error('[Chat] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const lastContentHeight = useRef(0);

  const doScroll = useCallback(() => {
    const list = flatListRef.current;
    if (!list) return;
    list.scrollToOffset({ offset: 999999, animated: false });
    InteractionManager.runAfterInteractions(() => {
      flatListRef.current?.scrollToOffset({ offset: 999999, animated: false });
    });
  }, []);

  useEffect(() => {
    doScroll();
  }, [messages.length, doScroll]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates.height);
      doScroll();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, [doScroll]);

  useEffect(() => {
    if (!user?.id) return;
    let cleanupFn: (() => void) | undefined;
    const setupSocket = async () => {
      const socket = await socketService.connect();
      if (!socket) return;
      const channelName = `private-chat.${bookingId}`;
      const token = Platform.OS === 'web'
        ? localStorage.getItem('access_token')
        : await SecureStore.getItemAsync('access_token');

      const trySubscribe = () => {
        socket.emit('subscribe', {
          channel: channelName,
          auth: { headers: { Authorization: `Bearer ${token}` } },
        });
        console.log(`[Chat] Subscribed to: ${channelName}`);
      };

      socket.once('subscribe:error', (err: any) => {
        console.error(`[Chat] Subscribe error for ${channelName}:`, err);
      });

      if (socket.connected) trySubscribe();
      else socket.once('connect', trySubscribe);

      const handler = (event: string, data: any) => {
        if (!event.includes(`private-chat.${bookingId}`)) return;
        if (!event.includes('message.sent')) return;
        const payload = Array.isArray(data) ? data[0] : data;
        if (payload && payload.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            if (Number(payload.sender_id) === Number(user?.id)) return prev;
            return [...prev, payload];
          });
        }
      };
      socket.onAny(handler);

      cleanupFn = () => {
        socket.emit('unsubscribe', { channel: channelName });
        socket.offAny(handler);
      };
    };
    setupSocket();
    return () => { cleanupFn?.(); };
  }, [user?.id, bookingId]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');
    try {
      const token = Platform.OS === 'web'
        ? localStorage.getItem('access_token')
        : await SecureStore.getItemAsync('access_token');
      const formData = new FormData();
      formData.append('booking_id', bookingId || '');
      formData.append('message', text);
      const response = await fetch('https://admin.datxedulich.vip/api/chat/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData,
      });
      const resText = await response.text();
      try {
        const data = JSON.parse(resText);
        if (response.ok && data.data) {
          setMessages((prev) => [...prev, data.data]);
          setTimeout(doScroll, 100);
          setTimeout(doScroll, 300);
          setTimeout(doScroll, 600);
        } else {
          setInputText(text);
        }
      } catch (_) {
        setInputText(text);
      }
    } catch (error) {
      setInputText(text);
    } finally { setSending(false); }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    const curr = new Date(messages[index].created_at);
    const prev = new Date(messages[index - 1].created_at);
    return curr.toDateString() !== prev.toDateString();
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.sender_type === 'customer' || item.sender_id === Number(user?.id);
    const prev = index > 0 ? messages[index - 1] : null;
    const showTime = !prev || prev.sender_id !== item.sender_id ||
      (new Date(item.created_at).getTime() - new Date(prev.created_at).getTime() > 300000);
    const showDate = shouldShowDateSeparator(index);
    const isConsecutive = prev && prev.sender_id === item.sender_id && !showTime;

    return (
      <View key={item.id?.toString() || `msg-${index}`}>
        {showDate && (
          <View style={styles.dateSep}>
            <Text style={styles.dateSepText}>{formatDateSeparator(item.created_at)}</Text>
          </View>
        )}
        <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe, isConsecutive && { marginTop: -2 }]}>
          <View style={[styles.bubbleWrapper, isMe && styles.bubbleWrapperMe]}>
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleDriver]}>
              <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.message}</Text>
            </View>
            {showTime && (
              <View style={[styles.timeRow, isMe && styles.timeRowMe]}>
                {isMe && <Ionicons name="checkmark-done" size={14} color="#53BDEB" style={{ marginRight: 3 }} />}
                <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const inputBottom = kbHeight > 0 ? kbHeight + 60 : insets.bottom;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.avatarBox}>
          <Ionicons name="person" size={18} color="#FFF" />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{driverName || 'Tài xế'}</Text>
          <Text style={styles.headerStatus}>Đang hoạt động</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.chatArea}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={[styles.listContent, { paddingBottom: inputBottom + 60 }]}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={21}
            onContentSizeChange={(_w, h) => {
              if (h > lastContentHeight.current) {
                doScroll();
              }
              lastContentHeight.current = h;
            }}
            onScrollToIndexFailed={doScroll}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="chatbubbles" size={36} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
                <Text style={styles.emptyDesc}>Gửi tin nhắn để bắt đầu trò chuyện</Text>
              </View>
            }
          />
        )}
      </View>

      <View style={[styles.inputBar, { bottom: inputBottom }]}>
        <View style={styles.inputWrap}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#8696A0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: (!inputText.trim() || sending) ? 0.4 : 1 }]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECE5DD' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#4ADE80',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  headerStatus: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  headerAction: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  chatArea: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingVertical: 6 },

  dateSep: { alignItems: 'center', marginVertical: 12 },
  dateSepText: {
    fontSize: 11.5, color: '#6B7B8D', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8,
    overflow: 'hidden', fontWeight: '500', letterSpacing: 0.3,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },

  bubbleRow: { flexDirection: 'row', marginBottom: 2 },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleWrapper: { maxWidth: '78%' },
  bubbleWrapperMe: { alignItems: 'flex-end' },
  bubble: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  bubbleMe: { backgroundColor: '#D9FDD3', borderTopRightRadius: 0 },
  bubbleDriver: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 0,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2,
  },
  bubbleText: { fontSize: 14.5, color: '#111B21', lineHeight: 21 },
  bubbleTextMe: { color: '#111B21' },

  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginHorizontal: 4 },
  timeRowMe: { justifyContent: 'flex-end' },
  timeText: { fontSize: 11, color: '#667781', letterSpacing: 0.1 },

  emptyWrap: { alignItems: 'center', paddingTop: 140 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#111B21', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#667781' },

  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F0F2F5',
    paddingTop: 2,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D7DB',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    gap: 6,
  },
  attachBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: '#111B21',
    maxHeight: 80,
    lineHeight: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D7DB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
