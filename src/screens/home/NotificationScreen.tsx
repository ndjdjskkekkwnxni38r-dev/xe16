import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'PROMO',
    title: 'Ưu đãi 30% chuyến đi đầu tiên',
    desc: 'Nhập mã VANMOI để được giảm giá ngay 30% cho chuyến đi đầu tiên của bạn tại Đà Nẵng.',
    time: '2 giờ trước',
    isRead: false,
  },
  {
    id: '2',
    type: 'SYSTEM',
    title: 'Xác nhận nạp tiền thành công',
    desc: 'Yêu cầu nạp 500.000đ của bạn đã được xử lý thành công. Số dư hiện tại là 1.250.000đ.',
    time: '5 giờ trước',
    isRead: true,
  },
  {
    id: '3',
    type: 'INFO',
    title: 'Cập nhật tính năng mới',
    desc: 'VanBooking hiện đã hỗ trợ thanh toán qua VietQR tự động. Trải nghiệm ngay!',
    time: '1 ngày trước',
    isRead: true,
  },
];

// Định nghĩa Item bên ngoài để tránh re-render không cần thiết
const NotificationItem = ({ item, onMarkRead, onDelete }: any) => {
  const getIcon = () => {
    switch (item.type) {
      case 'PROMO': return <Ionicons name="pricetag-outline" size={20} color={COLORS.accent} />;
      case 'SYSTEM': return <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />;
      default: return <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />;
    }
  };

  return (
    <View style={[styles.notiItem, !item.isRead && styles.unreadItem]}>
      <TouchableOpacity 
        style={styles.itemMainContent} 
        onPress={() => onMarkRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.isRead ? COLORS.background : COLORS.white }]}>
          {getIcon()}
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.notiHeader}>
            <Text style={[styles.notiTitle, !item.isRead && styles.boldText]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notiDesc} numberOfLines={2}>{item.desc}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(noti => 
      noti.id === id ? { ...noti, isRead: true } : noti
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
  };

  const handleDelete = (id: string) => {
    console.log("Attempting to delete ID:", id);
    setNotifications(prev => prev.filter(noti => noti.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
        </View>
        <TouchableOpacity style={styles.readAllBtn} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done" size={18} color={COLORS.primary} />
          <Text style={styles.readAllText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onMarkRead={markAsRead} 
            onDelete={handleDelete} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  readAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 6,
  },
  listContent: {
    paddingVertical: 0,
  },
  notiItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#F8FAFC', 
  },
  itemMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOW.sm,
  },
  contentContainer: {
    flex: 1,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
  },
  notiDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  deleteBtn: {
    padding: 10,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
