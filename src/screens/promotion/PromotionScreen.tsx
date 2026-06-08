import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';
import { PROMOTIONS } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Ticket } from 'lucide-react-native';

export default function PromotionScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const renderItem = ({ item }: { item: typeof PROMOTIONS[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/promotion/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.type}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.expiryRow}>
            <Text style={styles.expiryLabel}>Hạn dùng: </Text>
            <Text style={styles.expiryValue}>{item.expiry}</Text>
          </View>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.useBtn}
          >
            <Text style={styles.useBtnText}>Dùng ngay</Text>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ưu đãi của bạn</Text>
        <TouchableOpacity>
          <Ticket size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={PROMOTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(12, 74, 110, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C4A6E',
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F9FF',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  expiryValue: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  useBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});