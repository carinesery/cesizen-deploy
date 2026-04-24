import axios, { InternalAxiosRequestConfig } from 'axios';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

// Instance axios avec config de base
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // pour le refresh token, signifie que les cookies seront envoyés
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token dans chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // console.log("REQUEST CONFIG:", config); // ✅ pour debug
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si c'est FormData, on laisse le navigateur ajouter multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Pour régénérer l'access token avec le refresh token
apiClient.interceptors.response.use(
  // si tout va bien 
  (response) => response,
  // si on reçoit une erreur
  async (error) => {
    const originalRequest: RetryableRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) { // et qu'on n'a pas déjà tenté un refresh (sinon boucle infinie)
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);

        // Mise à jour du header avec le nouvel accessToken
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // on rejoue la requête initiale avec le nouveau token
        return apiClient(originalRequest);

      } catch (err) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
