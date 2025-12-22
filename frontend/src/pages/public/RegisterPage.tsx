// frontend/src/pages/public/RegisterPage.tsx
import { RegisterForm } from "@/features/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="text-2xl font-bold text-gray-800 mb-2 inline-block">
            🏥 <span className="text-blue-600">Medi</span>Cloud
          </Link>
          <CardTitle className="text-2xl">Buat Akun Klinik Baru</CardTitle>
          <CardDescription>Daftarkan klinik Anda dan mulai digitalisasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Login di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;