import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Ticket, MapPin, CheckCheck, Info } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'booking', title: 'Đặt xe thành công!', desc: 'Tài xế Nguyễn Văn A đang trên đường đến đón bạn tại Cầu Rồng. Vui lòng chú ý điện thoại.', time: 'Vừa xong', isRead: false },
  { id: '2', type: 'promo', title: 'Giảm 50K cho chuyến đi tiếp theo 🎉', desc: 'Mã giảm giá VUIXUAN50 đã được thêm vào ví ưu đãi của bạn. HSD: 10/04/2026.', time: '2 giờ trước', isRead: false },
  { id: '3', type: 'system', title: 'Cập nhật tính năng mới', desc: 'Trải nghiệm mượt mà hơn với tính năng thanh toán qua Ví điện tử và Face ID.', time: 'Hôm qua', isRead: true },
  { id: '4', type: 'booking', title: 'Hoàn thành chuyến đi', desc: 'Chuyến đi đến Bà Nà Hills đã hoàn tất. Hãy để lại đánh giá cho dịch vụ nhé!', time: '2 ngày trước', isRead: true },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (showToast) showToast({ message: 'Đã đánh dấu tất cả là đã đọc', type: 'success' });
  };

  const handleReadNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'booking': return <MapPin size={22} color="#3B82F6" />;
      case 'promo': return <Ticket size={22} color="#EF4444" />;
      default: return <Info size={22} color="#10B981" />;
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]} 
      onPress={() => handleReadNotification(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, !item.isRead && styles.unreadIconBox]}>
        {renderIcon(item.type)}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllRead}>
          <CheckCheck size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Bell size={48} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptyDesc}>Khi có thông báo mới, chúng sẽ xuất hiện ở đây.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 20, backgroundColor: '#FFF', zIndex: 10, ...SHADOW.sm 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  readAllBtn: { padding: 4 },
  
  listContainer: { padding: 15 },
  
  notificationCard: { 
    flexDirection: 'row', backgroundColor: '#FFF', 
    padding: 16, borderRadius: 20, marginBottom: 12, 
    ...SHADOW.sm, borderWidth: 1, borderColor: '#F1F5F9' 
  },
  unreadCard: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
  
  iconBox: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', 
    marginRight: 15 
  },
  unreadIconBox: { backgroundColor: '#FFF' },
  
  content: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: '#334155' },
  unreadText: { color: '#0F172A', fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 10 },
  
  desc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 6 },
  time: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 40 }
});
