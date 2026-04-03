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
};
