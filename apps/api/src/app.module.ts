// ============================================
// FINANCE DASHBOARD API - Root Module
// ============================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CardsModule } from './modules/cards/cards.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { VaultsModule } from './modules/vaults/vaults.module';
import { InsightsModule } from './modules/insights/insights.module';
import { SplitRequestsModule } from './modules/split-requests/split-requests.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Core
    PrismaModule,
    RedisModule,

    // Features
    AuthModule,
    UsersModule,
    AccountsModule,
    CardsModule,
    TransfersModule,
    TransactionsModule,
    DepositsModule,
    WithdrawalsModule,
    ExchangeModule,
    NotificationsModule,
    AuditModule,
    AdminModule,
    WebsocketModule,
    VaultsModule,
    InsightsModule,
    SplitRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
