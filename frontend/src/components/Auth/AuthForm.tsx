import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { UserCreate } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional(),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

type Tab = 'login' | 'register';

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (userData: UserCreate) => Promise<any>;
}

export default function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [apiError, setApiError] = useState<string | null>(null);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginData) => {
    setApiError(null);
    try {
      await onLogin(data.email, data.password);
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || err?.message || 'Login failed');
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setApiError(null);
    try {
      await onRegister({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || err?.message || 'Registration failed');
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setApiError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-secondary-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-secondary-200">
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'login'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'register'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6">
          {apiError && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">{apiError}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <div className="w-full">
                  <label className="form-label">
                    Email <span className="text-error-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-field ${loginForm.formState.errors.email ? 'form-field error' : ''}`}
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="form-error">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="w-full">
                  <label className="form-label">
                    Password <span className="text-error-500 ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-field ${loginForm.formState.errors.password ? 'form-field error' : ''}`}
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="form-error">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loginForm.formState.isSubmitting}
                  className="w-full"
                >
                  Sign In
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-4"
              >
                <div className="w-full">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-field"
                    {...registerForm.register('fullName')}
                  />
                </div>
                <div className="w-full">
                  <label className="form-label">
                    Email <span className="text-error-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-field ${registerForm.formState.errors.email ? 'form-field error' : ''}`}
                    {...registerForm.register('email')}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="form-error">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="w-full">
                  <label className="form-label">
                    Password <span className="text-error-500 ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-field ${registerForm.formState.errors.password ? 'form-field error' : ''}`}
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="form-error">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={registerForm.formState.isSubmitting}
                  className="w-full"
                >
                  Create Account
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
