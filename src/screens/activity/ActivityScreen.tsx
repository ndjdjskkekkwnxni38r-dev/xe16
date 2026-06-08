import { COLORS, SHADOW, SPACING } from "@/constants/theme";
import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal
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

const ACTIVITY_DATA = [
  {
    id: "1",
    type: "ride",
    title: "Van Luxury - Toyota Alphard",
    date: "31 Th3, 2026 • 14:30",
    from: "227 Nguyễn Văn Cừ, Quận 5",
    to: "Sân bay Tân Sơn Nhất",
    status: "completed",
    statusLabel: "Đã hoàn thành",
    price: "250.000đ",
  },
  {
    id: "2",
    type: "food",
    title: "Cơm Gà Bà Buội - Hội An",
    date: "30 Th3, 2026 • 18:45",
    from: "253 Phan Châu Trinh, Hội An",
    to: "Novotel Han River, Đà Nẵng",
    status: "completed",
    statusLabel: "Đã giao hàng",
    price: "145.000đ",
  },
  {
    id: "3",
    type: "ride",
    title: "Chuyến đi liên tỉnh - Ford Transit",
    date: "Hôm nay • 10:30",
    from: "Ga Đà Nẵng",
    to: "Bà Nà Hills",
    status: "ongoing",
    statusLabel: "Đang đón khách",
    price: "450.000đ",
  },
  {
    id: "4",
    type: "delivery",
    title: "Giao hàng nhanh - Hỏa tốc",
    date: "28 Th3, 2026 • 09:15",
    from: "Kho hàng Shopee, Quận 7",
    to: "Landmark 81, Bình Thạnh",
    status: "cancelled",
    statusLabel: "Đã hủy",
    price: "35.000đ",
  },
  {
    id: "5",
    type: "hotel",
    title: "InterContinental Danang Resort",
    date: "20 Th3 - 22 Th3, 2026",
    from: "Phòng King Bed Ocean View",
    to: "Check-in: 14:00 • Check-out: 12:00",
    status: "completed",
    statusLabel: "Đã hoàn tất kỳ nghỉ",
    price: "12.500.000đ",
  },
  {
    id: "6",
    type: "attraction",
    title: "Vé Sun World Bà Nà Hills",
    date: "21 Th3, 2026",
    from: "Vé người lớn - Bao gồm Buffet",
    to: "Số lượng: 02 Vé",
    status: "completed",
    statusLabel: "Đã sử dụng",
    price: "2.100.000đ",
  },
];

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  let bgColor = "#F1F5F9";
  let textColor = "#64748B";
  let iconName: any = "time-outline";

  if (status === "completed") {
    bgColor = "#DCFCE7";
    textColor = "#16A34A";
    iconName = "checkmark-circle";
  } else if (status === "ongoing") {
    bgColor = "#E0F2FE";
    textColor = "#0284C7";
    iconName = "time";
  } else if (status === "cancelled") {
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

const ActivityItem = ({ item }: { item: (typeof ACTIVITY_DATA)[0] }) => {
  const router = useRouter();
  const category = CATEGORIES[item.type] || CATEGORIES.ride;
  const IconLib = category.library;
  const categoryColor = category.color;

  const handlePress = () => {
    if (item.status === "ongoing") {
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
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: categoryColor + "15" },
            ]}
          >
            <IconLib name={category.icon} size={22} color={categoryColor} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
        </View>
        <Text style={styles.cardPrice}>{item.price}</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.routeIndicator}>
            <View
              style={[styles.routeDot, { backgroundColor: categoryColor }]}
            />
            <View style={styles.routeLineDashed} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Từ / Thông tin</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {item.from}
            </Text>
          </View>
        </View>

        <View style={[styles.routePoint, { marginTop: SPACING.xs }]}>
          <View style={styles.routeIndicator}>
            <View
              style={[styles.routeDot, { backgroundColor: COLORS.accent }]}
            />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Đến / Chi tiết</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {item.to}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={COLORS.textSecondary}
          />
          <Text style={styles.footerDate}>{item.date}</Text>
        </View>
        <StatusBadge status={item.status} label={item.statusLabel} />
      </View>

      {item.status === "ongoing" && (
        <TouchableOpacity style={styles.trackButton} onPress={handlePress}>
          <Ionicons name="navigate" size={16} color={COLORS.white} />
          <Text style={trackButtonTextStyles.text}>Theo dõi trực tiếp</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Extracted style to avoid complex object in JSX
const trackButtonTextStyles = StyleSheet.create({
  text: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredData = useMemo(() => {
    return ACTIVITY_DATA.filter((item) => {
      const matchTab = activeTab === "all" || item.status === activeTab;
      const matchCat = selectedCategory === "all" || item.type === selectedCategory;
      const matchSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.to.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchTab && matchCat && matchSearch;
    });
  }, [activeTab, selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {showSearch ? (
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm chuyến đi, đồ ăn..."
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
              <TouchableOpacity style={styles.cancelSearchBtn} onPress={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}>
                <Text style={styles.cancelSearchText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.headerSubtitle}>Lịch sử của bạn</Text>
                <Text style={styles.headerTitle}>Hoạt động</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(true)}>
                  <Ionicons name="search" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { marginLeft: SPACING.sm, backgroundColor: selectedCategory !== "all" ? '#F0F9FF' : '#F8FAFC', borderColor: selectedCategory !== "all" ? '#BAE6FD' : '#E2E8F0' }]}
                  onPress={() => setFilterModalVisible(true)}
                >
                  <Ionicons name="filter" size={20} color={selectedCategory !== "all" ? COLORS.primary : COLORS.text} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Custom Tab Switcher */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  activeTab === tab.id && styles.activeTabItem,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="time-outline" size={48} color={COLORS.border} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy hoạt động</Text>
            <Text style={styles.emptyText}>
              Dường như bạn chưa có hoạt động nào trong danh mục này.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setActiveTab("all")}
            >
              <Text style={styles.emptyButtonText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true} onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo dịch vụ</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.filterOption, selectedCategory === 'all' && styles.filterOptionActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <View style={styles.filterOptionContent}>
                <Ionicons name="apps" size={22} color={selectedCategory === 'all' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.filterOptionText, selectedCategory === 'all' && styles.filterOptionTextActive]}>Tất cả dịch vụ</Text>
              </View>
              {selectedCategory === 'all' && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
            </TouchableOpacity>

            {Object.keys(CATEGORIES).map((key) => {
              const cat = CATEGORIES[key];
              const isSelected = selectedCategory === key;
              const IconLib = cat.library;
              
              return (
                <TouchableOpacity 
                  key={key}
                  style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <View style={styles.filterOptionContent}>
                    <IconLib name={cat.icon} size={22} color={isSelected ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextActive]}>{cat.label}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    alignItems: "center",
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
    alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 15,
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
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  closeModalBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  
  filterOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  filterOptionActive: { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' },
  filterOptionContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  filterOptionText: { fontSize: 16, fontWeight: '600', color: '#475569' },
  filterOptionTextActive: { color: COLORS.primary, fontWeight: '800' },

  applyBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', ...SHADOW.sm, marginTop: 15 },
  applyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }
});
