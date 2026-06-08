import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Plus, X, Wallet, Trash2, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';

export default function PaymentScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [methods, setMethods] = useState([
    { id: '1', type: 'cash', title: 'Tiền mặt', sub: 'Thanh toán trực tiếp cho tài xế', isDefault: true, color: '#10B981', isStatic: true },
    { id: '2', type: 'card', title: 'Visa •••• 4242', sub: 'Thẻ tín dụng', isDefault: false, color: '#3B82F6', isStatic: false }
  ]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [addType, setAddType] = useState('card'); // 'card' | 'ewallet'
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');

  const handleSetDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    if (showToast) showToast({ message: 'Đã thay đổi phương thức mặc định', type: 'success' });
  };

  const handleDelete = (id: string, title: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    if (showToast) showToast({ message: `Đã xóa phương thức thanh toán ${title}`, type: 'success' });
  };

  const handleAddMethod = () => {
    if (addType === 'card' && (!cardNumber.trim() || !cardName.trim())) {
      if (showToast) showToast({ message: 'Vui lòng nhập đầy đủ thông tin thẻ', type: 'error' });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      type: addType,
      title: addType === 'card' 
        ? `Thẻ •••• ${cardNumber.slice(-4) || '1234'}` 
        : 'Ví điện tử MoMo',
      sub: addType === 'card' ? 'Thẻ tín dụng / Ghi nợ' : 'Đã liên kết',
      isDefault: false,
      color: addType === 'card' ? '#3B82F6' : '#EC4899',
      isStatic: false
    };

    setMethods(prev => [...prev, newItem]);
    setModalVisible(false);
    setCardNumber('');
    setCardName('');
    if (showToast) showToast({ message: `Đã thêm ${newItem.title} thành công!`, type: 'success' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Phương thức của bạn</Text>
        
        {methods.map((method) => {
          const Icon = method.type === 'cash' ? Wallet : CreditCard;
          return (
            <TouchableOpacity 
              key={method.id} 
              style={[styles.card, method.isDefault && styles.cardActive]}
              onPress={() => handleSetDefault(method.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: method.color + '15' }]}>
                <Icon size={24} color={method.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{method.title}</Text>
                <Text style={styles.cardSub}>{method.sub}</Text>
              </View>
              
              {method.isDefault ? (
                <View style={styles.defaultBadge}>
                  <CheckCircle2 size={14} color="#16A34A" />
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              ) : !method.isStatic ? (
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(method.id, method.title);
                  }}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addText}>Thêm phương thức thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Thêm Phương Thức */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm phương thức mới</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#0F172A" /></TouchableOpacity>
            </View>

            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, addType === 'card' && styles.typeBtnActive]} onPress={() => setAddType('card')}>
                <CreditCard size={20} color={addType === 'card' ? '#FFF' : '#64748B'} />
                <Text style={[styles.typeBtnText, addType === 'card' && styles.typeBtnTextActive]}>Thẻ tín dụng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, addType === 'ewallet' && styles.typeBtnActive]} onPress={() => setAddType('ewallet')}>
                <Wallet size={20} color={addType === 'ewallet' ? '#FFF' : '#64748B'} />
                <Text style={[styles.typeBtnText, addType === 'ewallet' && styles.typeBtnTextActive]}>Ví điện tử</Text>
              </TouchableOpacity>
            </View>

            {addType === 'card' ? (
              <View>
                <Text style={styles.inputLabel}>Số thẻ</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="•••• •••• •••• ••••" 
                  value={cardNumber} 
                  onChangeText={setCardNumber} 
                  keyboardType="numeric"
                  maxLength={19}
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.inputLabel}>Tên in trên thẻ</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="NGUYEN VAN A" 
                  value={cardName} 
                  onChangeText={setCardName} 
                  autoCapitalize="characters"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            ) : (
              <View style={styles.ewalletBox}>
                <Text style={styles.ewalletText}>Bạn sẽ được chuyển hướng đến ứng dụng ví điện tử để xác nhận liên kết.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddMethod}>
              <Text style={styles.submitBtnText}>{addType === 'card' ? 'Lưu thẻ' : 'Liên kết ví'}</Text>
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
  content: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#64748B', marginBottom: 15, marginLeft: 5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, ...SHADOW.sm, marginBottom: 15, borderWidth: 2, borderColor: 'transparent' },
  cardActive: { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' },
  cardIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardInfo: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4 },
  defaultText: { color: '#16A34A', fontSize: 12, fontWeight: '800' },
  deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 20, backgroundColor: '#F0F9FF', borderStyle: 'dashed', borderWidth: 2, borderColor: '#BAE6FD', gap: 8, marginTop: 10 },
  addText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, flexDirection: 'row', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', gap: 8 },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { fontWeight: '700', color: '#64748B', fontSize: 15 },
  typeBtnTextActive: { color: '#FFF' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', fontWeight: '600' },
  ewalletBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, alignItems: 'center' },
  ewalletText: { color: '#64748B', textAlign: 'center', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', ...SHADOW.sm, marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});
