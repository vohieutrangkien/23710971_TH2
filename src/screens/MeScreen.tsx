import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
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
  } = useCampusLocation();

  const stamp = examStamp();

  // Đồng bộ phí ship và khoảng cách sang cartStore khi tính xong
  useEffect(() => {
    if (shipFee !== null && distanceKm !== null) {
      setShippingFee(shipFee, distanceKm);
    }
  }, [shipFee, distanceKm, setShippingFee]);

  const isWatermarkTop = VARIANT.watermarkAtTop;

  const renderLocationContent = () => {
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
          <Text style={styles.statusGranted}>Quyền: granted</Text>
          <Text style={styles.distanceText}>
            ≈ {distanceKm} km tới điểm KTX
          </Text>
          <Text style={styles.feeLabel}>
            Phí ship ước tính (Công thức {VARIANT.shipFormula}):
          </Text>
          <Text style={styles.feeValue}>
            {shipFee.toLocaleString('vi-VN')} đ
          </Text>
        </View>
      );
    }

    if (status === 'denied') {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.statusDenied}>Quyền: denied (Bị từ chối)</Text>
          <Text style={styles.guideText}>
            Vui lòng bấm nút bên dưới để cấp quyền vị trí, giúp KTXGo tính khoảng cách giao hàng chính xác.
          </Text>
        </View>
      );
    }

    if (status === 'blocked') {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.statusBlocked}>Quyền: blocked (Bị chặn vĩnh viễn)</Text>
          <Text style={styles.guideText}>
            Bạn đã chặn quyền vị trí. Vui lòng bấm "Mở Cài đặt" để bật lại quyền.
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openSettings}
          >
            <Text style={styles.settingsButtonText}>Mở Cài đặt (blocked)</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <Text style={styles.guideText}>
          Chưa cấp quyền vị trí. Bấm nút dưới để ước tính phí giao hàng KTX.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isWatermarkTop && <Watermark />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>TÔI : LOCATION</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card thông tin sinh viên */}
        <View style={styles.profileCard}>
          <Text style={styles.studentName}>{STUDENT.hoTen}</Text>
          <Text style={styles.studentDetails}>
            {STUDENT.mssv} · #{stamp}
          </Text>
          {token && (
            <Text style={styles.tokenText}>
              Token: {token.length > 25 ? `${token.slice(0, 22)}...` : token}
            </Text>
          )}
        </View>

        {/* Card định vị & phí ship */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Định vị & Phí Ship</Text>
          {renderLocationContent()}

          {status !== 'blocked' && (
            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.8}
              onPress={requestPermissionAndGetLocation}
            >
              <Text style={styles.locationButtonText}>
                Lấy vị trí ước tính ship
              </Text>
            </TouchableOpacity>
          )}

          {status === 'blocked' && (
            <TouchableOpacity
              style={styles.settingsButtonOutline}
              activeOpacity={0.8}
              onPress={openSettings}
            >
              <Text style={styles.settingsButtonOutlineText}>
                Mở Cài đặt (blocked)
              </Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 6,
  },
  tokenText: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  stateContainer: {
    marginVertical: 8,
  },
  stateText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  statusGranted: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 4,
  },
  statusDenied: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statusBlocked: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 4,
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
    marginBottom: 14,
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
  locationButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsButtonOutline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  settingsButtonOutlineText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
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
