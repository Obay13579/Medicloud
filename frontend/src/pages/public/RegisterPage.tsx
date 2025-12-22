import { Link } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/RegisterForm';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-gray-600">Register your clinic</p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm">
          <span className="text-gray-600">Sudah punya akun? </span>
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}