import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, Modal, TextInput, Platform, KeyboardAvoidingView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, ThumbsUp, Trash2, Edit3, X, Plus } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';

export default function ReviewsScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([
    { id: '1', place: 'Bà Nà Hills', date: '02/04/2026', rating: 5, content: 'Chuyến đi tuyệt vời, tài xế đúng giờ và thân thiện!' },
    { id: '2', place: 'Bán đảo Sơn Trà', date: '15/03/2026', rating: 4, content: 'Cảnh rất đẹp, xe sạch sẽ nhưng đường hơi xóc.' },
  ]);

  // Modal State cho Thêm/Sửa
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [place, setPlace] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const renderStars = (currentRating: number, size = 16, interactive = false, onRate?: (r: number) => void) => {
    return (
      <View style={{ flexDirection: 'row', gap: interactive ? 10 : 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <TouchableOpacity 
            key={i} 
            disabled={!interactive} 
            onPress={() => onRate && onRate(i + 1)}
            activeOpacity={0.7}
          >
            <Star size={size} color={i < currentRating ? '#FACC15' : '#E2E8F0'} fill={i < currentRating ? '#FACC15' : 'transparent'} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleDelete = (id: string) => {
    // Xóa trực tiếp không qua Alert để đảm bảo hoạt động tốt trên cả Web và Mobile
    setReviews(prev => prev.filter(r => r.id !== id));
    if (showToast) showToast({ message: 'Đã xóa đánh giá thành công', type: 'success' });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setPlace('');
    setRating(5);
    setContent('');
    setModalVisible(true);
  };

  const openEditModal = (review: any) => {
    setIsEditing(true);
    setCurrentId(review.id);
    setPlace(review.place);
    setRating(review.rating);
    setContent(review.content);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!place.trim() || !content.trim()) {
      if (showToast) showToast({ message: 'Vui lòng nhập tên địa điểm và nội dung', type: 'error' });
      return;
    }

    if (isEditing) {
      // Cập nhật
      setReviews(prev => prev.map(r => 
        r.id === currentId 
          ? { ...r, place: place.trim(), rating, content: content.trim() } 
          : r
      ));
      if (showToast) showToast({ message: 'Đã cập nhật đánh giá', type: 'success' });
    } else {
      // Thêm mới
      const newReview = {
        id: Date.now().toString(),
        place: place.trim(),
        date: new Date().toLocaleDateString('vi-VN'),
        rating,
        content: content.trim()
      };
      setReviews(prev => [newReview, ...prev]);
      if (showToast) showToast({ message: 'Đã thêm đánh giá mới', type: 'success' });
    }

    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <View key={review.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName} numberOfLines={1}>{review.place}</Text>
                  <Text style={styles.date}>{review.date}</Text>
                </View>
                
                {/* Nút Sửa & Xóa đưa thẳng ra ngoài để tránh lỗi z-index overlay */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(review)}>
                    <Edit3 size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(review.id)}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.ratingRow}>
                {renderStars(review.rating)}
              </View>

              <Text style={styles.comment}>{review.content}</Text>
              
              <View style={styles.helpfulRow}>
                <ThumbsUp size={14} color="#64748B" />
                <Text style={styles.helpfulText}>0 người thấy hữu ích</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Star size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>Bạn chưa có bài đánh giá nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Thêm/Sửa Đánh giá */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Sửa đánh giá' : 'Thêm đánh giá mới'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#0F172A" /></TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tên địa điểm / Dịch vụ</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ví dụ: Bà Nà Hills, Xe 16 chỗ..." 
              value={place} 
              onChangeText={setPlace} 
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.ratingSelect}>
              <Text style={styles.inputLabel}>Chất lượng</Text>
              {renderStars(rating, 36, true, setRating)}
            </View>

            <Text style={styles.inputLabel}>Chia sẻ trải nghiệm</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="Chuyến đi của bạn thế nào?" 
              value={content} 
              onChangeText={setContent} 
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>{isEditing ? 'Cập nhật' : 'Đăng đánh giá'}</Text>
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
  
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  placeName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  date: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
  
  ratingRow: { marginBottom: 12 },
  comment: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 15 },
  helpfulRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpfulText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 50 },
  emptyText: { color: '#94A3B8', fontSize: 15, fontWeight: '600', marginTop: 15 },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  ratingSelect: { alignItems: 'center', marginBottom: 20, paddingVertical: 10, backgroundColor: '#F8FAFC', borderRadius: 16 },
  inputLabel: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, fontSize: 15, color: '#1E293B', marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, fontSize: 16, color: '#1E293B', marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', height: 100 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: 'center', ...SHADOW.sm },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});
