import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateVaultDto } from './dto/create-vault.dto';
import { AddFundsDto } from './dto/add-funds.dto';

@Injectable()
export class VaultsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.vault.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { name: true, currency: true } },
      },
    });
  }

  async findOne(userId: string, vaultId: string) {
    const vault = await this.prisma.vault.findFirst({
      where: { id: vaultId, userId },
      include: {
        account: { select: { name: true, currency: true } },
      },
    });

    if (!vault) throw new NotFoundException('Vault not found');
    return vault;
  }

  async create(userId: string, data: CreateVaultDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId, status: 'ACTIVE' },
    });

    if (!account) throw new NotFoundException('Account not found or inactive');

    const vaultCount = await this.prisma.vault.count({ where: { userId } });
    if (vaultCount >= 10) {
      throw new BadRequestException('Maximum 10 vaults allowed per user');
    }

    const vault = await this.prisma.vault.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        color: data.color || 'indigo',
        icon: data.icon || 'target',
        isRoundUpEnabled: data.isRoundUpEnabled || false,
        userId,
        accountId: data.accountId,
      },
    });

    await this.auditService.log({
      action: 'VAULT_CREATE',
      userId,
      targetId: vault.id,
      targetType: 'Vault',
      description: `Created vault: ${data.name}`,
    });

    return vault;
  }

  async addFunds(userId: string, vaultId: string, data: AddFundsDto) {
    // We use a transaction to deduct from account and add to vault
    return this.prisma.$transaction(async (tx) => {
      const vault = await tx.vault.findFirst({
        where: { id: vaultId, userId },
        include: { account: true },
      });

      if (!vault) throw new NotFoundException('Vault not found');

      if (Number(vault.account.availableBalance) < data.amount) {
        throw new BadRequestException('Insufficient funds in the source account');
      }

      // 1. Deduct from account
      await tx.account.update({
        where: { id: vault.accountId },
        data: {
          balance: { decrement: data.amount },
          availableBalance: { decrement: data.amount },
        },
      });

      // 2. Add to vault
      const updatedVault = await tx.vault.update({
        where: { id: vaultId },
        data: {
          currentAmount: { increment: data.amount },
        },
      });

      // 3. Create a transaction record
      const transaction = await tx.transaction.create({
        data: {
          reference: `VLT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'TRANSFER_OUT',
          status: 'COMPLETED',
          amount: data.amount,
          currency: vault.account.currency,
          description: `Funded vault: ${vault.name}`,
          userId,
          accountId: vault.accountId,
        },
      });

      await this.auditService.log({
        action: 'VAULT_FUND',
        userId,
        targetId: vaultId,
        targetType: 'Vault',
        description: `Added ${data.amount} ${vault.account.currency} to vault: ${vault.name}`,
        metadata: JSON.stringify({ transactionId: transaction.id }),
      });

      return updatedVault;
    });
  }

  async update(userId: string, vaultId: string, data: Partial<CreateVaultDto>) {
    const vault = await this.prisma.vault.findFirst({
      where: { id: vaultId, userId },
    });

    if (!vault) throw new NotFoundException('Vault not found');

    const updated = await this.prisma.vault.update({
      where: { id: vaultId },
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        color: data.color,
        icon: data.icon,
        isRoundUpEnabled: data.isRoundUpEnabled,
      },
    });

    return updated;
  }

  async remove(userId: string, vaultId: string) {
    return this.prisma.$transaction(async (tx) => {
      const vault = await tx.vault.findFirst({
        where: { id: vaultId, userId },
        include: { account: true },
      });

      if (!vault) throw new NotFoundException('Vault not found');

      // Return funds to account
      if (Number(vault.currentAmount) > 0) {
        await tx.account.update({
          where: { id: vault.accountId },
          data: {
            balance: { increment: vault.currentAmount },
            availableBalance: { increment: vault.currentAmount },
          },
        });
        
        await tx.transaction.create({
          data: {
            reference: `VLT-REF-${Date.now()}`,
            type: 'TRANSFER_IN',
            status: 'COMPLETED',
            amount: vault.currentAmount,
            currency: vault.account.currency,
            description: `Vault closed refund: ${vault.name}`,
            userId,
            accountId: vault.accountId,
          },
        });
      }

      await tx.vault.delete({ where: { id: vaultId } });

      await this.auditService.log({
        action: 'VAULT_DELETE',
        userId,
        targetId: vaultId,
        targetType: 'Vault',
        description: `Deleted vault: ${vault.name}`,
      });

      return { success: true, message: 'Vault closed and funds returned' };
    });
  }
}
