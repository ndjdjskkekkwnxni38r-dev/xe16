import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '@/constants/theme';

const FLIGHT_TYPES = [
  { id: 'one-way', label: 'Một chiều' },
  { id: 'round-trip', label: 'Khứ hồi' },
  { id: 'multi-city', label: 'Nhiều chặng' },
];

export default function FlightScreen() {
  const router = useRouter();
  const [flightType, setFlightType] = useState('round-trip');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt vé máy bay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Flight Type Selector */}
        <View style={styles.typeSelector}>
          {FLIGHT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeTab,
                flightType === type.id && styles.activeTypeTab,
              ]}
              onPress={() => setFlightType(type.id)}
            >
              <Text
                style={[
                  styles.typeTabText,
                  flightType === type.id && styles.activeTypeTabText,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Form */}
        <View style={styles.searchCard}>
          <View style={styles.locationSection}>
            <View style={styles.locationInput}>
              <View style={styles.iconContainer}>
                <Ionicons name="airplane-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Điểm đi</Text>
                <Text style={styles.inputValue}>Đà Nẵng (DAD)</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.swapButton}>
              <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.locationInput}>
              <View style={styles.iconContainer}>
                <Ionicons name="airplane" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Điểm đến</Text>
                <Text style={styles.inputValue}>Hồ Chí Minh (SGN)</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Ngày đi</Text>
                <Text style={styles.inputValue}>31 Th3, 2026</Text>
              </View>
            </View>
            {flightType === 'round-trip' && (
              <View style={styles.column}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <View style={styles.inputTextContainer}>
                  <Text style={styles.inputLabel}>Ngày về</Text>
                  <Text style={styles.inputValue}>05 Th4, 2026</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Hành khách</Text>
                <Text style={styles.inputValue}>1 Người lớn, 0 Trẻ em</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Tìm chuyến bay</Text>
          </TouchableOpacity>
        </View>

        {/* Promotions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ưu đãi đặc biệt</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoList}>
          {[1, 2].map((item) => (
            <TouchableOpacity key={item} style={styles.promoCard}>
              <View style={[styles.promoImage, { backgroundColor: item === 1 ? '#0EA5E9' : '#F472B6' }]} />
              <View style={styles.promoInfo}>
                <Text style={styles.promoTitle}>Giảm 20% vé khứ hồi</Text>
                <Text style={styles.promoDesc}>Áp dụng cho các chặng bay nội địa</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.md,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  typeTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTypeTab: {
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTypeTabText: {
    color: COLORS.primary,
  },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  locationSection: {
    position: 'relative',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  swapButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOW.sm,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  promoList: {
    marginBottom: SPACING.xl,
  },
  promoCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  promoImage: {
    height: 120,
  },
  promoInfo: {
    padding: SPACING.sm,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  promoDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
