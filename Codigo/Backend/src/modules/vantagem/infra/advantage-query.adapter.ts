import type { PrismaClient } from '@prisma/client';
import type { AdvantageQueryPort, InstitutionRedemptionReadModel } from '../../../shared/domain/ports/advantage-query.port.js';

export class AdvantageQueryAdapter implements AdvantageQueryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async getInstitutionRedemptions(institutionId: string): Promise<InstitutionRedemptionReadModel[]> {
    const redemptions = await this.prisma.redemption.findMany({
      where: { student: { institutionId } },
      include: {
        student: { include: { user: true } },
        advantage: { include: { partner: { include: { user: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return redemptions.map((r) => ({
      id: r.id,
      code: r.code,
      coinCost: r.coinCost,
      createdAt: r.createdAt,
      student: { name: r.student.user.name, email: r.student.user.email },
      advantage: { title: r.advantage.title, partner: { name: r.advantage.partner.corporateName } }
    }));
  }
}
