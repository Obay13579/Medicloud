// frontend/src/components/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100/50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};