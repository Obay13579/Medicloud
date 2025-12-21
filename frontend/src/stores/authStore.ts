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

// Untuk Tes Login
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // --- DATA DUMMY UNTUK TESTING ---
      token: 'dummy-secret-token-for-testing',
      user: {
        id: 'user-admin-01',
        name: 'Administrator',
        email: 'admin@testing.com',
        role: 'ADMIN',

        tenant: {
          id: 'tenant-01',
          slug: 'klinik-sehat-jaya', // Ini slug yang akan dipakai di URL API
          name: 'Klinik Sehat Jaya'
        }
      },
      // --- AKHIR DATA DUMMY ---

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);