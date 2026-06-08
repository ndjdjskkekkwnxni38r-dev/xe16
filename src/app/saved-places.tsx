import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Platform, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Briefcase, MapPin, Trash2, Plus, X } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';

export default function SavedPlacesScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [defaultPlaces, setDefaultPlaces] = useState([
    { id: '1', icon: Home, title: "Nhà riêng", address: "123 Trần Phú, Hải Châu, Đà Nẵng", color: "#3B82F6" },
    { id: '2', icon: Briefcase, title: "Cơ quan", address: "Tòa nhà VNG, Ngũ Hành Sơn", color: "#F59E0B" }
  ]);

  const [favoritePlaces, setFavoritePlaces] = useState([
    { id: '3', icon: MapPin, title: "Cầu Rồng", address: "Đường Nguyễn Văn Linh, Đà Nẵng", color: "#EF4444" },
    { id: '4', icon: MapPin, title: "Chợ Cồn", address: "290 Hùng Vương, Hải Châu", color: "#EF4444" }
  ]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState('favorite'); // 'default' | 'favorite'

  const handleDelete = (id: string, isDefault: boolean, title: string) => {
    if (isDefault) {
      setDefaultPlaces(prev => prev.filter(p => p.id !== id));
    } else {
      setFavoritePlaces(prev => prev.filter(p => p.id !== id));
    }
    
    if (showToast) {
      showToast({ message: `Đã xóa "${title}" khỏi danh sách`, type: 'success' });
    }
  };

  const handleAddPlace = () => {
    if (!newTitle.trim() || !newAddress.trim()) {
      if (showToast) showToast({ message: 'Vui lòng nhập đầy đủ tên và địa chỉ', type: 'error' });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      icon: newType === 'default' ? Home : MapPin,
      title: newTitle.trim(),
      address: newAddress.trim(),
      color: newType === 'default' ? '#3B82F6' : '#EF4444'
    };

    if (newType === 'default') {
      setDefaultPlaces(prev => [...prev, newItem]);
    } else {
      setFavoritePlaces(prev => [...prev, newItem]);
    }

    setModalVisible(false);
    setNewTitle('');
    setNewAddress('');
    if (showToast) showToast({ message: `Đã thêm "${newItem.title}" thành công`, type: 'success' });
  };

  const renderPlaceItem = (item: any, isDefault: boolean, isLast: boolean) => {
    const Icon = item.icon;
    return (
      <View key={item.id}>
        <View style={styles.item}>
          <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
            <Icon size={20} color={item.color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, isDefault, item.title)}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa điểm đã lưu</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Mặc định</Text>
        {defaultPlaces.length > 0 ? (
          <View style={styles.card}>
            {defaultPlaces.map((place, index) => renderPlaceItem(place, true, index === defaultPlaces.length - 1))}
          </View>
        ) : (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>Chưa có địa điểm mặc định nào</Text></View>
        )}

        <Text style={styles.sectionTitle}>Yêu thích</Text>
        {favoritePlaces.length > 0 ? (
          <View style={styles.card}>
            {favoritePlaces.map((place, index) => renderPlaceItem(place, false, index === favoritePlaces.length - 1))}
          </View>
        ) : (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>Chưa có địa điểm yêu thích nào</Text></View>
        )}
      </ScrollView>

      {/* Modal Thêm mới */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm địa điểm mới</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#0F172A" /></TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Tên gợi nhớ (VD: Quán cafe, Chợ...)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập tên địa điểm" 
              value={newTitle} 
              onChangeText={setNewTitle} 
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Địa chỉ chi tiết</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ví dụ: 123 Đường Bạch Đằng, Đà Nẵng" 
              value={newAddress} 
              onChangeText={setNewAddress} 
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Loại địa điểm</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, newType === 'default' && styles.typeBtnActive]} onPress={() => setNewType('default')}>
                <Text style={[styles.typeBtnText, newType === 'default' && styles.typeBtnTextActive]}>Mặc định</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, newType === 'favorite' && styles.typeBtnActive]} onPress={() => setNewType('favorite')}>
                <Text style={[styles.typeBtnText, newType === 'favorite' && styles.typeBtnTextActive]}>Yêu thích</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddPlace}>
              <Text style={styles.submitBtnText}>Lưu địa điểm</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  addBtn: { padding: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#64748B', marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, marginBottom: 25, ...SHADOW.sm },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 25, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  info: { flex: 1, marginRight: 10 },
  title: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  address: { fontSize: 13, color: '#94A3B8' },
  deleteBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 55 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, fontSize: 15, color: '#1E293B', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 25, marginTop: 5 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { fontWeight: '700', color: '#64748B' },
  typeBtnTextActive: { color: '#FFF' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: 'center', ...SHADOW.sm },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});
