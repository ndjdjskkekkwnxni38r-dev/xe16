import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Alert, 
  Platform, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { router } from 'expo-router';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/store/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MenuItem = ({ iconName, title, subtitle, onPress, color = COLORS.text }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={iconName} size={20} color={color} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { showToast } = useToast();
  const { user, logout } = useUser();
  const insets = useSafeAreaInsets();

  // Hàm xử lý cho các tính năng chưa hoàn thiện
  const handleWIP = (featureName: string) => {
    showToast({
      message: `Tính năng "${featureName}" đang được phát triển!`,
      type: 'info'
    });
  };

  // Hàm xử lý đăng xuất trực tiếp với thông báo Toast
  const handleLogout = async () => {
    try {
      await logout();
      showToast({ message: 'Đã đăng xuất thành công', type: 'success' });
      router.replace('/send-otp');
    } catch (error) {
      showToast({ message: 'Lỗi khi đăng xuất', type: 'error' });
    }
  };

  const displayName = user?.name || "Khách";
  const avatarUrl = user?.avatar || 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg';
  const balance = user?.balance || 0;
  const points = user?.point || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}>
        
        {/* Header & Avatar Info */}
        <View style={styles.header}>
          <SafeAreaView>
            <View style={styles.profileInfo}>
              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: avatarUrl }} 
                  style={styles.avatar} 
                />
                <TouchableOpacity style={styles.editAvatarBtn} onPress={() => router.push('/edit-profile')}>
                  <Ionicons name="camera" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{displayName}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.rankBadge}>
                    <Ionicons name="star" size={12} color="#FACC15" />
                    <Text style={styles.rankText}>Thành viên Vàng</Text>
                  </View>
                  <View style={styles.pointBadge}>
                    <Text style={styles.pointText}>{points} Điểm</Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Stats Row */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statBox} onPress={() => router.push('/history')}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Chuyến đi</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statBox} onPress={() => router.push('/reviews')}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statBox} onPress={() => router.push('/promotion')}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>Ưu đãi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletWrapper}>
          <TouchableOpacity onPress={() => router.push('/wallet')}>
            <LinearGradient colors={['#0EA5E9', '#0284C7']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.walletCard}>
              <View style={styles.walletInfo}>
                <View style={styles.walletLabelContainer}>
                  <Ionicons name="wallet-outline" size={18} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.walletLabel}>Số dư ví VanPay</Text>
                </View>
                <Text style={styles.walletBalance}>{(balance || 0).toLocaleString()} đ</Text>
              </View>
              <TouchableOpacity 
                style={styles.depositButton}
                onPress={() => router.push('/wallet/deposit')}
              >
                <Ionicons name="add" size={18} color="#0284C7" />
                <Text style={styles.depositText}>Nạp ngay</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Tài khoản của tôi</Text>
          <View style={styles.sectionCard}>
            <MenuItem 
              iconName="time-outline" 
              title="Lịch sử đặt vé" 
              subtitle="Xem các chuyến đi và vé tham quan đã mua" 
              color="#F59E0B"
              onPress={() => router.push('/history')}
            />
            <MenuItem 
              iconName="card-outline" 
              title="Quản lý thanh toán" 
              subtitle="Thẻ tín dụng, thẻ ghi nợ & ngân hàng" 
              color="#3B82F6"
              onPress={() => router.push('/payment')}
            />
            <MenuItem 
              iconName="location-outline" 
              title="Địa điểm đã lưu" 
              subtitle="Nhà, Cơ quan, Điểm đến yêu thích" 
              color="#10B981"
              onPress={() => router.push('/saved-places')}
            />
          </View>

          <Text style={styles.sectionLabel}>Khuyến mãi & Đánh giá</Text>
          <View style={styles.sectionCard}>
            <MenuItem 
              iconName="ticket-outline" 
              title="Mã giảm giá của tôi" 
              subtitle="Quản lý voucher và phần thưởng" 
              color="#EF4444"
              onPress={() => router.push('/promotion')}
            />
            <MenuItem 
              iconName="star-outline" 
              title="Đánh giá của tôi" 
              color="#8B5CF6"
              onPress={() => router.push('/reviews')}
            />
          </View>

          <Text style={styles.sectionLabel}>Cài đặt & Hỗ trợ</Text>
          <View style={styles.sectionCard}>
            <MenuItem iconName="settings-outline" title="Cài đặt tài khoản" color="#64748B" onPress={() => router.push('/settings')} />
            <MenuItem iconName="notifications-outline" title="Thông báo" color="#64748B" onPress={() => router.push('/notifications')} />
            <MenuItem iconName="shield-checkmark-outline" title="Quyền riêng tư" color="#64748B" onPress={() => router.push('/privacy')} />
            <MenuItem iconName="help-buoy-outline" title="Trung tâm trợ giúp" color="#64748B" onPress={() => router.push('/help')} />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>VanBooking App v1.0.0</Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOW.sm,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#F0F9FF',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rankText: {
    color: '#A16207',
    fontSize: 12,
    fontWeight: '800',
  },
  pointBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  statsWrapper: {
    paddingHorizontal: 20,
    marginTop: -25,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 15,
    ...SHADOW.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  walletWrapper: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  walletCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW.md,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  walletLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  walletBalance: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  depositButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 4,
  },
  depositText: {
    color: '#0284C7',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '900',
    marginTop: 25,
    marginBottom: 10,
    paddingLeft: 5,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 15,
    ...SHADOW.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginTop: 35,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 25,
    fontWeight: '600',
  },
});
