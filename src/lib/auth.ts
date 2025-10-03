import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { User } from '@shared/types';
import { api } from './api-client';
type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  actions: {
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => void;
  };
};
const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    token: localStorage.getItem('authToken'),
    isAuthenticated: false,
    isLoading: true,
    actions: {
      login: (token, user) => {
        localStorage.setItem('authToken', token);
        set((state) => {
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
        });
      },
      logout: () => {
        localStorage.removeItem('authToken');
        set((state) => {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
        });
      },
      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        try {
          const user = await api<User>('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          get().actions.logout();
          set({ isLoading: false });
        }
      },
      updateUser: (updatedUser) => {
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updatedUser };
          }
        });
      },
    },
  }))
);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthActions = () => useAuthStore((state) => state.actions);
export default useAuthStore;