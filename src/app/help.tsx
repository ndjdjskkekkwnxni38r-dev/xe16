import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, PhoneCall, MailPlus, ChevronDown, ChevronUp, X, Send, Headset, Clock } from 'lucide-react-native';
import { COLORS, SHADOW } from '@/constants/theme';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

const FAQS = [
  { id: '1', q: 'Làm sao để đặt xe 16 chỗ?', a: 'Tại màn hình Trang chủ, bạn nhập Điểm đón và Điểm đến. Hệ thống sẽ tính toán khoảng cách và hiển thị danh sách các loại xe cùng với giá cước để bạn lựa chọn.' },
  { id: '2', q: 'Phương thức thanh toán khả dụng?', a: 'Chúng tôi hỗ trợ đa dạng phương thức: Tiền mặt (thanh toán trực tiếp cho tài xế), Thẻ tín dụng/ghi nợ (Visa/Mastercard) và Ví điện tử VanPay.' },
  { id: '3', q: 'Chính sách hoàn hủy vé tham quan', a: 'Bạn có thể hủy vé miễn phí trước 24 giờ kể từ thời gian sử dụng. Nếu hủy trong vòng 24 giờ, hệ thống sẽ thu phí 50% giá trị vé.' },
  { id: '4', q: 'Tài xế đón muộn thì làm sao?', a: 'Nếu tài xế đến muộn quá 15 phút so với lịch hẹn, bạn sẽ tự động nhận được một mã giảm giá 50.000đ bồi thường vào ví Voucher cho chuyến đi tiếp theo.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Ticket Modal States
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketMsg, setTicketMsg] = useState('');

  const handleContact = (type: string) => {
    if (showToast) showToast({ message: `Đang kết nối tới ${type}...`, type: 'info' });
  };

  const submitTicket = () => {
    if (!ticketMsg.trim()) {
      if (showToast) showToast({ message: 'Vui lòng mô tả vấn đề của bạn', type: 'error' });
      return;
    }
    setTicketModal(false);
    setTicketMsg('');
    if (showToast) showToast({ message: 'Yêu cầu đã được gửi. CSKH sẽ phản hồi qua Email!', type: 'success' });
  };

  const FAQItem = ({ item, isLast }: any) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={styles.faqWrapper}>
        <TouchableOpacity 
          style={styles.faqHeader} 
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.faqTitle, isExpanded && styles.faqTitleActive]}>{item.q}</Text>
          <View style={[styles.faqIconBox, isExpanded && styles.faqIconBoxActive]}>
            {isExpanded ? <ChevronUp size={18} color={COLORS.primary} /> : <ChevronDown size={18} color="#64748B" />}
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.faqAnswer}>{item.a}</Text>
          </View>
        )}
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm trợ giúp</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient colors={['#E0F2FE', '#BAE6FD']} style={styles.heroIconBg}>
            <Headset size={48} color={COLORS.primary} strokeWidth={1.5} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Chào bạn, chúng tôi có thể giúp gì?</Text>
          <Text style={styles.heroSub}>Chọn phương thức liên hệ bên dưới để nhận được sự hỗ trợ nhanh nhất.</Text>
        </View>

        {/* Quick Contact Grid */}
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridCard} onPress={() => handleContact('Chat trực tuyến')} activeOpacity={0.8}>
            <View style={[styles.gridIconBox, { backgroundColor: '#DBEAFE' }]}>
              <MessageCircle size={28} color="#2563EB" strokeWidth={2} />
            </View>
            <Text style={styles.gridTitle}>Chat CSKH</Text>
            <View style={styles.gridSubRow}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.gridSub}>Phản hồi ~ 5 phút</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => handleContact('Hotline 1900 1234')} activeOpacity={0.8}>
            <View style={[styles.gridIconBox, { backgroundColor: '#DCFCE7' }]}>
              <PhoneCall size={28} color="#16A34A" strokeWidth={2} />
            </View>
            <Text style={styles.gridTitle}>Gọi Hotline</Text>
            <View style={styles.gridSubRow}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.gridSub}>Hỗ trợ 24/7</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Ticket Banner */}
        <TouchableOpacity style={styles.ticketCard} onPress={() => setTicketModal(true)} activeOpacity={0.9}>
          <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.ticketGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.ticketIconBox}>
              <MailPlus size={24} color={COLORS.primary} />
            </View>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketTitle}>Gửi Email hỗ trợ</Text>
              <Text style={styles.ticketSub}>Tạo ticket ghi nhận sự cố</Text>
            </View>
            <View style={styles.ticketArrow}>
              <ChevronDown size={20} color="#FFF" style={{ transform: [{ rotate: '-90deg' }] }} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
        
        {/* FAQ Card */}
        <View style={styles.faqCard}>
          {FAQS.map((item, index) => (
            <FAQItem key={item.id} item={item} isLast={index === FAQS.length - 1} />
          ))}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal Submit Ticket */}
      <Modal visible={ticketModal} animationType="slide" transparent={true} onRequestClose={() => setTicketModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo yêu cầu hỗ trợ</Text>
              <TouchableOpacity onPress={() => setTicketModal(false)} style={styles.closeBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalAlert}>
              <Text style={styles.modalAlertText}>Chúng tôi sẽ gửi phản hồi chi tiết về địa chỉ Email liên kết với tài khoản của bạn trong vòng 24 giờ.</Text>
            </View>

            <Text style={styles.inputLabel}>Nội dung sự cố</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi hỗ trợ tốt nhất..." 
              value={ticketMsg} 
              onChangeText={setTicketMsg} 
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitTicket} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, '#0284C7']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Send size={18} color="#FFF" />
                <Text style={styles.submitBtnText}>Gửi yêu cầu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  
  // Hero Section
  heroSection: { alignItems: 'center', marginTop: 10, marginBottom: 25 },
  heroIconBg: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20, ...SHADOW.md },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 15, lineHeight: 22, fontWeight: '500' },

  // Grid Row (Chat & Call)
  gridRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  gridCard: { 
    flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 24, 
    alignItems: 'center', ...SHADOW.sm, borderWidth: 1, borderColor: '#F1F5F9' 
  },
  gridIconBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  gridTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  gridSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gridSub: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  // Ticket Card
  ticketCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 35, ...SHADOW.md },
  ticketGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  ticketIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  ticketInfo: { flex: 1 },
  ticketTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  ticketSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  ticketArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // FAQ Section
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 12, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqCard: { backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 15, ...SHADOW.sm },
  faqWrapper: { paddingVertical: 5 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, gap: 15 },
  faqTitle: { flex: 1, fontSize: 15, color: '#334155', fontWeight: '700', lineHeight: 22 },
  faqTitleActive: { color: COLORS.primary, fontWeight: '800' },
  faqIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  faqIconBoxActive: { backgroundColor: '#F0F9FF' },
  faqContent: { paddingBottom: 20, paddingRight: 20 },
  faqAnswer: { fontSize: 14, color: '#475569', lineHeight: 24, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  
  modalAlert: { backgroundColor: '#F0F9FF', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#BAE6FD' },
  modalAlertText: { color: '#0284C7', fontSize: 13, lineHeight: 20, fontWeight: '500' },

  inputLabel: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 10, marginLeft: 4 },
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 18, fontSize: 15, color: '#1E293B', marginBottom: 25, borderWidth: 1.5, borderColor: '#F1F5F9', height: 140, fontWeight: '500' },
  
  submitBtn: { borderRadius: 18, overflow: 'hidden', ...SHADOW.md },
  submitGradient: { flexDirection: 'row', justifyContent: 'center', padding: 18, alignItems: 'center', gap: 10 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }
});
