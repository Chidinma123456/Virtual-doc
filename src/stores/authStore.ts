import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  tempCredentials: any;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setMfaRequired: (required: boolean, tempCreds?: any) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
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