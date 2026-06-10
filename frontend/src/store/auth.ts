import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';
import { authApi } from '@/lib/auth-api';
import { tokenStorage } from '@/lib/tokens';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setHydrated: () => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => set({ user }),
      setHydrated: () => set({ isHydrated: true }),

      fetchMe: async () => {
        const access = tokenStorage.getAccess();
        if (!access) {
          set({ user: null });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, isLoading: false });
        } catch {
          tokenStorage.clear();
          set({ user: null, isLoading: false });
        }
      },

      logout: async () => {
        const refresh = tokenStorage.getRefresh();
        try {
          if (refresh) await authApi.logout(refresh);
        } catch {
          // server xato bersa ham frontend'da tozalaymiz
        }
        tokenStorage.clear();
        set({ user: null });
      },
    }),
    {
      name: 'dio-auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);