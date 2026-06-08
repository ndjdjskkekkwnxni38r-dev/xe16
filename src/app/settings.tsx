import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Switch, Platform, StatusBar, Modal, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Bell, Shield, Moon, Globe, ChevronRight, Fingerprint, Mail, ScanFace } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';

export default function SettingsScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  // Biometric Modal State
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioStatus, setBioStatus] = useState('intro'); // 'intro' | 'scanning' | 'processing' | 'success'

  const handleWIP = (feature: string) => {
    if (showToast) showToast({ message: `Đang mở: ${feature}...`, type: 'info' });
  };

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean, name: string) => {
    if (name === 'Đăng nhập bằng Face ID' && value === true) {
      // Bắt đầu quá trình thiết lập Face ID từng bước (Giả lập)
      setBioStatus('intro');
      setShowBioModal(true);
      
      // Bước 1: Giới thiệu (1.5s) -> Bước 2: Quét khuôn mặt
      setTimeout(() => {
        setBioStatus('scanning');
        
        // Bước 2: Đang quét (2s) -> Bước 3: Đang xử lý
        setTimeout(() => {
          setBioStatus('processing');
          
          // Bước 3: Đang xử lý (1.5s) -> Bước 4: Thành công
          setTimeout(() => {
            setBioStatus('success');
            
            // Đóng Modal và bật công tắc sau 1.2s
            setTimeout(() => {
              setShowBioModal(false);
              setter(true);
              if (showToast) showToast({ message: `Đã thiết lập Face ID thành công!`, type: 'success' });
            }, 1200);
          }, 1500);
        }, 2000);
      }, 1500);
      return;
    }

    setter(value);
    if (showToast) {
      showToast({ message: `Đã ${value ? 'bật' : 'tắt'} ${name}`, type: 'success' });
    }
  };

  const SwitchItem = ({ icon: Icon, title, color, value, onValueChange }: any) => (
    <View style={styles.item}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ true: color, false: '#E2E8F0' }}
        thumbColor={Platform.OS === 'ios' ? '#FFF' : (value ? '#FFF' : '#F8FAFC')}
        ios_backgroundColor="#E2E8F0"
        style={styles.switchControl}
      />
    </View>
  );

  const NavItem = ({ icon: Icon, title, color, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSpacer} />
        
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.card}>
          <NavItem icon={User} title="Chỉnh sửa thông tin" color="#0284C7" onPress={() => router.push('/edit-profile')} />
          <View style={styles.divider} />
          <NavItem icon={Shield} title="Đổi mật khẩu" color="#10B981" onPress={() => router.push('/change-password')} />
        </View>

        <Text style={styles.sectionTitle}>Tùy chọn hiển thị</Text>
        <View style={styles.card}>
          <SwitchItem 
            icon={Moon} title="Chế độ tối (Dark Mode)" color="#8B5CF6" 
            value={darkMode} onValueChange={(v: boolean) => handleToggle(setDarkMode, v, 'Chế độ tối')} 
          />
          <View style={styles.divider} />
          <NavItem icon={Globe} title="Ngôn ngữ" subtitle="Tiếng Việt" color="#F59E0B" onPress={() => router.push('/language')} />
        </View>

        <Text style={styles.sectionTitle}>Thông báo & Bảo mật</Text>
        <View style={styles.card}>
          <SwitchItem 
            icon={Bell} title="Thông báo đẩy (Push)" color="#EF4444" 
            value={pushNotif} onValueChange={(v: boolean) => handleToggle(setPushNotif, v, 'Thông báo đẩy')} 
          />
          <View style={styles.divider} />
          <SwitchItem 
            icon={Mail} title="Nhận email khuyến mãi" color="#F43F5E" 
            value={emailNotif} onValueChange={(v: boolean) => handleToggle(setEmailNotif, v, 'Email khuyến mãi')} 
          />
          <View style={styles.divider} />
          <SwitchItem 
            icon={ScanFace} title="Đăng nhập bằng Face ID" color="#14B8A6" 
            value={biometrics} onValueChange={(v: boolean) => handleToggle(setBiometrics, v, 'Đăng nhập bằng Face ID')} 
          />
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>Phiên bản 1.0.0 (Build 26)</Text>
          <Text style={styles.companyText}>© 2026 VanBooking App Inc.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Giả lập Face ID */}
      <Modal visible={showBioModal} transparent animationType="fade">
        <View style={styles.bioModalContainer}>
          <View style={styles.bioModalContent}>
            <View style={[
              styles.bioIconBox, 
              bioStatus === 'success' && { backgroundColor: '#DCFCE7' },
              bioStatus === 'processing' && { backgroundColor: '#FEF9C3' }
            ]}>
              {bioStatus === 'success' ? (
                <Shield size={60} color="#16A34A" />
              ) : (
                <ScanFace size={60} color={bioStatus === 'processing' ? '#CA8A04' : COLORS.primary} />
              )}
            </View>
            
            <Text style={styles.bioTitle}>
              {bioStatus === 'intro' && 'Thiết lập Face ID'}
              {bioStatus === 'scanning' && 'Đang quét...'}
              {bioStatus === 'processing' && 'Đang xử lý'}
              {bioStatus === 'success' && 'Hoàn tất'}
            </Text>
            
            <Text style={styles.bioSub}>
              {bioStatus === 'intro' && 'Vui lòng đặt khuôn mặt của bạn vào trong khung hình.'}
              {bioStatus === 'scanning' && 'Từ từ xoay đầu theo một vòng tròn để hoàn tất góc quét.'}
              {bioStatus === 'processing' && 'Đang phân tích dữ liệu sinh trắc học của bạn...'}
              {bioStatus === 'success' && 'Face ID đã được thiết lập sẵn sàng cho tài khoản này.'}
            </Text>
            
            {(bioStatus === 'intro' || bioStatus === 'scanning') && (
              <TouchableOpacity style={styles.bioCancelBtn} onPress={() => setShowBioModal(false)}>
                <Text style={styles.bioCancelText}>Đóng</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

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
  headerSpacer: { height: 10 },
  
  sectionTitle: { 
    fontSize: 14, fontWeight: '800', color: '#64748B', 
    marginBottom: 12, marginLeft: 10, marginTop: 25, 
    textTransform: 'uppercase', letterSpacing: 0.5 
  },
  card: { backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 15, ...SHADOW.sm },
  
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  infoBox: { flex: 1, paddingRight: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
  
  switchControl: { transform: [{ scaleX: Platform.OS === 'ios' ? 0.8 : 1 }, { scaleY: Platform.OS === 'ios' ? 0.8 : 1 }] },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 60 },

  footerInfo: { alignItems: 'center', marginTop: 40 },
  versionText: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  companyText: { fontSize: 12, color: '#CBD5E1', fontWeight: '500' },

  // Biometric Modal
  bioModalContainer: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  bioModalContent: { backgroundColor: '#FFF', width: '80%', borderRadius: 24, padding: 30, alignItems: 'center', ...SHADOW.lg },
  bioIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  bioTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 10 },
  bioSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  bioCancelBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, backgroundColor: '#F1F5F9' },
  bioCancelText: { fontSize: 15, fontWeight: '700', color: '#64748B' }
});