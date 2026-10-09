import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Watermark } from '@components/Watermark';
import { useCartStore } from '@stores/cartStore';
import { useAuthStore } from '@stores/authStore';
import { STUDENT, ROOM_LABEL, VARIANT, examStamp, triggerAddToCartHaptic } from '@constants/student';
import { COLORS } from '@constants/theme';

type PaymentMethod = 'COD' | 'MOMO' | 'VIETQR' | 'IUHPAY';

export const CartScreen: React.FC = () => {
  const {
    items,
    removeItem,
    changeQty,
    shippingFee,
    distanceKm,
    totalAmount,
    clearCart,
  } = useCartStore();

  const userPhoneOrEmail = useAuthStore(state => state.userPhoneOrEmail);

  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [phoneNumber, setPhoneNumber] = useState(userPhoneOrEmail || '0328140841');
  const [deliveryRoom, setDeliveryRoom] = useState(`KTX IUH - ${ROOM_LABEL}`);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    stamp: string;
    total: number;
    method: string;
    room: string;
  } | null>(null);

  const subTotal = totalAmount();
  const calculatedShippingFee = shippingFee !== null ? shippingFee : 10000;
  const grandTotal = subTotal + calculatedShippingFee;

  const isWatermarkTop = VARIANT.watermarkAtTop;

  const handleOpenCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống.');
      return;
    }
    triggerAddToCartHaptic();
    setIsCheckoutVisible(true);
  };

  const handleConfirmOrder = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại nhận hàng.');
      return;
    }
    if (!deliveryRoom.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ / phòng nhận hàng.');
      return;
    }

    setIsProcessing(true);
    triggerAddToCartHaptic();

    setTimeout(() => {
      const orderId = `KTX-${STUDENT.mssv}-${Date.now().toString().slice(-4)}`;
      const stamp = examStamp();
      const methodLabel =
        paymentMethod === 'COD'
          ? 'Tiền mặt khi nhận (COD)'
          : paymentMethod === 'MOMO'
          ? 'Ví MoMo'
          : paymentMethod === 'VIETQR'
          ? 'Chuyển khoản VietQR'
          : 'Ví sinh viên IUH Pay';

      setCompletedOrder({
        orderId,
        stamp,
        total: grandTotal,
        method: methodLabel,
        room: deliveryRoom,
      });

      setIsProcessing(false);
      clearCart();
    }, 1000);
  };

  const handleFinishOrder = () => {
    setCompletedOrder(null);
    setIsCheckoutVisible(false);
  };

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>GIỎ HÀNG</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
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
            <View style={styles.roomHeaderRow}>
              <Text style={styles.roomIcon}>📍</Text>
              <Text style={styles.roomText}>Giao đến {ROOM_LABEL}</Text>
            </View>
            {shippingFee !== null ? (
              <Text style={styles.shipFeeText}>
                Phí ship: {shippingFee.toLocaleString('vi-VN')} đ ({distanceKm} km - công thức {VARIANT.shipFormula})
              </Text>
            ) : (
              <Text style={styles.shipNoticeText}>
                Phí ship tạm tính: {calculatedShippingFee.toLocaleString('vi-VN')} đ (mở tab Tôi để định vị)
              </Text>
            )}
          </View>

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalSubNote}>Đã bao gồm phí ship</Text>
            </View>
            <Text style={styles.totalValue}>
              {grandTotal.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            activeOpacity={0.85}
            onPress={handleOpenCheckout}
          >
            <Text style={styles.checkoutButtonText}>
              Tiến hành Đặt hàng 🛍️
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL THANH TOÁN & ĐẶT HÀNG */}
      <Modal
        visible={isCheckoutVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!isProcessing) setIsCheckoutVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {completedOrder ? (
              /* MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG */
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>ĐẶT HÀNG THÀNH CÔNG!</Text>
                <Text style={styles.successSubtitle}>
                  Đơn hàng của bạn đã được chuyển đến bếp KTX.
                </Text>

                <View style={styles.receiptCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Mã đơn hàng:</Text>
                    <Text style={styles.receiptValueBold}>{completedOrder.orderId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Mã Stamp:</Text>
                    <Text style={styles.receiptValue}>#{completedOrder.stamp}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Sinh viên:</Text>
                    <Text style={styles.receiptValue}>{STUDENT.hoTen} ({STUDENT.mssv})</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Địa chỉ giao:</Text>
                    <Text style={styles.receiptValue}>{completedOrder.room}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Thanh toán:</Text>
                    <Text style={styles.receiptValue}>{completedOrder.method}</Text>
                  </View>
                  <View style={styles.receiptDivider} />
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptGrandLabel}>Tổng tiền:</Text>
                    <Text style={styles.receiptGrandValue}>
                      {completedOrder.total.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.continueShoppingBtn}
                  activeOpacity={0.8}
                  onPress={handleFinishOrder}
                >
                  <Text style={styles.continueShoppingBtnText}>
                    Hoàn tất & Tiếp tục mua sắm
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* FORM XÁC NHẬN & THANH TOÁN */
              <View style={{ flex: 1 }}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>XÁC NHẬN & THANH TOÁN</Text>
                  <TouchableOpacity
                    onPress={() => setIsCheckoutVisible(false)}
                    disabled={isProcessing}
                    style={styles.closeModalBtn}
                  >
                    <Text style={styles.closeModalText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                  {/* Thông tin người nhận */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionHeader}>📍 Thông tin nhận hàng</Text>
                    
                    <Text style={styles.inputLabel}>Người nhận:</Text>
                    <View style={styles.disabledInput}>
                      <Text style={styles.disabledInputText}>{STUDENT.hoTen} · MSSV: {STUDENT.mssv}</Text>
                    </View>

                    <Text style={styles.inputLabel}>Số điện thoại:</Text>
                    <TextInput
                      style={styles.formInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Nhập số điện thoại nhận hàng"
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.inputLabel}>Phòng nhận hàng:</Text>
                    <TextInput
                      style={styles.formInput}
                      value={deliveryRoom}
                      onChangeText={setDeliveryRoom}
                      placeholder={`Ví dụ: KTX IUH - ${ROOM_LABEL}`}
                    />

                    <Text style={styles.inputLabel}>Ghi chú cho tài xế:</Text>
                    <TextInput
                      style={[styles.formInput, { height: 60 }]}
                      value={note}
                      onChangeText={setNote}
                      placeholder="Ví dụ: Giao trước cửa phòng, gọi trước khi tới..."
                      multiline
                    />
                  </View>

                  {/* Phương thức thanh toán */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionHeader}>💳 Phương thức thanh toán</Text>

                    <TouchableOpacity
                      style={[styles.payOption, paymentMethod === 'COD' && styles.payOptionActive]}
                      onPress={() => setPaymentMethod('COD')}
                    >
                      <Text style={styles.payIcon}>💵</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payName}>Tiền mặt khi nhận (COD)</Text>
                        <Text style={styles.payDesc}>Thanh toán cho shipper khi nhận món</Text>
                      </View>
                      <View style={[styles.radioCircle, paymentMethod === 'COD' && styles.radioCircleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.payOption, paymentMethod === 'MOMO' && styles.payOptionActive]}
                      onPress={() => setPaymentMethod('MOMO')}
                    >
                      <Text style={styles.payIcon}>📱</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payName}>Ví MoMo / ZaloPay</Text>
                        <Text style={styles.payDesc}>Quét mã thanh toán trực tuyến nhanh</Text>
                      </View>
                      <View style={[styles.radioCircle, paymentMethod === 'MOMO' && styles.radioCircleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.payOption, paymentMethod === 'VIETQR' && styles.payOptionActive]}
                      onPress={() => setPaymentMethod('VIETQR')}
                    >
                      <Text style={styles.payIcon}>🏦</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payName}>Chuyển khoản VietQR</Text>
                        <Text style={styles.payDesc}>Tạo mã QR chuyển khoản mọi ngân hàng</Text>
                      </View>
                      <View style={[styles.radioCircle, paymentMethod === 'VIETQR' && styles.radioCircleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.payOption, paymentMethod === 'IUHPAY' && styles.payOptionActive]}
                      onPress={() => setPaymentMethod('IUHPAY')}
                    >
                      <Text style={styles.payIcon}>🎓</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payName}>Ví sinh viên IUH Pay</Text>
                        <Text style={styles.payDesc}>Trừ trực tiếp vào tài khoản sinh viên</Text>
                      </View>
                      <View style={[styles.radioCircle, paymentMethod === 'IUHPAY' && styles.radioCircleActive]} />
                    </TouchableOpacity>
                  </View>

                  {/* Tóm tắt chi phí */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionHeader}>🧾 Tóm tắt đơn hàng</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tiền món ăn ({items.reduce((s, i) => s + i.quantity, 0)} món):</Text>
                      <Text style={styles.summaryValue}>{subTotal.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Phí vận chuyển ({distanceKm ? `${distanceKm} km` : 'nội khu'}):</Text>
                      <Text style={styles.summaryValue}>{calculatedShippingFee.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <View style={styles.receiptDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.grandSummaryLabel}>Tổng thanh toán:</Text>
                      <Text style={styles.grandSummaryValue}>{grandTotal.toLocaleString('vi-VN')} đ</Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer Modal */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.confirmOrderBtn, isProcessing && { opacity: 0.7 }]}
                    activeOpacity={0.85}
                    onPress={handleConfirmOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.confirmOrderBtnText}>Đang xử lý đặt hàng...</Text>
                      </View>
                    ) : (
                      <Text style={styles.confirmOrderBtnText}>
                        Xác nhận Đặt hàng · {grandTotal.toLocaleString('vi-VN')} đ
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
    paddingBottom: 20,
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
  roomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  roomIcon: {
    fontSize: 14,
    marginRight: 4,
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
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalSubNote: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  closeModalBtn: {
    padding: 6,
  },
  closeModalText: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 16,
  },
  sectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 6,
  },
  disabledInput: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledInputText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  payOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  payIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  payName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  payDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  grandSummaryLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  grandSummaryValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  confirmOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 54,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.success,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  receiptValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  receiptValueBold: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  receiptGrandLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  receiptGrandValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  continueShoppingBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueShoppingBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
