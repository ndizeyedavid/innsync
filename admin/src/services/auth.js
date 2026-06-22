import api from "./api";

export const authService = {
  async login(email, password) {
    const response = await api.post("/auth/sign-in", { email, password });
    if (response.data?.data?.tokens?.accessToken) {
      localStorage.setItem("adminToken", response.data.data.tokens.accessToken);
      if (response.data.data.tokens.refreshToken) {
        localStorage.setItem("adminRefreshToken", response.data.data.tokens.refreshToken);
      }
    }
    return response.data.data;
  },

  async signup(name, email, password) {
    const response = await api.post("/admin/auth/signup", { name, email, password });
    if (response.data?.data?.tokens?.accessToken) {
      localStorage.setItem("adminToken", response.data.data.tokens.accessToken);
      if (response.data.data.tokens.refreshToken) {
        localStorage.setItem("adminRefreshToken", response.data.data.tokens.refreshToken);
      }
    }
    return response.data.data;
  },

  async logout() {
    try {
      await api.post("/auth/sign-out");
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
    }
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  async updateProfile(data) {
    const response = await api.put("/auth/me", data);
    return response.data.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post("/auth/change-password", { currentPassword, newPassword });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  },

  getToken() {
    return localStorage.getItem("adminToken");
  },
};
