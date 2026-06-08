import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useUser } from '@/store/UserContext';
import { transactionService, Transaction } from '@/services/transactionService';

const TransactionItem = ({ type, title, date, amount, status }: any) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'SUCCESS': return COLORS.success;
      case 'PENDING': return '#F59E0B'; // Amber
      case 'FAILED': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'SUCCESS': return 'Thành công';
      case 'PENDING': return 'Đang xử lý';
      case 'FAILED': return 'Thất bại';
      default: return s;
    }
  };

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: type === 'DEPOSIT' ? '#E8F5E9' : '#FFEBEE' }]}>
        {type === 'DEPOSIT' ? (
          <Ionicons name="arrow-down" size={20} color={COLORS.success} />
        ) : (
          <Ionicons name="arrow-up" size={20} color={COLORS.error} />
        )}
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: type === 'DEPOSIT' ? COLORS.success : COLORS.text }]}>
          {type === 'DEPOSIT' ? '+' : '-'}{amount.toLocaleString('vi-VN')}đ
        </Text>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function WalletScreen() {
  const router = useRouter();
  const { balance } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userId = "user_123"; // Cùng ID với bên nạp tiền

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}đ</Text>
          </View>
          <TouchableOpacity 
            style={styles.depositButton}
            onPress={() => router.push('/wallet/deposit')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.depositButtonText}>Nạp tiền</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.viewAllText}>Làm mới</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : transactions.length > 0 ? (
            transactions.map((item) => (
              <TransactionItem 
                key={item.id}
                type={item.type}
                title={item.type === 'DEPOSIT' ? 'Nạp tiền vào ví' : 'Thanh toán'}
                date={formatDate(item.createdAt)}
                amount={item.amount}
                status={item.status}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Lịch sử</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Liên kết</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW.md,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  depositButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  depositButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    marginTop: SPACING.xl,
    minHeight: 200,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOW.sm,
    marginBottom: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
});
