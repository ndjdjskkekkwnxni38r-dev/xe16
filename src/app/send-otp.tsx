import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, TextInput, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Smartphone } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

export default function SendOTPScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      showToast?.({ message: 'Vui lòng nhập số điện thoại', type: 'error' });
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!phoneRegex.test(phone)) {
      showToast?.({ message: 'Số điện thoại không hợp lệ', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://admin.datxedulich.vip/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phone }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast?.({ message: 'Mã OTP đã được gửi thành công!', type: 'success' });
        // Chuyển sang màn hình xác nhận và truyền số điện thoại
        router.push({
          pathname: '/verify-otp',
          params: { phone: phone }
        });
      } else {
        showToast?.({ message: data.message || 'Gửi OTP thất bại', type: 'error' });
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showToast?.({ message: 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')} 
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác thực SĐT</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.iconHeader}>
            <View style={styles.iconBox}>
              <Smartphone size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.titleText}>Bảo mật tài khoản</Text>
            <Text style={styles.subText}>
              Nhập số điện thoại để nhận mã xác thực OTP gửi qua tin nhắn.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Smartphone size={20} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="VD: 0905777444"
                  placeholderTextColor="#94A3B8"
                  maxLength={11}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSendOTP} 
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
                <Text style={styles.submitBtnText}>Gửi mã OTP</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    flex: 1, paddingVertical: 18, fontSize: 16, 
    color: '#1E293B', fontWeight: '700' 
  },
  
  submitBtn: { borderRadius: 20, overflow: 'hidden', ...SHADOW.md, marginTop: 10 },
  disabledBtn: { opacity: 0.7 },
  submitGradient: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
