// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import { Toaster } from "@/components/ui/toaster";

// Layouts & Routes
import { AppLayout } from './components/layouts/AppLayout';
import { ProtectedRoute } from './router/ProtectedRoute';

// Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; 
import PatientListPage from './pages/admin/PatientListPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- Protected Admin Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/patients" element={<PatientListPage />} />
              <Route path="/admin/appointments" element={<div>Appointment List Page</div>} />
            </Route>
          </Route>
          
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;