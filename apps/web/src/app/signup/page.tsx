'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Landmark, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const response = await authApi.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Account created successfully! Welcome to FinanceHub.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 gradient-mesh px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FinanceHub</span>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-slate-400">Start your digital banking experience</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                <Input
                  {...register('firstName')}
                  placeholder="John"
                  icon={<User className="w-4 h-4" />}
                  error={errors.firstName?.message}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                <Input
                  {...register('lastName')}
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone (optional)</label>
              <Input
                {...register('phone')}
                placeholder="+33 6 12 34 56 78"
                icon={<Phone className="w-4 h-4" />}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  className="bg-slate-800 border-slate-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirm your password"
                icon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-12" loading={loading}>
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
