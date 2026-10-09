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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const debouncedSearch = useDebouncedValue(searchText, DEBOUNCE_MS);

  const { data: products, isPending, isError, refetch, isRefetching } = useProductsQuery();
  const addItem = useCartStore(state => state.addItem);

  const categories = [
    { key: 'all', label: 'Tất cả', icon: '🍱' },
    { key: "men's clothing", label: 'Đồ nam', icon: '👕' },
    { key: "women's clothing", label: 'Đồ nữ', icon: '👗' },
    { key: 'jewelery', label: 'Trang sức', icon: '💍' },
    { key: 'electronics', label: 'Điện tử', icon: '💻' },
  ];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (debouncedSearch.trim()) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    return list;
  }, [products, selectedCategory, debouncedSearch]);

  const isWatermarkTop = VARIANT.watermarkAtTop;

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.logoTitle}>KTXGO 🛵</Text>
          <Text style={styles.subSubtitle}>Sinh viên: {STUDENT.hoTen}</Text>
        </View>
        <View style={styles.roomBadge}>
          <Text style={styles.roomLabel}>📍 Giao tận {ROOM_LABEL}</Text>
        </View>
      </View>

      <Image
        source={{ uri: `https://picsum.photos/id/${BANNER_IMAGE_ID}/800/240` }}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={`Tìm món (debounce) — ${STUDENT.mssv}`}
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryScroll}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  subSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
    marginTop: 2,
  },
  roomBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roomLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  bannerImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryTextActive: {
    color: '#FFFFFF',
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
