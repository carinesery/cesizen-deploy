import apiClient from './apiClient';
import type { AuthResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: (): string | null => localStorage.getItem('token'),

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh-token');
    return response.data;
  },
};
