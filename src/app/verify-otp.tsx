import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, TextInput, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck, RefreshCcw } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

import * as SecureStore from 'expo-secure-store';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      showToast?.({ message: 'Vui lòng nhập đầy đủ mã OTP', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://admin.datxedulich.vip/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phone,
          otp: otp 
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // Lưu access_token vào bộ nhớ (SecureStore cho Mobile, localStorage cho Web)
        if (data.access_token) {
          if (Platform.OS === 'web') {
            localStorage.setItem('access_token', data.access_token);
          } else {
            await SecureStore.setItemAsync('access_token', data.access_token);
          }
        }

        showToast?.({ message: 'Xác thực thành công!', type: 'success' });
        
        setTimeout(() => {
          if (data.is_profile_completed === false) {
            router.replace('/edit-profile');
          } else {
            router.replace('/(tabs)');
          }
        }, 1500);
      } else {
        showToast?.({ message: data.message || 'Mã OTP không chính xác', type: 'error' });
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      showToast?.({ message: 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setLoading(true);
    try {
      const response = await fetch('https://admin.datxedulich.vip/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phone }),
      });
      if (response.ok) {
        showToast?.({ message: 'Đã gửi lại mã OTP!', type: 'success' });
        setTimer(60);
        setOtp('');
      } else {
        showToast?.({ message: 'Gửi lại mã thất bại', type: 'error' });
      }
    } catch (error) {
      showToast?.({ message: 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận OTP</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.iconHeader}>
            <View style={styles.iconBox}>
              <ShieldCheck size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.titleText}>Xác nhận OTP</Text>
            <Text style={styles.subText}>
              Chúng tôi đã gửi mã xác thực đến số điện thoại <Text style={{fontWeight: '800', color: '#1E293B'}}>{phone}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã xác thực OTP</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <ShieldCheck size={20} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  placeholder="Nhập mã OTP"
                  placeholderTextColor="#94A3B8"
                  maxLength={6}
                  letterSpacing={stepLetterSpacing(otp)}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleVerifyOTP} 
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient 
              colors={[COLORS.primary, '#0284C7']} 
              style={styles.submitGradient} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Xác nhận</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>Không nhận được mã?</Text>
            <TouchableOpacity 
              onPress={handleResendOTP} 
              disabled={timer > 0 || loading}
              style={styles.resendBtn}
            >
              {timer > 0 ? (
                <Text style={styles.timerText}>Gửi lại sau ({timer}s)</Text>
              ) : (
                <View style={styles.resendRow}>
                  <RefreshCcw size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.resendText}>Gửi lại ngay</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stepLetterSpacing = (val: string) => {
  return val.length > 0 ? 8 : 0;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 20, backgroundColor: '#F8FAFC', zIndex: 10 
  },
  backBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, ...SHADOW.sm },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { paddingHorizontal: 24 },
  
  iconHeader: { alignItems: 'center', marginVertical: 30 },
  iconBox: { 
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: '#E0F2FE', alignItems: 'center', 
    justifyContent: 'center', marginBottom: 24 
  },
  titleText: { fontSize: 26, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  subText: { 
    fontSize: 16, color: '#64748B', textAlign: 'center', 
    paddingHorizontal: 10, lineHeight: 24, fontWeight: '500' 
  },

  card: { 
    backgroundColor: '#FFF', borderRadius: 24, 
    padding: 24, ...SHADOW.sm, marginBottom: 30 
  },
  inputGroup: { marginBottom: 10 },
  inputLabel: { 
    fontSize: 15, fontWeight: '700', color: '#475569', 
    marginBottom: 10, marginLeft: 4 
  },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F8FAFC', borderRadius: 18, 
    borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  iconContainer: { paddingLeft: 18, paddingRight: 12 },
  input: { 
    flex: 1, paddingVertical: 18, fontSize: 18, 
    color: '#1E293B', fontWeight: '800' 
  },
  
  submitBtn: { borderRadius: 20, overflow: 'hidden', ...SHADOW.md, marginTop: 10 },
  disabledBtn: { opacity: 0.7 },
  submitGradient: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  resendContainer: { 
    marginTop: 30, alignItems: 'center', flexDirection: 'row', 
    justifyContent: 'center' 
  },
  resendLabel: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  resendBtn: { marginLeft: 8 },
  resendText: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },
  timerText: { color: '#94A3B8', fontSize: 15, fontWeight: '700' },
  resendRow: { flexDirection: 'row', alignItems: 'center' }
});
