import { create } from 'zustand';
import { STUDENT, examStamp } from '@constants/student';

interface AuthState {
  token: string | null;
  userPhoneOrEmail: string | null;
  login: (inputValue: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  userPhoneOrEmail: null,
  login: (inputValue: string) => {
    const stamp = examStamp();
    const token = `ktxgo-${STUDENT.mssv}-${stamp}`;
    set({ token, userPhoneOrEmail: inputValue });
  },
  logout: () => {
    set({ token: null, userPhoneOrEmail: null });
  },
}));
