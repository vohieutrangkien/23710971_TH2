import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Watermark } from '@components/Watermark';
import { ProductCard } from '@components/ProductCard';
import { useProductsQuery, Product } from '@services/productApi';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useCartStore } from '@stores/cartStore';
import {
  STUDENT,
  DEBOUNCE_MS,
  ROOM_LABEL,
  BANNER_IMAGE_ID,
  VARIANT,
} from '@constants/student';
import { COLORS } from '@constants/theme';
import { ShopStackParamList } from '@navigation/ShopStack';

type NavigationProp = NativeStackNavigationProp<ShopStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, DEBOUNCE_MS);

  const { data: products, isPending, isError, refetch, isRefetching } = useProductsQuery();
  const addItem = useCartStore(state => state.addItem);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!debouncedSearch.trim()) return products;
    return products.filter(p =>
      p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  const isWatermarkTop = VARIANT.watermarkAtTop;

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <Text style={styles.logoTitle}>KTXGO</Text>
        <Text style={styles.roomLabel}>Giao tận {ROOM_LABEL}</Text>
      </View>

      <Image
        source={{ uri: `https://picsum.photos/id/${BANNER_IMAGE_ID}/800/240` }}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Tìm món (debounce) — ${STUDENT.mssv}`}
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      {isPending ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải món...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorMssv}>{STUDENT.mssv}</Text>
          <Text style={styles.errorText}>Không tải được dữ liệu món.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlashList
            data={filteredProducts}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('Detail', { id: String(item.id) })}
                onAddToCart={() => addItem(item)}
              />
            )}
            numColumns={2}
            keyExtractor={item => `${STUDENT.mssv}-${item.id}`}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy món phù hợp</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  refetch();
                }}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {!isWatermarkTop && <Watermark />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  topHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  roomLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  bannerImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchWrapper: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textLight,
  },
  errorMssv: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
