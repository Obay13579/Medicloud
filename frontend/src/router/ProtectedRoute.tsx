// frontend/src/router/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const ProtectedRoute = () => {
  const { token } = useAuthStore();

  if (!token) {
    // Jika tidak ada token, redirect ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, tampilkan konten halaman (misal: AppLayout)
  return <Outlet />;
};