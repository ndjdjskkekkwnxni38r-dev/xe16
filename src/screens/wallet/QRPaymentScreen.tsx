import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, Image, Share, ActivityIndicator, Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOW } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { depositService } from '@/services/depositService';
import { useToast } from '@/components/Toast';
import { useUser } from '@/store/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FALLBACK_BANK = {
  bin: '970422',
  accountNo: '0369888888',
  accountName: 'NGUYEN DINH TUONG',
  bankName: 'MB Bank',
};

export default function QRPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    depositId, amount, desc, qrUrl: apiQrUrl,
    bankName: apiBankName, accountNo: apiAccountNo, accountName: apiAccountName
  } = useLocalSearchParams();
  const { showToast } = useToast();
  const { fetchUserInfo } = useUser();

  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string>('pending');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amountNum = Number(amount) || 0;
  const description = desc ? String(desc) : `NAP TIEN VANBOOKING ${Math.floor(Math.random() * 100000)}`;
  const bankName = apiBankName || FALLBACK_BANK.bankName;
  const accountNo = apiAccountNo || FALLBACK_BANK.accountNo;
  const accountName = apiAccountName || FALLBACK_BANK.accountName;
  const bankBin = FALLBACK_BANK.bin;

  const finalQrUrl = apiQrUrl
    ? String(apiQrUrl)
    : `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amountNum}&addInfo=${description}&accountName=${accountName}`;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Poll deposit status
  useEffect(() => {
    if (!depositId || depositStatus !== 'pending') return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await depositService.checkStatus(depositId);
        if (res.success && res.data?.status) {
          const st = res.data.status.toLowerCase();
          if (st === 'success' || st === 'completed') {
            setDepositStatus('success');
            fetchUserInfo();
            showToast({ type: 'success', message: 'Nạp tiền thành công!' });
            setTimeout(() => router.replace('/(tabs)'), 1500);
          } else if (st === 'failed') {
            setDepositStatus('failed');
          }
        }
      } catch {}
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [depositId, depositStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    showToast({ type: 'success', message: `Đã sao chép ${label}` });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Chuyển khoản nạp tiền VanBooking: ${amountNum.toLocaleString('vi-VN')}đ. Nội dung: ${description}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleDone = async () => {
    setLoading(true);
    if (depositId) {
      try {
        const res = await depositService.checkStatus(depositId);
        if (res.success && res.data?.status?.toLowerCase() === 'success') {
          setDepositStatus('success');
          fetchUserInfo();
          showToast({ type: 'success', message: 'Nạp tiền thành công!' });
          setTimeout(() => router.replace('/(tabs)'), 1500);
          setLoading(false);
          return;
        }
      } catch {}
    }
    showToast({
      type: 'info',
      message: 'Yêu cầu đang xử lý. Vui lòng chờ trong vài phút.'
    });
    setTimeout(() => router.replace('/(tabs)'), 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán QR</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status / Timer */}
        <View style={styles.statusCard}>
          {depositStatus === 'success' ? (
            <View style={styles.statusCenter}>
              <View style={[styles.statusIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              </View>
              <Text style={[styles.statusTitle, { color: '#10B981' }]}>Nạp tiền thành công!</Text>
              <Text style={styles.statusDesc}>Số dư đã được cập nhật</Text>
            </View>
          ) : depositStatus === 'failed' ? (
            <View style={styles.statusCenter}>
              <View style={[styles.statusIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="close-circle" size={40} color="#EF4444" />
              </View>
              <Text style={[styles.statusTitle, { color: '#EF4444' }]}>Giao dịch thất bại</Text>
              <Text style={styles.statusDesc}>Vui lòng thử lại</Text>
            </View>
          ) : (
            <View style={styles.statusCenter}>
              <Text style={styles.statusLabel}>Đơn hàng hết hạn sau</Text>
              <View style={styles.timerWrap}>
                <Ionicons name="time-outline" size={18} color="#EF4444" />
                <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
              </View>
              <View style={styles.pulseIndicator}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseText}>Đang chờ thanh toán</Text>
              </View>
            </View>
          )}
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          {/* Bank Info */}
          <View style={styles.bankRow}>
            <View style={[styles.bankLogo, { backgroundColor: '#0054A5' }]}>
              <Text style={styles.bankLogoText}>{bankName.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankName}>{bankName}</Text>
              <Text style={styles.accountNameText}>{accountName}</Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrWrap}>
            <Image
              source={{ uri: finalQrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Số tiền</Text>
            <Text style={styles.amountValue}>{amountNum.toLocaleString('vi-VN')}đ</Text>
          </View>

          {/* Description */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Nội dung CK</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{description}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(description, 'nội dung')}
            >
              <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Số TK</Text>
              <Text style={styles.detailValue}>{accountNo}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(accountNo, 'số tài khoản')}
            >
              <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Hướng dẫn thanh toán</Text>
          {[
            'Mở ứng dụng Ngân hàng hoặc Ví điện tử',
            'Chọn quét mã QR và quét mã bên trên',
            'Nhập đúng nội dung chuyển khoản',
            'Xác nhận thanh toán'
          ].map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="alert-circle" size={18} color="#D97706" />
          <Text style={styles.warningText}>
            Nhập chính xác nội dung chuyển khoản để được cộng tiền tự động trong 1-3 phút.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Chia sẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => copyToClipboard(finalQrUrl, 'link QR')}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Lưu ảnh QR</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 36) + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDone}
          disabled={loading}
          style={loading ? { opacity: 0.7 } : undefined}
        >
          <LinearGradient
            colors={depositStatus === 'success' ? ['#10B981', '#059669'] : ['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.doneBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.doneBtnText}>Tôi đã chuyển khoản</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...SHADOW.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Status / Timer
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOW.sm,
  },
  statusCenter: {
    alignItems: 'center',
  },
  statusIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#EF4444',
    marginLeft: 6,
    fontVariant: ['tabular-nums'],
  },
  pulseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  pulseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  // QR Card
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOW.sm,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankLogoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  accountNameText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  qrImage: {
    width: width * 0.55,
    height: width * 0.55,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailLeft: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  // Steps
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOW.sm,
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  stepText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  // Warning
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 6,
  },
  // Footer
  footer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOW.lg,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    ...SHADOW.md,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 8,
  },
});
