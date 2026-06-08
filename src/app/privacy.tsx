import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Switch, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck, MapPin, Smartphone, Trash2, AlertTriangle, Lock } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(false);

  const handleDeleteAccount = () => {
    // Luôn luôn dùng Toast và chuyển trang, không dùng window.confirm hay Alert nữa
    if (showToast) {
      showToast({ message: 'Yêu cầu xóa tài khoản đã được ghi nhận. Sẽ xử lý trong 7 ngày.', type: 'success' });
    }
    
    // Đợi 1.5 giây cho user đọc Toast rồi văng ra màn hình ngoài
    setTimeout(() => {
      router.replace('/');
    }, 1500);
  };

  const SwitchItem = ({ icon: Icon, title, desc, color, value, onValueChange }: any) => (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quyền riêng tư</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <LinearGradient colors={['#E0F2FE', '#BAE6FD']} style={styles.shieldBg}>
            <ShieldCheck size={48} color={COLORS.primary} strokeWidth={1.5} />
          </LinearGradient>
          <Text style={styles.headerText}>Bảo vệ dữ liệu của bạn</Text>
          <Text style={styles.headerSub}>Kiểm soát cách VanBooking sử dụng thông tin và quyền riêng tư của bạn.</Text>
        </View>

        <Text style={styles.sectionTitle}>Quyền truy cập dữ liệu</Text>
        
        <View style={styles.card}>
          <SwitchItem 
            icon={MapPin} 
            color="#10B981" 
            title="Dịch vụ định vị" 
            desc="Cho phép ứng dụng truy cập vị trí để gợi ý điểm đến và theo dõi chuyến đi."
            value={locationEnabled} 
            onValueChange={setLocationEnabled} 
          />
          <View style={styles.divider} />
          <SwitchItem 
            icon={Smartphone} 
            color="#3B82F6" 
            title="Quảng cáo cá nhân hóa" 
            desc="Sử dụng dữ liệu duyệt web để hiển thị các khuyến mãi phù hợp nhất với bạn."
            value={adsEnabled} 
            onValueChange={setAdsEnabled} 
          />
        </View>

        <Text style={styles.sectionTitle}>Bảo mật tài khoản</Text>

        <View style={styles.dangerCard}>
          <View style={styles.dangerHeader}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
          </View>
          <Text style={styles.dangerDesc}>
            Khi bạn yêu cầu xóa tài khoản, tất cả dữ liệu chuyến đi, điểm thưởng và số dư ví VanPay của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </Text>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.deleteGradient}>
              <Trash2 size={18} color="#EF4444" />
              <Text style={styles.deleteText}>Yêu cầu xóa tài khoản</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footerHint}>
          <Lock size={14} color="#94A3B8" />
          <Text style={styles.footerHintText}>Mọi dữ liệu đều được mã hóa an toàn.</Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
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
  
  headerBanner: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  shieldBg: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 15, ...SHADOW.sm },
  headerText: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  headerSub: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 12, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  card: { backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 15, ...SHADOW.sm, marginBottom: 25 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  info: { flex: 1, paddingRight: 15 },
  title: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  desc: { fontSize: 13, color: '#64748B', lineHeight: 18, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 65 },
  switchControl: { transform: [{ scaleX: Platform.OS === 'ios' ? 0.8 : 1 }, { scaleY: Platform.OS === 'ios' ? 0.8 : 1 }] },

  dangerCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FECACA', ...SHADOW.sm, marginBottom: 20 },
  dangerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dangerTitle: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
  dangerDesc: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20 },
  
  deleteBtn: { borderRadius: 16, overflow: 'hidden' },
  deleteGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  deleteText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },

  footerHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  footerHintText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' }
});