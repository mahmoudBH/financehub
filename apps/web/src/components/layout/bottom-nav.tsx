'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpRight,
  Receipt,
  User,
} from 'lucide-react';

const items = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cards', href: '/dashboard/cards', icon: CreditCard },
  { label: 'Send', href: '/dashboard/transfers', icon: ArrowUpRight, primary: true },
  { label: 'Activity', href: '/dashboard/transactions', icon: Receipt },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border/50"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          if (item.primary) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
                aria-label={item.label}
              >
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30 btn-press">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-primary">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'text-primary'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for notch phones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
