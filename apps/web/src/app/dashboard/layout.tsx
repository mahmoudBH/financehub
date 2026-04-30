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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-black dark:text-[#E5E4DF]">
              Finance
            </span>
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-[#DFFF00]">
              Hub
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full bg-black dark:bg-[#DFFF00] opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 bg-black dark:bg-[#DFFF00]" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 dark:text-[#5A5A5A]">
              Initializing Dashboard...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-black dark:text-[#E5E4DF] relative selection:bg-black selection:text-white dark:selection:bg-[#DFFF00] dark:selection:text-[#0A0A0A] overflow-x-hidden transition-colors duration-300">
      {/* ── Brutalist Background Noise / Grain ── */}
      <div className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03] dark:opacity-[0.03] mix-blend-multiply dark:mix-blend-normal">
        <svg id="noise" width="100%" height="100%">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
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
