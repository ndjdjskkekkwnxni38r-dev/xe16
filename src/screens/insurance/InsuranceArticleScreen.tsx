import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ARTICLES_DATA: Record<string, any> = {
  '0': {
    title: 'Thủ tục 100% Online: Tương lai của ngành bảo hiểm',
    subtitle: 'Mua bảo hiểm chỉ với vài thao tác chạm trên điện thoại của bạn.',
    content: `Trong thời đại công nghệ số, việc mua bảo hiểm không còn là nỗi lo về giấy tờ rắc rối. VanBooking mang đến trải nghiệm mua bảo hiểm 100% trực tuyến.\n\nƯu điểm của quy trình Online:\n• Tiết kiệm thời gian: Chỉ mất 5 phút để hoàn tất quy trình.\n• Minh bạch: Mọi điều khoản được hiển thị rõ ràng, dễ tra cứu.\n• Tiện lợi: Nhận hợp đồng điện tử ngay qua email và ứng dụng.\n\nBạn có thể quản lý hợp đồng mọi lúc, mọi nơi ngay trên chiếc điện thoại của mình mà không cần giữ bản cứng rườm rà.`,
    quote: 'Số hóa bảo hiểm giúp khách hàng tiếp cận dịch vụ bảo vệ một cách nhanh chóng và minh bạch nhất.',
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000'
  },
  '1': {
    title: 'Bồi thường siêu tốc: Cam kết từ VanBooking',
    subtitle: 'Quy trình xử lý hồ sơ minh bạch trong vòng 24h làm việc.',
    content: `Chúng tôi hiểu rằng khi rủi ro xảy ra, sự hỗ trợ nhanh chóng là điều quan trọng nhất. VanBooking cam kết quy trình bồi thường minh bạch và nhanh gọn.\n\nQuy trình 3 bước đơn giản:\n1. Chụp ảnh hiện trường/hồ sơ y tế.\n2. Gửi yêu cầu bồi thường trực tiếp trên app.\n3. Nhận kết quả thẩm định và tiền bồi thường trong vòng 24h - 48h làm việc.\n\nVới mạng lưới đối tác rộng khắp, chúng tôi luôn ưu tiên quyền lợi của khách hàng lên hàng đầu.`,
    quote: 'Chúng tôi không chỉ bán bảo hiểm, chúng tôi bán sự an tâm khi khách hàng gặp khó khăn.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000'
  },
  '2': {
    title: 'Đối tác uy tín: Nền tảng cho sự tin cậy',
    subtitle: 'Hợp tác cùng những tập đoàn bảo hiểm hàng đầu Việt Nam và Thế giới.',
    content: `Sự an tâm của bạn được đảm bảo bởi những cái tên lớn nhất trong ngành bảo hiểm tại Việt Nam và quốc tế.\n\nVanBooking tự hào là đối tác chiến lược của:\n• Bảo hiểm PVI: Đơn vị bảo hiểm số 1 Việt Nam.\n• Bảo Việt: Uy tín lâu đời với mạng lưới rộng khắp.\n• Liberty Mutual: Tiêu chuẩn quốc tế từ Hoa Kỳ.\n\nChúng tôi cùng nhau xây dựng các gói sản phẩm độc quyền, tối ưu chi phí nhưng vẫn đảm bảo quyền lợi bảo vệ cao nhất cho cộng đồng người dùng VanBooking.`,
    quote: 'Sự kết hợp giữa công nghệ của VanBooking và uy tín của các đối tác tạo nên lớp lá chắn vững chắc.',
    img: 'https://images.unsplash.com/photo-1521791136364-798a730bb361?q=80&w=1000'
  }
};

export default function InsuranceArticleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const article = ARTICLES_DATA[id as string] || ARTICLES_DATA['0'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Modern Header Image */}
        <View style={styles.headerImageContainer}>
          <Image source={{ uri: article.img }} style={styles.mainImg} />
          <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.overlay} />
          
          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.iconCircle}><Ionicons name="share-social" size={18} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}><Ionicons name="bookmark" size={18} color="#FFF" /></TouchableOpacity>
            </View>
          </SafeAreaView>

          <View style={styles.headerInfo}>
            <Animated.View entering={FadeInDown.delay(200)}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>BLOG BẢO HIỂM</Text>
              </View>
              <Text style={styles.headerTitle}>{article.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.metaText}>5 phút đọc</Text>
                </View>
                <View style={[styles.metaItem, { marginLeft: 15 }]}>
                  <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.metaText}>1.2k xem</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Content Body */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.contentCard}>
          <Text style={styles.subtitle}>{article.subtitle}</Text>
          
          <View style={styles.authorSection}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=van' }} style={styles.authorAvatar} />
            <View>
              <Text style={styles.authorName}>Phan Minh Tuấn</Text>
              <Text style={styles.authorRole}>Chuyên gia bảo hiểm @VanBooking</Text>
            </View>
          </View>

          <View style={styles.quoteBox}>
            <MaterialCommunityIcons name="format-quote-close" size={24} color={COLORS.primary} style={{ opacity: 0.3 }} />
            <Text style={styles.quoteText}>{article.quote}</Text>
          </View>

          <Text style={styles.articleBody}>{article.content}</Text>
          
          <View style={styles.footerInfo}>
            <View style={styles.tagRow}>
              {['#BaoHiem', '#CongNghe', '#VanBooking'].map((tag, i) => (
                <View key={i} style={styles.tagItem}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerImageContainer: { width: width, height: 450, position: 'relative' },
  mainImg: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  rightActions: { flexDirection: 'row', gap: 10 },
  headerInfo: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  categoryTag: { backgroundColor: COLORS.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  categoryText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', lineHeight: 36, marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  
  contentCard: { backgroundColor: '#FFF', marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  subtitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 26, marginBottom: 25 },
  authorSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30 },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9' },
  authorName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  authorRole: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginTop: 2 },
  
  quoteBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: COLORS.primary, marginBottom: 30 },
  quoteText: { fontSize: 15, fontStyle: 'italic', color: '#475569', lineHeight: 24, fontWeight: '600' },
  
  articleBody: { fontSize: 16, color: '#334155', lineHeight: 30, textAlign: 'justify', marginBottom: 30 },
  
  footerInfo: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 25 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagItem: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
});
