import { create } from 'zustand';
import { authService } from '@/services/authService';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await authService.login(credentials);
      localStorage.setItem('token', data.token);
      set({ token: data.token });
      await useAuthStore.getState().fetchUser();
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUser: async () => {
    try {
      const { data } = await authService.getMe();
      set({ user: data });
    } catch (error) {
      set({ user: null, token: null });
      localStorage.removeItem('token');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));