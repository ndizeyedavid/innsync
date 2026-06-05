import apiClient from '../api/client';
import { SignInDto, SignUpDto, RefreshTokenDto, AuthResponse, User } from '../api/types';
import { setTokens, clearTokens, setUserData, clearUserData, getDeviceInfo } from '../utils/storage';
import { useAuthStore } from '../store/auth.store';
import CONFIG from '../constants/config';

class AuthService {
  /**
   * Sign in with email/phone and password
   */
  async signIn(credentials: SignInDto): Promise<AuthResponse> {
    try {
      const deviceInfo = await getDeviceInfo();
      const response = await apiClient.post<AuthResponse>('/auth/sign-in', {
        ...credentials,
        deviceLabel: deviceInfo.deviceId,
      });

      const { tokens, user } = response.data;
      
      // Store tokens and user data
      await setTokens(tokens.accessToken, tokens.refreshToken);
      await setUserData({ tokens, user });
      
      // Update auth store
      useAuthStore.getState().setAuth(user, tokens);
      
      return response.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign up with email, name, and password
   */
  async signUp(credentials: SignUpDto): Promise<AuthResponse> {
    try {
      const deviceInfo = await getDeviceInfo();
      const response = await apiClient.post<AuthResponse>('/auth/sign-up', {
        ...credentials,
      });

      const { tokens, user } = response.data;
      
      // Store tokens and user data
      await setTokens(tokens.accessToken, tokens.refreshToken);
      await setUserData({ tokens, user });
      
      // Update auth store
      useAuthStore.getState().setAuth(user, tokens);
      
      return response.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
    try {
      const response = await apiClient.post<{ tokens: { accessToken: string; refreshToken: string } }>(
        '/auth/refresh',
        { refreshToken }
      );

      const { tokens } = response.data;
      
      // Update stored tokens
      await setTokens(tokens.accessToken, tokens.refreshToken);
      
      // Update auth store
      const currentState = useAuthStore.getState();
      if (currentState.user) {
        useAuthStore.getState().setAuth(currentState.user, tokens);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      // Call backend sign-out endpoint
      await apiClient.post('/auth/sign-out');
    } catch (error) {
      console.error('Sign out error:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      // Clear local storage
      await clearTokens();
      await clearUserData();
      
      // Clear auth store
      useAuthStore.getState().clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      
      // Update auth store with latest user data
      useAuthStore.getState().updateUser(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();