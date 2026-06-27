import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Platform, StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOW } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useUser } from '@/store/UserContext';
import { depositService, DepositHistoryItem } from '@/services/depositService';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const balance = user?.balance ?? 0;
  const [history, setHistory] = useState<DepositHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await depositService.getHistory();
      if (res.success && res.data) {
        setHistory(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Error fetching deposit history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return { label: 'Thành công', color: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-circle' as const, amountColor: '#16A34A' };
      case 'pending':
      case 'processing':
        return { label: 'Đang xử lý', color: '#D97706', bg: '#FEF3C7', icon: 'time' as const, amountColor: '#D97706' };
      case 'failed':
      case 'cancelled':
        return { label: 'Thất bại', color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle' as const, amountColor: '#DC2626' };
      default:
        return { label: status || 'N/A', color: '#6B7280', bg: '#F3F4F6', icon: 'help-circle' as const, amountColor: '#6B7280' };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const groupByDate = (items: DepositHistoryItem[]) => {
    const groups: { label: string; data: DepositHistoryItem[] }[] = [];
    const map = new Map<string, DepositHistoryItem[]>();
    items.forEach((item) => {
      const key = formatDate(item.created_at) || 'Không rõ';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    map.forEach((data, label) => groups.push({ label, data }));
    return groups;
  };

  const formatMoney = (val: number) => Math.round(val).toLocaleString('vi-VN');

  const groupedHistory = groupByDate(history);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ví của tôi</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceLabelRow}>
              <View style={styles.balanceDot} />
              <Text style={styles.balanceLabel}>Tổng số dư</Text>
            </View>
            <Text style={styles.balanceValue}>{formatMoney(balance)}đ</Text>
          </View>

          {/* Nạp tiền button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.depositBtn}
            onPress={() => router.push('/wallet/deposit')}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.depositBtnText}>Nạp tiền</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* Body */}
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 36) + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* History Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            <Text style={styles.sectionSub}>
              {history.length > 0 ? `${history.length} giao dịch gần nhất` : 'Chưa có giao dịch'}
            </Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
          </View>
        ) : history.length > 0 ? (
          groupedHistory.map((group, gi) => (
            <View key={gi}>
              <View style={styles.dateGroupHeader}>
                <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                <Text style={styles.dateGroupText}>{group.label}</Text>
              </View>
              {group.data.map((item, index) => {
                const statusCfg = getStatusConfig(item.status);
                const isSuccess = item.status?.toLowerCase() === 'success' || item.status?.toLowerCase() === 'completed';
                return (
                  <TouchableOpacity
                    key={item.id ?? index}
                    activeOpacity={0.7}
                    style={styles.historyCard}
                  >
                    <View style={[styles.historyIconWrap, { backgroundColor: statusCfg.bg }]}>
                      <Ionicons name={statusCfg.icon} size={22} color={statusCfg.color} />
                    </View>
                    <View style={styles.historyBody}>
                      <View style={styles.historyBodyTop}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {item.description || 'Nạp tiền vào ví'}
                        </Text>
                        <Text style={[styles.historyAmount, { color: statusCfg.amountColor }]}>
                          {isSuccess ? '+' : ''}{formatMoney(item.amount)}đ
                        </Text>
                      </View>
                      <View style={styles.historyBodyBottom}>
                        <Text style={styles.historyTime}>{formatTime(item.created_at)}</Text>
                        <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                        <Text style={[styles.historyStatus, { color: statusCfg.color }]}>
                          {statusCfg.label}
                        </Text>
                      </View>
                      {item.bank_info?.bank_name && (
                        <View style={styles.bankRow}>
                          <Ionicons name="business-outline" size={12} color="#94A3B8" />
                          <Text style={styles.bankInfoText}>
                            {item.bank_info.bank_name}{item.bank_info.account_no ? ` • ${item.bank_info.account_no}` : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#FFF7ED', '#FFEDD5']}
              style={styles.emptyIconWrap}
            >
              <Ionicons name="wallet-outline" size={44} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
            <Text style={styles.emptyDesc}>Bắt đầu nạp tiền để sử dụng dịch vụ</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.emptyBtn}
              onPress={() => router.push('/wallet/deposit')}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyBtnGradient}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Nạp tiền ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Header */
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOW.lg,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  /* Balance */
  balanceSection: {
    paddingHorizontal: 24, marginTop: 8, marginBottom: 16,
  },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 6, letterSpacing: -1 },

  /* Nạp tiền button */
  depositBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 4,
    backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 14,
  },
  depositBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.primary },

  /* Body */
  body: { flex: 1 },

  /* Section */
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  sectionSub: { fontSize: 12, fontWeight: '500', color: '#94A3B8', marginTop: 2 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Loading */
  loadingWrap: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 12, fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  /* Date Group */
  dateGroupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, marginTop: 16, marginBottom: 8,
  },
  dateGroupText: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  /* History Card */
  historyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20,
    marginBottom: 8, padding: 14, ...SHADOW.sm,
  },
  historyIconWrap: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  historyBody: { flex: 1, marginLeft: 12 },
  historyBodyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A', marginRight: 8 },
  historyAmount: { fontSize: 15, fontWeight: '800' },
  historyBodyBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  historyTime: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  historyStatus: { fontSize: 11, fontWeight: '700' },
  bankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F8FAFC',
  },
  bankInfoText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  /* Empty */
  emptyContainer: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 40 },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 24 },
  emptyBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
