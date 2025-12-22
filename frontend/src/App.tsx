import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AppLayout } from './components/layouts/AppLayout';
import { ProtectedRoute } from './router/ProtectedRoute';
import { RoleProtectedRoute } from './router/RoleProtectedRoute';

// Fix: Gunakan named import
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { PatientListPage } from './pages/admin/PatientListPage';
import { AppointmentListPage } from './pages/admin/AppointmentListPage';
import { DoctorQueuePage } from './pages/doctor/DoctorQueuePage';
import { EmrPage } from './pages/doctor/EmrPage';
import { PharmacyQueuePage } from './pages/pharmacy/PharmacyQueuePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with Layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Admin Routes */}
          <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="patients" element={<PatientListPage />} />
            <Route path="appointments" element={<AppointmentListPage />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={<RoleProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route path="queue" element={<DoctorQueuePage />} />
            <Route path="emr/:appointmentId" element={<EmrPage />} />
          </Route>

          {/* Pharmacy Routes */}
          <Route path="/pharmacy" element={<RoleProtectedRoute allowedRoles={['PHARMACIST']} />}>
            <Route path="queue" element={<PharmacyQueuePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;