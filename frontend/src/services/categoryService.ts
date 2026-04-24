import apiClient from './apiClient';
import type { Category } from '../types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  update: async (slug: string, data: FormData) => {
    const response = await apiClient.patch(`/categories/${slug}`, data);
    return response.data;
  },

  delete: async (slug: string) => {
    const response = await apiClient.delete(`/categories/${slug}`);
    return response.data;
  },
};
