import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { data } = response.data;
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
        
        localStorage.setItem('token', data.token);
      },
      
      register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        const { data } = response.data;
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
        
        localStorage.setItem('token', data.token);
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
      
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

