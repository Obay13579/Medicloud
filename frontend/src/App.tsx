// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage'; // <-- Import halaman baru
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* <-- Daftarkan route baru */}

          {/* --- Dashboard Routes (contoh) --- */}
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
          <Route path="/doctor/queue" element={<div>Doctor Queue</div>} />
          <Route path="/pharmacy/queue" element={<div>Pharmacy Queue</div>} />
          
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;