import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Form } from '../components/forms/Form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = async (data: any) => {
    try {
      await login(data.email, data.password);
    } catch (err) {
      console.error('Login action failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Sign In</h2>
        <p className="text-sm text-slate-500 mt-1.5">Enter email and password to access TransitOps</p>
      </div>

      <Form schema={loginSchema} onSubmit={handleLogin} className="flex flex-col gap-4">
        {(methods) => (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...methods.register('email')}
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              {methods.formState.errors.email && (
                <span className="text-xs text-rose-500 block mt-1">
                  {methods.formState.errors.email.message as string}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                {...methods.register('password')}
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              {methods.formState.errors.password && (
                <span className="text-xs text-rose-500 block mt-1">
                  {methods.formState.errors.password.message as string}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors mt-2"
            >
              Sign In
            </button>
          </>
        )}
      </Form>
    </div>
  );
};
