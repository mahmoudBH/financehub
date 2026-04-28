'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Landmark, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'john@example.com', password: 'Password@123' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinanceHub</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Your finances,<br />
            <span className="text-gradient bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              reimagined.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Experience next-generation digital banking with real-time insights, smart analytics, and seamless transfers.
          </p>

          {/* Feature Cards */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Instant Transfers', value: '<1s' },
              { label: 'Currencies', value: '8+' },
              { label: 'Virtual Cards', value: 'Unlimited' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceHub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Demo Credentials Notice */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-400 font-medium mb-1">🔑 Demo Credentials</p>
            <p className="text-xs text-slate-400">
              <span className="text-slate-300">john@example.com</span> / <span className="text-slate-300">Password@123</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Admin: <span className="text-slate-300">admin@financehub.dev</span> / <span className="text-slate-300">Password@123</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12" loading={loading}>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create account
            </Link>
          </p>

          {/* Simulator Notice */}
          <p className="mt-6 text-center text-xs text-slate-600">
            This is a fintech simulator for portfolio purposes only.
            <br />No real financial transactions are processed.
          </p>
        </div>
      </div>
    </div>
  );
}
