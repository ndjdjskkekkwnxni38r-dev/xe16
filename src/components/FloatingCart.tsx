import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '@/store/CartContext';
import { COLORS, SHADOW } from '@/constants/theme';
import Animated, { ZoomIn } from 'react-native-reanimated';

export default function FloatingCart() {
  const router = useRouter();
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <Animated.View 
      entering={ZoomIn}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.cartBtn}
        onPress={() => router.push('/cart')}
        activeOpacity={0.8}
      >
        <Ionicons name="bag-handle" size={24} color="#FFF" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems > 99 ? '9+' : totalItems}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  cartBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F43F5E',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
