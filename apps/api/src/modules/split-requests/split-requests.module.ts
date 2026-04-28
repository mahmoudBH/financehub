import { Module } from '@nestjs/common';
import { SplitRequestsService } from './split-requests.service';
import { SplitRequestsController } from './split-requests.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [SplitRequestsController],
  providers: [SplitRequestsService],
  exports: [SplitRequestsService],
})
export class SplitRequestsModule {}
