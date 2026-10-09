import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Watermark } from '@components/Watermark';
import { useProductsQuery } from '@services/productApi';
import { useCartStore } from '@stores/cartStore';
import { STUDENT, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { ShopStackParamList } from '@navigation/ShopStack';

type DetailRouteProp = RouteProp<ShopStackParamList, 'Detail'>;

export const DetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const { data: products, isLoading } = useProductsQuery();
  const addItem = useCartStore(state => state.addItem);

  const product = products?.find(p => String(p.id) === String(id));

  const handleAddToCart = () => {
    if (!product) return;

    // Rung Haptic theo VARIANT.hapticOnAdd
    if (VARIANT.hapticOnAdd === 'impact') {
      Vibration.vibrate(60);
    } else {
      Vibration.vibrate(25);
    }

    addItem(product);

    Alert.alert(
      'Thành công',
      `Đã thêm món vào giỏ hàng! [${STUDENT.mssv}]`
    );
  };

  const isWatermarkTop = VARIANT.watermarkAtTop;

  if (isLoading || !product) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết món...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>
            {product.price.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.subNote}>Giao nội khu · nhận tận phòng</Text>

          <View style={styles.divider} />

          <Text style={styles.descLabel}>Mô tả món:</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>
            Thêm vào giỏ · Haptic
          </Text>
        </TouchableOpacity>
      </View>

      {!isWatermarkTop && <Watermark />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  imageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subNote: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  descLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  bottomBar: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textLight,
  },
});
