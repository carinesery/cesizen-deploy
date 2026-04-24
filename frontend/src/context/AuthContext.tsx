import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, AuthContextType, AuthResponse } from '../types';

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer le token au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = authService.getToken();

        if (storedToken) {
          // ici on n'ajoute pas en plus un && user.role === "admin" pour vérifier le role du user ?
          //  refresh pour récupérer nouvel accessToken + user
          const { accessToken, user } = await authService.refreshToken();
          setToken(accessToken);

          if (user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification", error);
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.accessToken);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
