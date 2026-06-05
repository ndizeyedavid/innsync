import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import authService from '../services/auth.service';
import { SignInDto, SignUpDto } from '../api/types';

/**
 * Custom hook for authentication management
 * Provides auth state and actions throughout the app
 */
export function useAuth() {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    updateUser,
    setLoading,
    setError,
    initializeAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Sign in with credentials
   */
  const signIn = async (credentials: SignInDto) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.signIn(credentials);
      
      // Auth store is updated inside the service
      return response;
    } catch (error: any) {
      setError(error.message || 'Sign in failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with new user data
   */
  const signUp = async (credentials: SignUpDto) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.signUp(credentials);
      
      // Auth store is updated inside the service
      return response;
    } catch (error: any) {
      setError(error.message || 'Sign up failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      // Auth store is cleared inside the service
    } catch (error: any) {
      setError(error.message || 'Sign out failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      setError(error.message || 'Failed to refresh user data');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    signIn,
    signUp,
    signOut,
    refreshUser,
    
    // Direct store access
    setAuth,
    clearAuth,
    updateUser,
    setError,
  };
}

/**
 * Hook to protect routes - requires authentication
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
  };
}