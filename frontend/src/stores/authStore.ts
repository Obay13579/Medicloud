// frontend/src/stores/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'PHARMACIST';
  tenant: {
    id: string;
    name: string;
    slug: string;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);