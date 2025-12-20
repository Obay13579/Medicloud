// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import { Toaster } from "@/components/ui/toaster" // Import Toaster

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- Dashboard Routes (contoh) --- */}
          {/* Anda akan membuat halaman ini nanti */}
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
          <Route path="/doctor/queue" element={<div>Doctor Queue</div>} />
          <Route path="/pharmacy/queue" element={<div>Pharmacy Queue</div>} />
          
        </Routes>
      </Router>
      <Toaster /> {/* Tambahkan Toaster di sini */}
    </>
  );
}

export default App;