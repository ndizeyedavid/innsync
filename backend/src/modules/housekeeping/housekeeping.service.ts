import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { HOUSEKEEPING_PROVIDER } from 'src/hospitality/tokens';
import { HousekeepingProvider } from 'src/hospitality/domain/providers/housekeeping.provider';
import { HousekeepingTaskKind } from 'src/hospitality/domain/models/housekeeping.model';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/common/errors/domain.errors';

@Injectable()
export class HousekeepingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(HOUSEKEEPING_PROVIDER) private readonly housekeeping: HousekeepingProvider,
  ) {}

  async requestTask(userId: string, stayId: string, kind: HousekeepingTaskKind, notes?: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (!stay.externalReservationId) throw new ConflictError('Reservation not provisioned');

    const r = await this.housekeeping.createTask({
      externalReservationId: stay.externalReservationId,
      kind,
      notes,
      idempotencyKey: `hk-${stayId}-${kind}`,
    });
    if (!r.ok) throw new ConflictError(`Could not create task: ${r.reason}`);
    return r.data;
  }

  async listForStay(userId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (!stay.externalReservationId) return [];
    const r = await this.housekeeping.listForReservation(stay.externalReservationId);
    return r.ok ? r.data : [];
  }
}
