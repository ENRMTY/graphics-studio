import { api } from "./apiClient";

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post<{
      success: boolean;
      data: { user: User; token: string };
    }>("/api/auth/login", { email, password });
    return res.data;
  },

  async register(email: string, password: string, name?: string) {
    const res = await api.post<{
      success: boolean;
      data: { user: User; token: string };
    }>("/api/auth/register", { email, password, name });
    return res.data;
  },

  async me() {
    const res = await api.get<{ success: boolean; data: User }>("/api/auth/me");
    return res.data;
  },

  async requestPasswordReset(email: string) {
    const res = await api.post<{ success: boolean; message: string }>(
      "/api/auth/forgot-password",
      { email },
    );
    return res;
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const res = await api.post<{ success: boolean; message: string }>(
      "/api/auth/reset-password",
      { email, otp, newPassword },
    );
    return res;
  },
};
