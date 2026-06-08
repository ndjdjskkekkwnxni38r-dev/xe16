import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông tin dịch vụ</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.infoText}>
          Dịch vụ VanGrab 16 chỗ cung cấp giải pháp di chuyển nhóm linh hoạt, 
          tiện nghi và an toàn cho hành trình của bạn.
        </Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureTitle}>• Sức chứa:</Text>
          <Text style={styles.featureDesc}>Tối đa 15 hành khách + 1 tài xế.</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureTitle}>• Hành lý:</Text>
          <Text style={styles.featureDesc}>Khoang chứa hành lý rộng rãi phía sau.</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureTitle}>• Tiện ích:</Text>
          <Text style={styles.featureDesc}>Máy lạnh toàn bộ xe, ghế bọc da cao cấp.</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.md,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  featureItem: {
    marginBottom: SPACING.md,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  featureDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
