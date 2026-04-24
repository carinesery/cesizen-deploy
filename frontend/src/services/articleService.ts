import apiClient from './apiClient';
import type { Article } from '../types';

export const articleService = {
  getAll: async (): Promise<Article[]> => {
    const response = await apiClient.get('/articles');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const response = await apiClient.get(`/articles/${slug}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Article> => {
    const response = await apiClient.post('/articles', data);
    return response.data;
  },

  update: async (slug: string, data: FormData): Promise<Article> => {
    const response = await apiClient.patch(`/articles/${slug}`, data);
    return response.data;
  },

  delete: async (slug: string) => {
    const response = await apiClient.delete(`/articles/${slug}`);
    return response.data;
  },
};
