// ============================================
// Shared Types & Constants
// Used by both frontend and backend
// ============================================

// ─── User Types ─────────────────────────────
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type KycStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  kycStatus: KycStatus;
  preferredCurrency: Currency;
  createdAt: string;
}

// ─── Account Types ──────────────────────────
export type AccountType = 'CHECKING' | 'SAVINGS' | 'BUSINESS' | 'INVESTMENT';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'PENDING';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD' | 'MAD';

export interface Account {
  id: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  status: AccountStatus;
  currency: Currency;
  balance: number;
  availableBalance: number;
  isDefault: boolean;
  iban?: string;
}

// ─── Card Types ─────────────────────────────
export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX';
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'PENDING_ACTIVATION';

export interface VirtualCard {
  id: string;
  last4: string;
  cardholderName: string;
  brand: CardBrand;
  status: CardStatus;
  expiryMonth: number;
  expiryYear: number;
  dailyLimit: number;
  monthlyLimit: number;
}

// ─── Transaction Types ──────────────────────
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'EXCHANGE' | 'FEE' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
export type TransferStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  currency: Currency;
  description?: string;
  createdAt: string;
}

// ─── Notification Types ─────────────────────
export type NotificationType = 'TRANSACTION' | 'TRANSFER' | 'SECURITY' | 'ACCOUNT' | 'CARD' | 'SYSTEM' | 'PROMOTION';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response Types ─────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

// ─── Constants ──────────────────────────────
export const SUPPORTED_CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'MAD'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', GBP: '£', CHF: 'CHF', JPY: '¥', CAD: 'C$', AUD: 'A$', MAD: 'MAD',
};

export const TRANSFER_FEE_RATE = 0.001; // 0.1%
export const EXCHANGE_SPREAD = 0.005;   // 0.5%
export const MAX_ACCOUNTS_PER_USER = 5;
export const MAX_CARDS_PER_USER = 10;
export const MAX_DEPOSIT_AMOUNT = 100000;
