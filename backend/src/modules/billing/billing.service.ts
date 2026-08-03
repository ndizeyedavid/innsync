import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { DisputeStatus } from '@prisma/client';
import { FOLIO_PROVIDER } from 'src/hospitality/tokens';
import { FolioProvider } from 'src/hospitality/domain/providers/folio.provider';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  ForbiddenError,
  NotFoundError,
  ExternalProviderUnavailableError,
} from 'src/common/errors/domain.errors';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FOLIO_PROVIDER) private readonly folios: FolioProvider,
  ) {}

  async getFolio(userId: string, stayId: string, opts?: { forceRefresh?: boolean }) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (!stay.externalReservationId) return { lines: [], totalCents: 0, currency: 'USD', finalized: false };

    const r = await this.folios.getFolio(stay.externalReservationId, opts);
    if (!r.ok) {
      // Checkout flow MUST get live data; raise an explicit unavailable signal.
      if (opts?.forceRefresh) throw new ExternalProviderUnavailableError('Folio refresh failed', 'folio');
      // Outside checkout, degrade gracefully with an empty folio.
      return { lines: [], totalCents: 0, currency: 'USD', finalized: false, _meta: { degraded: true } };
    }
    return { ...r.data, _meta: { source: r.source } };
  }

  async lodgeDispute(userId: string, input: {
    stayId: string;
    folioLineId?: string;
    amountCents?: number;
    reason: string;
  }) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: input.stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    return this.prisma.dispute.create({
      data: {
        id: createId(),
        guestStayId: stay.id,
        folioLineId: input.folioLineId,
        amountCents: input.amountCents,
        reason: input.reason,
        status: DisputeStatus.OPEN,
      },
    });
  }

  async listInvoices(userId: string, opts?: { skip?: number; take?: number }) {
    return this.prisma.invoice.findMany({
      where: { stay: { userId } },
      orderBy: { createdAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 50,
      include: { stay: { select: { id: true, checkIn: true, checkOut: true } } },
    });
  }
}
