import { DANANG_SPOTS, PROMOTIONS } from "@/constants/data";
import { COLORS, SHADOW } from "@/constants/theme";
import { useCart } from "@/store/CartContext";
import { useUser } from "@/store/UserContext";
import { useNotifications } from "@/store/NotificationContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  {
    id: "van",
    label: "Xe 16 chỗ",
    icon: (props: any) => <MaterialCommunityIcons name="bus-side" {...props} />,
    color: "#0EA5E9",
    route: "/booking",
  },
  {
    id: "food",
    label: "Đồ ăn",
    icon: (props: any) => <Ionicons name="restaurant" {...props} />,
    color: "#F43F5E",
    route: "/food",
  },
  {
    id: "mart",
    label: "Đi chợ",
    icon: (props: any) => <MaterialCommunityIcons name="shopping" {...props} />,
    color: "#8B5CF6",
    route: "/mart",
  },
  {
    id: "express",
    label: "Giao hàng",
    icon: (props: any) => <MaterialCommunityIcons name="truck-delivery" {...props} />,
    color: "#F59E0B",
    route: "/express",
  },
  {
    id: "flight",
    label: "Vé máy bay",
    icon: (props: any) => <Ionicons name="airplane" {...props} />,
    color: "#06B6D4",
    route: "/flight",
  },
  {
    id: "hotel",
    label: "Khách sạn",
    icon: (props: any) => <Ionicons name="business" {...props} />,
    color: "#EC4899",
    route: "/hotel",
  },
  {
    id: "attractions",
    label: "Tham quan",
    icon: (props: any) => <Ionicons name="ticket" {...props} />,
    color: "#10B981",
    route: "/attractions",
  },
  {
    id: "insurance",
    label: "Bảo hiểm",
    icon: (props: any) => <Ionicons name="shield-checkmark" {...props} />,
    color: "#6366F1",
    route: "/insurance",
  },
];

const HomeHeader = ({ unreadCount }: { unreadCount: number }) => {
  const router = useRouter();
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const balance = user?.balance || 0;
  const points = user?.point || 0;
  const displayName = user?.name || "Khách";
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&auto=format&fit=crop";

  return (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={[COLORS.primary, "#7DD3FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.userText}>
                <Text style={styles.greetingText}>{getGreeting()},</Text>
                <Text style={styles.userNameText}>{displayName} ✨</Text>
              </View>
            </View>

            <View style={styles.topIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications" size={22} color={COLORS.white} />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { marginLeft: 15 }]}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Ionicons name="menu" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rewardCard}>
            <TouchableOpacity style={styles.rewardItem}>
              <View style={styles.rewardIconBg}>
                <Ionicons name="sparkles" size={16} color="#FACC15" />
              </View>
              <Text style={styles.rewardText}>Thành viên Kim Cương</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <View style={styles.rewardDivider} />
            <TouchableOpacity style={styles.rewardItem}>
              <Ionicons name="star" size={16} color="#FACC15" />
              <Text style={styles.rewardText}>{points.toLocaleString()} xu</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Floating Wallet Card */}
      <View style={styles.walletWrapper}>
        <View style={styles.walletCard}>
          <View style={styles.walletMain}>
            <TouchableOpacity
              style={styles.walletInfo}
              onPress={() => router.push("/wallet")}
            >
              <Text style={styles.walletLabel}>Số dư tài khoản</Text>
              <Text style={styles.walletAmount}>{(balance || 0).toLocaleString()}đ</Text>
            </TouchableOpacity>
            <View style={styles.walletActions}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push("/wallet/deposit")}
              >
                <View style={styles.actionIconCircle}>
                  <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.actionLabel}>Nạp tiền</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push("/wallet")}
              >
                <View style={styles.actionIconCircle}>
                  <Ionicons name="time-outline" size={22} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.actionLabel}>Lịch sử</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchSection}
          onPress={() => router.push("/booking")}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F0F9FF"]}
            style={styles.searchInner}
          >
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <Text style={styles.searchPlaceholder}>
              Bạn muốn đi đâu hôm nay?
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DiscoverSection = () => {
  const router = useRouter();
  const displaySpots = DANANG_SPOTS.slice(0, 6);
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Khám phá Đà Nẵng</Text>
        <TouchableOpacity onPress={() => router.push("/discover")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spotsScroll}
      >
        {displaySpots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.spotCard}
            onPress={() => router.push(`/discover/${spot.id}`)}
          >
            <Image source={{ uri: spot.image }} style={styles.spotImage} />
            <View style={styles.spotPriceTag}>
              <Text style={styles.spotPrice}>Từ {spot.price}</Text>
            </View>
            <LinearGradient
              colors={["transparent", "rgba(3, 105, 161, 0.8)"]}
              style={styles.spotInfoArea}
            >
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotDesc} numberOfLines={1}>
                {spot.desc}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const PromotionSection = () => {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ưu đãi</Text>
        <TouchableOpacity onPress={() => router.push("/promotion")}>
          <Text style={styles.seeAllText}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promoScroll}
      >
        {PROMOTIONS.map((promo) => (
          <TouchableOpacity
            key={promo.id}
            style={styles.promoCard}
            onPress={() => router.push(`/promotion/${promo.id}`)}
          >
            <Image
              source={{ uri: promo.image }}
              style={styles.promoCardImage}
            />
            <View style={styles.promoCardBadge}>
              <Text style={styles.promoBadgeText}>{promo.type}</Text>
            </View>
            <View style={styles.promoCardContent}>
              <Text style={styles.promoCardTitle} numberOfLines={1}>
                {promo.title}
              </Text>
              <Text style={styles.promoCardSubtitle} numberOfLines={1}>
                {promo.subtitle}
              </Text>
              <View style={styles.promoCardFooter}>
                <Text style={styles.promoExpiry}>{promo.expiry}</Text>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.useNowBtn}
                >
                  <Text style={styles.useNowText}>Dùng ngay</Text>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

import FloatingCart from "@/components/FloatingCart";

export default function HomeScreen() {
  const router = useRouter();
  const { fetchUserInfo, loading } = useUser();
  const { unreadCount, refreshApi } = useNotifications();

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useFocusEffect(
    useCallback(() => {
      console.log('[HomeScreen] focused, calling refreshApi');
      refreshApi();
    }, [refreshApi])
  );

  useEffect(() => {
    console.log('[HomeScreen] unreadCount:', unreadCount);
  }, [unreadCount]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader unreadCount={unreadCount} />

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryItem}
              onPress={() => router.push(item.route as any)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: "#FFFFFF", ...SHADOW.sm },
                ]}
              >
                <item.icon size={28} color={item.color} strokeWidth={2.5} />
              </View>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <DiscoverSection />
        <PromotionSection />

        <View style={{ height: 120 }} />
      </ScrollView>
      <FloatingCart />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
    marginBottom: 100,
  },
  headerGradient: {
    paddingTop: Platform.OS === "android" ? 45 : 10,
    paddingBottom: 90,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.6)",
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  userText: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
  },
  topIcons: {
    flexDirection: "row",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 24,
    marginTop: 25,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  rewardItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rewardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rewardText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "800",
    flex: 1,
  },
  rewardDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 12,
  },
  walletWrapper: {
    position: "absolute",
    bottom: -85,
    left: 20,
    right: 20,
  },
  walletCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 22,
    ...SHADOW.lg,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  walletMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  walletActions: {
    flexDirection: "row",
  },
  actionItem: {
    alignItems: "center",
    marginLeft: 24,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "800",
  },
  searchSection: {
    marginTop: 18,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#E0F2FE",
    ...SHADOW.md,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 12,
    fontWeight: "600",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginTop: 15,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 24,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0369A1",
    textAlign: "center",
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0C4A6E",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "800",
  },
  spotsScroll: {
    paddingRight: 20,
  },
  spotCard: {
    width: 240,
    height: 170,
    marginRight: 18,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    ...SHADOW.md,
    overflow: "hidden",
  },
  spotImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  spotPriceTag: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    zIndex: 2,
    ...SHADOW.sm,
  },
  spotPrice: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  spotInfoArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    height: 80,
    justifyContent: "flex-end",
  },
  spotName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
  },
  spotDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "500",
  },
  promoScroll: {
    paddingRight: 20,
  },
  promoCard: {
    width: 300,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    marginRight: 18,
    overflow: "hidden",
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  promoCardImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  promoCardBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(12, 74, 110, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promoBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  promoCardContent: {
    padding: 18,
  },
  promoCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0C4A6E",
  },
  promoCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: "500",
  },
  promoCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  promoExpiry: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "700",
  },
  useNowBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    ...SHADOW.sm,
  },
  useNowText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
});
