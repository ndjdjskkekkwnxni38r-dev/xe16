import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { useRouter } from 'expo-router';

const PRESETS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function DepositScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const handlePresetPress = (value: number) => {
    setAmount(value.toString());
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleContinue = () => {
    if (!amount || parseInt(amount) < 10000) {
      alert('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }
    router.push({
      pathname: '/wallet/qr-payment',
      params: { amount: amount }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nạp tiền</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nhập số tiền cần nạp</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
              <Text style={styles.currency}>đ</Text>
            </View>
          </View>

          <View style={styles.presetsGrid}>
            {PRESETS.map((preset) => (
              <TouchableOpacity 
                key={preset} 
                style={[
                  styles.presetItem,
                  amount === preset.toString() && styles.presetItemActive
                ]}
                onPress={() => handlePresetPress(preset)}
              >
                <Text style={[
                  styles.presetText,
                  amount === preset.toString() && styles.presetTextActive
                ]}>
                  {preset.toLocaleString('vi-VN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Phương thức thanh toán</Text>
            <TouchableOpacity style={styles.methodItem}>
              <View style={[styles.methodIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="business" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Chuyển khoản VietQR</Text>
                <Text style={styles.methodSubtitle}>Tự động xác nhận trong 1-3 phút</Text>
              </View>
              <View style={styles.radioButtonActive}>
                <View style={styles.radioButtonInner} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.methodItem, { opacity: 0.5 }]} disabled>
              <View style={[styles.methodIcon, { backgroundColor: '#F5F5F5' }]}>
                <Ionicons name="card" size={24} color={COLORS.textSecondary} />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Thẻ Visa/Mastercard</Text>
                <Text style={styles.methodSubtitle}>Đang bảo trì</Text>
              </View>
              <View style={styles.radioButton} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.xl,
  },
  presetItem: {
    width: '30%',
    margin: '1.66%',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  presetItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E0F2FE',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  presetTextActive: {
    color: COLORS.primary,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  methodSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  radioButtonActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOW.md,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
