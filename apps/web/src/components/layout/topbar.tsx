'use client';

import { Bell, Search, Moon, Sun, Menu, Command } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 };

export function Topbar() {
  const { user } = useAuthStore();
  const { setMobileSidebarOpen } = useUIStore();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6',
        // Glassmorphism
        'bg-white/60 dark:bg-[#0a0a0a]/60',
        'backdrop-blur-2xl',
        'border-b border-black/[0.04] dark:border-white/[0.04]',
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <motion.button
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          onClick={() => setMobileSidebarOpen(true)}
          whileTap={{ scale: 0.9 }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Search bar */}
        <div className="hidden md:flex items-center">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search anything..."
              className={cn(
                'h-10 w-72 lg:w-80 rounded-xl pl-9 pr-16 text-sm',
                'bg-foreground/[0.03] dark:bg-white/[0.04]',
                'border border-black/[0.06] dark:border-white/[0.06]',
                'text-foreground placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
                'transition-all duration-200',
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50 bg-foreground/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-md px-1.5 py-0.5 font-mono">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          className={cn(
            'relative p-2.5 rounded-xl',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]',
            'transition-colors duration-200',
          )}
          whileTap={{ scale: 0.9, rotate: 15 }}
          transition={spring}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <motion.div
            key={isDark ? 'sun' : 'moon'}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={spring}
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className={cn(
            'relative p-2.5 rounded-xl',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]',
            'transition-colors duration-200',
          )}
          aria-label="View notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0a0a0a]" />
        </Link>

        {/* Divider */}
        <div className="w-px h-7 bg-border/60 mx-1.5 hidden md:block" />

        {/* User */}
        <Link
          href="/dashboard/profile"
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-xl',
            'hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]',
            'transition-colors duration-200',
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white/80 dark:ring-white/10 shadow-sm">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Personal'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
