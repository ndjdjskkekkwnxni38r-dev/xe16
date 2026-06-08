import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, Platform, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

const LANGUAGES = [
  { id: 'vi', title: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam' },
  { id: 'en', title: 'English', flag: '🇬🇧', region: 'United Kingdom' },
  { id: 'ko', title: '한국어', flag: '🇰🇷', region: 'South Korea' },
  { id: 'ja', title: '日本語', flag: '🇯🇵', region: 'Japan' },
  { id: 'zh', title: '中文', flag: '🇨🇳', region: 'China' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [selectedLang, setSelectedLang] = useState('vi');

  const handleSave = () => {
    if (showToast) {
      const langName = LANGUAGES.find(l => l.id === selectedLang)?.title;
      showToast({ message: `Đã đổi ngôn ngữ sang ${langName}`, type: 'success' });
    }
    
    // Quay về màn hình trước
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ngôn ngữ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionHint}>Chọn ngôn ngữ bạn muốn sử dụng cho ứng dụng. Giao diện sẽ tự động thay đổi sau khi lưu.</Text>

        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = selectedLang === lang.id;
            return (
              <View key={lang.id}>
                <TouchableOpacity 
                  style={[styles.langItem, isSelected && styles.langItemActive]}
                  onPress={() => setSelectedLang(lang.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.flagBox}>
                    <Text style={styles.flagText}>{lang.flag}</Text>
                  </View>
                  
                  <View style={styles.langInfo}>
                    <Text style={[styles.langTitle, isSelected && styles.langTitleActive]}>{lang.title}</Text>
                    <Text style={styles.langRegion}>{lang.region}</Text>
                  </View>
                  
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <CheckCircle2 size={22} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
          <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.submitBtnText}>Áp dụng</Text>
          </LinearGradient>
        </TouchableOpacity>
        
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
  
  sectionHint: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 20, paddingHorizontal: 5 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 10, ...SHADOW.sm, marginBottom: 30 },
  
  langItem: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 15, borderRadius: 16,
    backgroundColor: 'transparent'
  },
  langItemActive: { backgroundColor: '#F0F9FF' },
  
  flagBox: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', 
    marginRight: 15 
  },
  flagText: { fontSize: 24 },
  
  langInfo: { flex: 1, justifyContent: 'center' },
  langTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  langTitleActive: { color: '#0284C7', fontWeight: '800' },
  langRegion: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  
  checkIcon: { marginLeft: 10 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 15 },

  submitBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOW.md, marginHorizontal: 5 },
  submitGradient: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});