import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

export default function FindingDriverScreen() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Tự động chuyển sang màn hình "Đã tìm thấy tài xế" sau 3 giây (Demo)
    const timer = setTimeout(() => {
      // router.replace('/trip-status');
    }, 3000);

    return () => clearTimeout(timer);
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.loaderContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="sync-outline" size={80} color={COLORS.primary} />
          </Animated.View>
          <View style={styles.innerDot} />
        </View>

        <Text style={styles.title}>Đang tìm tài xế...</Text>
        <Text style={styles.subtitle}>
          Chúng tôi đang kết nối bạn với tài xế xe 16 chỗ gần nhất.
        </Text>

        <View style={styles.tripPreview}>
          <Text style={styles.previewText}>Hành trình: Hải Châu ➔ Sân bay Đà Nẵng</Text>
          <Text style={styles.previewPrice}>250.000đ</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={20} color={COLORS.textSecondary} />
        <Text style={styles.cancelText}>Hủy yêu cầu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  innerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tripPreview: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    width: '100%',
  },
  previewText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});
