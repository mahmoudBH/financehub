// ============================================
// Database Seed - Demo Data for Simulator
// ============================================
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.exchangeHistory.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.card.deleteMany();
  await prisma.account.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 12);

  // ─── CREATE USERS ──────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@financehub.dev',
      passwordHash,
      firstName: 'Admin',
      lastName: 'FinanceHub',
      phone: '+33600000001',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      kycStatus: 'VERIFIED',
      preferredCurrency: 'EUR',
      country: 'France',
      city: 'Paris',
    },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+33612345678',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      kycStatus: 'VERIFIED',
      preferredCurrency: 'EUR',
      country: 'France',
      city: 'Lyon',
      address: '15 Rue de la République',
      postalCode: '69001',
    },
  });

  const sophie = await prisma.user.create({
    data: {
      email: 'sophie@example.com',
      passwordHash,
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '+33698765432',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      kycStatus: 'VERIFIED',
      preferredCurrency: 'EUR',
      country: 'France',
      city: 'Marseille',
    },
  });

  const ahmed = await prisma.user.create({
    data: {
      email: 'ahmed@example.com',
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Benali',
      phone: '+212600000001',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      kycStatus: 'SUBMITTED',
      preferredCurrency: 'MAD',
      country: 'Morocco',
      city: 'Casablanca',
    },
  });

  console.log('✅ Users created');

  // ─── CREATE ACCOUNTS ──────────────────────
  const johnChecking = await prisma.account.create({
    data: {
      accountNumber: 'FH1000000001',
      name: 'Main Checking',
      type: 'CHECKING',
      status: 'ACTIVE',
      currency: 'EUR',
      balance: 24750.50,
      availableBalance: 24750.50,
      userId: john.id,
      isDefault: true,
      iban: 'FR7630001007941234567890185',
      bic: 'FNHBFRPP',
    },
  });

  const johnSavings = await prisma.account.create({
    data: {
      accountNumber: 'FH1000000002',
      name: 'Savings Account',
      type: 'SAVINGS',
      status: 'ACTIVE',
      currency: 'EUR',
      balance: 52300.00,
      availableBalance: 52300.00,
      userId: john.id,
      iban: 'FR7630001007941234567890186',
      bic: 'FNHBFRPP',
    },
  });

  const johnUSD = await prisma.account.create({
    data: {
      accountNumber: 'FH1000000003',
      name: 'USD Account',
      type: 'CHECKING',
      status: 'ACTIVE',
      currency: 'USD',
      balance: 8500.00,
      availableBalance: 8500.00,
      userId: john.id,
      iban: 'FR7630001007941234567890187',
      bic: 'FNHBFRPP',
    },
  });

  const sophieChecking = await prisma.account.create({
    data: {
      accountNumber: 'FH2000000001',
      name: 'Main Account',
      type: 'CHECKING',
      status: 'ACTIVE',
      currency: 'EUR',
      balance: 15200.75,
      availableBalance: 15200.75,
      userId: sophie.id,
      isDefault: true,
      iban: 'FR7630001007949876543210185',
      bic: 'FNHBFRPP',
    },
  });

  const ahmedChecking = await prisma.account.create({
    data: {
      accountNumber: 'FH3000000001',
      name: 'Main Account',
      type: 'CHECKING',
      status: 'ACTIVE',
      currency: 'MAD',
      balance: 95000.00,
      availableBalance: 95000.00,
      userId: ahmed.id,
      isDefault: true,
      iban: 'FR7630001007945555555555185',
      bic: 'FNHBFRPP',
    },
  });

  const adminChecking = await prisma.account.create({
    data: {
      accountNumber: 'FH0000000001',
      name: 'Admin Account',
      type: 'CHECKING',
      status: 'ACTIVE',
      currency: 'EUR',
      balance: 100000.00,
      availableBalance: 100000.00,
      userId: admin.id,
      isDefault: true,
      iban: 'FR7630001007940000000000185',
      bic: 'FNHBFRPP',
    },
  });

  console.log('✅ Accounts created');

  // ─── CREATE CARDS ─────────────────────────
  await prisma.card.createMany({
    data: [
      {
        cardNumber: 'tok_visa_john_1',
        last4: '4242',
        cardholderName: 'JOHN DOE',
        brand: 'VISA',
        type: 'VIRTUAL',
        status: 'ACTIVE',
        expiryMonth: 12,
        expiryYear: 2028,
        dailyLimit: 5000,
        monthlyLimit: 25000,
        totalSpent: 3250.80,
        currency: 'EUR',
        userId: john.id,
        accountId: johnChecking.id,
      },
      {
        cardNumber: 'tok_mc_john_1',
        last4: '8888',
        cardholderName: 'JOHN DOE',
        brand: 'MASTERCARD',
        type: 'VIRTUAL',
        status: 'ACTIVE',
        expiryMonth: 6,
        expiryYear: 2027,
        dailyLimit: 3000,
        monthlyLimit: 15000,
        totalSpent: 1200.00,
        currency: 'EUR',
        userId: john.id,
        accountId: johnSavings.id,
      },
      {
        cardNumber: 'tok_visa_sophie_1',
        last4: '1234',
        cardholderName: 'SOPHIE MARTIN',
        brand: 'VISA',
        type: 'VIRTUAL',
        status: 'ACTIVE',
        expiryMonth: 9,
        expiryYear: 2028,
        dailyLimit: 5000,
        monthlyLimit: 25000,
        totalSpent: 890.50,
        currency: 'EUR',
        userId: sophie.id,
        accountId: sophieChecking.id,
      },
    ],
  });

  console.log('✅ Cards created');

  // ─── CREATE BENEFICIARIES ─────────────────
  await prisma.beneficiary.create({
    data: {
      userId: john.id,
      beneficiaryId: sophie.id,
      name: 'Sophie Martin',
      email: 'sophie@example.com',
      iban: 'FR7630001007949876543210185',
      bankName: 'FinanceHub',
      isFavorite: true,
    },
  });

  await prisma.beneficiary.create({
    data: {
      userId: sophie.id,
      beneficiaryId: john.id,
      name: 'John Doe',
      email: 'john@example.com',
      iban: 'FR7630001007941234567890185',
      bankName: 'FinanceHub',
    },
  });

  console.log('✅ Beneficiaries created');

  // ─── CREATE TRANSACTIONS ──────────────────
  const txnData = [
    { type: 'DEPOSIT', amount: 5000, desc: 'Initial deposit', days: 30 },
    { type: 'DEPOSIT', amount: 3500, desc: 'Salary deposit', days: 25 },
    { type: 'TRANSFER_OUT', amount: 250, desc: 'Transfer to Sophie', days: 22 },
    { type: 'WITHDRAWAL', amount: 100, desc: 'ATM Withdrawal', days: 20 },
    { type: 'DEPOSIT', amount: 1200, desc: 'Freelance payment', days: 18 },
    { type: 'FEE', amount: 2.50, desc: 'Transfer fee', days: 15 },
    { type: 'TRANSFER_OUT', amount: 500, desc: 'Rent payment', days: 12 },
    { type: 'DEPOSIT', amount: 3500, desc: 'Salary deposit', days: 10 },
    { type: 'WITHDRAWAL', amount: 200, desc: 'Cash withdrawal', days: 8 },
    { type: 'TRANSFER_IN', amount: 150, desc: 'Refund from Sophie', days: 6 },
    { type: 'DEPOSIT', amount: 800, desc: 'Client payment', days: 4 },
    { type: 'TRANSFER_OUT', amount: 75, desc: 'Subscription payment', days: 3 },
    { type: 'DEPOSIT', amount: 3500, desc: 'Salary deposit', days: 1 },
    { type: 'WITHDRAWAL', amount: 50, desc: 'ATM Withdrawal', days: 0 },
  ];

  let runningBalance = 24750.50;
  for (const txn of txnData.reverse()) {
    const isIncome = ['DEPOSIT', 'TRANSFER_IN', 'REFUND'].includes(txn.type);
    const balanceAfter = runningBalance;
    const balanceBefore = isIncome
      ? runningBalance - txn.amount
      : runningBalance + txn.amount;
    runningBalance = balanceBefore;

    await prisma.transaction.create({
      data: {
        reference: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        type: txn.type as any,
        status: 'COMPLETED',
        amount: txn.amount,
        currency: 'EUR',
        description: txn.desc,
        balanceBefore,
        balanceAfter,
        userId: john.id,
        accountId: johnChecking.id,
        createdAt: new Date(Date.now() - txn.days * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Transactions created');

  // ─── CREATE NOTIFICATIONS ─────────────────
  const notifications = [
    { type: 'SYSTEM', title: 'Welcome to FinanceHub! 🎉', message: 'Your account is ready. Explore your dashboard!', days: 30 },
    { type: 'TRANSACTION', title: 'Deposit Received', message: '€5,000.00 deposited to Main Checking', days: 25 },
    { type: 'SECURITY', title: 'New Login Detected', message: 'Login from Chrome on Windows - Paris, FR', days: 20 },
    { type: 'CARD', title: 'Card Activated', message: 'Your VISA card ending 4242 is now active', days: 18 },
    { type: 'TRANSFER', title: 'Transfer Completed', message: '€250.00 sent to Sophie Martin', days: 15 },
    { type: 'ACCOUNT', title: 'Savings Goal Update', message: 'You\'re 65% towards your savings goal!', days: 10 },
    { type: 'TRANSACTION', title: 'Salary Received', message: '€3,500.00 deposited to Main Checking', days: 5 },
    { type: 'PROMOTION', title: 'New Feature: Currency Exchange', message: 'Convert currencies directly from your dashboard', days: 2 },
    { type: 'SECURITY', title: 'Password Changed', message: 'Your password was recently changed', days: 1, read: true },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({
      data: {
        type: notif.type as any,
        priority: notif.type === 'SECURITY' ? 'HIGH' : 'MEDIUM',
        title: notif.title,
        message: notif.message,
        isRead: (notif as any).read || false,
        userId: john.id,
        createdAt: new Date(Date.now() - notif.days * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Notifications created');

  // ─── AUDIT LOGS ───────────────────────────
  const auditEntries = [
    { action: 'SIGNUP', desc: 'User registered', days: 30 },
    { action: 'LOGIN', desc: 'User logged in', days: 28 },
    { action: 'ACCOUNT_CREATE', desc: 'Created Main Checking account', days: 28 },
    { action: 'CARD_CREATE', desc: 'Created VISA virtual card', days: 25 },
    { action: 'DEPOSIT', desc: 'Deposited €5,000.00', days: 25 },
    { action: 'TRANSFER_CREATE', desc: 'Transfer to Sophie Martin', days: 22 },
    { action: 'TRANSFER_COMPLETE', desc: 'Transfer completed', days: 22 },
    { action: 'LOGIN', desc: 'User logged in', days: 15 },
    { action: 'SETTINGS_UPDATE', desc: 'Updated notification preferences', days: 10 },
    { action: 'LOGIN', desc: 'User logged in', days: 1 },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        action: entry.action as any,
        description: entry.desc,
        userId: john.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        createdAt: new Date(Date.now() - entry.days * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Audit logs created');
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Admin:  admin@financehub.dev / Password@123');
  console.log('  User:   john@example.com / Password@123');
  console.log('  User:   sophie@example.com / Password@123');
  console.log('  User:   ahmed@example.com / Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
