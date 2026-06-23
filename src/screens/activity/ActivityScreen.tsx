import { COLORS, SHADOW, SPACING } from "@/constants/theme";
import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import socketService from '@/services/socket';
import { useUser } from '@/store/UserContext';
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "ongoing", label: "Đang đến" },
  { id: "completed", label: "Lịch sử" },
  { id: "cancelled", label: "Đã hủy" },
];

const CATEGORIES: any = {
  ride: {
    label: "Chuyến đi",
    icon: "car",
    library: MaterialCommunityIcons,
    color: "#0EA5E9",
  },
  food: {
    label: "Đồ ăn",
    icon: "food-fork-drink",
    library: MaterialCommunityIcons,
    color: "#F43F5E",
  },
  delivery: {
    label: "Giao hàng",
    icon: "package-variant-closed",
    library: MaterialCommunityIcons,
    color: "#8B5CF6",
  },
  hotel: {
    label: "Khách sạn",
    icon: "bed",
    library: Ionicons,
    color: "#EC4899",
  },
  attraction: {
    label: "Tham quan",
    icon: "ticket",
    library: MaterialCommunityIcons,
    color: "#10B981",
  },
};

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  let bgColor = "#F1F5F9";
  let textColor = "#64748B";
  let iconName: any = "time-outline";

  const s = status.toLowerCase();

  if (s.includes("completed") || s.includes("hoàn thành")) {
    bgColor = "#DCFCE7";
    textColor = "#16A34A";
    iconName = "checkmark-circle";
  } else if (
    s.includes("pending") || 
    s.includes("accepted") || 
    s.includes("picking") ||
    s.includes("delivering") ||
    s.includes("đang")
  ) {
    bgColor = "#E0F2FE";
    textColor = "#0284C7";
    iconName = "time";
  } else if (s.includes("cancelled") || s.includes("hủy")) {
    bgColor = "#FEE2E2";
    textColor = "#DC2626";
    iconName = "close-circle";
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <Ionicons
        name={iconName}
        size={14}
        color={textColor}
        style={{ marginRight: 4 }}
      />
      <Text style={[styles.statusBadgeText, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
};

// ... (các import khác giữ nguyên)

const ActivityItem = ({ item }: { item: any }) => {
  const router = useRouter();
  const category = CATEGORIES[item.type] || CATEGORIES.ride;
  const IconLib = category.library;
  const categoryColor = category.color;

  const handlePress = () => {
    if (['pending', 'accepted', 'picking', 'delivering'].includes(item.status)) {
      router.push(`/activity/tracking/${item.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.activityCard}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <IconLib name={category.icon} size={24} color={categoryColor} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <Text style={styles.cardPrice}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.routeIndicator}>
            <View style={[styles.routeDot, { backgroundColor: categoryColor }]} />
            <View style={styles.routeLineDashed} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Điểm đón</Text>
            <Text style={styles.routeText} numberOfLines={1}>{item.from}</Text>
          </View>
        </View>
        <View style={styles.routePoint}>
          <View style={styles.routeIndicator}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.error }]} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Điểm đến</Text>
            <Text style={styles.routeText} numberOfLines={1}>{item.to}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerDate}>{item.date}</Text>
        </View>
        <StatusBadge status={item.status} label={item.statusLabel} />
      </View>

      {/* Nút theo dõi trực tiếp */}
      {['pending', 'accepted', 'picking', 'delivering'].includes(item.status) && (
        <TouchableOpacity style={styles.trackButton} onPress={handlePress}>
          <Ionicons name="navigate" size={16} color={COLORS.white} />
          <Text style={trackButtonTextStyles.text}>Theo dõi trực tiếp</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const trackButtonTextStyles = StyleSheet.create({
  text: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default function ActivityScreen() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    console.log('[ActivityScreen] Starting fetchBookings...');
    try {
      const token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      
      console.log('[ActivityScreen] Token used for fetch:', token ? 'Bearer ' + token.substring(0, 10) + '...' : 'NONE');
      if (!token) {
        console.warn('[ActivityScreen] No token found. Skipping fetch.');
        return;
      }

      const response = await fetch('https://admin.datxedulich.vip/api/customer/bookings/history', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
      });

      console.log('[ActivityScreen] Response status:', response.status);
      const resData = await response.json();
      console.log('[ActivityScreen] Raw API response:', resData);

      // Xử lý dữ liệu linh hoạt hơn
      const bookingsArray = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      console.log('[ActivityScreen] Processed bookings array length:', bookingsArray.length);
      
      const mapped = bookingsArray
        .map((b: any, index: number) => ({
          id: (b.booking_id || b.id || `booking-${index}-${b.created_at || Date.now()}`).toString(),
          type: 'ride', 
          title: b.vehicle_type?.name || 'Đặt xe',
          date: b.created_at || '---',
          from: b.pickup_address || '---',
          to: b.dropoff_address || '---',
          status: (b.status || 'unknown').toLowerCase(),
          statusLabel: b.status_label || b.status_text || '---',
          price: b.total_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(b.total_price) : '---',
          driver_phone: b.driver?.phone || null
        }));
      console.log('[ActivityScreen] Mapped bookings count:', mapped.length);
      setBookings(mapped);
    } catch (e) { 
      console.error('[ActivityScreen] Error during fetch:', e); 
    }
    finally { setLoading(false); }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  useEffect(() => {
    if (!user?.id) return;
    
    const setupSocket = async () => {
      const socket = await socketService.connect();
      if (!socket) {
        console.error('[Socket] Cannot connect to socket service!');
        return;
      }
      
      console.log('[Socket] Connected for ActivityScreen, User ID:', user.id);
      
      // Đăng ký kênh để nhận sự kiện private
      const channelName = `private-customer.${user.id}`;
      socket.emit('subscribe', { channel: channelName });
      console.log(`[Socket] Subscribed to channel: ${channelName}`);

      const handleUpdate = async (eventName: string, data: any) => {
        // Log dữ liệu nhận được chi tiết
        console.log(`[Socket] Event ${eventName} received. Data:`, JSON.stringify(data));
        
        const payload = Array.isArray(data) ? data[0] : data;

        // Nếu là sự kiện timeout, gọi fetchBookings để cập nhật lại danh sách từ server
        if (eventName.includes('booking-search-timeout')) {
          console.log('[Socket] Timeout event detected, refreshing bookings...');
          fetchBookings();
          return;
        }

        // Update local state bookings immediately
        setBookings(prevBookings => {
          const bookingId = payload?.booking_id || payload?.id;
          if (bookingId) {
            console.log('[Socket] Applying update for:', bookingId, 'New status:', payload.status);
            return prevBookings.map(b => 
              b.id == bookingId ? { 
                ...b, 
                status: (payload.status || b.status).toLowerCase(),
                statusLabel: payload.message || b.statusLabel,
                driver_phone: payload.driver?.phone || b.driver_phone 
              } : b
            );
          }
          return prevBookings;
        });
      };

      // 2. Lắng nghe wildcard cho mọi event của user
      const userChannelId = `private-customer.${user.id}`;
      socket.offAny();
      socket.onAny((event, data) => {
         console.log(`[Socket] Received event: ${event}`);

         // Kiểm tra nếu tên sự kiện chứa ID người dùng (vd: private-customer.12)
         // Cách này bỏ qua các tiền tố lạ như 'laravel_database_'
         if (event.includes(userChannelId)) {
           console.log(`[Socket] Matched event: ${event}`);
           handleUpdate(event, data);
         }
      });

      console.log('[Socket] Listeners registered.');

      return () => {
        socket.emit('unsubscribe', { channel: channelName });
        socket.offAny();
        console.log('[Socket] Listeners cleaned up.');
      };
    };

    setupSocket();
  }, [user?.id]);

  const filteredData = useMemo(() => {
    return bookings.filter((item) => {
      const status = item.status.toLowerCase(); 
      const ongoingStatuses = ['pending', 'accepted', 'picking', 'delivering'];
      const isOngoing = ongoingStatuses.includes(status);
      
      const matchTab = activeTab === "all" || 
                       (activeTab === 'ongoing' ? isOngoing : status === activeTab);
      
      const matchCat = selectedCategory === "all" || item.type === selectedCategory;
      const matchSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.to.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchTab && matchCat && matchSearch;
    });
  }, [activeTab, selectedCategory, searchQuery, bookings]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          {showSearch ? (
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.cancelSearchBtn} onPress={() => { setShowSearch(false); setSearchQuery(""); }}>
                <Text style={styles.cancelSearchText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.headerTitle}>Hoạt động</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(true)}>
                  <Ionicons name="search" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}><Ionicons name="time-outline" size={48} color={COLORS.border} /></View>
              <Text style={styles.emptyTitle}>Không có hoạt động</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOW.md,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 15,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: 120,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: SPACING.md,
  },
  routeContainer: {
    paddingLeft: 4,
  },
  routePoint: {
    flexDirection: "row",
  },
  routeIndicator: {
    alignItems: "center",
    width: 20,
    marginRight: 10,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  routeLineDashed: {
    width: 1.5,
    height: 25,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.lg,
    backgroundColor: "#F8FAFC",
    marginHorizontal: -SPACING.md,
    marginBottom: -SPACING.md,
    padding: SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  trackButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: SPACING.lg,
    ...SHADOW.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  cancelSearchBtn: {
    marginLeft: 15,
    paddingVertical: 10,
  },
  cancelSearchText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
