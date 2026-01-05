import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Todo App - GIAIC Hackathon
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to manage your tasks
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
