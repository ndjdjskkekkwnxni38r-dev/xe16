import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, Platform, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useNotifications, LocalNotification } from '@/store/NotificationContext';

const getToken = async () =>
  Platform.OS === 'web'
    ? localStorage.getItem('access_token')
    : await SecureStore.getItemAsync('access_token');

const getIcon = (type: string) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('promo')) return { name: 'pricetag' as const, gradient: ['#F59E0B', '#D97706'] };
  if (t.includes('booking')) return { name: 'car' as const, gradient: ['#F97316', '#EA580C'] };
  if (t.includes('payment') || t.includes('wallet') || t.includes('refund')) return { name: 'wallet' as const, gradient: ['#8B5CF6', '#7C3AED'] };
  if (t.includes('system') || t.includes('success') || t.includes('complete')) return { name: 'checkmark-circle' as const, gradient: ['#10B981', '#059669'] };
  if (t.includes('cancel')) return { name: 'close-circle' as const, gradient: ['#EF4444', '#DC2626'] };
  return { name: 'notifications' as const, gradient: ['#F97316', '#EA580C'] };
};

const getRelativeTime = (dateStr: string) => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)}p trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean | string | number;
  created_at: string;
}

const isRead = (val: any): boolean => {
  if (val === true || val === 1 || val === '1' || val === 'true') return true;
  return false;
};

const NotificationItem = ({ item, onMarkRead }: { item: any; onMarkRead: (id: any) => void }) => {
  const icon = getIcon(item.type);
  const read = isRead(item.is_read);
  return (
    <TouchableOpacity
      style={[styles.card, !read && styles.cardUnread]}
      onPress={() => onMarkRead(item.id)}
      activeOpacity={0.6}
    >
      <View style={styles.cardInner}>
        <LinearGradient colors={icon.gradient} style={styles.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={icon.name} size={20} color="#FFF" />
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTitle, !read && styles.cardTitleBold]} numberOfLines={1}>
              {item.title}
            </Text>
            {!read && <View style={styles.newDot} />}
          </View>

          {item.content ? (
            <Text style={styles.cardMessage} numberOfLines={2}>{item.content}</Text>
          ) : null}

          <View style={styles.cardFooter}>
            <View style={styles.timeWrap}>
              <Ionicons name="time-outline" size={11} color="#94A3B8" />
              <Text style={styles.timeLabel}>{getRelativeTime(item.created_at)}</Text>
            </View>

            <View style={[styles.statusChip, read ? styles.chipRead : styles.chipUnread]}>
              <View style={[styles.statusDot, read ? styles.dotGreen : styles.dotOrange]} />
              <Text style={[styles.chipText, read ? styles.chipTextGreen : styles.chipTextOrange]}>
                {read ? 'Đã đọc' : 'Mới'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {!read && <LinearGradient colors={['#F97316', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />}
    </TouchableOpacity>
  );
};

export default function NotificationScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { mergedNotifications, unreadCount, apiLoading, markAsRead: markLocalRead, markAllRead: markLocalAllRead, refreshApi } = useNotifications();

  console.log('[NotificationScreen] merged:', mergedNotifications.length, 'unread:', unreadCount);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshApi();
    setRefreshing(false);
  }, [refreshApi]);

  const markAsRead = async (id: any) => {
    markLocalRead(String(id));
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`https://admin.datxedulich.vip/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    markLocalAllRead();
    try {
      const token = await getToken();
      if (!token) return;
      await fetch('https://admin.datxedulich.vip/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
    } catch (e) { console.log(e); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>THÔNG BÁO</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadgeHeader}>
                <Text style={styles.unreadBadgeText}>{unreadCount} mới</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.readAllBtn}>
              <Ionicons name="checkmark-done" size={16} color="#FFF" />
              <Text style={styles.readAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.readAllBtnDisabled}>
              <Ionicons name="checkmark-done" size={16} color="rgba(255,255,255,0.4)" />
              <Text style={styles.readAllTextDisabled}>Đã đọc</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={mergedNotifications}
        style={{ flex: 1 }}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <NotificationItem item={item} onMarkRead={markAsRead} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor="#FFF"
          />
        }
        ListHeaderComponent={
          unreadCount > 0 ? (
            <View style={styles.filterBar}>
              <View style={styles.filterActive}>
                <Text style={styles.filterActiveText}>Tất cả ({mergedNotifications.length})</Text>
              </View>
              <View style={styles.filterInactive}>
                <Text style={styles.filterInactiveText}>Chưa đọc ({unreadCount})</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          apiLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                <LinearGradient colors={['#E2E8F0', '#F1F5F9']} style={styles.emptyCircleInner}>
                  <Ionicons name="notifications-off-outline" size={40} color="#CBD5E1" />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>Trống rỗng</Text>
              <Text style={styles.emptyDesc}>Chưa có thông báo nào{'\n'}Quay lại sau nhé!</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0284C7',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  unreadBadgeHeader: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 5,
  },
  readAllBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  readAllTextDisabled: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 5,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  filterInactive: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterInactiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  listContent: {
    paddingBottom: 100,
    backgroundColor: '#F1F5F9',
  },

  card: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: 18,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  cardUnread: {
    backgroundColor: '#FFFBF5',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  cardTitleBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chipUnread: {
    backgroundColor: '#FFF7ED',
  },
  chipRead: {
    backgroundColor: '#F0FDF4',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  dotOrange: {
    backgroundColor: '#F97316',
  },
  dotGreen: {
    backgroundColor: '#22C55E',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chipTextOrange: {
    color: '#EA580C',
  },
  chipTextGreen: {
    color: '#16A34A',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyCircleInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
});
