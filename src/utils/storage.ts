import * as SecureStore from "expo-secure-store";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  DEVICE_ID: "device_id",
  ONBOARDING_PROGRESS: "onboarding_progress",
} as const;

// Token Management
export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } catch (error) {
    console.error("Error storing tokens:", error);
    throw error;
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error("Error clearing tokens:", error);
    throw error;
  }
}

// User Data Management
export async function setUserData(userData: any): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(userData),
    );
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
}

export async function getUserData(): Promise<any | null> {
  try {
    const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function clearUserData(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
}

// Device ID Management
export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      // Generate a simple device ID using timestamp and random string
      deviceId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    // Fallback to a generated ID if storage fails
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

// Clear all stored data (for logout)
export async function clearAllData(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw error;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    return accessToken !== null;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
}

// Onboarding Progress Management
interface OnboardingProgress {
  hotelId?: string;
  hotelName?: string;
  step?: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  roomPreference?: string;
  bedPreference?: string;
  floorPreference?: string;
  selectedMealPlanId?: string;
  specialRequests?: string;
  selectedVibeIndices?: number[];
  dietaryRestrictions?: string[];
}

export async function setOnboardingProgress(
  progress: OnboardingProgress,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.ONBOARDING_PROGRESS,
      JSON.stringify(progress),
    );
  } catch (error) {
    console.error("Error storing onboarding progress:", error);
    throw error;
  }
}

export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    const progress = await SecureStore.getItemAsync(
      STORAGE_KEYS.ONBOARDING_PROGRESS,
    );
    return progress ? JSON.parse(progress) : null;
  } catch (error) {
    console.error("Error getting onboarding progress:", error);
    return null;
  }
}

export async function clearOnboardingProgress(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ONBOARDING_PROGRESS);
  } catch (error) {
    console.error("Error clearing onboarding progress:", error);
    throw error;
  }
}
