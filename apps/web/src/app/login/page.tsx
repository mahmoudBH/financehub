'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen flex bg-white dark:bg-[#0A0A0A] text-black dark:text-[#E5E4DF] selection:bg-black selection:text-white dark:selection:bg-[#DFFF00] dark:selection:text-[#0A0A0A] transition-colors duration-300">
      {/* ── Left - Brutalist Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-black/[0.06] dark:border-[#E5E4DF]/[0.06] overflow-hidden">
        {/* Architectural grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-100" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0,0,0,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16 lg:px-24 w-full">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-px bg-black dark:bg-[#DFFF00]" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gray-500 dark:text-[#5A5A5A]">
              Authentication
            </span>
          </div>

          <h1 className="text-[clamp(3rem,6vw,6rem)] font-extrabold text-black dark:text-[#E5E4DF] leading-[0.9] tracking-[-0.04em] mb-8">
            ENTER<br />
            <span className="text-gray-300 dark:text-[#3A3A3A]">THE<br />TERMINAL.</span>
          </h1>
          
          <p className="text-[15px] leading-[1.8] text-gray-600 dark:text-[#7A7A7A] max-w-[400px]">
            Enterprise-grade digital banking. Connect to your dashboard to manage virtual cards, execute transfers, and view real-time analytics.
          </p>

          {/* Protocol Details */}
          <div className="mt-16 border-t border-black/[0.06] dark:border-[#E5E4DF]/[0.06] pt-8">
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: 'Latency', value: '<12ms' },
                { label: 'Encryption', value: 'AES-256' },
                { label: 'Protocol', value: 'SOC2 Type II' },
                { label: 'Uptime', value: '99.99%' },
              ].map((stat, i) => (
                <div key={stat.label}>
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-gray-500 dark:text-[#5A5A5A] mb-2">
                    {String(i + 1).padStart(2, '0')} {'//'} {stat.label}
                  </div>
                  <div className="font-mono text-[16px] text-black dark:text-[#E5E4DF]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right - Login Form ── */}
      <div className="flex-1 flex flex-col px-6 py-12 lg:px-24 justify-center relative">
        {/* Top Navbar items */}
        <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-6 lg:px-24 border-b border-black/[0.06] dark:border-[#E5E4DF]/[0.06]">
          <Link href="/" className="flex items-center gap-0">
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-black dark:text-[#E5E4DF]">
              Finance
            </span>
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-[#DFFF00]">
              Hub
            </span>
            <span className="text-black dark:text-[#DFFF00] text-lg leading-none ml-0.5">.</span>
          </Link>
          <Link
            href="/signup"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-500 dark:text-[#7A7A7A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors"
          >
            Create Account ↗
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-14">
          <div className="mb-10">
            <h2 className="text-[32px] font-bold tracking-[-0.03em] text-black dark:text-[#E5E4DF] mb-2">
              System Login
            </h2>
            <p className="text-[14px] text-gray-600 dark:text-[#7A7A7A]">
              Provide your credentials to establish a secure session.
            </p>
          </div>

          {/* Demo Credentials Notice */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-[#E5E4DF]/[0.02] border border-black/[0.06] dark:border-[#E5E4DF]/[0.06]">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-black dark:text-[#DFFF00] mb-3">
              Demo Access
            </p>
            <div className="font-mono text-[11px] text-gray-600 dark:text-[#7A7A7A] space-y-2">
              <div className="flex justify-between">
                <span>User:</span>
                <span className="text-black dark:text-[#E5E4DF]">john@example.com / Password@123</span>
              </div>
              <div className="flex justify-between">
                <span>Admin:</span>
                <span className="text-black dark:text-[#E5E4DF]">admin@financehub.dev / Password@123</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-gray-500 dark:text-[#5A5A5A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-[#5A5A5A]" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-transparent border border-black/10 dark:border-[#E5E4DF]/20 text-black dark:text-[#E5E4DF] text-[14px] px-10 py-3.5 focus:outline-none focus:border-black dark:focus:border-[#DFFF00] transition-colors placeholder:text-gray-400 dark:placeholder:text-[#3A3A3A] rounded-none"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-red-500 dark:text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-gray-500 dark:text-[#5A5A5A]">
                  Authentication Key
                </label>
                <Link href="/forgot-password" className="font-mono text-[10px] tracking-[0.1em] text-gray-500 dark:text-[#7A7A7A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors">
                  Reset?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-[#5A5A5A]" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-transparent border border-black/10 dark:border-[#E5E4DF]/20 text-black dark:text-[#E5E4DF] text-[14px] px-10 py-3.5 focus:outline-none focus:border-black dark:focus:border-[#DFFF00] transition-colors placeholder:text-gray-400 dark:placeholder:text-[#3A3A3A] rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-[#5A5A5A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-red-500 dark:text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-[#DFFF00] text-white dark:text-[#0A0A0A] font-bold text-[12px] tracking-[0.15em] uppercase py-4 hover:bg-black/90 dark:hover:bg-[#DFFF00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white dark:border-[#0A0A0A] border-t-transparent rounded-full" />
                  Authenticating...
                </span>
              ) : (
                <>
                  Initialize Session
                  <span className="relative flex h-1.5 w-1.5 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-[#0A0A0A] opacity-40" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white dark:bg-[#0A0A0A]" />
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Simulator Notice */}
          <div className="mt-12 pt-6 border-t border-black/[0.06] dark:border-[#E5E4DF]/[0.06]">
            <p className="text-center font-mono text-[9px] tracking-[0.1em] uppercase text-gray-400 dark:text-[#3A3A3A]">
              Simulator Environment v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
