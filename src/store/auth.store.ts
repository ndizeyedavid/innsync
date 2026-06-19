import { create } from 'zustand';
import { User, Tokens } from '../api/types';
import { isAuthenticated, getUserData, clearAllData } from '../utils/storage';

interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasInitialized: boolean;
  
  // Actions
  setAuth: (user: User, tokens: Tokens) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasInitialized: false,

  setAuth: (user: User, tokens: Tokens) => {
    set({
      user,
      tokens,
      isAuthenticated: true,
      error: null,
    });
  },

  clearAuth: () => {
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateUser: (user: User) => {
    set({ user });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initializeAuth: async () => {
    if (get().hasInitialized) {
      return;
    }
    
    try {
      set({ isLoading: true, hasInitialized: true });
      
      const isAuth = await isAuthenticated();
      
      if (isAuth) {
        const userData = await getUserData();
        if (userData) {
          set({
            user: userData.user,
            tokens: userData.tokens,
            isAuthenticated: true,
          });
        } else {
          set({ isAuthenticated: false });
        }
      } else {
        set({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isAuthenticated: false, error: 'Failed to initialize authentication' });
    } finally {
      set({ isLoading: false });
    }
  },
}));