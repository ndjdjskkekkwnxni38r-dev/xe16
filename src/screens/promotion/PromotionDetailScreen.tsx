import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { PROMOTIONS } from '@/constants/data';

const { width } = Dimensions.get('window');

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const promo = PROMOTIONS.find((p) => p.id === id);

  if (!promo) return null;

  const handleUseNow = () => {
    if (promo.type === 'Di chuyển' || promo.id === 'p1' || promo.id === 'p3') {
      router.push({
        pathname: '/booking',
        params: { promoCode: promo.code }
      });
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết ưu đãi</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: promo.image }} style={styles.promoImage} />
        
        <View style={styles.content}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{promo.type}</Text>
          </View>
          <Text style={styles.title}>{promo.title}</Text>
          <Text style={styles.subtitle}>{promo.subtitle}</Text>

          <View style={styles.expiryRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.error} />
            <Text style={styles.expiryText}>{promo.expiry}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.codeSection}>
            <Text style={styles.sectionLabel}>Mã giảm giá</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{promo.code}</Text>
              <TouchableOpacity>
                <Text style={styles.copyText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Điều kiện áp dụng</Text>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>Áp dụng cho dịch vụ xe 16 chỗ tại Đà Nẵng.</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>Không áp dụng đồng thời với các chương trình khác.</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>Mỗi khách hàng được sử dụng 01 lần.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.useButton, { backgroundColor: promo.color }]}
          onPress={handleUseNow}
        >
          <Text style={styles.useButtonText}>Dùng ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  promoImage: {
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: SPACING.lg,
  },
  typeBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  expiryText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  codeSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 2,
  },
  copyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  useButton: {
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  useButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
