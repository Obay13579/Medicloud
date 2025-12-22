import { LoginForm } from '@/features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to MediCloud</h2>
          <p className="mt-2 text-gray-600">Access your clinic management system</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}