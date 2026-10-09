import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Watermark } from '@components/Watermark';
import { useCartStore } from '@stores/cartStore';
import { ROOM_LABEL, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';

export const CartScreen: React.FC = () => {
  const {
    items,
    removeItem,
    changeQty,
    shippingFee,
    distanceKm,
    totalAmount,
  } = useCartStore();

  const subTotal = totalAmount();
  const grandTotal = shippingFee ? subTotal + shippingFee : subTotal;

  const isWatermarkTop = VARIANT.watermarkAtTop;

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>GIỎ HÀNG</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptySubText}>
            Hãy quay lại Cửa hàng để chọn món nhé!
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cartCard}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemPrice}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                </Text>
              </View>

              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => changeQty(item.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => changeQty(item.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.roomShipRow}>
            <Text style={styles.roomText}>Giao đến {ROOM_LABEL}</Text>
            {shippingFee !== null ? (
              <Text style={styles.shipFeeText}>
                Phí ship: {shippingFee.toLocaleString('vi-VN')} đ ({distanceKm} km - công thức {VARIANT.shipFormula})
              </Text>
            ) : (
              <Text style={styles.shipNoticeText}>
                Chưa ước tính phí — mở tab Tôi
              </Text>
            )}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {grandTotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>
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
  header: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  listContent: {
    padding: 12,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  qtyBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  qtyValue: {
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  roomShipRow: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roomText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  shipFeeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  shipNoticeText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
