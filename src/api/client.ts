import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ApiError } from "./types";

// Configuration
const API_CONFIG = {
  baseURL: __DEV__
    ? "http://192.168.0.225:3000/api/v1"
    : "https://api.innsync.com",
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Import here to avoid circular dependency
    const { getAccessToken } = require("../utils/storage");

    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add device info for auth requests
    if (config.url?.includes("/auth/")) {
      const { getDeviceInfo } = require("../utils/deviceInfo");
      const deviceInfo = await getDeviceInfo();
      if (config.headers) {
        config.headers["X-Device-Info"] = JSON.stringify(deviceInfo);
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors - try to refresh token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { getRefreshToken, setTokens } = require("../utils/storage");
        const refreshToken = await getRefreshToken();

        if (refreshToken) {
          // Call refresh endpoint
          const response = await axios.post(
            `${API_CONFIG.baseURL}/auth/refresh`,
            {
              refreshToken,
            },
          );

          const { tokens } = response.data.data;
          await setTokens(tokens.accessToken, tokens.refreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        const { clearTokens } = require("../utils/storage");
        await clearTokens();

        // Navigate to login (this will need to be handled by the app)
        // For now, just reject the error
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      statusCode: error.response?.status || 0,
      message:
        error.response?.data?.message || error.message || "An error occurred",
      error: error.response?.data?.error,
      timestamp: error.response?.data?.timestamp,
      path: error.response?.data?.path,
    };

    return Promise.reject(apiError);
  },
);

// Retry logic wrapper
export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_CONFIG.retryAttempts,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) or specific errors
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.retryDelay * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError;
}

export default apiClient;
