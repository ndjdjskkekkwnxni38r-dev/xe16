import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Image, Share, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { transactionService } from '@/services/transactionService';
import { useToast } from '@/components/Toast';
import { useCart } from '@/store/CartContext';

// Placeholder Bank Info - Replace with real ones later
const BANK_INFO = {
  bin: '970422', // MBBank
  accountNo: '0369888888',
  accountName: 'NGUYEN DINH TUONG',
  bankName: 'MB Bank',
};
export default function QRPaymentScreen() {
  const router = useRouter();
  const { amount, desc } = useLocalSearchParams();
  const { showToast } = useToast();
  const { clearCart } = useCart();

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const [description] = useState(desc ? String(desc) : `NAP TIEN VANBOOKING ${Math.floor(Math.random() * 100000)}`);

  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNo}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${BANK_INFO.accountName}`;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    showToast({
      type: 'success',
      message: `Đã sao chép ${label}`
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Chuyển khoản nạp tiền VanBooking: ${amount}đ. Nội dung: ${description}`,
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
    
    // 1. Thực hiện gọi dịch vụ trong background
    transactionService.createDepositRequest("user_123", Number(amount), description)
      .catch(err => console.error("Background Firebase Error:", err));

    // 2. Clear cart if it was an order payment
    const isOrder = description.startsWith('THANH TOAN DON HANG');
    if (isOrder) {
      clearCart();
    }

    // 3. Hiển thị thông báo và tự động điều hướng
    showToast({
      type: 'success',
      message: isOrder 
        ? 'Thanh toán đơn hàng thành công!' 
        : 'Yêu cầu nạp tiền của bạn đã được gửi đi.'
    });

    // 4. Tự động điều hướng sau 1.5 giây
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Đơn hàng hết hạn sau</Text>
          <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.bankHeader}>
            <View style={styles.bankIconPlaceholder}>
              <Text style={styles.bankIconText}>MB</Text>
            </View>
            <View>
              <Text style={styles.bankName}>{BANK_INFO.bankName}</Text>
              <Text style={styles.accountName}>{BANK_INFO.accountName}</Text>
            </View>
          </View>

          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: qrUrl }} 
              style={styles.qrImage} 
              resizeMode="contain"
            />
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền chuyển khoản</Text>
            <Text style={styles.amountValue}>{Number(amount).toLocaleString('vi-VN')}đ</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nội dung chuyển khoản</Text>
              <Text style={styles.infoValue}>{description}</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(description, 'nội dung')}>
              <Ionicons name="copy" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.stepDescription}>Mở ứng dụng Ngân hàng hoặc Ví điện tử</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>2</Text></View>
            <Text style={styles.stepDescription}>Chọn quét mã QR và quét ảnh phía trên</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>3</Text></View>
            <Text style={styles.stepDescription}>Kiểm tra thông tin và xác nhận chuyển khoản</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={16} color="#B45309" />
          <Text style={styles.warningText}>
            Vui lòng nhập chính xác nội dung chuyển khoản để được cộng tiền tự động.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.outlineAction} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color={COLORS.text} />
            <Text style={styles.actionLabel}>Chia sẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineAction} onPress={() => copyToClipboard(qrUrl, 'link QR')}>
            <Ionicons name="download" size={20} color={COLORS.text} />
            <Text style={styles.actionLabel}>Lưu ảnh</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.doneButton, loading && { opacity: 0.7 }]} 
          onPress={handleDone}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.doneButtonText}>Tôi đã chuyển khoản</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 4,
  },
  qrCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  bankIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0054A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bankIconText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  accountName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  instructions: {
    marginTop: SPACING.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 8,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  outlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '48%',
  },
  actionLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  doneButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOW.md,
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
