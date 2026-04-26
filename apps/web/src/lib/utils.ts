import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

export function maskIBAN(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  return `${iban.slice(0, 4)} •••• •••• ${iban.slice(-4)}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
}

export function getTransactionIcon(type: string): string {
  const icons: Record<string, string> = {
    DEPOSIT: '↓',
    WITHDRAWAL: '↑',
    TRANSFER_IN: '←',
    TRANSFER_OUT: '→',
    EXCHANGE: '⇄',
    FEE: '💰',
    REFUND: '↩',
  };
  return icons[type] || '•';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
    COMPLETED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
    PENDING: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
    PROCESSING: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10',
    FAILED: 'text-red-600 bg-red-50 dark:bg-red-500/10',
    CANCELLED: 'text-slate-600 bg-slate-50 dark:bg-slate-500/10',
    FROZEN: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10',
    BLOCKED: 'text-red-600 bg-red-50 dark:bg-red-500/10',
    SUSPENDED: 'text-red-600 bg-red-50 dark:bg-red-500/10',
    CLOSED: 'text-slate-600 bg-slate-50 dark:bg-slate-500/10',
  };
  return colors[status] || 'text-slate-600 bg-slate-50';
}
