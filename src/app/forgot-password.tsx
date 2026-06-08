import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, TextInput, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, KeyRound, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Nhập Email, 2: Gửi thành công
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    if (!email.trim()) {
      if (showToast) showToast({ message: 'Vui lòng nhập địa chỉ Email', type: 'error' });
      return;
    }

    // Biểu thức chính quy kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (showToast) showToast({ message: 'Địa chỉ Email không hợp lệ', type: 'error' });
      return;
    }

    // Giả lập gửi email thành công
    setStep(2);
  };

  const handleBackToLogin = () => {
    // Nếu bạn có màn hình login, thay bằng router.replace('/login')
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quên mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {step === 1 ? (
            // BƯỚC 1: NHẬP EMAIL
            <View>
              <View style={styles.iconHeader}>
                <View style={styles.iconBox}>
                  <KeyRound size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.titleText}>Khôi phục mật khẩu</Text>
                <Text style={styles.subText}>Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi một liên kết để tạo lại mật khẩu mới.</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Địa chỉ Email</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.iconContainer}>
                      <Mail size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="VD: name@example.com"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSendResetLink} activeOpacity={0.8}>
                <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.submitBtnText}>Gửi liên kết khôi phục</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            // BƯỚC 2: GỬI THÀNH CÔNG
            <View style={styles.successView}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={80} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Kiểm tra Email của bạn!</Text>
              <Text style={styles.successSub}>
                Chúng tôi vừa gửi hướng dẫn khôi phục mật khẩu đến địa chỉ email <Text style={{ fontWeight: '800', color: '#1E293B' }}>{email}</Text>.
              </Text>
              
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>Không nhận được email? Vui lòng kiểm tra thư mục Spam (Thư rác) hoặc bấm nút Gửi lại bên dưới.</Text>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleBackToLogin} activeOpacity={0.8}>
                <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.submitBtnText}>Quay lại Đăng nhập / Cài đặt</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn} onPress={() => {
                if(showToast) showToast({ message: 'Đã gửi lại email khôi phục', type: 'success' })
              }}>
                <Text style={styles.resendText}>Gửi lại Email</Text>
              </TouchableOpacity>
            </View>
          )}

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
  content: { paddingHorizontal: 20 },
  
  // Icon & Title
  iconHeader: { alignItems: 'center', marginVertical: 20 },
  iconBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titleText: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  subText: { fontSize: 15, color: '#64748B', textAlign: 'center', paddingHorizontal: 15, lineHeight: 24 },

  // Form Card
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, ...SHADOW.sm, marginBottom: 25 },
  inputGroup: { marginBottom: 10 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F8FAFC', borderRadius: 16, 
    borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  iconContainer: { paddingLeft: 16, paddingRight: 10 },
  input: { flex: 1, paddingVertical: 18, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  
  // Button
  submitBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOW.md, marginTop: 10, width: '100%' },
  submitGradient: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Success Step
  successView: { alignItems: 'center', marginTop: 40 },
  successIconBox: { marginBottom: 25 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  successSub: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 25, paddingHorizontal: 10 },
  
  hintBox: { backgroundColor: '#FFFBEB', padding: 15, borderRadius: 16, marginBottom: 35, borderWidth: 1, borderColor: '#FEF08A' },
  hintText: { fontSize: 13, color: '#92400E', textAlign: 'center', lineHeight: 20, fontWeight: '500' },

  resendBtn: { marginTop: 25, padding: 10 },
  resendText: { color: COLORS.primary, fontSize: 15, fontWeight: '800' }
});