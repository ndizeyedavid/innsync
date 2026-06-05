import { ApiError } from '../api/types';
import { Alert } from 'react-native';

/**
 * Error Handler Utility
 * Centralized error handling for API errors, network issues, etc.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle API errors and display user-friendly messages
 */
export function handleApiError(error: any): void {
  console.error('API Error:', error);

  if (error.statusCode) {
    // Custom API error
    switch (error.statusCode) {
      case 400:
        Alert.alert('Bad Request', error.message || 'Invalid request parameters');
        break;
      case 401:
        Alert.alert('Unauthorized', 'Please log in again');
        break;
      case 403:
        Alert.alert('Forbidden', 'You don\'t have permission to perform this action');
        break;
      case 404:
        Alert.alert('Not Found', 'The requested resource was not found');
        break;
      case 409:
        Alert.alert('Conflict', error.message || 'Resource already exists');
        break;
      case 429:
        Alert.alert('Too Many Requests', 'Please wait before trying again');
        break;
      case 500:
        Alert.alert('Server Error', 'Something went wrong on our end. Please try again later');
        break;
      default:
        Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  } else if (error.message) {
    // Generic error with message
    Alert.alert('Error', error.message);
  } else {
    // Unknown error
    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
  }
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: any): void {
  console.error('Network Error:', error);

  if (error.code === 'ECONNABORTED') {
    Alert.alert('Timeout', 'Request timed out. Please check your connection and try again.');
  } else if (error.code === 'ERR_NETWORK') {
    Alert.alert('Network Error', 'Please check your internet connection and try again.');
  } else {
    Alert.alert('Connection Error', 'Unable to connect to the server. Please try again later.');
  }
}

/**
 * Parse error and return user-friendly message
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Log error for debugging
 */
export function logError(error: any, context?: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    error: {
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      stack: error?.stack,
    },
  };

  console.error('Error Log:', JSON.stringify(logData, null, 2));

  // In production, send to error tracking service
  if (!__DEV__) {
    // TODO: Send to error tracking service (e.g., Sentry, Crashlytics)
    // ErrorTrackingService.logError(logData);
  }
}

/**
 * Create error boundary component wrapper
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }) as T;
}