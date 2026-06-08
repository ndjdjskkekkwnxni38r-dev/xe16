import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';

const MOCK_HISTORY = [
  { id: '1', title: 'Tour Bà Nà Hills 1 Ngày', date: '02/04/2026', status: 'Hoàn thành', price: '1,250,000đ' },
  { id: '2', title: 'Xe 16 chỗ - Sân bay Đà Nẵng', date: '25/03/2026', status: 'Hoàn thành', price: '250,000đ' },
  { id: '3', title: 'Vé tham quan Ngũ Hành Sơn', date: '10/03/2026', status: 'Hoàn thành', price: '80,000đ' },
];

export default function HistoryScreen() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <CheckCircle2 size={12} color="#16A34A" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.dateRow}>
        <Calendar size={14} color="#64748B" />
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử chuyến đi</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList 
        data={MOCK_HISTORY}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  list: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, ...SHADOW.sm, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  statusText: { color: '#16A34A', fontSize: 12, fontWeight: '700' },
  price: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  title: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: 13, color: '#64748B', fontWeight: '500' },
});