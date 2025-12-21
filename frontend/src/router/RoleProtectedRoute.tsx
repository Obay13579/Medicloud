// frontend/src/router/RoleProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};