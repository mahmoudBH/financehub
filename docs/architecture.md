# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js 14 (App Router)                  │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │   │
│  │  │ Zustand  │ │ TanStack │ │  Zod   │ │ Socket.io │  │   │
│  │  │  Store   │ │  Query   │ │ Forms  │ │  Client   │  │   │
│  │  └─────────┘ └──────────┘ └────────┘ └───────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────┬───────────────────┘
                        │ REST API        │ WebSocket
┌───────────────────────┴─────────────────┴───────────────────┐
│                         SERVER                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   NestJS                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │   │
│  │  │  Guards   │  │  Pipes   │  │   Interceptors    │  │   │
│  │  │ JWT+RBAC  │  │Validation│  │  Logging+Cache    │  │   │
│  │  └──────────┘  └──────────┘  └───────────────────┘  │   │
│  │                                                       │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │   │
│  │  │ Auth │ │Users │ │Accts │ │Cards │ │Transfers │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘  │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │   │
│  │  │Txns  │ │Deps  │ │Wdraw │ │Exch  │ │  Admin   │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │   │
│  │  │  Notifs  │ │  Audit   │ │    WebSocket GW   │   │   │
│  │  └──────────┘ └──────────┘ └───────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────┬───────────────────┘
                        │                 │
              ┌─────────┴───┐    ┌────────┴────┐
              │   MySQL 8   │    │   Redis 7   │
              │  (Prisma)   │    │   (Cache)   │
              └─────────────┘    └─────────────┘
```

## Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── ThrottlerModule (global)
├── PrismaModule (global)
├── RedisModule (global)
├── AuthModule
│   ├── JwtModule
│   ├── PassportModule
│   └── AuditModule
├── UsersModule → AuditModule
├── AccountsModule → AuditModule
├── CardsModule → AuditModule
├── TransfersModule → AuditModule, NotificationsModule
├── TransactionsModule
├── DepositsModule → AuditModule, NotificationsModule
├── WithdrawalsModule → AuditModule, NotificationsModule
├── ExchangeModule → AuditModule, NotificationsModule
├── NotificationsModule
├── AuditModule
├── AdminModule → AuditModule
└── WebsocketModule → JwtModule
```

## Data Flow: Transfer

```
1. User submits transfer form
2. Frontend validates with Zod
3. POST /api/v1/transfers
4. JwtAuthGuard validates token
5. TransfersController receives request
6. TransfersService.create():
   a. Validate source account ownership
   b. Calculate fee (0.1%)
   c. Check sufficient balance
   d. Begin database transaction:
      - Create Transfer (PROCESSING)
      - Debit source account
      - Create outgoing Transaction
      - Credit destination (if internal)
      - Create incoming Transaction
      - Create Fee Transaction
      - Update Transfer (COMPLETED)
   e. Send notification via NotificationsService
   f. Create audit log via AuditService
   g. Emit WebSocket event
7. Return transfer to client
8. TanStack Query invalidates & refetches
9. UI updates with success state
```

## Security Layers

1. **Network**: Helmet headers, CORS, rate limiting
2. **Authentication**: JWT with short-lived access tokens
3. **Authorization**: RBAC guards (USER, ADMIN, SUPER_ADMIN)
4. **Input**: class-validator DTOs, Zod frontend validation
5. **Data**: bcrypt hashing, token rotation, no PAN storage
6. **Audit**: Complete trail for sensitive actions
