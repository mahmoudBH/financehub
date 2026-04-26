# Database Schema Documentation

## Entity Relationship Overview

The database follows a normalized relational design with 15 core models.

## Models

### User
The central entity. Stores authentication data, profile, and preferences.
- Password stored as bcrypt hash (12 rounds)
- KYC status simulated (PENDING → VERIFIED)
- Supports roles: USER, ADMIN, SUPER_ADMIN

### Account
Virtual bank accounts linked to users.
- Max 5 accounts per user
- Supports 8 currencies (EUR, USD, GBP, CHF, JPY, CAD, AUD, MAD)
- Balance stored as Decimal(18,2) for precision
- Simulated IBAN and BIC

### Card
Virtual payment cards linked to accounts.
- Tokenized PAN (never store real card numbers)
- Only last4 digits stored for display
- Brand: VISA, MASTERCARD, AMEX
- Daily and monthly spending limits

### Transfer
Money movement between accounts.
- Full lifecycle: PENDING → PROCESSING → COMPLETED/FAILED
- Fee calculation (0.1%)
- Links to source/destination accounts and beneficiaries

### Transaction
Immutable ledger of all financial events.
- Records balance before/after for audit trail
- Types: DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT, EXCHANGE, FEE, REFUND
- Links to parent entity (transfer, deposit, withdrawal, exchange)

### ExchangeRate / ExchangeHistory
Currency conversion with simulated rates and spread.

### Notification
In-app notification system with read/unread tracking.
- Types: TRANSACTION, TRANSFER, SECURITY, ACCOUNT, CARD, SYSTEM, PROMOTION

### AuditLog
Complete audit trail for security-sensitive actions.
- 25+ action types covering all critical operations
- Stores IP address, user agent, and metadata

### Token Models
- **RefreshToken**: Hashed storage, rotation on use, expiry tracking
- **PasswordResetToken**: One-time use, 1-hour expiry
- **EmailVerificationToken**: One-time use, 24-hour expiry

## Key Design Decisions
1. **Decimal for money**: Avoids floating-point precision issues
2. **Soft references**: Transaction links to parent via nullable foreign keys
3. **Hash-only tokens**: Refresh/reset tokens stored as bcrypt hashes
4. **Cascading deletes**: User deletion cascades to accounts, cards, tokens
5. **Indexed queries**: Optimized for common access patterns (userId, status, date)
