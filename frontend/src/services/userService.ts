import apiClient from './apiClient';
import type { User } from '../types';
import { AxiosError } from 'axios';

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get("/admin/users");
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    create: async (userData: FormData) => {
        const response = await apiClient.post("/admin/users", userData);
        return response.data;
    },

    confirmEmail: async (token: string) => {
        const response = await apiClient.get(`/auth/confirm-email?token=${encodeURIComponent(token)}`);
        return response.data;
    },

    acceptLegal: async (termsConsent: boolean, privacyConsent: boolean, legalToken: string) => {
        const response = await apiClient.post(
            "/auth/accept-legal",
            {
                termsConsent,
                privacyConsent,
            },
            {
                headers: {
                    Authorization: `Bearer ${legalToken}`,
                },
            }
        );
        return response.data;
    },

    update: async (id: string, userData: FormData) => {
        const response = await apiClient.patch(`/admin/users/${id}`, userData);
        return response.data;
    },

    setActiveStatus: async (id: string, isActive: boolean) => {
        try {
            const response = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
            return response.data;
        } catch (error) {
            // ⚡ Ici on récupère le message du backend si possible
            const axiosError = error as AxiosError<{ message?: string }>;
            if (axiosError.response && axiosError.response.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
            throw error; // Sinon on remonte l'erreur originale
        }
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
    }
}