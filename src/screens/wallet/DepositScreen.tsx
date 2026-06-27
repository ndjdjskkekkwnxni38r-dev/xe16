import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Platform,
  ActivityIndicator, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOW } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { depositService } from '@/services/depositService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PRESETS = [
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
  { value: 200000, label: '200K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1Tr' },
  { value: 2000000, label: '2Tr' },
  { value: 5000000, label: '5Tr' },
  { value: 10000000, label: '10Tr' },
];

export default function DepositScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const amountNum = parseInt(displayAmount.replace(/\./g, '')) || 0;
  const isValid = amountNum >= 10000;

  const formatWithDots = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return '';
    return parseInt(cleaned).toLocaleString('vi-VN');
  };

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    if (raw.length > 12) return;
    setDisplayAmount(formatWithDots(raw));
  };

  const handlePresetPress = (value: number) => {
    setDisplayAmount(value.toLocaleString('vi-VN'));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleContinue = async () => {
    if (!isValid) {
      return;
    }
    setLoading(true);
    try {
      const res = await depositService.createDeposit(amountNum);
      if (res.success && res.data) {
        router.push({
          pathname: '/wallet/qr-payment',
          params: {
            depositId: String(res.data.id),
            amount: String(res.data.amount),
            desc: res.data.description,
            qrUrl: res.data.qr_code_url || '',
            bankName: res.data.bank_info?.bank_name || '',
            accountNo: res.data.bank_info?.account_no || '',
            accountName: res.data.bank_info?.account_name || '',
          }
        });
      } else {
        alert(res.message || 'Không thể tạo yêu cầu nạp tiền');
      }
    } catch (e: any) {
      alert('Lỗi kết nối: ' + (e?.message || 'Thử lại sau'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

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
            <Text style={styles.headerTitle}>Nạp tiền</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        {/* Amount Display */}
        <View style={styles.amountDisplay}>
          <Text style={styles.amountLabel}>Số tiền nạp</Text>
          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              value={displayAmount}
              onChangeText={handleAmountChange}
              selectionColor="#fff"
              autoFocus
            />
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>VNĐ</Text>
            </View>
          </View>
          {amountNum > 0 && (
            <Text style={styles.amountWords}>
              {amountNum.toLocaleString('vi-VN')} đồng
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Presets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Chọn nhanh</Text>
          </View>
          <View style={styles.presetsGrid}>
              {PRESETS.map((item) => {
                const isActive = displayAmount === item.value.toLocaleString('vi-VN');
                return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  onPress={() => handlePresetPress(item.value)}
                >
                  <LinearGradient
                    colors={isActive ? [COLORS.primary, '#0284C7'] : ['#F8FAFC', '#F1F5F9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.presetCard, isActive && styles.presetCardActive]}
                  >
                    <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.presetValue, isActive && styles.presetValueActive]}>
                      {item.value.toLocaleString('vi-VN')}đ
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#EFF6FF', '#DBEAFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.methodCard}
            >
              <View style={styles.methodLeft}>
                <View style={styles.methodIconWrap}>
                  <Ionicons name="qr-code" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.methodTitle}>VietQR</Text>
                  <Text style={styles.methodDesc}>Chuyển khoản qua mã QR</Text>
                </View>
              </View>
              <View style={styles.methodCheck}>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color="#F59E0B" />
          <Text style={styles.infoText}>
            Quét mã QR và chuyển khoản đúng nội dung để được cộng tiền tự động trong 1-3 phút.
          </Text>
        </View>
      </ScrollView>

      {/* Footer - fixed at bottom */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 36) + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!isValid || loading}
        >
          <LinearGradient
            colors={isValid ? [COLORS.primary, '#0284C7'] : ['#CBD5E1', '#94A3B8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.continueBtnText}>Tiếp tục</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  amountDisplay: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  amountLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    paddingVertical: 4,
  },
  currencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  amountWords: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 4,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: (width - 52) / 4,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetCardActive: {
    borderColor: 'rgba(255,255,255,0.4)',
    ...SHADOW.md,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  presetLabelActive: {
    color: '#fff',
  },
  presetValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  presetValueActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  methodCardDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  methodDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  methodCheck: {
    marginLeft: 10,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOW.lg,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    ...SHADOW.md,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginRight: 8,
  },
});
