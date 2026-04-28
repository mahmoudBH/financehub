'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Landmark } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gradient-mesh">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Landmark className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">FinanceHub</h1>
      </div>
      <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );
}
