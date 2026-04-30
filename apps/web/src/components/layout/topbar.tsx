'use client';

import { Bell, Search, Menu, Command, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        'bg-white dark:bg-[#0A0A0A]',
        'border-b border-black/[0.06] dark:border-[#E5E4DF]/[0.06]',
        'transition-colors duration-300'
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-gray-500 dark:text-[#5A5A5A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#5A5A5A] group-focus-within:text-black dark:group-focus-within:text-[#DFFF00] transition-colors" />
            <input
              type="text"
              placeholder="Search terminal..."
              className={cn(
                'h-10 w-72 lg:w-96 rounded-none pl-12 pr-16 text-[13px]',
                'bg-transparent',
                'border border-black/10 dark:border-[#E5E4DF]/20',
                'text-black dark:text-[#E5E4DF] placeholder:text-gray-400 dark:placeholder:text-[#5A5A5A]',
                'focus:outline-none focus:border-black dark:focus:border-[#DFFF00]',
                'transition-all duration-200 font-mono',
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-[#5A5A5A] font-mono uppercase tracking-[0.1em]">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-gray-500 dark:text-[#5A5A5A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors duration-200"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Live Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-[#DFFF00] opacity-40" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black dark:bg-[#DFFF00]" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-black dark:text-[#DFFF00]">
            System Online
          </span>
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative text-gray-500 dark:text-[#5A5A5A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors duration-200"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-black dark:bg-[#DFFF00]" />
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-black/[0.06] dark:bg-[#E5E4DF]/[0.06] hidden md:block" />

        {/* User */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 group"
        >
          <div className="hidden md:block text-right">
            <p className="text-[13px] font-bold tracking-wide uppercase text-black dark:text-[#E5E4DF] leading-none group-hover:text-gray-600 dark:group-hover:text-[#DFFF00] transition-colors">
              {user?.firstName}
            </p>
            <p className="text-[10px] font-mono tracking-[0.1em] text-gray-400 dark:text-[#5A5A5A] mt-1">
              {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'ROOT' : 'USER'}
            </p>
          </div>
          <div className="w-9 h-9 bg-black dark:bg-[#E5E4DF] text-white dark:text-[#0A0A0A] flex items-center justify-center font-mono text-[13px] font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </Link>
      </div>
    </header>
  );
}
