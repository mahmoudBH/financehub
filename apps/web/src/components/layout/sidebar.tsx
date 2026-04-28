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
  ChevronLeft, Landmark, X, Target, TrendingUp,
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
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
        'transition-colors duration-200',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-0',
      )}
      title={isCollapsed ? item.name : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active background */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className={cn(
            'absolute inset-0 rounded-xl',
            'bg-primary/8 dark:bg-primary/10',
            'border border-primary/15 dark:border-primary/20',
          )}
          transition={spring}
        />
      )}

      {/* Hover background */}
      {!isActive && (
        <div className="absolute inset-0 rounded-xl bg-foreground/0 group-hover:bg-foreground/[0.04] dark:group-hover:bg-white/[0.04] transition-colors duration-200" />
      )}

      <motion.div className="relative z-10 flex items-center gap-3" layout transition={spring}>
        <item.icon
          className={cn(
            'w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
          )}
        />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Active dot */}
      {isActive && !isCollapsed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-primary"
          transition={spring}
        />
      )}
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
      <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0">
        <motion.div
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-400 shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
        >
          <Landmark className="w-[18px] h-[18px] text-white" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              className="flex flex-col overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-sm font-bold tracking-tight text-foreground">FinanceHub</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.12em]">Dashboard</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse button — desktop only */}
      <div className="hidden lg:flex px-3 mb-1">
        <motion.button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center justify-center w-full py-1.5 rounded-lg',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]',
            'transition-colors duration-200',
          )}
          whileTap={{ scale: 0.95 }}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={spring}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Main">
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.p
              className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Menu
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
                  className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60"
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
      <div className="px-3 py-3 space-y-0.5 flex-shrink-0 border-t border-border/50">
        {bottomNav.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setMobileSidebarOpen(false)}
          />
        ))}
        <motion.button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full',
            'text-muted-foreground hover:text-red-500 dark:hover:text-red-400',
            'hover:bg-red-500/[0.06] dark:hover:bg-red-500/10',
            'transition-colors duration-200',
            isSidebarCollapsed && 'justify-center px-0',
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="Sign out"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* User card */}
      <AnimatePresence>
        {!isSidebarCollapsed && user && (
          <motion.div
            className="px-4 py-3 border-t border-border/50 flex-shrink-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-[11px] font-bold text-white shadow-md shadow-primary/20">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
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
          // Light mode: luminous & clean
          'bg-white/70 dark:bg-[#0a0a0a]/90',
          'backdrop-blur-2xl',
          'border-r border-black/[0.06] dark:border-white/[0.06]',
          // Premium shadow
          'shadow-[4px_0_24px_-2px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_-2px_rgba(0,0,0,0.4)]',
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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className={cn(
                'fixed left-0 top-0 z-50 h-screen w-[280px] flex flex-col lg:hidden',
                'bg-white/95 dark:bg-[#0a0a0a]/95',
                'backdrop-blur-2xl',
                'border-r border-black/[0.06] dark:border-white/[0.06]',
                'shadow-[8px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[8px_0_30px_rgba(0,0,0,0.6)]',
              )}
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close button */}
              <motion.button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </motion.button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
