import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, TextInput, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      if (showToast) showToast({ message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }
    
    if (newPwd !== confirmPwd) {
      if (showToast) showToast({ message: 'Mật khẩu mới không khớp', type: 'error' });
      return;
    }

    if (newPwd.length < 6) {
      if (showToast) showToast({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự', type: 'warning' });
      return;
    }

    // Giả lập gọi API
    if (showToast) showToast({ message: 'Đổi mật khẩu thành công!', type: 'success' });
    
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.iconHeader}>
            <View style={styles.shieldBox}>
              <ShieldCheck size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.titleText}>Bảo mật tài khoản</Text>
            <Text style={styles.subText}>Cập nhật mật khẩu thường xuyên để bảo vệ tài khoản của bạn</Text>
          </View>

          <View style={styles.card}>
            {/* Mật khẩu hiện tại */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Lock size={20} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  value={currentPwd}
                  onChangeText={setCurrentPwd}
                  secureTextEntry={!showCurrent}
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Mật khẩu mới */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Lock size={20} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  value={newPwd}
                  onChangeText={setNewPwd}
                  secureTextEntry={!showNew}
                  placeholder="Ít nhất 6 ký tự"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(!showNew)}>
                  {showNew ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Xác nhận mật khẩu mới */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Lock size={20} color="#64748B" />
                </View>
                <TextInput
                  style={styles.input}
                  value={confirmPwd}
                  onChangeText={setConfirmPwd}
                  secureTextEntry={!showConfirm}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Yêu cầu mật khẩu:</Text>
            <Text style={styles.hintText}>• Có độ dài tối thiểu 6 ký tự.</Text>
            <Text style={styles.hintText}>• Nên chứa cả chữ cái và chữ số.</Text>
            <Text style={styles.hintText}>• Không nên sử dụng mật khẩu cũ.</Text>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.submitBtnText}>Cập nhật mật khẩu</Text>
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
  content: { paddingHorizontal: 20 },
  
  iconHeader: { alignItems: 'center', marginVertical: 20 },
  shieldBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  titleText: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  subText: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, ...SHADOW.sm, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F8FAFC', borderRadius: 16, 
    borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  iconContainer: { paddingLeft: 16, paddingRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  eyeBtn: { padding: 15 },
  
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },

  hintBox: { backgroundColor: '#F0F9FF', padding: 15, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#BAE6FD' },
  hintTitle: { fontSize: 14, fontWeight: '800', color: '#0369A1', marginBottom: 6 },
  hintText: { fontSize: 13, color: '#0284C7', marginBottom: 4, fontWeight: '500' },

  submitBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOW.md },
  submitGradient: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});