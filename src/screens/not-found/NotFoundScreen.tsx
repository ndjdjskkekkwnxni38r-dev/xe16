import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy trang' }} />
      <View style={styles.container}>
        <Ionicons name="warning" size={64} color={COLORS.error} />
        <Text style={styles.title}>Trang này không tồn tại.</Text>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Quay lại Trang chủ</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  link: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
