import apiClient from './apiClient';
import type { Emotion } from '../types';

export const emotionService = {

    getAll: async (): Promise<Emotion[]> => {
        const response = await apiClient.get('/emotions');
        return response.data;
    },

    getById: async (id: string): Promise<Emotion> => {
        const response = await apiClient.get(`/emotions/${id}`);
        return response.data;
    },

    create: async (data: FormData): Promise<Emotion> => {
        const response = await apiClient.post('/emotions', data);
        return response.data;
    },

    update: async (id: string, data: FormData): Promise<Emotion> => {
        const response = await apiClient.patch(`/emotions/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/emotions/${id}`);
        return response.data;
    },

}

export default emotionService;