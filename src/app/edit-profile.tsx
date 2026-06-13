import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Alert, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, User, Phone, Mail, Calendar } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

// Sửa lại InputField: Bỏ TouchableOpacity bọc ngoài để gõ mượt mà 100% trên cả Web và Mobile
const InputField = ({ icon: Icon, label, value, onChangeText, keyboardType = 'default', placeholder, editable = true }: any) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, !editable && styles.inputWrapperDisabled]}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#64748B" />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          editable={editable}
        />
      </View>
    </View>
  );
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('Nguyễn Đình Tường');
  const [phone, setPhone] = useState('0987654321');
  const [email, setEmail] = useState('tuongnd@example.com');
  const [dob, setDob] = useState('15/08/1998');
  const [gender, setGender] = useState('male');
  const [avatarUri, setAvatarUri] = useState('https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg');

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      if (showToast) showToast({ message: 'Tên và số điện thoại không được để trống', type: 'error' });
      return;
    }
    if (showToast) showToast({ message: 'Cập nhật thông tin cá nhân thành công!', type: 'success' });
    
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    }, 1000);
  };

  const handleUpdateAvatar = () => {
    if (Platform.OS === 'web') {
      const newUrl = window.prompt("Nhập đường dẫn hình ảnh mới (URL):", avatarUri);
      if (newUrl && newUrl.trim() !== '') {
        setAvatarUri(newUrl.trim());
        if (showToast) showToast({ message: 'Đã cập nhật ảnh đại diện', type: 'success' });
      }
      return;
    }

    Alert.prompt(
      "Đổi ảnh đại diện",
      "Vui lòng nhập đường dẫn (URL) hình ảnh mới:",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Cập nhật", 
          onPress: (url?: string) => {
            if (url && url.trim() !== '') {
              setAvatarUri(url.trim());
              if (showToast) showToast({ message: 'Đã cập nhật ảnh đại diện', type: 'success' });
            }
          } 
        }
      ],
      "plain-text",
      avatarUri
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Gradient (Cover Photo Style) */}
      <LinearGradient 
        colors={[COLORS.primary, '#0284C7']} 
        style={styles.coverPhoto}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section - Overlapping the cover photo */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={handleUpdateAvatar}>
                <Camera size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarName}>{name}</Text>
            <Text style={styles.avatarHint}>Chạm vào nút camera để đổi ảnh</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin cơ bản</Text>
            <View style={styles.divider} />

            <InputField icon={User} label="Họ và tên" value={name} onChangeText={setName} placeholder="Nhập họ và tên" />
            <InputField icon={Phone} label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Nhập số điện thoại" />
            <InputField icon={Mail} label="Địa chỉ Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Nhập địa chỉ email" />
            <InputField icon={Calendar} label="Ngày sinh" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.genderRow}>
                {['male', 'female', 'other'].map((item) => {
                  const labels: Record<string, string> = { male: 'Nam', female: 'Nữ', other: 'Khác' };
                  const isActive = gender === item;
                  return (
                    <TouchableOpacity 
                      key={item}
                      style={[styles.genderBtn, isActive && styles.genderBtnActive]} 
                      onPress={() => setGender(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.genderText, isActive && styles.genderTextActive]}>{labels[item]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.submitBtnText}>Lưu thay đổi</Text>
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
  coverPhoto: { 
    height: Platform.OS === 'ios' ? 140 : 120, 
    width: '100%', 
    position: 'absolute', 
    top: 0 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 10,
    zIndex: 10 
  },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  content: { paddingTop: Platform.OS === 'ios' ? 90 : 70, paddingHorizontal: 20 },
  
  // Avatar Section
  avatarSection: { alignItems: 'center', marginBottom: 25 },
  avatarWrapper: { position: 'relative', ...SHADOW.lg },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#FFF', backgroundColor: '#FFF' },
  editAvatarBtn: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: COLORS.primary, width: 36, height: 36, 
    borderRadius: 18, alignItems: 'center', justifyContent: 'center', 
    borderWidth: 3, borderColor: '#FFF', ...SHADOW.sm 
  },
  avatarName: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginTop: 15 },
  avatarHint: { marginTop: 4, fontSize: 13, color: '#64748B', fontWeight: '500' },

  // Card & Form
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, ...SHADOW.sm, marginBottom: 25 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  
  inputGroup: { marginBottom: 22 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F8FAFC', borderRadius: 16, 
    borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  inputWrapperDisabled: { backgroundColor: '#F1F5F9', opacity: 0.7 },
  iconContainer: { paddingLeft: 16, paddingRight: 10 },
  input: { flex: 1, paddingVertical: 16, paddingRight: 16, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  
  // Gender Toggle
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: { 
    flex: 1, paddingVertical: 14, alignItems: 'center', 
    backgroundColor: '#F8FAFC', borderRadius: 14, 
    borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  genderBtnActive: { backgroundColor: '#F0F9FF', borderColor: '#38BDF8' },
  genderText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  genderTextActive: { color: '#0284C7', fontWeight: '800' },

  // Submit Button
  submitBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOW.md },
  submitGradient: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});
