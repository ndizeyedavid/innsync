// Environment Configuration
export const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: __DEV__ 
      ? 'http://192.168.0.225:3000' 
      : 'https://api.innsync.com',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // WebSocket Configuration
  WEBSOCKET: {
    URL: __DEV__ 
      ? 'http://localhost:3000' 
      : 'https://api.innsync.com',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 3000,
  },

  // App Configuration
  APP: {
    NAME: 'InnSync',
    VERSION: '1.0.0',
    DEBUG: __DEV__,
  },

  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: !__DEV__,
    ENABLE_CRASH_REPORTING: !__DEV__,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_DIGITAL_KEY: true,
    ENABLE_ROOM_SERVICE: true,
  },

  // Storage Keys (synced with utils/storage.ts)
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    DEVICE_ID: 'device_id',
  } as const,
};

export default CONFIG;