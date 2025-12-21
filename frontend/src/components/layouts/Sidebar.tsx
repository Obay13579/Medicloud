// frontend/src/components/layouts/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Users, CalendarDays, List, ClipboardList } from "lucide-react";
import type { ElementType } from "react";

type NavItem = {
  name: string;
  href: string;
  icon: ElementType; // ElementType adalah tipe umum untuk komponen React
};

const adminNavItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Patient List", href: "/admin/patients", icon: Users },
  { name: "Appointment List", href: "/admin/appointments", icon: CalendarDays },
];

const doctorNavItems = [
  { name: "My Queue", href: "/doctor/queue", icon: List },
  // Tambahkan menu lain untuk dokter di sini jika ada
];

const pharmacistNavItems = [
  { name: "Prescription Queue", href: "/pharmacy/queue", icon: ClipboardList },
  // Tambahkan menu lain untuk apoteker di sini jika ada
];


export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- 2. Pilih array navigasi yang benar secara dinamis ---
  let navItems: NavItem[] = [];
  switch (user?.role) {
    case 'ADMIN':
      navItems = adminNavItems;
      break;
    case 'DOCTOR':
      navItems = doctorNavItems;
      break;
    case 'PHARMACIST':
      navItems = pharmacistNavItems;
      break;
    default:
      // Default ke array kosong jika peran tidak dikenali
      navItems = [];
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-center">
          <NavLink to="/">
            <span className="text-blue-600">Medi</span>Cloud
          </NavLink>
        </h1>
      </div>
      <div className="p-4 mt-4">
         <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
              <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2">
        {/* --- 3. Render dari variabel navItems yang dinamis --- */}
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </aside>
  );
};