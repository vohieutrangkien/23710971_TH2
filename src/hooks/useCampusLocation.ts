import { useState, useCallback } from 'react';
import { PermissionsAndroid, Platform, Linking, Alert } from 'react-native';
import { BASE_SHIP_FEE, VARIANT } from '@constants/student';

// Tọa độ KTX giả lập (IUH KTX)
export const KTX_COORDS = {
  latitude: 10.8221,
  longitude: 106.6868,
};

// Hàm tính khoảng cách Haversine (km)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

// Hàm tính phí ship theo công thức A hoặc B
export function calculateShippingFee(km: number): number {
  if (VARIANT.shipFormula === 'A') {
    return BASE_SHIP_FEE + Math.round(km * 2000);
  } else {
    // Công thức B: BASE_SHIP_FEE + Math.round(km * 1500) + 2000 cố định
    return BASE_SHIP_FEE + Math.round(km * 1500) + 2000;
  }
}

export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';

export function useCampusLocation() {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [shipFee, setShipFee] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestPermissionAndGetLocation = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí KTXGo',
            message: 'KTXGo cần quyền vị trí để tính khoảng cách và phí giao hàng đến phòng bạn.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setStatus('granted');
          // Giả lập lấy toạ độ vị trí người dùng (hoặc GPS trên máy ảo/máy thật)
          const mockUserLat = 10.8275;
          const mockUserLon = 106.6912;
          const km = calculateHaversineDistance(
            mockUserLat,
            mockUserLon,
            KTX_COORDS.latitude,
            KTX_COORDS.longitude
          );
          const fee = calculateShippingFee(km);

          setUserCoords({ latitude: mockUserLat, longitude: mockUserLon });
          setDistanceKm(km);
          setShipFee(fee);
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          setStatus('denied');
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setStatus('blocked');
        }
      } else {
        // iOS or fallback
        setStatus('granted');
        const mockUserLat = 10.8275;
        const mockUserLon = 106.6912;
        const km = calculateHaversineDistance(
          mockUserLat,
          mockUserLon,
          KTX_COORDS.latitude,
          KTX_COORDS.longitude
        );
        const fee = calculateShippingFee(km);
        setUserCoords({ latitude: mockUserLat, longitude: mockUserLon });
        setDistanceKm(km);
        setShipFee(fee);
      }
    } catch (err) {
      console.warn('Location request error:', err);
      setStatus('denied');
    } finally {
      setLoading(false);
    }
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      Alert.alert('Lỗi', 'Không thể mở Cài đặt thiết bị');
    });
  }, []);

  return {
    status,
    setStatus,
    distanceKm,
    shipFee,
    userCoords,
    loading,
    requestPermissionAndGetLocation,
    openSettings,
  };
}
