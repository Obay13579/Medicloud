// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import { Toaster } from "@/components/ui/toaster";

// Layouts & Routes
import { AppLayout } from './components/layouts/AppLayout';
import { RoleProtectedRoute } from './router/RoleProtectedRoute';

// Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PatientListPage from './pages/admin/PatientListPage';
import AppointmentListPage from './pages/admin/AppointmentListPage';
import DoctorQueuePage from './pages/doctor/DoctorQueuePage';
import EmrPage from './pages/doctor/EmrPage'; // <-- 1. IMPORT HALAMAN EMR
import { useAuthStore } from './stores/authStore';

// --- KOMPONEN BARU UNTUK REDIRECT OTOMATIS ---
const HomeRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'DOCTOR') {
    return <Navigate to="/doctor/queue" replace />;
  }
  // Tambahkan peran lain di sini jika perlu
  // ...
  return <Navigate to="/" replace />; // Fallback jika tidak ada peran yang cocok
};


function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* --- Rute Publik --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- Rute Admin (Dilindungi oleh RoleProtectedRoute) --- */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/patients" element={<PatientListPage />} />
              <Route path="/admin/appointments" element={<AppointmentListPage />} />
            </Route>
          </Route>

          {/* --- Rute Dokter (Dilindungi oleh RoleProtectedRoute) --- */}
          <Route element={<RoleProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route element={<AppLayout />}>
              <Route path="/doctor/queue" element={<DoctorQueuePage />} />
              <Route path="/doctor/emr/:appointmentId/:patientId" element={<EmrPage />} />
            </Route>
          </Route>

          {/* --- Rute untuk redirect setelah login --- */}
          {/* Ini adalah rute "virtual" yang tidak punya UI */}
          <Route path="/home" element={<HomeRedirect />} />

          {/* --- Rute Fallback (Jika halaman tidak ditemukan) --- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;