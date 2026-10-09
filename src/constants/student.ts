export const STUDENT = {
  mssv: '23710971',
  hoTen: 'VO HIEU TRANG KIEN',
} as const;

const soCuoi = Number(STUDENT.mssv.slice(-1));
export const LAST_DIGIT = soCuoi;
export const STUDENT_SEED = parseInt(STUDENT.mssv.slice(-3), 10) || 1;

/** Không viết cứng các số dưới đây ở màn hình — phải import từ file này */
export const DEBOUNCE_MS = 300 + (STUDENT_SEED % 5) * 100;
// 300..700
export const STALE_TIME_MS = 10_000 + (STUDENT_SEED % 20) * 1000;
// 10s..29s
export const PRICE_MULTIPLIER = 15000 + (STUDENT_SEED % 40) * 500;
export const BASE_SHIP_FEE = 8000 + (STUDENT_SEED % 10) * 1000;
// phí ship nền
export const ROOM_LABEL = `P.${100 + (STUDENT_SEED % 400)}`;
// phòng giao demo
export const BANNER_IMAGE_ID = 200 + (STUDENT_SEED % 150);

export const VARIANT = {
  watermarkAtTop: LAST_DIGIT % 2 === 0,
  authField: LAST_DIGIT % 2 === 0 ? 'email' : 'phone',
  tabOrder: LAST_DIGIT >= 5 ? 'cartFirst' : 'shopFirst',
  /** 'impact' | 'selection' — Haptic khi thêm giỏ */
  hapticOnAdd: LAST_DIGIT % 3 === 0 ? 'impact' : 'selection',
  /** công thức phí: A = nền + km*2000; B = nền + km*1500 + 2000 cố định */
  shipFormula: LAST_DIGIT % 2 === 0 ? 'A' : 'B',
  detailPresentation: LAST_DIGIT >= 5 ? 'modal' : 'card',
} as const;

import { Vibration, Platform, PermissionsAndroid } from 'react-native';

export async function triggerAddToCartHaptic(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      const hasPerm = await PermissionsAndroid.check(
        'android.permission.VIBRATE' as any
      ).catch(() => false);
      if (!hasPerm) {
        return;
      }
    }

    if (VARIANT.hapticOnAdd === 'impact') {
      Vibration.vibrate(60);
    } else {
      Vibration.vibrate(25);
    }
  } catch {
    // Graceful fallback
  }
}

export function examStamp(): string {
  const raw = `TH2|${STUDENT.mssv}|${STUDENT.hoTen}`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = Math.imul(h, 33) ^ raw.charCodeAt(i);
  }
  return String(Math.abs(h) % 1000000).padStart(6, '0');
}
