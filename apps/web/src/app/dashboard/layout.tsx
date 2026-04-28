'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Landmark } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { isSidebarCollapsed } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center shadow-xl shadow-primary/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Landmark className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Ambient Luxury Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/5 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content — adapts to sidebar width with luxury easing */}
      <div
        className={cn(
          'relative z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Desktop: follow sidebar width exactly
          'lg:ml-[280px]',
          isSidebarCollapsed && 'lg:ml-[80px]',
        )}
      >
        <Topbar />

        <motion.main
          className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
