import FloatingCart from "@/components/FloatingCart";
import { DANANG_SPOTS } from "@/constants/data";
import { COLORS, SHADOW } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: "all", name: "Tất cả", icon: "ticket-outline" },
  { id: "popular", name: "Phổ biến", icon: "star" },
  { id: "nature", name: "Thiên nhiên", icon: "camera" },
  { id: "food", name: "Ẩm thực", icon: "restaurant" },
];

const COLLECTIONS = [
  {
    id: "c1",
    name: "Đà Nẵng về đêm",
    count: 12,
    img: "https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000",
  },
  {
    id: "c2",
    name: "Tour Bà Nà Hills",
    count: 8,
    img: "https://cdn3.ivivu.com/2024/08/ba-na-hill-iVIVU1-e1724662224847.png",
  },
  {
    id: "c3",
    name: "Khám phá Sơn Trà",
    count: 6,
    img: "https://statics.vinpearl.com/ban-dao-son-tra-7_1629274214.jpg",
  },
  {
    id: "c4",
    name: "Ẩm thực Phố Cổ",
    count: 15,
    img: "https://bcp.cdnchinhphu.vn/334894974524682240/2025/9/18/cdhoian5-17581621538711341831070.jpeg",
  },
  {
    id: "c5",
    name: "Vẻ đẹp Ngũ Hành",
    count: 5,
    img: "https://statics.vinpearl.com/ngu-hanh-son-da-nang-1_1629452077.jpg",
  },
];

export default function AttractionsScreen() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState("popular"); // 'popular' | 'price_asc' | 'price_desc'

  const filteredSpots = useMemo(() => {
    let spots =
      selectedCat === "all"
        ? [...DANANG_SPOTS]
        : DANANG_SPOTS.filter((spot) => spot.categoryId === selectedCat);

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      spots = spots.filter(
        (spot) =>
          spot.name.toLowerCase().includes(q) ||
          spot.location.toLowerCase().includes(q),
      );
    }

    if (sortBy === "price_asc") {
      spots.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, "")) || 0;
        const priceB = parseInt(b.price.replace(/\D/g, "")) || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      spots.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, "")) || 0;
        const priceB = parseInt(b.price.replace(/\D/g, "")) || 0;
        return priceB - priceA;
      });
    }

    return spots;
  }, [selectedCat, searchQuery, sortBy]);

  const handleSearchPress = () => {
    // Gọi focus vào ô tìm kiếm hoặc thực hiện hành động khác khi bấm vào icon search
    // Hiện tại ô tìm kiếm là live-search nên chỉ cần focus vào nó
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Tìm hoạt động, địa điểm..."
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Ionicons name="map" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Flash Sale Banner */}
        <TouchableOpacity
          style={styles.flashSaleCard}
          onPress={() => router.push("/attractions/flash-sale")}
        >
          <LinearGradient
            colors={["#F43F5E", "#E11D48"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.flashSaleGradient}
          >
            <View style={styles.flashSaleInfo}>
              <View style={styles.flashTitleRow}>
                <Ionicons name="flash" size={18} color="#FACC15" />
                <Text style={styles.flashSaleTitle}>
                  Flash Sale Vé Tham Quan
                </Text>
              </View>
              <Text style={styles.flashSaleTime}>
                Kết thúc sau: 02 : 45 : 12
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catItem,
                selectedCat === cat.id && styles.catItemActive,
              ]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={selectedCat === cat.id ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.catText,
                  selectedCat === cat.id && styles.catTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Collections */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bộ sưu tập nổi bật</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colScroll}
        >
          {COLLECTIONS.map((col) => (
            <TouchableOpacity
              key={col.id}
              style={styles.colCard}
              onPress={() => router.push(`/collection/${col.id}`)}
            >
              <Image source={{ uri: col.img }} style={styles.colImg} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.colOverlay}
              >
                <Text style={styles.colName}>{col.name}</Text>
                <Text style={styles.colCount}>{col.count} địa điểm</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Main List */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Hoạt động tại Đà Nẵng</Text>
            <Text style={styles.sectionSubtitle}>
              Gợi ý dựa trên xu hướng du lịch hiện nay
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={14} color={COLORS.primary} />
            <Text style={styles.filterChipText}>Lọc & Sắp xếp</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spotsList}>
          {filteredSpots.map((spot, index) => (
            <Animated.View
              key={spot.id}
              entering={FadeInDown.delay(index * 100)}
            >
              <TouchableOpacity
                style={styles.spotCard}
                onPress={() => router.push(`/discover/${spot.id}`)}
              >
                <View style={styles.spotImgContainer}>
                  <Image source={{ uri: spot.image }} style={styles.spotImg} />
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>
                      THAM QUAN NHIỀU NHẤT
                    </Text>
                  </View>
                </View>
                <View style={styles.spotInfo}>
                  <View>
                    <Text style={styles.spotName} numberOfLines={1}>
                      {spot.name}
                    </Text>
                    <View style={styles.spotLocRow}>
                      <Ionicons name="location" size={12} color="#94A3B8" />
                      <Text style={styles.spotLocText}>{spot.location}</Text>
                    </View>
                  </View>

                  <View style={styles.spotRatingRow}>
                    <View style={styles.starGroup}>
                      <Ionicons name="star" size={12} color="#FACC15" />
                      <Text style={styles.ratingText}>4.9</Text>
                    </View>
                    <Text style={styles.soldText}>• 2k+ đã đặt</Text>
                  </View>

                  <View style={styles.spotFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Giá từ</Text>
                      <Text style={styles.priceValue}>{spot.price}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => router.push(`/discover/${spot.id}`)}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
          {filteredSpots.length === 0 && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text
                style={{ color: "#94A3B8", fontSize: 16, fontWeight: "600" }}
              >
                Không tìm thấy địa điểm phù hợp
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingCart />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc & Sắp xếp</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>

            <TouchableOpacity
              style={[
                styles.filterOption,
                sortBy === "popular" && styles.filterOptionActive,
              ]}
              onPress={() => setSortBy("popular")}
            >
              <View style={styles.filterOptionContent}>
                <Ionicons
                  name="star"
                  size={20}
                  color={sortBy === "popular" ? COLORS.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === "popular" && styles.filterOptionTextActive,
                  ]}
                >
                  Phổ biến nhất
                </Text>
              </View>
              {sortBy === "popular" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                sortBy === "price_asc" && styles.filterOptionActive,
              ]}
              onPress={() => setSortBy("price_asc")}
            >
              <View style={styles.filterOptionContent}>
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={sortBy === "price_asc" ? COLORS.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === "price_asc" && styles.filterOptionTextActive,
                  ]}
                >
                  Giá tăng dần
                </Text>
              </View>
              {sortBy === "price_asc" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                sortBy === "price_desc" && styles.filterOptionActive,
              ]}
              onPress={() => setSortBy("price_desc")}
            >
              <View style={styles.filterOptionContent}>
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={sortBy === "price_desc" ? COLORS.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === "price_desc" && styles.filterOptionTextActive,
                  ]}
                >
                  Giá giảm dần
                </Text>
              </View>
              {sortBy === "price_desc" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerSafe: { backgroundColor: COLORS.white, ...SHADOW.sm, zIndex: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingBottom: 20 },
  flashSaleCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  flashSaleGradient: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flashTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flashSaleTitle: { color: COLORS.white, fontWeight: "900", fontSize: 15 },
  flashSaleTime: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
  catScroll: { paddingHorizontal: 20, paddingVertical: 20 },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  catItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  catTextActive: { color: COLORS.white },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 25,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#0F172A" },
  sectionSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "500",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterChipText: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  colScroll: { paddingLeft: 20, marginBottom: 25 },
  colCard: {
    width: 160,
    height: 220,
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  colImg: { width: "100%", height: "100%" },
  colOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    height: 100,
    justifyContent: "flex-end",
  },
  colName: { color: COLORS.white, fontSize: 15, fontWeight: "900" },
  colCount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  spotsList: { paddingHorizontal: 20 },
  spotCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 20,
    flexDirection: "row",
    padding: 12,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  spotImgContainer: {
    width: 110,
    height: 130,
    borderRadius: 18,
    overflow: "hidden",
  },
  spotImg: { width: "100%", height: "100%" },
  tagBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  tagBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 12,
  },
  spotInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  spotName: { fontSize: 16, fontWeight: "900", color: "#1E293B" },
  spotLocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  spotLocText: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
  spotRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  starGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, fontWeight: "800", color: "#1E293B" },
  soldText: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
  spotFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },
  priceContainer: { gap: 2 },
  priceLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "600" },
  priceValue: { fontSize: 16, fontWeight: "900", color: COLORS.primary },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 15,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },
  filterOptionActive: { borderColor: "#BAE6FD", backgroundColor: "#F0F9FF" },
  filterOptionContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  filterOptionText: { fontSize: 15, fontWeight: "600", color: "#64748B" },
  filterOptionTextActive: { color: COLORS.primary, fontWeight: "800" },

  applyBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    ...SHADOW.sm,
    marginTop: 15,
  },
  applyBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
