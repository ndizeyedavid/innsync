export const APP_CONFIG = {
  LOADING_DURATION: 2000,
  API_BASE_URL: __DEV__ ? "http://localhost:3000" : "https://api.innsync.com",
} as const;

export const COLORS = {
  PRIMARY: "#0a0a08",
  WHITE: "#ffffff",
  GRAY: {
    50: "#f9fafb",
    100: "#f3f4f6",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
  },
} as const;
