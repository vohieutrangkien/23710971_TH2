import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { Watermark } from '@components/Watermark';
import { useAuthStore } from '@stores/authStore';
import { useCartStore } from '@stores/cartStore';
import { useCampusLocation } from '@hooks/useCampusLocation';
import { STUDENT, examStamp, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';

export const MeScreen: React.FC = () => {
  const { token, logout } = useAuthStore();
  const setShippingFee = useCartStore(state => state.setShippingFee);

  const {
    status,
    distanceKm,
    shipFee,
    loading,
    requestPermissionAndGetLocation,
    openSettings,
    resetLocation,
  } = useCampusLocation();

  const stamp = examStamp();

  // Đồng bộ phí ship và khoảng cách sang cartStore khi tính xong
  useEffect(() => {
    if (shipFee !== null && distanceKm !== null) {
      setShippingFee(shipFee, distanceKm);
    } else {
      setShippingFee(null, null);
    }
  }, [shipFee, distanceKm, setShippingFee]);

  const isWatermarkTop = VARIANT.watermarkAtTop;
  const isGpsActive = status === 'granted';

  const handleToggleGps = (value: boolean) => {
    if (value) {
      requestPermissionAndGetLocation();
    } else {
      resetLocation();
    }
  };

  const renderLocationStatus = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.stateText}>Đang lấy vị trí GPS và tính khoảng cách...</Text>
        </View>
      );
    }

    if (status === 'granted' && distanceKm !== null && shipFee !== null) {
      return (
        <View style={styles.resultBox}>
          <View style={styles.statusBadgeGranted}>
            <Text style={styles.statusBadgeText}>🟢 Quyền vị trí: Đã cho phép (granted)</Text>
          </View>
          <Text style={styles.distanceText}>
            📍 Khoảng cách: ≈ {distanceKm} km đến KTX IUH
          </Text>
          <Text style={styles.feeLabel}>
            Phí giao hàng ước tính (Công thức {VARIANT.shipFormula}):
          </Text>
          <Text style={styles.feeValue}>
            {shipFee.toLocaleString('vi-VN')} đ
          </Text>
        </View>
      );
    }

    if (status === 'blocked') {
      return (
        <View style={styles.stateContainer}>
          <View style={styles.statusBadgeBlocked}>
            <Text style={styles.statusBadgeBlockedText}>🔴 Quyền vị trí: Bị chặn (blocked)</Text>
          </View>
          <Text style={styles.guideText}>
            Ứng dụng đã bị từ chối quyền vĩnh viễn. Vui lòng mở Cài đặt của thiết bị để bật lại quyền Vị trí.
          </Text>
          <TouchableOpacity
            style={styles.openSettingsBtn}
            activeOpacity={0.8}
            onPress={openSettings}
          >
            <Text style={styles.openSettingsBtnText}>⚙️ Mở Cài đặt thiết bị (Cấp quyền)</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <View style={styles.statusBadgeDenied}>
          <Text style={styles.statusBadgeDeniedText}>🟡 Quyền vị trí: Chưa cấp (denied)</Text>
        </View>
        <Text style={styles.guideText}>
          Bật công tắc GPS ở trên hoặc bấm "Cấp quyền & Lấy vị trí" để tự động tính phí ship chính xác.
        </Text>
        <TouchableOpacity
          style={styles.requestBtn}
          activeOpacity={0.8}
          onPress={requestPermissionAndGetLocation}
        >
          <Text style={styles.requestBtnText}>📍 Cấp quyền & Lấy vị trí</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>TÔI & CÀI ĐẶT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card thông tin sinh viên */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>🎓</Text>
          </View>
          <Text style={styles.studentName}>{STUDENT.hoTen}</Text>
          <Text style={styles.studentDetails}>
            MSSV: {STUDENT.mssv} · Stamp: #{stamp}
          </Text>
          {token && (
            <Text style={styles.tokenText}>
              Token: {token.length > 25 ? `${token.slice(0, 22)}...` : token}
            </Text>
          )}
        </View>

        {/* Card Cài đặt định vị GPS */}
        <View style={styles.settingCard}>
          <Text style={styles.cardHeaderTitle}>📍 Cài đặt Vị trí & Định vị GPS</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Cho phép bật GPS</Text>
              <Text style={styles.switchSubtitle}>
                {isGpsActive
                  ? 'Đang bật GPS tính phí ship theo vị trí thực'
                  : 'Đang tắt GPS (dùng mức phí ship mặc định)'}
              </Text>
            </View>
            <Switch
              value={isGpsActive}
              onValueChange={handleToggleGps}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
              thumbColor={isGpsActive ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          {renderLocationStatus()}

          {status === 'granted' && (
            <TouchableOpacity
              style={styles.refreshLocationBtn}
              activeOpacity={0.8}
              onPress={requestPermissionAndGetLocation}
            >
              <Text style={styles.refreshLocationBtnText}>🔄 Cập nhật lại vị trí GPS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Card Cài đặt ứng dụng hệ thống */}
        <View style={styles.settingCard}>
          <Text style={styles.cardHeaderTitle}>⚙️ Cài đặt Ứng dụng</Text>

          <TouchableOpacity
            style={styles.settingRowItem}
            activeOpacity={0.7}
            onPress={openSettings}
          >
            <View>
              <Text style={styles.settingItemTitle}>Quyền ứng dụng trên thiết bị</Text>
              <Text style={styles.settingItemSubtitle}>Mở Cài đặt hệ thống (Vị trí, Rung, Camera)</Text>
            </View>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

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
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarText: {
    fontSize: 30,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  stateContainer: {
    marginVertical: 4,
  },
  stateText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  statusBadgeGranted: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  statusBadgeDenied: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeDeniedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadgeBlocked: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeBlockedText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.error,
  },
  guideText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  resultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  feeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  requestBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  openSettingsBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  openSettingsBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  refreshLocationBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  refreshLocationBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingItemSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
