'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, CreditCard, ArrowLeftRight, Receipt,
  ArrowDownUp, RefreshCw, Bell, User, Shield, Settings, LogOut,
  ChevronLeft, X, Target, TrendingUp,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Cards', href: '/dashboard/cards', icon: CreditCard },
  { name: 'Transfers', href: '/dashboard/transfers', icon: ArrowLeftRight },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Operations', href: '/dashboard/operations', icon: ArrowDownUp },
  { name: 'Exchange', href: '/dashboard/exchange', icon: RefreshCw },
  { name: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
  { name: 'Vaults', href: '/dashboard/vaults', icon: Target },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

const bottomNav = [
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 };

function NavItem({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: (typeof navigation)[0];
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-4 px-4 py-3 text-[13px] font-mono uppercase tracking-[0.05em]',
        'transition-all duration-300',
        isActive
          ? 'text-black dark:text-[#DFFF00]'
          : 'text-gray-500 dark:text-[#7A7A7A] hover:text-black dark:hover:text-[#E5E4DF]',
        isCollapsed && 'justify-center px-0',
      )}
      title={isCollapsed ? item.name : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active Left Border */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-[#DFFF00]"
          transition={spring}
        />
      )}

      <motion.div className={cn("relative z-10 flex items-center gap-4", isCollapsed ? "justify-center w-auto" : "w-full")} layout transition={spring}>
        <item.icon
          className={cn(
            'w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200',
            isActive ? 'text-black dark:text-[#DFFF00]' : 'text-gray-400 dark:text-[#5A5A5A] group-hover:text-black dark:group-hover:text-[#E5E4DF]',
          )}
        />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden flex-1"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn("flex items-center gap-4 h-16 flex-shrink-0 border-b border-black/[0.06] dark:border-[#E5E4DF]/[0.06]", isSidebarCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="flex items-center justify-center w-8 h-8 bg-black dark:bg-[#DFFF00] flex-shrink-0">
          <span className="text-white dark:text-[#0A0A0A] font-extrabold text-[16px] leading-none">F</span>
        </div>

        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              className="flex flex-col overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <span className="text-[14px] font-bold tracking-[0.2em] uppercase text-black dark:text-[#E5E4DF]">
                  Finance
                </span>
                <span className="text-[14px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-[#DFFF00]">
                  Hub
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse button — desktop only */}
      <div className="hidden lg:flex px-4 py-3 border-b border-black/[0.06] dark:border-[#E5E4DF]/[0.06]">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2 text-gray-500 dark:text-[#5A5A5A] hover:text-black dark:hover:text-[#E5E4DF] border border-transparent hover:border-black/10 dark:hover:border-[#E5E4DF]/20 transition-all duration-200 uppercase font-mono text-[10px] tracking-[0.2em]"
          aria-label={isSidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={spring}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
          {!isSidebarCollapsed && <span className="ml-2">COLLAPSE</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main">
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.p
              className="px-5 mb-4 font-mono text-[10px] tracking-[0.3em] uppercase text-gray-400 dark:text-[#5A5A5A]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              System Index
            </motion.p>
          )}
        </AnimatePresence>

        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <NavItem
              key={item.name}
              item={item}
              isActive={isActive}
              isCollapsed={isSidebarCollapsed}
              onClick={() => setMobileSidebarOpen(false)}
            />
          );
        })}

        {isAdmin && (
          <>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.p
                  className="px-5 mt-8 mb-4 font-mono text-[10px] tracking-[0.3em] uppercase text-gray-400 dark:text-[#5A5A5A]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Admin
                </motion.p>
              )}
            </AnimatePresence>
            <NavItem
              item={{ name: 'Admin Panel', href: '/dashboard/admin', icon: Shield }}
              isActive={pathname.startsWith('/dashboard/admin')}
              isCollapsed={isSidebarCollapsed}
              onClick={() => setMobileSidebarOpen(false)}
            />
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="py-4 flex-shrink-0 border-t border-black/[0.06] dark:border-[#E5E4DF]/[0.06]">
        {bottomNav.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setMobileSidebarOpen(false)}
          />
        ))}
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className={cn(
            'group relative flex items-center gap-4 px-4 py-3 text-[13px] font-mono uppercase tracking-[0.05em] w-full',
            'transition-all duration-300',
            'text-gray-500 dark:text-[#7A7A7A] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.04]',
            isSidebarCollapsed && 'justify-center px-0',
          )}
          aria-label="Terminate Session"
        >
          <LogOut className={cn("w-[18px] h-[18px] flex-shrink-0 text-gray-400 dark:text-[#5A5A5A] group-hover:text-red-500 transition-colors duration-200", isSidebarCollapsed && "mx-auto")} />
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden text-left flex-1"
              >
                Terminate
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User card */}
      <AnimatePresence>
        {!isSidebarCollapsed && user && (
          <motion.div
            className="px-6 py-4 border-t border-black/[0.06] dark:border-[#E5E4DF]/[0.06] flex-shrink-0 bg-white dark:bg-[#0A0A0A]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black dark:bg-[#E5E4DF] text-white dark:text-[#0A0A0A] flex items-center justify-center font-mono text-[14px] font-bold">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold tracking-wide uppercase text-black dark:text-[#E5E4DF] truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] font-mono tracking-[0.1em] text-gray-500 dark:text-[#5A5A5A] truncate mt-1">
                  ID: {user.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <motion.aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex-col',
          'hidden lg:flex',
          'bg-white dark:bg-[#0A0A0A]',
          'border-r border-black/[0.06] dark:border-[#E5E4DF]/[0.06]',
        )}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {sidebarContent}
      </motion.aside>

      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 dark:bg-[#0A0A0A]/80 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className={cn(
                'fixed left-0 top-0 z-50 h-screen w-[280px] flex flex-col lg:hidden',
                'bg-white dark:bg-[#0A0A0A]',
                'border-r border-black/[0.06] dark:border-[#E5E4DF]/[0.06]',
              )}
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-5 right-5 text-gray-500 dark:text-[#5A5A5A] hover:text-black dark:hover:text-[#E5E4DF] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
