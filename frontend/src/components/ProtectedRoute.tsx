import { useContext, ReactNode } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { token, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Vérification du rôle
  if (requiredRole && (!user || user.role.toUpperCase() !== requiredRole.toUpperCase())) {
    console.log("Accès refusé : rôle requis", requiredRole, "rôle actuel", user?.role);
    return <Navigate to="/403" />;
  }

  return children;
};
