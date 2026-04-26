// ============================================
// Cards Service - Virtual Card Management
// ============================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { id: true, name: true, currency: true } },
      },
    });
  }

  async create(userId: string, data: { accountId: string; brand?: string; cardholderName?: string }) {
    // Verify account belongs to user
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });

    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== 'ACTIVE') throw new BadRequestException('Account is not active');

    const cardCount = await this.prisma.card.count({ where: { userId } });
    if (cardCount >= 10) throw new BadRequestException('Maximum 10 cards allowed');

    // Generate tokenized card number (not a real PAN)
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const tokenizedPan = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const card = await this.prisma.card.create({
      data: {
        cardNumber: tokenizedPan,
        last4,
        cardholderName: data.cardholderName || `${user!.firstName} ${user!.lastName}`,
        brand: data.brand || 'VISA',
        type: 'VIRTUAL',
        status: 'ACTIVE',
        expiryMonth: new Date().getMonth() + 1,
        expiryYear: new Date().getFullYear() + 3,
        currency: account.currency,
        userId,
        accountId: data.accountId,
      },
      include: {
        account: { select: { id: true, name: true, currency: true } },
      },
    });

    await this.auditService.log({
      action: 'CARD_CREATE',
      userId,
      targetId: card.id,
      targetType: 'Card',
      description: `Created ${card.brand} virtual card ending in ${last4}`,
    });

    return card;
  }

  async updateStatus(userId: string, cardId: string, status: string) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) throw new NotFoundException('Card not found');

    const updated = await this.prisma.card.update({
      where: { id: cardId },
      data: { status },
    });

    const actionMap: Record<string, any> = {
      BLOCKED: 'CARD_BLOCK',
      ACTIVE: 'CARD_ACTIVATE',
    };

    await this.auditService.log({
      action: actionMap[status] || 'CARD_ACTIVATE',
      userId,
      targetId: cardId,
      targetType: 'Card',
      description: `Card ****${card.last4} status changed to ${status}`,
    });

    return updated;
  }

  async delete(userId: string, cardId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) throw new NotFoundException('Card not found');

    await this.prisma.card.delete({ where: { id: cardId } });

    await this.auditService.log({
      action: 'CARD_DELETE',
      userId,
      targetId: cardId,
      targetType: 'Card',
      description: `Deleted card ending in ****${card.last4}`,
    });

    return { message: 'Card deleted successfully' };
  }
}
