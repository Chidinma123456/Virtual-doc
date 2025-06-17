import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  tempCredentials: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setMfaRequired: (required: boolean, credentials?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
      tempCredentials: null,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        mfaRequired: false,
        tempCredentials: null 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      setMfaRequired: (mfaRequired, tempCredentials = null) => set({ 
        mfaRequired, 
        tempCredentials 
      }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        mfaRequired: false,
        tempCredentials: null 
      }),
    }),
    {
      name: 'virtudoc-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);